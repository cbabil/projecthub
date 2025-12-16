import { SETTINGS_PATH } from '@shared/constants.js';
import { loadPlatformSettings, loadSettings, readSettingsFileRaw, updateSettings } from '@shared/dataStore.js';
import type { OperationResult, Settings } from '@shared/types.js';
import { ipcMain } from 'electron';

const ensureChannel = <T>(channel: string, handler: (...args: unknown[]) => Promise<OperationResult<T>>) => {
  ipcMain.handle(channel, async (_event, ...args) => handler(...args));
};

export const registerSettingsHandlers = () => {
  ensureChannel<Settings>('settings:load', () => loadSettings());
  ensureChannel<Settings>('settings:update', (payload: Settings) => updateSettings(payload));
  ensureChannel<string>('settings:readRaw', () => readSettingsFileRaw());
  ipcMain.handle('settings:get-path', () => SETTINGS_PATH);
  ipcMain.handle('app:get-platform-settings', () => loadPlatformSettings(process.platform));
};
