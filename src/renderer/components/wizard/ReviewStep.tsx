import { ClipboardList, Folder, Layers, PackageCheck } from 'lucide-react';
import React from 'react';

type ReviewTemplate = {
  name: string;
  category?: string;
  structure?: {
    folders?: string[];
    files?: Record<string, string>;
  };
};

export type ReviewStepLabels = {
  name: string;
  template: string;
  version: string;
  installTree: string;
  libraries: string;
  none: string;
};

type Props = {
  name: string;
  version: string;
  destination: string;
  templates: ReviewTemplate[];
  libraries: string[];
  labels: ReviewStepLabels;
};

const REVIEW_ROWS = [
  { key: 'name', icon: ClipboardList },
  { key: 'version', icon: ClipboardList },
  { key: 'template', icon: Layers },
  { key: 'libraries', icon: PackageCheck }
] as const;

const formatTemplates = (templates: ReviewTemplate[], fallback: string): string => {
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

const ReviewStep: React.FC<Props> = ({ name, version, destination, templates, libraries, labels }) => {
  const buildInstallTree = (): string => {
    const root = destination || labels.none;
    const targets: string[] = [];

    templates.forEach((tpl) => {
      const filesMap = tpl.structure?.files ?? {};
      const fileTargets = Object.values(filesMap);
      if (fileTargets.length) {
        targets.push(...fileTargets);
      } else if (tpl.structure?.folders?.length) {
        targets.push(...tpl.structure.folders);
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
  };

  const hasWorkspace = templates.some((tpl) => tpl.category === 'workspace');

  const formatValue = (value: string | string[]): string => {
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
            <div key={key} className={`flex items-start gap-3 border-brand-divider/20 ${index > 0 ? 'pt-3 border-t' : ''}`}>
              <div className="rounded-full bg-brand-divider/20 p-2 text-brand-text-dark/70">
                <Icon size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wide text-brand-text-dark/60">{labels[key as keyof ReviewStepLabels]}</p>
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

export default ReviewStep;
