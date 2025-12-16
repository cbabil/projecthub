import { logger } from '@shared/logger.js';
import { BrowserWindow, ipcMain } from 'electron';

import { getMainWindow } from '../window.js';

const resolveWindow = () => getMainWindow() ?? BrowserWindow.getFocusedWindow();

export const registerWindowHandlers = () => {
  ipcMain.handle('app:window-control', (_event, action: 'minimize' | 'maximize' | 'close' | 'toggle-maximize') => {
    const win = resolveWindow();
    if (!win) return false;

    switch (action) {
      case 'minimize':
        win.minimize();
        return true;
      case 'maximize':
        if (!win.isMaximized()) {
          win.maximize();
        }
        return true;
      case 'toggle-maximize':
        if (win.isMaximized()) {
          win.unmaximize();
        } else {
          win.maximize();
        }
        return true;
      case 'close':
        if (process.platform === 'darwin') {
          win.hide();
        } else {
          win.close();
        }
        return true;
      default:
        return false;
    }
  });

  ipcMain.handle('app:get-window-state', () => ({
    isMaximized: resolveWindow()?.isMaximized() ?? false
  }));

  ipcMain.handle('log:renderer', (_event, level: 'log' | 'info' | 'warn' | 'error' | 'debug' = 'log', ...args: unknown[]) => {
    const levelMap: Record<string, keyof typeof logger> = { log: 'info', info: 'info', warn: 'warn', error: 'error', debug: 'debug' };
    const logFn = logger[levelMap[level] ?? 'info'];
    logFn('renderer', ...args);
  });

  ipcMain.handle('cache:filter-log', (_event, payload: { category?: string; count: number }) => {
    logger.info('ProjectHub', 'cache read (filter)', payload);
  });
};
