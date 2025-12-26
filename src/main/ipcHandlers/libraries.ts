import {
  deleteLibraryFile,
  listLibraries,
  readLibraryYaml,
  writeLibraryYaml
} from '@shared/dataStore.js';
import type { OperationResult } from '@shared/types.js';
import { ipcMain } from 'electron';

import { getMainWindow } from '../window.js';

const ensureChannel = <T>(channel: string, handler: (...args: unknown[]) => Promise<OperationResult<T>>) => {
  ipcMain.handle(channel, async (_event, ...args) => handler(...args));
};

export const registerLibrariesHandlers = () => {
  ipcMain.handle('filesystem:listLibraries', async (_event, source?: string) => {
    const res = await listLibraries(source ?? 'ipc:listLibraries');
    return res;
  });

  ensureChannel('filesystem:readLibrary', (libraryPath: string) => readLibraryYaml(libraryPath));
  ensureChannel('filesystem:updateLibrary', (payload: { libraryPath: string; content: string }) =>
    writeLibraryYaml(payload.libraryPath, payload.content)
  );

  ensureChannel('filesystem:deleteLibrary', async (relativePath: string) => {
    const res = await deleteLibraryFile(relativePath);
    if (res.ok) getMainWindow()?.webContents.send('filesystem:changed');
    return res;
  });
};
