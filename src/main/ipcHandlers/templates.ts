import {
  deleteTemplateFile,
  listTemplateFolders,
  listTemplates,
  readTemplateYaml,
  writeTemplateYaml
} from '@shared/dataStore.js';
import type { OperationResult } from '@shared/types.js';
import { ipcMain } from 'electron';

import { getMainWindow } from '../window.js';

const ensureChannel = <T>(channel: string, handler: (...args: unknown[]) => Promise<OperationResult<T>>) => {
  ipcMain.handle(channel, async (_event, ...args) => handler(...args));
};

export const registerTemplatesHandlers = () => {
  ipcMain.handle('filesystem:listTemplates', async (_event, source?: string) => {
    const res = await listTemplates(source ?? 'ipc:listTemplates');
    return res;
  });

  ensureChannel('filesystem:listTemplateFolders', () => listTemplateFolders());
  ensureChannel('filesystem:readTemplate', (templatePath: string) => readTemplateYaml(templatePath));
  ensureChannel('filesystem:updateTemplate', (payload: { templatePath: string; content: string }) =>
    writeTemplateYaml(payload.templatePath, payload.content)
  );

  ensureChannel('filesystem:deleteTemplate', async (relativePath: string) => {
    const res = await deleteTemplateFile(relativePath);
    if (res.ok) getMainWindow()?.webContents.send('filesystem:changed');
    return res;
  });
};
