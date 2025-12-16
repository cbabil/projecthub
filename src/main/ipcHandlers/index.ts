import { registerPacksHandlers } from './packs.js';
import { registerProjectsHandlers } from './projects.js';
import { registerSettingsHandlers } from './settings.js';
import { registerTemplatesHandlers } from './templates.js';
import { registerWindowHandlers } from './window.js';

export const registerIpcHandlers = () => {
  registerSettingsHandlers();
  registerPacksHandlers();
  registerTemplatesHandlers();
  registerProjectsHandlers();
  registerWindowHandlers();
};
