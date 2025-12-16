import fs from 'fs/promises';
import path from 'path';

import { PACKS_DIR } from '../constants.js';
import type { OperationResult } from '../types.js';
import { clearPacksCache } from './templates.js';

/**
 * Delete a template directory from the packs folder.
 */
export async function deleteTemplateFile(relativePath: string): Promise<OperationResult<null>> {
  try {
    const target = path.resolve(PACKS_DIR, relativePath);
    await fs.rm(target, { force: true, recursive: true });
    clearPacksCache();
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Read the metadata.yaml file for a template.
 */
export async function readTemplateYaml(templatePath: string): Promise<OperationResult<string>> {
  try {
    const metaPath = path.resolve(PACKS_DIR, templatePath, 'metadata.yaml');
    const content = await fs.readFile(metaPath, 'utf-8');
    return { ok: true, data: content };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Write the metadata.yaml file for a template.
 */
export async function writeTemplateYaml(templatePath: string, content: string): Promise<OperationResult<null>> {
  try {
    const metaPath = path.resolve(PACKS_DIR, templatePath, 'metadata.yaml');
    await fs.mkdir(path.dirname(metaPath), { recursive: true });
    await fs.writeFile(metaPath, content, 'utf-8');
    clearPacksCache();
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
