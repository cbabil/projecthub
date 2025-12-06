import { describe, expect, it } from 'vitest';

import { fetchPackList } from '../src/renderer/utils/packs.js';

type ManifestResult = { ok: boolean; data?: any; error?: string };

const setFetcher = (impl: (url: string) => Promise<ManifestResult>) => {
  (globalThis as any).window = {
    projecthub: {
      fetchManifest: impl
    }
  };
};

describe('fetchPackList edge cases', () => {
  it('handles direct manifest URL and skips non-zip entries', async () => {
    setFetcher(async (url) => {
      if (url === 'https://example.com/manifest.json') {
        return {
          ok: true,
          data: {
            version: '1.0.0',
            packs: [
              { name: 'Good', zip: 'good.zip' },
              { name: 'Skip', zip: 'readme.md' }
            ]
          }
        };
      }
      return { ok: false, error: 'bad' };
    });

    const packs = await fetchPackList('https://example.com/manifest.json');
    expect(packs).toHaveLength(1);
    expect(packs[0].name).toBe('Good');
  });

  it('throws when manifest has no installable packs', async () => {
    setFetcher(async () => ({ ok: true, data: { packs: [{ name: 'NoZip', zip: 'notes.txt' }] } }));
    await expect(fetchPackList('https://example.com/manifest.json')).rejects.toThrow(/no installable packs/);
  });

  it('throws when release is missing manifest asset', async () => {
    setFetcher(async (url) => {
      if (url.includes('releases/latest')) {
        return { ok: true, data: { assets: [] } };
      }
      return { ok: false, error: 'no asset' };
    });
    await expect(fetchPackList('https://github.com/org/repo/releases/latest')).rejects.toThrow(/packs-manifest\.json/);
  });
});
