import { Dirent } from 'fs';
import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

import { PACKS_DIR } from '../constants.js';
import type { OperationResult, TemplateMeta } from '../types.js';
import { collectFiles, logCacheEvent, logDebug, normalizeFiles, PackContentEntry, PackMetadataYaml } from './utils.js';

// Cache state
let packsCache: TemplateMeta[] | null = null;
let packsCachePromise: Promise<TemplateMeta[]> | null = null;
let cachedCategories: string[] | null = null;
let cachedCategoriesPromise: Promise<string[]> | null = null;

export const clearPacksCache = (): void => {
  packsCache = null;
  packsCachePromise = null;
  cachedCategories = null;
  cachedCategoriesPromise = null;
  logCacheEvent('clear', 0, 'clearPacksCache');
};

const buildPacksCache = async (): Promise<TemplateMeta[]> => {
  const packs = await fs.readdir(PACKS_DIR, { withFileTypes: true });
  const templates: TemplateMeta[] = [];

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
    const templatesRoot = path.join(packRoot, 'templates');
    let entries: Dirent[] = [];
    try {
      entries = await fs.readdir(templatesRoot, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const tplPath = path.join(templatesRoot, entry.name);
      const stat = await fs.stat(tplPath);
      const relativeTplPath = path.relative(PACKS_DIR, tplPath);

      const contentMeta: PackContentEntry | undefined = Array.isArray(meta?.contents)
        ? meta.contents.find((c) => c?.path && path.basename(c.path) === entry.name)
        : undefined;

      let files: Record<string, string> = {};
      if (contentMeta && Array.isArray(contentMeta.files)) {
        files = normalizeFiles(contentMeta.files);
      }
      if (!Object.keys(files).length) {
        try {
          const discovered = await collectFiles(tplPath);
          discovered.forEach((f) => {
            files[f] = path.basename(f);
          });
        } catch {
          // ignore
        }
      }

      const category =
        contentMeta?.type === 'workspace' || entry.name.toLowerCase().includes('workspace')
          ? 'workspace'
          : entry.name.toLowerCase().includes('gitignore') || entry.name.toLowerCase().includes('config')
            ? 'configuration'
            : meta?.category ?? 'workspace';

      templates.push({
        type: 'template',
        id: `${packDir.name}-${entry.name}`,
        name: entry.name,
        description: meta?.summary ? `${meta.summary} (${entry.name})` : `${entry.name} from ${packDir.name}`,
        version: meta?.version ?? '1.0.0',
        lastEdited: stat.mtime.toISOString(),
        category,
        sourcePath: relativeTplPath,
        packPath: relativeTplPath,
        editable: meta?.editable ?? true,
        structure: Object.keys(files).length ? { files, folders: [] } : undefined
      });
    }
  }

  return templates;
};

export async function listTemplates(source = 'listTemplates'): Promise<OperationResult<TemplateMeta[]>> {
  try {
    if (packsCache) {
      logDebug('using cache', packsCache.length, packsCache.map((t) => `${t.name} (${t.category})`));
      logCacheEvent('read', packsCache.length, source);
      return { ok: true, data: packsCache };
    }

    if (!packsCachePromise) {
      packsCachePromise = (async () => {
        const built = await buildPacksCache();
        packsCache = built;
        logDebug('built', built.length, built.map((t) => `${t.name} (${t.category})`));
        logCacheEvent('generate', built.length, source);
        return built;
      })();
    }

    const data = await packsCachePromise;
    if (packsCache === data) {
      logCacheEvent('read', data.length, source);
    }
    return { ok: true, data };
  } catch (error) {
    packsCachePromise = null;
    return { ok: false, error: (error as Error).message };
  }
}

export async function listTemplateFolders(): Promise<OperationResult<string[]>> {
  if (cachedCategories) return { ok: true, data: cachedCategories };

  if (!cachedCategoriesPromise) {
    cachedCategoriesPromise = (async () => {
      let data = packsCache as TemplateMeta[] | null;
      if (!data && packsCachePromise) {
        data = await packsCachePromise;
      }
      if (!data) {
        const res = await listTemplates('listTemplateFolders');
        if (!res.ok || !res.data) throw new Error(res.error ?? 'listTemplateFolders failed');
        data = res.data;
      }
      cachedCategories = Array.from(new Set(data.map((t) => t.category ?? 'misc')));
      return cachedCategories;
    })();
  }

  try {
    const categories = await cachedCategoriesPromise;
    return { ok: true, data: categories };
  } catch (error) {
    cachedCategoriesPromise = null;
    return { ok: false, error: (error as Error).message };
  }
}

