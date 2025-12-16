import AdmZip from 'adm-zip';
import { createHash } from 'crypto';
import fsSync from 'fs';
import fs from 'fs/promises';
import https from 'https';
import os from 'os';
import path from 'path';
import YAML from 'yaml';

import { PACKS_DIR } from '../constants.js';
import type { OperationResult, PackMeta } from '../types.js';
import { clearPacksCache } from './templates.js';
import { PackMetadataYaml } from './utils.js';

export async function listPacks(): Promise<OperationResult<PackMeta[]>> {
  try {
    const entries = await fs.readdir(PACKS_DIR, { withFileTypes: true });
    const packs: PackMeta[] = [];
    for (const entry of entries.filter((d) => d.isDirectory())) {
      const packPath = path.join(PACKS_DIR, entry.name);
      const metaPath = path.join(packPath, 'metadata.yaml');
      let meta: PackMetadataYaml = {};
      try {
        meta = YAML.parse(await fs.readFile(metaPath, 'utf-8')) as PackMetadataYaml;
      } catch {
        meta = {};
      }
      packs.push({
        name: meta?.name ?? entry.name,
        description: meta?.summary,
        summary: meta?.summary,
        version: meta?.version,
        installedVersion: meta?.version,
        technology: meta?.technology,
        license: meta?.license,
        path: packPath,
        localPath: packPath,
        releasedOn: meta?.releasedOn,
        status: 'installed'
      });
    }
    return { ok: true, data: packs };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function fetchJsonFromUrl(url: string): Promise<OperationResult<unknown>> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

const downloadToTemp = (url: string, redirects = 0): Promise<string> =>
  new Promise((resolve, reject) => {
    const tmpFile = path.join(os.tmpdir(), `projecthub-pack-${Date.now()}.zip`);
    const request = https.get(
      url,
      { headers: { 'User-Agent': 'projecthub/1.0', Accept: 'application/octet-stream' } },
      (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          if (redirects > 5) return reject(new Error('Too many redirects'));
          res.resume();
          return resolve(downloadToTemp(res.headers.location, redirects + 1));
        }
        if (res.statusCode && res.statusCode >= 400) return reject(new Error(`HTTP ${res.statusCode}`));
        const file = fsSync.createWriteStream(tmpFile);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(tmpFile)));
      }
    );
    request.on('error', (err) => reject(err));
  });

const verifyChecksum = async (filePath: string, expected?: string): Promise<void> => {
  if (!expected) return;
  const normalized = expected.toLowerCase().replace(/^sha256:/, '');
  const data = await fs.readFile(filePath);
  const hash = createHash('sha256').update(data).digest('hex');
  if (hash !== normalized) throw new Error('Checksum mismatch');
};

export async function installPackFromUrl(url: string, checksum?: string): Promise<OperationResult<null>> {
  try {
    const zipPath = await downloadToTemp(url);
    await verifyChecksum(zipPath, checksum);
    const zip = new AdmZip(zipPath);
    const entries = zip.getEntries();
    if (!entries.length) return { ok: false, error: 'Empty ZIP' };

    const zipName = (() => {
      try {
        const u = new URL(url);
        return path.basename(u.pathname);
      } catch {
        return path.basename(url);
      }
    })();

    const packDirName = zipName.toLowerCase().endsWith('.zip') ? zipName.slice(0, -4) : zipName || `pack-${Date.now()}`;
    const targetDir = path.join(PACKS_DIR, packDirName || `pack-${Date.now()}`);

    await fs.rm(targetDir, { recursive: true, force: true });
    await fs.mkdir(targetDir, { recursive: true });
    zip.extractAllTo(targetDir, true);
    await fs.rm(zipPath, { force: true });
    clearPacksCache();
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function removePack(payload: { name: string; path?: string }): Promise<OperationResult<null>> {
  try {
    const candidates = [
      payload.path,
      payload.path ? path.join(PACKS_DIR, path.basename(payload.path)) : undefined,
      path.join(PACKS_DIR, payload.name)
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      try {
        await fs.access(candidate);
      } catch {
        continue;
      }
      await fs.rm(candidate, { recursive: true, force: true });
      clearPacksCache();
      return { ok: true, data: null };
    }
    return { ok: false, error: 'Pack folder not found on disk' };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
