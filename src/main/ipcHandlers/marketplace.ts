import { loadMarketplaces, saveMarketplaces } from '@shared/dataStore.js';
import type { Marketplace, OperationResult } from '@shared/types.js';
import { ipcMain } from 'electron';

const ensureChannel = <T>(channel: string, handler: (...args: unknown[]) => Promise<OperationResult<T>>) => {
  ipcMain.handle(channel, async (_event, ...args) => handler(...args));
};

export const registerMarketplaceHandlers = () => {
  ensureChannel<Marketplace[]>('marketplace:load', () => loadMarketplaces());
  ensureChannel<Marketplace[]>('marketplace:save', (payload: Marketplace[]) => saveMarketplaces(payload));
};
