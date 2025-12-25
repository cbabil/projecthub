import type { Marketplace, PackMeta } from '@shared/types';

export type PackRow = PackMeta & { type: string; lastEdited: string; installedVersion?: string };

const normalize = (name?: string) => (name || '').replace(/\.zip$/i, '').toLowerCase();
const isJsonFile = (p: PackMeta) => {
  const name = String(p.name || '').toLowerCase();
  const path = String(p.path || '').toLowerCase();
  return name.endsWith('.json') || path.endsWith('.json');
};

export interface FetchResult {
  packs: PackMeta[];
  errors: Record<string, string>;
}

export async function fetchAllMarketplaces(marketplaces: Marketplace[]): Promise<FetchResult> {
  const results = await Promise.allSettled(
    marketplaces.map(async (m) => ({ marketplace: m, list: await fetchPackList(m.url) }))
  );
  const errors: Record<string, string> = {};
  const packs: PackMeta[] = [];

  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      result.value.list.filter((p) => !isJsonFile(p)).forEach((pack) => {
        packs.push({ ...pack, marketplaceId: result.value.marketplace.id, marketplaceName: result.value.marketplace.name });
      });
    } else {
      const msg = result.reason?.message || 'Failed to fetch';
      errors[marketplaces[i].id] = msg.includes('403') || msg.includes('429') ? 'GitHub rate limit.' : msg;
    }
  });
  return { packs, errors };
}

export function mergeWithInstalled(remotePacks: PackMeta[], installed: PackMeta[]): PackRow[] {
  return remotePacks.map((p) => {
    const match = installed.find((i) => normalize(i.name) === normalize(p.name));
    return {
      ...p,
      type: 'project',
      name: p.name || '-',
      description: p.description || '-',
      version: p.version || '-',
      localPath: match?.path,
      status: match ? 'installed' : 'missing',
      installedVersion: match?.version,
      lastEdited: p.releasedOn || ''
    } as PackRow;
  });
}

/** GitHub Release API asset shape */
interface GitHubAsset {
  name: string;
  browser_download_url: string;
}

/** GitHub Release API response shape */
interface GitHubRelease {
  tag_name?: string;
  published_at?: string;
  created_at?: string;
  assets?: GitHubAsset[];
  license?: { spdx_id?: string };
}

const normalizeGithubReleaseUrl = (url: string): string => {
  const trimmed = url.trim();
  const githubMatch = trimmed.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/releases(?:\/(tag\/[^/]+|latest))?\/?$/i);
  if (!githubMatch) return trimmed;

  const [, owner, repo, suffix] = githubMatch;
  if (suffix?.startsWith('tag/')) {
    const tag = suffix.replace(/^tag\//, '');
    return `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;
  }
  return `https://api.github.com/repos/${owner}/${repo}/releases/latest`;
};

// Manifest fetcher used ONLY by the Packs tab. Do not call at app start.
export const fetchPackList = async (releaseUrl: string): Promise<PackMeta[]> => {
  const defaultUrl = 'https://api.github.com/repos/cbabil/projecthub-packs/releases/latest';
  const target = releaseUrl?.trim() ? releaseUrl.trim() : defaultUrl;

  // If target points directly to a manifest json
  if (target.toLowerCase().endsWith('.json')) {
    const manifestRes = await window.projecthub.fetchManifest?.(target);
    if (!manifestRes?.ok || !manifestRes.data) throw new Error(manifestRes?.error || 'Manifest fetch failed');
    const manifest = manifestRes.data as {
      version?: string;
      packs?: {
        name?: string;
        description?: string;
        version?: string;
        technology?: string;
        license?: string;
        zip: string;
        checksum?: string;
      }[];
    };

    const packs = (manifest.packs || []).map((p) => {
      const path = p.zip;
      const isZip = String(path).toLowerCase().endsWith('.zip');
      if (!isZip) return null;
      return {
        name: p.name ?? '-',
        description: p.description ?? '-',
        version: p.version ?? manifest.version ?? '-',
        technology: p.technology ?? '-',
        license: p.license ?? '-',
        path,
        checksum: p.checksum ?? '-',
        status: 'missing' as const,
        releasedOn: manifest.version ?? ''
      } satisfies PackMeta;
    });
    const filtered = packs.filter(Boolean) as PackMeta[];
    if (!filtered.length) throw new Error('Manifest contains no installable packs');
    return filtered;
  }

  // Otherwise treat as GitHub release API URL (web release page URLs are normalized to API endpoints)
  const releaseApiUrl = normalizeGithubReleaseUrl(target);
  const relRes = await window.projecthub.fetchManifest?.(releaseApiUrl);
  if (!relRes?.ok || !relRes.data) throw new Error(relRes?.error || 'Failed to load releases');
  const rel = relRes.data as GitHubRelease;

  const releasedOn = rel.published_at || rel.created_at || new Date().toISOString();
  const manifestAsset = (rel.assets || []).find((a) => a.name === 'packs-manifest.json');
  if (!manifestAsset) throw new Error('packs-manifest.json not found in latest release');

  const manifestRes = await window.projecthub.fetchManifest?.(manifestAsset.browser_download_url);
  if (!manifestRes?.ok || !manifestRes.data) throw new Error(manifestRes?.error || 'Manifest fetch failed');
  const manifest = manifestRes.data as {
    version?: string;
    packs?: {
      name?: string;
      description?: string;
      version?: string;
      technology?: string;
      license?: string;
      zip: string;
      checksum?: string;
    }[];
  };

  const packs = (manifest.packs || []).map((p) => {
    const zipAsset = (rel.assets || []).find((a) => a.name === p.zip);
    if (!zipAsset) return null; // skip entries without a matching asset
    const path = zipAsset.browser_download_url;
    const isZip = String(path).toLowerCase().endsWith('.zip');
    if (!isZip) return null; // ensure we only return zips
    return {
      name: p.name ?? '-',
      description: p.description ?? '-',
      version: p.version ?? rel.tag_name ?? manifest.version ?? '-',
      technology: p.technology ?? '-',
      license: p.license ?? rel.license?.spdx_id ?? '-',
      path,
      checksum: p.checksum ?? '-',
      status: 'missing' as const,
      releasedOn
    } satisfies PackMeta;
  });

  const filtered = packs.filter(Boolean) as PackMeta[];
  if (!filtered.length) throw new Error('Manifest contains no installable packs');
  return filtered;
};
