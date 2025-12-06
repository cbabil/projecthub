import { loadSettings, updateSettings } from '@shared/dataStore.js';
import type { ThemeMode } from '@shared/types.js';
import { BrowserWindow, Menu } from 'electron';

export const buildMenu = () => {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'ProjectHub',
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        {
          label: 'Settings…',
          accelerator: 'CmdOrCtrl+,',
          click: () =>
            BrowserWindow.getAllWindows().forEach((win) => {
              if (!win.isDestroyed()) win.webContents.send('ui:open-settings');
            })
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        {
          label: 'Toggle Theme',
          accelerator: 'CmdOrCtrl+T',
          click: async () => {
            const current = await loadSettings();
            if (!current.ok || !current.data) return;
            const nextTheme: ThemeMode = current.data.theme === 'dark' ? 'light' : 'dark';
            const next = { ...current.data, theme: nextTheme };
            await updateSettings(next);
            BrowserWindow.getAllWindows().forEach((win) => {
              if (!win.isDestroyed()) win.webContents.send('settings:changed', next);
            });
          }
        }
      ]
    },
    {
      label: 'Window',
      submenu: [{ role: 'minimize' }, { role: 'zoom' }, { role: 'close' }]
    },
    {
      label: 'Help',
      submenu: [{ role: 'togglefullscreen' }]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
