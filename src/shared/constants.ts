import os from 'os';
import path from 'path';

const home = os.homedir();
export const ROOT_DIR = path.join(home, '.projecthub');
export const SETTINGS_PATH = path.join(ROOT_DIR, 'settings.local.json');
export const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates'); // legacy, may be empty when packs are used
export const LIBRARIES_DIR = path.join(ROOT_DIR, 'libraries'); // legacy
export const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');
export const PACKS_DIR = path.join(ROOT_DIR, 'packs');

export const DEFAULT_TITLEBAR = {
  window: {
    width: 1280,
    height: 800,
    backgroundColor: '#1d1e22'
  },
  titleBar: {
    icons: [
      { ref: 'theme-toggle', action: 'theme-toggle', variant: 'titlebar' },
      { ref: 'settings', action: 'settings' }
    ],
    themeToggleVariant: 'titlebar'
  }
} as const;

export const DEFAULT_SETTINGS = {
  installPath: ROOT_DIR,
  projectsPath: PROJECTS_DIR,
  templatesPath: TEMPLATES_DIR,
  librariesPath: LIBRARIES_DIR,
  // Default to the latest GitHub release so new pack ZIPs are discovered automatically
  packsRepoUrl: 'https://github.com/cbabil/projecthub-packs/releases/latest',
  trace: 'info',
  theme: 'dark',
  accentColor: 'primary',
  enforceLineLimit: true,
  recentProjects: [],
  appVersion: '1.0.0',
  language: 'en',
  window: DEFAULT_TITLEBAR.window,
  titleBar: DEFAULT_TITLEBAR.titleBar
} as const;
