/* eslint-disable max-lines */
import { SETTINGS_PATH } from '@shared/constants.js';
import {
  clearPacksCache,
  createProjectFile,
  deleteProjectFile,
  deleteTemplateFile,
  fetchJsonFromUrl,
  installPackFromUrl,
  listLibraries,
  listPacks,
  listProjects,
  listTemplateFolders,
  listTemplates,
  loadPlatformSettings,
  loadSettings,
  readSettingsFileRaw,
  readTemplateYaml,
  removePack,
  updateSettings,
  writeTemplateYaml
} from '@shared/dataStore.js';
import { normalizeTemplate } from '@shared/templates.js';
import { OperationResult, ProjectMeta, Settings, TemplateMeta } from '@shared/types.js';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from 'fs/promises';
import path from 'path';

import { applyTemplates } from './templateApplier.js';
import { getMainWindow } from './window.js';

const ensureChannel = <T>(channel: string, handler: (...args: any[]) => Promise<OperationResult<T>>) => {
  ipcMain.handle(channel, async (_event, ...args) => handler(...args));
};

/* eslint-disable max-lines-per-function */
const registerFilesystemChannels = () => {
  ensureChannel<Settings>('settings:load', () => loadSettings());
  ensureChannel<Settings>('settings:update', (payload: Settings) => updateSettings(payload));
  ensureChannel<string>('settings:readRaw', () => readSettingsFileRaw());
  ipcMain.handle('settings:get-path', () => SETTINGS_PATH);
  ipcMain.handle('app:get-platform-settings', () => loadPlatformSettings(process.platform));

  ipcMain.handle('filesystem:listTemplates', async (_event, source?: string) => {
    const res = await listTemplates(source ?? 'ipc:listTemplates');
    return res;
  });
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
  ensureChannel('filesystem:listTemplateFolders', () => listTemplateFolders());
  ensureChannel('filesystem:listLibraries', () => listLibraries());
  ensureChannel('filesystem:listProjects', () => listProjects());
  ensureChannel('filesystem:readTemplate', (templatePath: string) => readTemplateYaml(templatePath));
  ensureChannel('filesystem:updateTemplate', (payload: { templatePath: string; content: string }) =>
    writeTemplateYaml(payload.templatePath, payload.content)
  );
  ensureChannel('filesystem:deleteTemplate', async (relativePath: string) => {
    const res = await deleteTemplateFile(relativePath);
    if (res.ok) getMainWindow()?.webContents.send('filesystem:changed');
    return res;
  });
  ensureChannel('filesystem:deleteProject', async (payload: { relativePath: string; folderPath?: string }) => {
    const { relativePath, folderPath } = payload;
    const win = getMainWindow() ?? BrowserWindow.getFocusedWindow();
    const messageBoxOptions: Electron.MessageBoxOptions = {
      type: 'warning',
      buttons: ['Delete', 'Cancel'],
      defaultId: 0,
      cancelId: 1,
      title: 'Delete project',
      message: 'Delete this project from ProjectHub',
      detail: folderPath ? '' : 'Project folder path is unknown.',
      checkboxLabel: folderPath ? 'Delete project folder (this cannot be undone)' : undefined,
      checkboxChecked: Boolean(folderPath)
    };
    const result = win ? await dialog.showMessageBox(win, messageBoxOptions) : await dialog.showMessageBox(messageBoxOptions);

    if (result.response === 1) return { ok: false, error: 'cancelled' } as OperationResult<null>;

    if (result.checkboxChecked && folderPath) {
      try {
        await fs.rm(path.resolve(folderPath), { recursive: true, force: true });
      } catch (error) {
        return { ok: false, error: (error as Error).message } as OperationResult<null>;
      }
    }

    const res = await deleteProjectFile(relativePath);
    if (res.ok) {
      getMainWindow()?.webContents.send('filesystem:changed');
    }
    return res;
  });

  ipcMain.handle(
    'filesystem:createProjectFromTemplates',
    async (
      _event,
      payload: {
        name: string;
        destination: string;
        templates: TemplateMeta[];
        libraries: string[];
        version?: string;
        description?: string;
      }
    ) => {
      const { name, destination, templates, libraries, version } = payload;
      const timestamp = new Date().toISOString();

      try {
        const normalized = templates.map((tpl) => normalizeTemplate(tpl));
        await applyTemplates(destination, normalized);
      } catch (error) {
        const message = (error as Error)?.message ?? 'Template application failed';
        if (message === 'cancelled') return { ok: false, error: 'Operation cancelled' } as OperationResult<null>;
        return { ok: false, error: message } as OperationResult<null>;
      }

      const meta: ProjectMeta = {
        type: 'project',
        name,
        description: payload.description ?? `${name} created from ${templates.map((t) => t.name).join(', ')}`,
        version: version ?? '',
        lastEdited: timestamp,
        path: destination,
        templateUsed: templates.map((t) => t.name),
        librariesApplied: libraries
      };

      const safeName = `${name.replace(/\s+/g, '_').toLowerCase()}`;
      const res = await createProjectFile(safeName, meta);
      getMainWindow()?.webContents.send('filesystem:changed');
      // also refresh projects list cache in background
      listProjects().catch(() => undefined);
      return res;
    }
  );

  ensureChannel<ProjectMeta>('filesystem:writeJson', (fileName: string, payload: ProjectMeta) => {
    const safeName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    return createProjectFile(safeName, payload);
  });

  ipcMain.handle('filesystem:openFolder', async (_event, folderPath: string) => {
    const resolved = path.resolve(folderPath);
    await shell.openPath(resolved);
    return { ok: true } as OperationResult<null>;
  });

  ipcMain.handle('filesystem:pickProjectLocation', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory', 'createDirectory'] });
    if (result.canceled || result.filePaths.length === 0) {
      return { ok: false };
    }
    return { ok: true, path: result.filePaths[0] };
  });

  const resolveWindow = () => getMainWindow() ?? BrowserWindow.getFocusedWindow();

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

  ipcMain.handle('log:renderer', (_event, level: keyof Console = 'log', ...args: unknown[]) => {
    const target = console[level] ?? console.log;
    target('[renderer]', ...args);
  });

  ipcMain.handle('cache:filter-log', (_event, payload: { category?: string; count: number }) => {
    console.info('[ProjectHub] cache read (filter)', payload);
  });

};

export const registerIpcHandlers = () => registerFilesystemChannels();
