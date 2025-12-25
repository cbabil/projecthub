import { FileJson, Folder, Library, Store } from 'lucide-react';
import React from 'react';

import { useData } from '../context/DataContext.js';
import { ProjectHubNav } from '../types/navigation.js';

interface Props {
  active: string;
  onSelect: (key: string) => void;
}

const Sidebar: React.FC<Props> = ({ active, onSelect }) => {
  const [directories, setDirectories] = React.useState<string[]>([]);
  const { setTemplateFilter } = useData();

  React.useEffect(() => {
    const loadDirs = () =>
      window.projecthub.listTemplateFolders().then((res) => {
        if (res.ok && res.data) setDirectories(res.data);
      });
    loadDirs();
    window.projecthub?.ipc?.on?.('filesystem:changed', loadDirs);
    return () => {
      window.projecthub?.ipc?.removeAllListeners?.('filesystem:changed');
    };
  }, []);

  const logNav = (dest: ProjectHubNav, extra?: Record<string, unknown>) => {
    try {
      window.projecthub?.log?.('info', '[ProjectHub] nav', { dest, ...(extra ?? {}) });
    } catch {
      // best effort
    }
  };

  return (
    <aside className="w-56 bg-brand-surface-dark text-brand-text-dark p-4 pt-8 flex flex-col gap-3">
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-left transition cursor-pointer ${
          active === 'projects' ? 'bg-brand-accent-primary text-white' : 'hover:bg-brand-divider/30'
        }`}
        onClick={() => {
          logNav('projects');
          onSelect('projects');
        }}
      >
        <Folder size={18} />
        <span className="text-sm">Projects</span>
      </button>

      <div>
        <button
          className={`flex w-full items-center gap-2 px-3 py-2 rounded-md text-left transition cursor-pointer ${
            active === 'templates' ? 'bg-brand-accent-primary text-white' : 'hover:bg-brand-divider/30 text-brand-text-dark/90'
          }`}
        onClick={() => {
          setTemplateFilter(undefined);
          logNav('templates');
          onSelect('templates');
        }}
        >
          <FileJson size={18} />
          <span className="text-sm">Templates</span>
        </button>
        <div className="mt-1 pl-6 space-y-1">
          {directories.map((dir) => (
            <button
              key={dir}
              className={`flex items-center gap-2 text-xs px-2 py-1 rounded-md transition cursor-pointer ${
                active === `templates:${dir}`
                  ? 'bg-brand-accent-primary text-white'
                  : 'hover:bg-brand-divider/10 text-brand-text-dark'
              }`}
              onClick={() => {
                setTemplateFilter(dir);
                logNav('templates', { category: dir });
                onSelect(`templates:${dir}`);
              }}
            >
              <Folder size={14} />
              <span>{dir}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-left transition cursor-pointer ${
          active === 'libraries' ? 'bg-brand-accent-primary text-white' : 'hover:bg-brand-divider/30'
        }`}
        onClick={() => {
          logNav('libraries');
          onSelect('libraries');
        }}
      >
        <Library size={18} />
        <span className="text-sm">Libraries <span className="text-[11px] text-brand-text-dark/70">(Coming soon)</span></span>
      </button>

      <div className="mt-auto pt-4 border-t border-brand-divider/20">
        <button
          className={`flex w-full items-center gap-2 px-3 py-2 rounded-md text-left transition cursor-pointer ${
            active === 'marketplace' ? 'bg-brand-accent-primary text-white' : 'hover:bg-brand-divider/30'
          }`}
          onClick={() => {
            logNav('marketplace');
            onSelect('marketplace');
          }}
        >
          <Store size={18} />
          <span className="text-sm">Marketplace</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
