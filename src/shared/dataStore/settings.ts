import fs from 'fs/promises';

import { DEFAULT_SETTINGS, DEFAULT_TITLEBAR, PACKS_DIR, PROJECTS_DIR, ROOT_DIR, SETTINGS_PATH } from '../constants.js';
import type { OperationResult, PlatformSettings, Settings } from '../types.js';
import { encoder, readJson, writeJson } from './utils.js';

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

export async function readSettingsFileRaw(): Promise<OperationResult<string>> {
  try {
    const content = await fs.readFile(SETTINGS_PATH, 'utf-8');
    return { ok: true, data: content };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function updateSettings(payload: Settings): Promise<OperationResult<Settings>> {
  return writeJson<Settings>(SETTINGS_PATH, payload);
}
