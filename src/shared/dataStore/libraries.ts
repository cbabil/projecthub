import type { LibraryMeta, OperationResult } from '../types.js';

/**
 * List available libraries.
 * Libraries feature not yet implemented; returns empty list for API compatibility.
 */
export async function listLibraries(): Promise<OperationResult<LibraryMeta[]>> {
  return { ok: true, data: [] };
}
