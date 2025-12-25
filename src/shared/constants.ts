import os from 'os';
import path from 'path';

import { OFFICIAL_MARKETPLACE } from './marketplace.constants.js';

// Re-export for convenience (main process only)
export { OFFICIAL_MARKETPLACE };

const home = os.homedir();
export const ROOT_DIR = path.join(home, '.projecthub');
export const SETTINGS_PATH = path.join(ROOT_DIR, 'settings.local.json');
export const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates'); // legacy only
export const LIBRARIES_DIR = path.join(ROOT_DIR, 'libraries'); // legacy only
export const PROJECTS_DIR = path.join(ROOT_DIR, 'projects');
export const PACKS_DIR = path.join(ROOT_DIR, 'packs');
export const MARKETPLACE_DIR = path.join(ROOT_DIR, 'marketplace');
export const MARKETPLACE_METADATA_PATH = path.join(MARKETPLACE_DIR, 'metadata.yml');

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
  packsPath: PACKS_DIR,
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
