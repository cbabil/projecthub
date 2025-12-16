import { electronApp } from '@electron-toolkit/utils';
import { PACKS_DIR, PROJECTS_DIR } from '@shared/constants.js';
import { clearPacksCache } from '@shared/dataStore.js';
import { ensureRoots, listTemplates, loadSettings } from '@shared/dataStore.js';
import { logger } from '@shared/logger.js';
import { app, BrowserWindow } from 'electron';
import fs from 'fs';

import { registerIpcHandlers } from './ipcHandlers.js';
import { buildMenu } from './menu.js';
import { createMainWindow } from './window.js';

const setAppPreferences = () => {
  electronApp.setAppUserModelId('com.projecthub.app');
};

const handleAppReady = async () => {
  await ensureRoots();
  // Preload settings file so defaults are present before renderer requests them
  const settingsRes = await loadSettings();
  const settings = settingsRes.ok && settingsRes.data ? settingsRes.data : null;
  if (settings?.trace) {
    process.env.PROJECTHUB_TRACE = settings.trace;
    if (settings.trace === 'debug') {
      process.env.DEBUG = '1';
    }
    logger.info('ProjectHub', `trace level: ${settings.trace}`);
  }
  await listTemplates('app:init');
  buildMenu();
  registerIpcHandlers();
  await createMainWindow();
  watchDirectories();
};

app.whenReady().then(() => {
  setAppPreferences();
  handleAppReady();

  app.on('activate', () => {
    if (AppWindows.isEmpty()) createMainWindow();
  });
});

app.on('window-all-closed', () => {
  app.quit();
});

const AppWindows = {
  isEmpty: () => BrowserWindow.getAllWindows().length === 0
};

const watchDirectories = () => {
  const targets = [PROJECTS_DIR, PACKS_DIR];
  targets.forEach((target) => {
    try {
      fs.watch(target, { recursive: true }, () => {
        if (target === PACKS_DIR) clearPacksCache();
        BrowserWindow.getAllWindows().forEach((win) => {
          if (!win.isDestroyed()) win.webContents.send('filesystem:changed');
        });
      });
    } catch (error) {
      logger.warn('ProjectHub', 'Failed to watch', target, error);
    }
  });
};
