/* eslint-disable max-lines */
import AdmZip from 'adm-zip';
import { createHash } from 'crypto';
import fsSync from 'fs';
import fs from 'fs/promises';
import https from 'https';
import path from 'path';
import YAML from 'yaml';

import { DEFAULT_SETTINGS, DEFAULT_TITLEBAR, PACKS_DIR, PROJECTS_DIR, ROOT_DIR, SETTINGS_PATH } from './constants.js';
import type { LibraryMeta, OperationResult, PackMeta, PlatformSettings, ProjectMeta, Settings, TemplateMeta, TraceLevel } from './types.js';

const encoder = (data: unknown) => JSON.stringify(data, null, 2);

const TRACE_ORDER: Record<TraceLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  critical: 50
};

const resolveTraceLevel = (): TraceLevel => {
  const envLevel = (process.env.PROJECTHUB_TRACE || '').toLowerCase();
  if (envLevel && TRACE_ORDER[envLevel as TraceLevel]) return envLevel as TraceLevel;
  return process.env.DEBUG ? 'debug' : 'info';
};

let packsCache: TemplateMeta[] | null = null;
let packsCachePromise: Promise<TemplateMeta[]> | null = null;
let cachedCategories: string[] | null = null;
let cachedCategoriesPromise: Promise<string[]> | null = null;
const traceLevel = resolveTraceLevel();
const debug = TRACE_ORDER[traceLevel] <= TRACE_ORDER.debug;
// In Electron main, process.type is undefined; in renderer it's 'renderer'. Treat undefined or 'browser' as main.
const isMainProcess = typeof process !== 'undefined' && (!process.type || process.type === 'browser');
const logDebug = (...args: unknown[]) => {
  if (debug && isMainProcess) {
    // eslint-disable-next-line no-console
    console.info('[packsCache]', ...args);
  }
};

const logCacheEvent = (action: 'generate' | 'read' | 'clear', count: number, source: string) => {
  if (!isMainProcess) return;
  console.info(`[ProjectHub] cache ${action}`, { count, source });
};
export const clearPacksCache = () => {
  packsCache = null;
  packsCachePromise = null;
  cachedCategories = null;
  cachedCategoriesPromise = null;
  logCacheEvent('clear', 0, 'clearPacksCache');
};

export const loadPlatformSettings = (platform: NodeJS.Platform = process.platform): PlatformSettings => {
  const mapped = platform === 'darwin' ? 'mac' : platform === 'win32' ? 'windows' : 'linux';
  return {
    window: { ...DEFAULT_TITLEBAR.window },
    titleBar: { ...DEFAULT_TITLEBAR.titleBar },
    platform: mapped
  };
};

export async function ensureRoots(): Promise<void> {
  const dirs = [ROOT_DIR, PROJECTS_DIR, PACKS_DIR];
  await Promise.all(dirs.map((dir) => fs.mkdir(dir, { recursive: true })));
  try {
    await fs.access(SETTINGS_PATH);
  } catch {
    await fs.writeFile(SETTINGS_PATH, encoder(DEFAULT_SETTINGS));
  }
}

async function readJson<T>(filePath: string): Promise<OperationResult<T>> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { ok: true, data: JSON.parse(content) as T };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

async function writeJson<T>(filePath: string, data: T): Promise<OperationResult<T>> {
  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, encoder(data));
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function loadSettings(): Promise<OperationResult<Settings>> {
  await ensureRoots();
  const res = await readJson<Settings>(SETTINGS_PATH);
  if (!res.ok || !res.data) return { ok: false, error: res.error };
  return {
    ok: true,
    data: {
      ...DEFAULT_SETTINGS,
      ...res.data,
      window: { ...DEFAULT_TITLEBAR.window, ...(res.data.window ?? {}) },
      titleBar: { ...DEFAULT_TITLEBAR.titleBar, ...(res.data.titleBar ?? {}) }
    }
  };
}

export async function readSettingsFileRaw() {
  try {
    const content = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return { ok: true, data: content } as OperationResult<string>;
  } catch (error) {
    return { ok: false, error: (error as Error).message } as OperationResult<string>;
  }
}

export async function updateSettings(payload: Settings): Promise<OperationResult<Settings>> {
  return writeJson<Settings>(SETTINGS_PATH, payload);
}

const buildPacksCache = async (): Promise<TemplateMeta[]> => {
  const packs = await fs.readdir(PACKS_DIR, { withFileTypes: true });
  const templates: TemplateMeta[] = [];

    const collectFiles = async (root: string) => {
      const files: string[] = [];
      const walk = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(full);
          } else if (entry.isFile()) {
            files.push(path.relative(root, full));
          }
        }
      };
      await walk(root);
      return files;
    };

    for (const packDir of packs.filter((d) => d.isDirectory())) {
      const packRoot = path.join(PACKS_DIR, packDir.name);
      const metaPath = path.join(packRoot, 'metadata.yaml');
      let meta: any = {};
      try {
        const metaRaw = await fs.readFile(metaPath, 'utf-8');
        meta = YAML.parse(metaRaw);
      } catch {
        // ignore
      }
      const templatesRoot = path.join(packRoot, 'templates');
      let entries: fs.Dirent[] = [];
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

        const contentMeta =
          Array.isArray(meta?.contents) && meta.contents.find?.((c: any) => c?.path && path.basename(c.path) === entry.name);

        const normalizeFiles = (files: any[]): Record<string, string> => {
          const map: Record<string, string> = {};
          files.forEach((f: any) => {
            if (!f || typeof f !== 'object') return;
            const source = String(f.source ?? '').trim();
            if (!source) return;
            const target = f.target ? String(f.target).trim() : path.basename(source);
            map[source] = target || path.basename(source);
          });
          return map;
        };

        let files: Record<string, string> = {};
        if (Array.isArray(contentMeta?.files)) {
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
    // Only the first caller logs generate; subsequent callers share the same promise but we avoid extra read logs here.
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
      // Prefer existing cache/promise to avoid extra generate/read logs
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

export async function listLibraries(): Promise<OperationResult<LibraryMeta[]>> {
  // Libraries not yet implemented; return empty list for compatibility
  return { ok: true, data: [] };
}

export async function listProjects(): Promise<OperationResult<ProjectMeta[]>> {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects: ProjectMeta[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const projectDir = path.join(PROJECTS_DIR, entry.name);
      const metaCandidates = ['metadata.yaml', 'metadata.yml'];
      let metaPath: string | null = null;
      for (const candidate of metaCandidates) {
        const full = path.join(projectDir, candidate);
        try {
          await fs.access(full);
          metaPath = full;
          break;
        } catch {
          // continue
        }
      }
      if (!metaPath) {
        // fallback: first yaml file in the directory
        try {
          const files = await fs.readdir(projectDir);
          const firstYaml = files.find((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
          if (firstYaml) metaPath = path.join(projectDir, firstYaml);
        } catch {
          // ignore
        }
      }
      if (!metaPath) continue;
      try {
        const content = await fs.readFile(metaPath, 'utf-8');
        const meta = YAML.parse(content) as ProjectMeta;
        if (meta) {
          if (!meta.sourcePath) {
            meta.sourcePath = path.relative(PROJECTS_DIR, metaPath);
          }
          projects.push(meta);
        }
      } catch {
        // ignore malformed files
      }
    }
    return { ok: true, data: projects };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function deleteProjectFile(relativePath: string): Promise<OperationResult<null>> {
  try {
    const target = path.join(PROJECTS_DIR, relativePath);
    await fs.rm(target, { force: true, recursive: true });
    const dir = path.dirname(target);
    // If target was metadata inside a project dir, clean that directory
    if (dir.startsWith(PROJECTS_DIR) && dir !== PROJECTS_DIR) {
      await fs.rm(dir, { recursive: true, force: true });
    }
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function deleteTemplateFile(relativePath: string): Promise<OperationResult<null>> {
  try {
    const target = path.resolve(PACKS_DIR, relativePath);
    await fs.rm(target, { force: true, recursive: true });
    clearPacksCache();
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: (error as Error).message } as OperationResult<null>;
  }
}

export async function readTemplateYaml(templatePath: string): Promise<OperationResult<string>> {
  try {
    const metaPath = path.resolve(PACKS_DIR, templatePath, 'metadata.yaml');
    const content = await fs.readFile(metaPath, 'utf-8');
    return { ok: true, data: content };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

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

export async function listPacks(): Promise<OperationResult<PackMeta[]>> {
  try {
    const entries = await fs.readdir(PACKS_DIR, { withFileTypes: true });
    const packs: PackMeta[] = [];
    for (const entry of entries.filter((d) => d.isDirectory())) {
      const packPath = path.join(PACKS_DIR, entry.name);
      const metaPath = path.join(packPath, 'metadata.yaml');
      let meta: any = {};
      try {
        meta = YAML.parse(await fs.readFile(metaPath, 'utf-8'));
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

export async function fetchJsonFromUrl(url: string): Promise<OperationResult<any>> {
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
      payload.path ? path.join(PACKS_DIR, path.basename(payload.path)) : void 0,
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

export async function createProjectFile(fileName: string, payload: ProjectMeta) {
  const baseName =
    fileName.endsWith('.json') || fileName.endsWith('.yaml') || fileName.endsWith('.yml')
      ? path.basename(fileName, path.extname(fileName))
      : fileName;
  const projectDir = path.join(PROJECTS_DIR, baseName);
  const yamlTarget = path.join(projectDir, 'metadata.yaml');
  const meta: ProjectMeta = { ...payload, sourcePath: path.relative(PROJECTS_DIR, yamlTarget) };
  await fs.mkdir(projectDir, { recursive: true });
  await fs.writeFile(yamlTarget, YAML.stringify(meta));
  return { ok: true, data: meta };
}
