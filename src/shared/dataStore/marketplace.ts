import fs from 'fs/promises';
import YAML from 'yaml';

import { MARKETPLACE_DIR, MARKETPLACE_METADATA_PATH } from '../constants.js';
import { OFFICIAL_MARKETPLACE } from '../marketplace.constants.js';
import type { Marketplace, OperationResult } from '../types.js';

interface MarketplaceMetadata {
  version: number;
  marketplaces: Marketplace[];
}

const DEFAULT_METADATA: MarketplaceMetadata = {
  version: 1,
  marketplaces: [OFFICIAL_MARKETPLACE]
};

/**
 * Ensure marketplace directory and metadata.yml exist
 */
export async function ensureMarketplaceDir(): Promise<void> {
  await fs.mkdir(MARKETPLACE_DIR, { recursive: true });
  try {
    await fs.access(MARKETPLACE_METADATA_PATH);
  } catch {
    // File doesn't exist, create with defaults
    await writeMarketplaceMetadata(DEFAULT_METADATA.marketplaces);
  }
}

/**
 * Load marketplaces from metadata.yml
 */
export async function loadMarketplaces(): Promise<OperationResult<Marketplace[]>> {
  try {
    await ensureMarketplaceDir();
    const content = await fs.readFile(MARKETPLACE_METADATA_PATH, 'utf-8');
    const data = YAML.parse(content) as MarketplaceMetadata;

    let marketplaces = data?.marketplaces ?? [];

    // Ensure official marketplace is always present
    if (!marketplaces.some((m) => m.isOfficial)) {
      marketplaces = [OFFICIAL_MARKETPLACE, ...marketplaces];
    }

    return { ok: true, data: marketplaces };
  } catch (error) {
    // If parsing fails, recreate with defaults
    console.error('Failed to load marketplace metadata, recreating:', error);
    await writeMarketplaceMetadata(DEFAULT_METADATA.marketplaces);
    return { ok: true, data: DEFAULT_METADATA.marketplaces };
  }
}

/**
 * Save marketplaces to metadata.yml
 */
export async function saveMarketplaces(marketplaces: Marketplace[]): Promise<OperationResult<Marketplace[]>> {
  try {
    await ensureMarketplaceDir();

    // Ensure official marketplace cannot be removed
    let toSave = marketplaces;
    if (!toSave.some((m) => m.isOfficial)) {
      toSave = [OFFICIAL_MARKETPLACE, ...toSave];
    }

    await writeMarketplaceMetadata(toSave);
    return { ok: true, data: toSave };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/**
 * Write marketplace metadata to YAML file
 */
async function writeMarketplaceMetadata(marketplaces: Marketplace[]): Promise<void> {
  const metadata: MarketplaceMetadata = {
    version: 1,
    marketplaces
  };

  const yamlContent = `# ProjectHub Marketplace Sources
# Add custom marketplaces using owner/repo or full URLs

${YAML.stringify(metadata)}`;

  await fs.writeFile(MARKETPLACE_METADATA_PATH, yamlContent, 'utf-8');
}

/**
 * Migrate marketplaces from settings.local.json to metadata.yml (one-time migration)
 */
export async function migrateFromSettings(settingsMarketplaces?: Marketplace[]): Promise<void> {
  if (!settingsMarketplaces || settingsMarketplaces.length === 0) return;

  try {
    await fs.access(MARKETPLACE_METADATA_PATH);
    // File already exists, skip migration
    return;
  } catch {
    // File doesn't exist, migrate
    await writeMarketplaceMetadata(settingsMarketplaces);
  }
}
