import type { Marketplace, PackCategory } from './types.js';

/**
 * Browser-safe marketplace constants.
 * Do NOT import Node.js modules here - this file is used by the renderer.
 */

export const OFFICIAL_MARKETPLACE: Marketplace = {
  id: 'official',
  name: 'ProjectHub Official',
  url: 'https://github.com/cbabil/projecthub-packs/releases/latest',
  isOfficial: true,
  enabled: true
};

export const PACK_CATEGORIES: PackCategory[] = [
  'Frontend',
  'Backend',
  'Fullstack',
  'Configuration',
  'Other'
];
