import { DEFAULT_SETTINGS, DEFAULT_TITLEBAR } from '@shared/constants.js';
import { loadSettings } from '@shared/dataStore.js';
import { BrowserWindow } from 'electron';
import fs from 'fs';
import path from 'path';

const isMac = process.platform === 'darwin';
let mainWindow: BrowserWindow | null = null;

const emitMaximizeState = (win: BrowserWindow) => {
  if (win.isDestroyed()) return;
  win.webContents.send('app:window-maximize-changed', win.isMaximized());
};

export const getMainWindow = () => mainWindow;

export const createMainWindow = async () => {
  const settingsRes = await loadSettings();
  const settings = settingsRes.ok && settingsRes.data ? settingsRes.data : { ...DEFAULT_SETTINGS };
  const userWindow = (settings as Record<string, unknown>)['window'] as Record<string, unknown> | undefined;
  const preloadCandidates = ['index.cjs', 'index.js', 'index.mjs'];
  const preloadPath = preloadCandidates
    .map((file) => path.join(__dirname, '../preload/', file))
    .find((candidate) => fs.existsSync(candidate))
    || path.join(__dirname, '../preload/index.cjs');
  const isDev = !!process.env['ELECTRON_RENDERER_URL'];

  const win = new BrowserWindow({
    width: (userWindow?.['width'] as number) || DEFAULT_TITLEBAR.window.width,
    height: (userWindow?.['height'] as number) || DEFAULT_TITLEBAR.window.height,
    backgroundColor: (userWindow?.['backgroundColor'] as string) || DEFAULT_TITLEBAR.window.backgroundColor,
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    titleBarOverlay: isMac
      ? {
          color: '#00000000',
          height: 36,
          symbolColor: '#ffffff'
        }
      : undefined,
    frame: true,
    ...(userWindow || {}),
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      ...(userWindow?.['webPreferences'] as Record<string, unknown> | undefined)
    }
  });

  mainWindow = win;

  win.on('ready-to-show', () => {
    emitMaximizeState(win);
  });

  win.on('maximize', () => emitMaximizeState(win));
  win.on('unmaximize', () => emitMaximizeState(win));
  win.on('closed', () => {
    if (mainWindow === win) {
      mainWindow = null;
    }
  });

  if (isDev) {
    const devUrl = process.env['ELECTRON_RENDERER_URL'] as string;
    await win.loadURL(devUrl);
    // Always enable devtools in dev for easier debugging
    win.webContents.openDevTools({ mode: 'detach' });
  } else {
    await win.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  return win;
};
