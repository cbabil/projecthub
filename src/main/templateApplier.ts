import { PACKS_DIR } from '@shared/constants.js';
import type { NormalizedTemplate } from '@shared/templates.js';
import { BrowserWindow, dialog } from 'electron';
import fs from 'fs/promises';
import path from 'path';

export type ConflictResolution = 'overwrite' | 'skip' | 'cancel';

type ConflictPrompt = (filePath: string) => Promise<{ decision: ConflictResolution; applyAll?: boolean }>;

const defaultPromptConflict: ConflictPrompt = async (filePath) => {
  const win = BrowserWindow.getFocusedWindow();
  const options: Electron.MessageBoxOptions = {
    type: 'question',
    buttons: ['Overwrite', 'Skip', 'Cancel'],
    defaultId: 0,
    cancelId: 2,
    title: 'File exists',
    message: `The file ${filePath} already exists.`,
    detail: 'Choose whether to overwrite, skip, or cancel project creation.',
    checkboxLabel: 'Apply to all conflicts',
    checkboxChecked: false
  } as const;
  const result = win ? await dialog.showMessageBox(win, options) : await dialog.showMessageBox(options);

  const map: ConflictResolution[] = ['overwrite', 'skip', 'cancel'];
  return { decision: map[result.response], applyAll: result.checkboxChecked };
};

const ensureDir = (target: string) => fs.mkdir(target, { recursive: true });

const shouldWriteFile = async (
  target: string,
  promptConflict: ConflictPrompt,
  stickyDecisionRef: { decision?: ConflictResolution }
): Promise<boolean> => {
  let shouldWrite = true;
  try {
    await fs.access(target);
    const sticky = stickyDecisionRef.decision;
    if (!sticky) {
      const res = await promptConflict(target);
      if (res.applyAll) stickyDecisionRef.decision = res.decision;
      if (res.decision === 'skip') shouldWrite = false;
      if (res.decision === 'cancel') throw new Error('cancelled');
    } else {
      if (sticky === 'skip') shouldWrite = false;
      if (sticky === 'cancel') throw new Error('cancelled');
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'cancelled') throw err;
    // file does not exist -> proceed
  }
  return shouldWrite;
};

const copyDirectory = async (
  sourceRoot: string,
  destinationRoot: string,
  promptConflict: ConflictPrompt,
  stickyDecisionRef: { decision?: ConflictResolution }
) => {
  const entries = await fs.readdir(sourceRoot, { withFileTypes: true });
  for (const entry of entries) {
    const sourcePath = path.join(sourceRoot, entry.name);
    const destPath = path.join(destinationRoot, entry.name);
    if (entry.isDirectory()) {
      await ensureDir(destPath);
      await copyDirectory(sourcePath, destPath, promptConflict, stickyDecisionRef);
    } else if (entry.isFile()) {
      if (await shouldWriteFile(destPath, promptConflict, stickyDecisionRef)) {
        await ensureDir(path.dirname(destPath));
        await fs.copyFile(sourcePath, destPath);
      }
    }
  }
};

const writeLines = async (target: string, lines: string[]) => {
  await ensureDir(path.dirname(target));
  await fs.writeFile(target, `${lines.join('\n')}${lines.length ? '\n' : ''}`);
};

export async function applyTemplates(
  destination: string,
  templates: NormalizedTemplate[],
  promptConflict: ConflictPrompt = defaultPromptConflict
): Promise<void> {
  await ensureDir(destination);

  const stickyDecisionRef: { decision?: ConflictResolution } = {};

  for (const tpl of templates) {
    if (tpl.kind === 'workspace') {
      const folders = tpl.folders || [];
      await Promise.all(folders.map((folder) => ensureDir(path.join(destination, folder))));
      continue;
    }

    if (tpl.kind === 'gitignore' || tpl.kind === 'env') {
      const target = path.join(destination, tpl.filename);
      if (await shouldWriteFile(target, promptConflict, stickyDecisionRef)) {
        await writeLines(target, tpl.lines);
      }
      continue;
    }

    if (tpl.kind === 'pack') {
      const sourceRoot = path.join(PACKS_DIR, tpl.packPath);
      if (tpl.files && Object.keys(tpl.files).length) {
        for (const [source, target] of Object.entries(tpl.files)) {
          const sourcePath = path.join(sourceRoot, source);
          const destPath = path.join(destination, target);
          if (await shouldWriteFile(destPath, promptConflict, stickyDecisionRef)) {
            await ensureDir(path.dirname(destPath));
            await fs.copyFile(sourcePath, destPath);
          }
        }
      } else {
        await copyDirectory(sourceRoot, destination, promptConflict, stickyDecisionRef);
      }
      continue;
    }
  }
}
