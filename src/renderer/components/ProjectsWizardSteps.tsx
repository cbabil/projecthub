/* eslint-disable max-lines */
import { ClipboardList, Folder, Layers, Library, PackageCheck } from 'lucide-react';
import path from 'path';
import React from 'react';

import Button from './Button.js';
import EmptyState from './EmptyState.js';
import Input from './Input.js';
import Search from './Search.js';

export type BasicsStepLabels = {
  name: string;
  destination: string;
  error: string;
  choose: string;
};

type BasicsProps = {
  name: string;
  version: string;
  destination: string;
  onNameChange: (value: string) => void;
  onVersionChange: (value: string) => void;
  onPickLocation: () => void;
  labels: BasicsStepLabels;
  showError: boolean;
};

export const BasicsStep: React.FC<BasicsProps> = ({ name, version, destination, onNameChange, onVersionChange, onPickLocation, labels, showError }) => (
  <div className="space-y-5">
    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] items-start sm:items-center">
      <div className="text-sm text-brand-text-dark/80 sm:text-right">{labels.name}</div>
      <Input value={name} onChange={onNameChange} className="w-full" placeholder={labels.name} />
    </div>
    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] items-start sm:items-center">
      <div className="text-sm text-brand-text-dark/80 sm:text-right">{labels.version}</div>
      <Input value={version} onChange={onVersionChange} className="w-full" placeholder="1.0.0" />
    </div>
    <div className="grid gap-3 sm:grid-cols-[160px_minmax(0,1fr)] items-start sm:items-center">
      <div className="text-sm text-brand-text-dark/80 sm:text-right">{labels.destination}</div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input value={destination} className="sm:flex-1" placeholder={labels.destination} readOnly />
        <Button type="button" variant="ghost" onClick={onPickLocation}>
          {labels.choose}
        </Button>
      </div>
    </div>
    {showError && <p className="text-xs text-brand-accent-red sm:pl-[160px]">{labels.error}</p>}
  </div>
);

type LibrariesProps = {
  libraries: { name: string }[];
  selected: string[];
  query: string;
  searchPlaceholder: string;
  emptyTitle: string;
  emptyMessage: string;
  onQueryChange: (value: string) => void;
  onToggle: (value: string) => void;
};

export const LibrariesStep: React.FC<LibrariesProps> = ({ libraries, selected, query, searchPlaceholder, emptyTitle, emptyMessage, onQueryChange, onToggle }) => (
  <div className="flex h-full flex-col gap-3">
    <div className="shrink-0">
      <Search value={query} onChange={onQueryChange} placeholder={searchPlaceholder} />
    </div>
    {libraries.length ? (
      <div className="flex-1 overflow-auto pr-1">
        <div className="flex flex-col gap-2">
          {libraries.map((lib) => (
            <label key={lib.name} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selected.includes(lib.name)} onChange={() => onToggle(lib.name)} />
              {lib.name}
            </label>
          ))}
        </div>
      </div>
    ) : (
      <div className="flex flex-1 items-center justify-center">
        <EmptyState icon={Library} title={emptyTitle} message={emptyMessage} />
      </div>
    )}
  </div>
);

type ReviewTemplate = { name: string; category?: string; structure?: { files?: Record<string, string> } };

type ReviewProps = {
  name: string;
  version: string;
  destination: string;
  templates: ReviewTemplate[];
  libraries: string[];
  labels: {
    name: string;
    template: string;
    version: string;
    installTree: string;
    libraries: string;
    none: string;
  };
};

const REVIEW_ROWS = [
  { key: 'name', icon: ClipboardList },
  { key: 'version', icon: ClipboardList },
  { key: 'template', icon: Layers },
  { key: 'libraries', icon: PackageCheck }
] as const;

const formatTemplates = (templates: ReviewTemplate[], fallback: string) => {
  if (!templates.length) return fallback;
  const byCategory = templates.reduce<Record<string, number>>((acc, tpl) => {
    const cat = tpl.category ?? 'other';
    acc[cat] = (acc[cat] ?? 0) + 1;
    return acc;
  }, {});
  const lines = [`${templates.length} selected`];
  Object.entries(byCategory).forEach(([cat, count]) => {
    lines.push(`  ${cat}: ${count}`);
  });
  return lines.join('\n');
};

export const ReviewStep: React.FC<ReviewProps> = ({ name, version, destination, templates, libraries, labels }) => {
  const buildInstallTree = () => {
    const root = destination || labels.none;
    const targets: string[] = [];

    templates.forEach((tpl) => {
      const filesMap = tpl.structure?.files ?? {};
      const fileTargets = Object.values(filesMap);
      if (fileTargets.length) {
        targets.push(...fileTargets);
      } else if ((tpl as any).structure?.folders?.length) {
        targets.push(...((tpl as any).structure.folders as string[]));
      } else {
        targets.push(tpl.name);
      }
    });

    if (!targets.length) return `${root}\n└─ (no templates selected)`;

    const lines = [root];
    targets.forEach((target, idx) => {
      const isLast = idx === targets.length - 1;
      const branch = isLast ? '└─' : '├─';
      lines.push(`${branch} ${target}`);
    });

    return lines.join('\n');
  };

  const valueMap: Record<string, string | string[]> = {
    name,
    version,
    template: formatTemplates(templates, labels.none),
    installTree: buildInstallTree(),
    libraries
  } as Record<string, string | string[]>;

  const hasWorkspace = templates.some((tpl) => tpl.category === 'workspace');

  const formatValue = (value: string | string[]) => {
    if (Array.isArray(value)) {
      if (!value.length) return labels.none;
      return value.join(', ');
    }
    return value || labels.none;
  };

  return (
    <div className="space-y-3 rounded-2xl border border-white/5 bg-white/5 p-4">
      {!hasWorkspace && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          No workspace template selected — folders will not be created unless present already.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          {REVIEW_ROWS.map(({ key, icon: Icon }, index) => (
            <div
              key={key}
              className={`flex items-start gap-3 border-brand-divider/20 ${index > 0 ? 'pt-3 border-t' : ''}`}
            >
              <div className="rounded-full bg-brand-divider/20 p-2 text-brand-text-dark/70">
                <Icon size={16} />
              </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-brand-text-dark/60">{labels[key as keyof ReviewProps['labels']]}</p>
              {key === 'template' ? (
                <pre className="text-sm text-white whitespace-pre-wrap font-mono leading-relaxed">{formatValue(valueMap[key])}</pre>
              ) : (
                <p className="text-sm text-white break-words">{formatValue(valueMap[key])}</p>
              )}
            </div>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-t border-brand-divider/20 pt-3 md:border-t-0 md:border-l md:pl-4">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-brand-divider/20 p-2 text-brand-text-dark/70">
              <Folder size={16} />
            </div>
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wide text-brand-text-dark/60">{labels.installTree}</p>
              <pre className="text-sm text-white whitespace-pre-wrap font-mono leading-relaxed">{formatValue(valueMap.installTree)}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
