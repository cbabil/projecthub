import { LibraryMeta, OperationResult, PlatformSettings, ProjectMeta, Settings, TemplateMeta } from '@shared/types.js';
import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron';

const api = {
  loadSettings: () => ipcRenderer.invoke('settings:load') as Promise<OperationResult<Settings>>,
  updateSettings: (payload: Settings) => ipcRenderer.invoke('settings:update', payload) as Promise<OperationResult<Settings>>,
  readRawSettings: () => ipcRenderer.invoke('settings:readRaw') as Promise<OperationResult<string>>,
  getSettingsPath: () => ipcRenderer.invoke('settings:get-path') as Promise<string>,
  getPlatformSettings: () => ipcRenderer.invoke('app:get-platform-settings') as Promise<PlatformSettings>,
  listTemplates: (source?: string) => ipcRenderer.invoke('filesystem:listTemplates', source) as Promise<OperationResult<TemplateMeta[]>>,
  listLibraries: () => ipcRenderer.invoke('filesystem:listLibraries') as Promise<OperationResult<LibraryMeta[]>>,
  listProjects: () => ipcRenderer.invoke('filesystem:listProjects') as Promise<OperationResult<ProjectMeta[]>>,
  listTemplateFolders: () => ipcRenderer.invoke('filesystem:listTemplateFolders') as Promise<OperationResult<string[]>>,
  readTemplate: (templatePath: string) => ipcRenderer.invoke('filesystem:readTemplate', templatePath) as Promise<OperationResult<string>>,
  updateTemplate: (payload: { templatePath: string; content: string }) =>
    ipcRenderer.invoke('filesystem:updateTemplate', payload) as Promise<OperationResult<null>>,
  listPacks: () => ipcRenderer.invoke('filesystem:listPacks') as Promise<OperationResult<import('@shared/types.js').PackMeta[]>>,
  installPack: (payload: { url: string; checksum?: string }) =>
    ipcRenderer.invoke('filesystem:installPack', payload) as Promise<OperationResult<null>>,
  removePack: (payload: { name: string; path?: string }) =>
    ipcRenderer.invoke('filesystem:removePack', payload) as Promise<OperationResult<null>>,
  clearPacksCache: () => ipcRenderer.invoke('filesystem:clearPacksCache') as Promise<OperationResult<null>>,
  fetchManifest: (url: string) => ipcRenderer.invoke('packs:fetchManifest', url) as Promise<OperationResult<unknown>>,
  createProject: (fileName: string, payload: ProjectMeta) => ipcRenderer.invoke('filesystem:writeJson', fileName, payload) as Promise<OperationResult<ProjectMeta>>,
  createProjectFromTemplates: (payload: { name: string; version?: string; destination: string; templates: TemplateMeta[]; libraries: string[]; description?: string }) =>
    ipcRenderer.invoke('filesystem:createProjectFromTemplates', payload) as Promise<OperationResult<ProjectMeta>>,
  deleteTemplate: (relativePath: string) => ipcRenderer.invoke('filesystem:deleteTemplate', relativePath) as Promise<OperationResult<null>>,
  deleteProject: (payload: { relativePath: string; folderPath?: string }) =>
    ipcRenderer.invoke('filesystem:deleteProject', payload) as Promise<OperationResult<null>>,
  openFolder: (folderPath: string) => ipcRenderer.invoke('filesystem:openFolder', folderPath) as Promise<OperationResult<null>>,
  pickProjectLocation: () => ipcRenderer.invoke('filesystem:pickProjectLocation') as Promise<{ ok: boolean; path?: string }>,
  windowControls: {
    minimize: () => ipcRenderer.invoke('app:window-control', 'minimize'),
    maximize: () => ipcRenderer.invoke('app:window-control', 'maximize'),
    toggleMaximize: () => ipcRenderer.invoke('app:window-control', 'toggle-maximize'),
    close: () => ipcRenderer.invoke('app:window-control', 'close'),
    getState: () => ipcRenderer.invoke('app:get-window-state') as Promise<{ isMaximized: boolean }>
  },
  onWindowMaximizeChanged: (listener: (isMaximized: boolean) => void) => {
    const channel = 'app:window-maximize-changed';
    const handler = (_event: IpcRendererEvent, flag: boolean) => listener(flag);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },
  ipc: {
    on: (channel: string, listener: (...args: unknown[]) => void) => ipcRenderer.on(channel, (_event, ...args) => listener(...args)),
    removeAllListeners: (channel: string) => ipcRenderer.removeAllListeners(channel)
  },
  log: (level: 'log' | 'info' | 'warn' | 'error' | 'debug', ...args: unknown[]) => ipcRenderer.invoke('log:renderer', level, ...args),
  logCacheFilter: (category: string | undefined, count: number) => ipcRenderer.invoke('cache:filter-log', { category, count })
};

export type PreloadApi = typeof api;

export const exposeApi = () => {
  contextBridge.exposeInMainWorld('projecthub', api);
};
