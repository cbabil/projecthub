/**
 * DataStore - Central data access layer for ProjectHub
 *
 * This file re-exports all data operations from modular files for backwards compatibility.
 * The actual implementation is split across:
 * - dataStore/settings.ts  - Settings load/save
 * - dataStore/templates.ts - Template listing and caching
 * - dataStore/projects.ts  - Project CRUD operations
 * - dataStore/packs.ts     - Pack installation and management
 * - dataStore/utils.ts     - Shared utilities and types
 */

export * from './dataStore/index.js';
