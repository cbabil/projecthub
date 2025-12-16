import fs from 'fs/promises';
import path from 'path';
import YAML from 'yaml';

import { PROJECTS_DIR } from '../constants.js';
import type { OperationResult, ProjectMeta } from '../types.js';

export async function listProjects(): Promise<OperationResult<ProjectMeta[]>> {
  try {
    const entries = await fs.readdir(PROJECTS_DIR, { withFileTypes: true });
    const projects: ProjectMeta[] = [];
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const projectDir = path.join(PROJECTS_DIR, entry.name);
      const metaCandidates = ['metadata.yaml', 'metadata.yml'];
      let metaPath: string | null = null;
      for (const candidate of metaCandidates) {
        const full = path.join(projectDir, candidate);
        try {
          await fs.access(full);
          metaPath = full;
          break;
        } catch {
          // continue
        }
      }
      if (!metaPath) {
        // fallback: first yaml file in the directory
        try {
          const files = await fs.readdir(projectDir);
          const firstYaml = files.find((f) => f.endsWith('.yaml') || f.endsWith('.yml'));
          if (firstYaml) metaPath = path.join(projectDir, firstYaml);
        } catch {
          // ignore
        }
      }
      if (!metaPath) continue;
      try {
        const content = await fs.readFile(metaPath, 'utf-8');
        const meta = YAML.parse(content) as ProjectMeta;
        if (meta) {
          if (!meta.sourcePath) {
            meta.sourcePath = path.relative(PROJECTS_DIR, metaPath);
          }
          projects.push(meta);
        }
      } catch {
        // ignore malformed files
      }
    }
    return { ok: true, data: projects };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function deleteProjectFile(relativePath: string): Promise<OperationResult<null>> {
  try {
    const target = path.join(PROJECTS_DIR, relativePath);
    await fs.rm(target, { force: true, recursive: true });
    const dir = path.dirname(target);
    // If target was metadata inside a project dir, clean that directory
    if (dir.startsWith(PROJECTS_DIR) && dir !== PROJECTS_DIR) {
      await fs.rm(dir, { recursive: true, force: true });
    }
    return { ok: true, data: null };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

export async function createProjectFile(
  fileName: string,
  payload: ProjectMeta
): Promise<OperationResult<ProjectMeta>> {
  try {
    const baseName =
      fileName.endsWith('.json') || fileName.endsWith('.yaml') || fileName.endsWith('.yml')
        ? path.basename(fileName, path.extname(fileName))
        : fileName;
    const projectDir = path.join(PROJECTS_DIR, baseName);
    const yamlTarget = path.join(projectDir, 'metadata.yaml');
    const meta: ProjectMeta = { ...payload, sourcePath: path.relative(PROJECTS_DIR, yamlTarget) };
    await fs.mkdir(projectDir, { recursive: true });
    await fs.writeFile(yamlTarget, YAML.stringify(meta));
    return { ok: true, data: meta };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}
