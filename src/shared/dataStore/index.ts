// Barrel export for dataStore modules
// This provides backwards compatibility - all exports available from one import

// Settings
export { ensureRoots, loadPlatformSettings, loadSettings, readSettingsFileRaw, updateSettings } from './settings.js';

// Templates
export { clearPacksCache, listTemplateFolders, listTemplates } from './templates.js';

// Template file operations
export { deleteTemplateFile, readTemplateYaml, writeTemplateYaml } from './templateFiles.js';

// Libraries
export { clearLibrariesCache, listLibraries } from './libraries.js';

// Library file operations
export { deleteLibraryFile, readLibraryYaml, writeLibraryYaml } from './libraryFiles.js';

// Projects
export { createProjectFile, deleteProjectFile, listProjects } from './projects.js';

// Packs
export { fetchJsonFromUrl, installPackFromUrl, listPacks, removePack } from './packs.js';

// Marketplace
export { ensureMarketplaceDir, loadMarketplaces, migrateFromSettings, saveMarketplaces } from './marketplace.js';

// Utils (export types for consumers who need them)
export type { PackContentEntry, PackFileEntry, PackMetadataYaml } from './utils.js';
