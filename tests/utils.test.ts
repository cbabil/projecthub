import { describe, expect, it } from 'vitest';

import { buildDestinationPath } from '../src/renderer/utils/destination.js';
import { formatDate, truncate } from '../src/renderer/utils/text.js';
import { fetchPackList } from '../src/renderer/utils/packs.js';

describe('text utils', () => {
  it('truncates long strings and keeps short ones', () => {
    expect(truncate('short', 10)).toBe('short');
    expect(truncate('averylongstring', 5)).toBe('avery…');
  });

  it('formats valid dates and falls back on invalid', () => {
    expect(formatDate('2024-01-02T03:04:00Z')).toMatch(/\d{2}\/\d{2}\/\d{2}/);
    expect(formatDate('not-a-date')).toBe('not-a-date');
    expect(formatDate()).toBe('—');
  });
});

describe('destination utils', () => {
  it('builds destination with unix and windows separators', () => {
    expect(buildDestinationPath('/tmp/', 'proj')).toBe('/tmp/proj');
    expect(buildDestinationPath('C:\\\\tmp\\\\', 'proj')).toMatch(/C:\\\\tmp\\.*proj/);
  });

  it('handles empty base or name gracefully', () => {
    expect(buildDestinationPath('', 'proj')).toBe('');
    expect(buildDestinationPath('/tmp', '')).toBe('/tmp');
  });

  it('returns empty string when base is whitespace', () => {
    expect(buildDestinationPath('   ', 'name')).toBe('');
  });
});

describe('packs fetch error paths', () => {
  it('throws when manifest asset is missing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).window = {
      projecthub: {
        fetchManifest: async () =>
          ({ ok: true, data: { assets: [], tag_name: 'v0.1', published_at: '2024-01-01T00:00:00Z' } })
      }
    };

    await expect(fetchPackList('https://github.com/example/projecthub-packs/releases/latest')).rejects.toThrow(
      'packs-manifest.json not found in latest release'
    );
  });
});
