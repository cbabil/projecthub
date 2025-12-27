import { FileJson, Folder, Library, Store } from 'lucide-react';
import React from 'react';
import { Badge, SideMenu, type SideMenuItem } from 'ui-toolkit';

import { useData } from '../context/DataContext.js';
import { usePacks } from '../context/PacksContext.js';
import { ProjectHubNav } from '../types/navigation.js';

interface Props {
  active: string;
  onSelect: (key: string) => void;
}

const Sidebar: React.FC<Props> = ({ active, onSelect }) => {
  const [directories, setDirectories] = React.useState<string[]>([]);
  const { setTemplateFilter } = useData();
  const { updateCount } = usePacks();

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

  const handleSelect = (value: string) => {
    if (value === 'templates') {
      setTemplateFilter(undefined);
      logNav('templates');
    } else if (value.startsWith('templates:')) {
      const dir = value.replace('templates:', '');
      setTemplateFilter(dir);
      logNav('templates', { category: dir });
    } else {
      logNav(value as ProjectHubNav);
    }
    onSelect(value);
  };

  const items: SideMenuItem[] = [
    { label: 'Projects', value: 'projects', icon: <Folder size={18} /> },
    {
      label: 'Templates',
      value: 'templates',
      icon: <FileJson size={18} />,
      children: directories.map((dir) => ({
        label: dir,
        value: `templates:${dir}`,
        icon: <Folder size={14} />
      }))
    },
    { label: 'Libraries', value: 'libraries', icon: <Library size={18} /> }
  ];

  const footerItems: SideMenuItem[] = [
    {
      label: 'Marketplace',
      value: 'marketplace',
      icon: <Store size={18} />,
      badge: updateCount > 0 ? (
        <Badge variant="success" size="sm" circle>
          {updateCount}
        </Badge>
      ) : undefined
    }
  ];

  return (
    <SideMenu
      items={items}
      footerItems={footerItems}
      active={active}
      onSelect={handleSelect}
      className="bg-brand-surface-dark"
    />
  );
};

export default Sidebar;
