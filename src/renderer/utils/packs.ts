import { PackMeta } from '@shared/types';

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
  const rel = relRes.data as any;

  const releasedOn = rel.published_at || rel.created_at || new Date().toISOString();
  const manifestAsset = (rel.assets || []).find((a: any) => a.name === 'packs-manifest.json');
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
    const zipAsset = (rel.assets || []).find((a: any) => a.name === p.zip);
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
