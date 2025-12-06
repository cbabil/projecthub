import path from 'path';

import type { TemplateMeta } from './types.js';

export type NormalizedTemplate =
  | { kind: 'workspace'; id: string; name: string; folders: string[] }
  | { kind: 'gitignore'; id: string; name: string; filename: string; lines: string[] }
  | { kind: 'env'; id: string; name: string; filename: string; lines: string[] }
  | { kind: 'pack'; id: string; name: string; packPath: string; files?: Record<string, string> }
  | { kind: 'other'; id: string; name: string };

const coerceLines = (value?: unknown) => {
  if (!value) return [] as string[];
  if (Array.isArray(value)) return value.map((v) => String(v));
  if (typeof value === 'string') return value.split(/\r?\n/);
  return [] as string[];
};

export function normalizeTemplate(template: TemplateMeta): NormalizedTemplate {
  const id = (template as any).id ?? template.name;
  const name = template.name;
  const category = template.category ?? 'other';

  if ((template as any).packPath) {
    const files = template.structure?.files;
    return { kind: 'pack', id, name, packPath: (template as any).packPath, files };
  }

  if (category === 'workspace') {
    const folders = template.folders ?? template.structure?.folders ?? [];
    return { kind: 'workspace', id, name, folders };
  }

  if (category === 'gitignore') {
    const lines = coerceLines(template.content ?? template.structure?.files?.['.gitignore']);
    const filename = template.fileName || '.gitignore';
    return { kind: 'gitignore', id, name, filename, lines };
  }

  if (category === 'env') {
    const defaultFile = template.fileName || '.env';
    // if sourcePath hints at filename (e.g., configuration/env-frontend.json), prefer that basename without .json
    const hinted = template.sourcePath ? `.${path.basename(template.sourcePath, '.json')}` : defaultFile;
    const filename = template.fileName || hinted || '.env';
    const lines = coerceLines(template.content ?? template.structure?.files?.[filename]);
    return { kind: 'env', id, name, filename, lines };
  }

  if ((template as any).packPath) {
    return { kind: 'pack', id, name, packPath: (template as any).packPath };
  }

  return { kind: 'other', id, name };
}
