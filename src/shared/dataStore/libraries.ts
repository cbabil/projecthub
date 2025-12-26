import { Dirent } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

import { PACKS_DIR } from '../constants.js';
import type { LibraryMeta, OperationResult } from '../types.js';
import { collectFiles, logCacheEvent, logDebug, normalizeFiles, PackContentEntry, PackMetadataYaml } from './utils.js';

// Cache state
let librariesCache: LibraryMeta[] | null = null;
let librariesCachePromise: Promise<LibraryMeta[]> | null = null;

export const clearLibrariesCache = (): void => {
  librariesCache = null;
  librariesCachePromise = null;
  logCacheEvent('clear', 0, 'clearLibrariesCache');
};

const buildLibrariesCache = async (): Promise<LibraryMeta[]> => {
  const packs = await fs.readdir(PACKS_DIR, { withFileTypes: true });
  const libraries: LibraryMeta[] = [];

  for (const packDir of packs.filter((d) => d.isDirectory())) {
    const packRoot = path.join(PACKS_DIR, packDir.name);
    const metaPath = path.join(packRoot, 'metadata.yaml');
    let meta: PackMetadataYaml = {};
    try {
      const metaRaw = await fs.readFile(metaPath, 'utf-8');
      meta = YAML.parse(metaRaw) as PackMetadataYaml;
    } catch {
      // ignore
    }
    const librariesRoot = path.join(packRoot, 'libraries');
    let entries: Dirent[] = [];
    try {
      entries = await fs.readdir(librariesRoot, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const libPath = path.join(librariesRoot, entry.name);
      const stat = await fs.stat(libPath);
      const relativeLibPath = path.relative(PACKS_DIR, libPath);

      const contentMeta: PackContentEntry | undefined = Array.isArray(meta?.contents)
        ? meta.contents.find((c) => c?.path && path.basename(c.path) === entry.name && c.type === 'library')
        : undefined;

      let files: Record<string, string> = {};
      if (contentMeta && Array.isArray(contentMeta.files)) {
        files = normalizeFiles(contentMeta.files);
      }
      if (!Object.keys(files).length) {
        try {
          const discovered = await collectFiles(libPath);
          discovered.forEach((f) => {
            files[f] = path.basename(f);
          });
        } catch {
          // ignore
        }
      }

      const category = contentMeta?.type ?? meta?.category ?? 'library';

      libraries.push({
        type: 'library',
        id: `${packDir.name}-${entry.name}`,
        name: entry.name,
        description: meta?.summary ? `${meta.summary} (${entry.name})` : `${entry.name} from ${packDir.name}`,
        version: meta?.version ?? '1.0.0',
        lastEdited: stat.mtime.toISOString(),
        category,
        sourcePath: relativeLibPath,
        packPath: relativeLibPath,
        editable: meta?.editable ?? true,
        files
      });
    }
  }

  return libraries;
};

export async function listLibraries(source = 'listLibraries'): Promise<OperationResult<LibraryMeta[]>> {
  try {
    if (librariesCache) {
      logDebug('using libraries cache', librariesCache.length, librariesCache.map((l) => `${l.name} (${l.category})`));
      logCacheEvent('read', librariesCache.length, source);
      return { ok: true, data: librariesCache };
    }

    if (!librariesCachePromise) {
      librariesCachePromise = (async () => {
        const built = await buildLibrariesCache();
        librariesCache = built;
        logDebug('built libraries', built.length, built.map((l) => `${l.name} (${l.category})`));
        logCacheEvent('generate', built.length, source);
        return built;
      })();
    }

    const data = await librariesCachePromise;
    if (librariesCache === data) {
      logCacheEvent('read', data.length, source);
    }
    return { ok: true, data };
  } catch (error) {
    librariesCachePromise = null;
    return { ok: false, error: (error as Error).message };
  }
}
