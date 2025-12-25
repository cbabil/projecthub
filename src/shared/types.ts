export type ThemeMode = 'dark' | 'light';
export type AccentColor = 'primary' | 'boost' | 'blue' | 'green' | 'red';
export type FontSize = 'small' | 'medium' | 'large';
export type TraceLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type TitleBarIconAction = 'settings' | 'theme-toggle' | string;

export type TitleBarIconConfig = {
  ref: string;
  label?: string;
  action: TitleBarIconAction;
  variant?: 'default' | 'minimal' | 'titlebar';
};

export type TitleBarConfig = {
  icons: TitleBarIconConfig[];
  themeToggleVariant: 'default' | 'minimal' | 'titlebar';
};

export type WindowConfig = {
  width?: number;
  height?: number;
  backgroundColor?: string;
};

export type PlatformSettings = {
  window: Required<Pick<WindowConfig, 'width' | 'height'>> & {
    backgroundColor: string;
  };
  titleBar: TitleBarConfig;
  platform: 'mac' | 'windows' | 'linux';
};

export interface Marketplace {
  id: string;
  name: string;
  url: string;
  isOfficial?: boolean;
  enabled: boolean;
}

export interface Settings {
  installPath: string;
  projectsPath: string;
  templatesPath: string;
  librariesPath: string;
  /** @deprecated Use marketplace/metadata.yml instead */
  packsRepoUrl?: string;
  trace?: TraceLevel;
  theme: ThemeMode;
  accentColor: AccentColor;
  enforceLineLimit: boolean;
  recentProjects: string[];
  appVersion: string;
  language?: string;
  fontSize?: FontSize;
  reduceMotion?: boolean;
  window?: WindowConfig;
  titleBar?: TitleBarConfig;
}

export interface BaseMeta {
  type: 'template' | 'library' | 'project';
  name: string;
  description: string;
  version: string;
  lastEdited: string;
}

export type TemplateCategory = string; // allow any category from packs or templates

export type PackCategory = 'Frontend' | 'Backend' | 'Fullstack' | 'Configuration' | 'Other';

export interface TemplateMeta extends BaseMeta {
  type: 'template';
  id?: string;
  /**
   * Derived from folder path under ~/.projecthub/templates (e.g., workspaces/, configuration/gitignore-*)
   */
  category?: TemplateCategory;
  /** optional folder nesting relative to templates root */
  sourcePath?: string;
  /** workspace templates */
  folders?: string[];
  /** configuration templates (gitignore/env) */
  content?: string[];
  /** optional explicit filename for file-based templates */
  fileName?: string;
  /** default libraries to preselect */
  defaultLibraries?: string[];
  /** legacy/alternative structure shape kept for compatibility */
  structure?: {
    folders?: string[];
    files?: Record<string, string>;
  };
  editable?: boolean;
  /** absolute path when template comes from a pack folder */
  packPath?: string;
}

export interface LibraryMeta extends BaseMeta {
  type: 'library';
  files?: Record<string, string>;
  category?: string;
}

export interface ProjectMeta extends BaseMeta {
  type: 'project';
  path: string;
  templateUsed: string[];
  librariesApplied: string[];
  category?: string;
  sourcePath?: string;
  updatedAt?: string;
}

export interface PackMeta {
  name: string;
  description?: string;
  summary?: string;
  version?: string;
  installedVersion?: string;
  technology?: string;
  category?: PackCategory;
  license?: string;
  /** Remote ZIP URL (for installation) or local directory path when listed from disk */
  path: string;
  /** Installed directory path if present locally */
  localPath?: string;
  checksum?: string;
  releasedOn?: string;
  status: 'installed' | 'missing';
  /** Source marketplace identifier */
  marketplaceId?: string;
  /** Source marketplace display name for UI */
  marketplaceName?: string;
}

export type AnyMeta = TemplateMeta | LibraryMeta | ProjectMeta;

export interface OperationResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

export type ChannelName =
  | 'settings:load'
  | 'settings:update'
  | 'filesystem:listTemplates'
  | 'filesystem:listTemplateFolders'
  | 'filesystem:listLibraries'
  | 'filesystem:listProjects'
  | 'filesystem:createProjectFromTemplates'
  | 'filesystem:deleteTemplate'
  | 'filesystem:deleteProject'
  | 'filesystem:writeJson'
  | 'filesystem:openFolder';
