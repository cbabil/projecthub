import { createProjectFile, deleteProjectFile, listLibraries, listProjects } from '@shared/dataStore.js';
import { normalizeTemplate } from '@shared/templates.js';
import type { OperationResult, ProjectMeta, TemplateMeta } from '@shared/types.js';
import { BrowserWindow, dialog, ipcMain, shell } from 'electron';
import fs from 'fs/promises';
import path from 'path';

import { applyTemplates } from '../templateApplier.js';
import { getMainWindow } from '../window.js';

const ensureChannel = <T>(channel: string, handler: (...args: unknown[]) => Promise<OperationResult<T>>) => {
  ipcMain.handle(channel, async (_event, ...args) => handler(...args));
};

export const registerProjectsHandlers = () => {
  ensureChannel('filesystem:listLibraries', () => listLibraries());
  ensureChannel('filesystem:listProjects', () => listProjects());

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
};
