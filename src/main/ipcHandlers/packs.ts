import {
  clearPacksCache,
  fetchJsonFromUrl,
  installPackFromUrl,
  listPacks,
  removePack
} from '@shared/dataStore.js';
import type { OperationResult } from '@shared/types.js';
import { ipcMain } from 'electron';

import { getMainWindow } from '../window.js';

const ensureChannel = <T>(channel: string, handler: (...args: unknown[]) => Promise<OperationResult<T>>) => {
  ipcMain.handle(channel, async (_event, ...args) => handler(...args));
};

export const registerPacksHandlers = () => {
  ensureChannel('filesystem:listPacks', () => listPacks());

  ipcMain.handle('filesystem:installPack', async (_event, payload: { url: string; checksum?: string }) => {
    const res = await installPackFromUrl(payload.url, payload.checksum);
    if (res.ok) getMainWindow()?.webContents.send('filesystem:changed');
    return res;
  });

  ipcMain.handle('filesystem:removePack', async (_event, payload: { name: string; path?: string }) => {
    const res = await removePack(payload);
    if (res.ok) getMainWindow()?.webContents.send('filesystem:changed');
    return res;
  });

  ipcMain.handle('filesystem:clearPacksCache', async () => {
    clearPacksCache();
    getMainWindow()?.webContents.send('filesystem:changed');
    return { ok: true } as OperationResult<null>;
  });

  ensureChannel('packs:fetchManifest', (url: string) => fetchJsonFromUrl(url));
};
