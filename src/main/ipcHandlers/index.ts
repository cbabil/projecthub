import { registerAIHandlers } from './ai.js';
import { registerLibrariesHandlers } from './libraries.js';
import { registerMarketplaceHandlers } from './marketplace.js';
import { registerPacksHandlers } from './packs.js';
import { registerProjectsHandlers } from './projects.js';
import { registerSettingsHandlers } from './settings.js';
import { registerTemplatesHandlers } from './templates.js';
import { registerWindowHandlers } from './window.js';

export const registerIpcHandlers = () => {
  registerAIHandlers();
  registerSettingsHandlers();
  registerPacksHandlers();
  registerTemplatesHandlers();
  registerLibrariesHandlers();
  registerProjectsHandlers();
  registerWindowHandlers();
  registerMarketplaceHandlers();
};
