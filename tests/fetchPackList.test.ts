import { describe, expect, it } from 'vitest';

import { fetchPackList } from '../src/renderer/utils/packs.js';

type ManifestResult = { ok: boolean; data?: any; error?: string };

const releaseUrl = 'https://github.com/example/projecthub-packs/releases/latest';

const mockRelease = {
  tag_name: 'v1.2.3',
  published_at: '2024-01-01T00:00:00.000Z',
  assets: [
    { name: 'packs-manifest.json', browser_download_url: 'https://example.com/packs-manifest.json' },
    { name: 'pack-a.zip', browser_download_url: 'https://example.com/pack-a.zip' }
  ],
  license: { spdx_id: 'MIT' }
};

const mockManifest = {
  version: '1.2.3',
  packs: [
    {
      name: 'Pack A',
      description: 'Starter pack',
      version: '1.2.3',
      technology: 'node',
      license: 'MIT',
      zip: 'pack-a.zip',
      checksum: '123'
    }
  ]
};

const calls: string[] = [];

// Minimal mock of the preload bridge used by fetchPackList
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).window = {
  projecthub: {
    fetchManifest: async (url: string): Promise<ManifestResult> => {
      calls.push(url);
      if (url === 'https://api.github.com/repos/example/projecthub-packs/releases/latest') {
        return { ok: true, data: mockRelease };
      }
      if (url === 'https://example.com/packs-manifest.json') {
        return { ok: true, data: mockManifest };
      }
      return { ok: false, error: `unexpected url: ${url}` };
    }
  }
};

describe('fetchPackList', () => {
  it('fetches manifest from release page URL', async () => {
    const packs = await fetchPackList(releaseUrl);

    expect(packs).toHaveLength(1);
    const pack = packs[0];
    expect(pack.name).toBe('Pack A');
    expect(pack.path).toBe('https://example.com/pack-a.zip');
    expect(pack.status).toBe('missing');
    expect(pack.releasedOn).toBe(mockRelease.published_at);

    expect(calls).toEqual([
      'https://api.github.com/repos/example/projecthub-packs/releases/latest',
      'https://example.com/packs-manifest.json'
    ]);
  });
});
