import fs from 'fs/promises';
import path from 'path';

import { isDebugEnabled, logger } from '../logger.js';
import type { OperationResult } from '../types.js';

/** Shape of a file entry in pack metadata */
export interface PackFileEntry {
  source?: string;
  target?: string;
}

/** Shape of a content entry in pack metadata */
export interface PackContentEntry {
  path?: string;
  type?: string;
  files?: PackFileEntry[];
  category?: string;
  editable?: boolean;
}

/** Shape of pack metadata.yaml parsed content */
export interface PackMetadataYaml {
  name?: string;
  description?: string;
  summary?: string;
  version?: string;
  technology?: string;
  license?: string;
  releasedOn?: string;
  category?: string;
  editable?: boolean;
  contents?: PackContentEntry[];
}

export const encoder = (data: unknown): string => JSON.stringify(data, null, 2);

/** Log debug information for packs cache operations */
export const logDebug = (...args: unknown[]): void => {
  if (isDebugEnabled()) {
    logger.debug('packsCache', ...args);
  }
};

/** Log cache lifecycle events */
export const logCacheEvent = (action: 'generate' | 'read' | 'clear', count: number, source: string): void => {
  logger.cache(action, count, source);
};

export async function readJson<T>(filePath: string): Promise<OperationResult<T>> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { ok: true, data: JSON.parse(content) as T };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function writeJson<T>(filePath: string, data: T): Promise<OperationResult<T>> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, encoder(data));
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/** Recursively collect all file paths relative to root directory */
export const collectFiles = async (root: string): Promise<string[]> => {
  const files: string[] = [];
  const walk = async (dir: string): Promise<void> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        files.push(path.relative(root, full));
      }
    }
  };
  await walk(root);
  return files;
};

/** Normalize pack file entries to source->target mapping */
export const normalizeFiles = (files: PackFileEntry[]): Record<string, string> => {
  const map: Record<string, string> = {};
  for (const f of files) {
    if (!f || typeof f !== 'object') continue;
    const source = String(f.source ?? '').trim();
    if (!source) continue;
    map[source] = f.target ? String(f.target).trim() || path.basename(source) : path.basename(source);
  }
  return map;
};
