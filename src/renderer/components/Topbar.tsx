import React from 'react';

import { useSettings } from '../context/SettingsContext.js';

interface Props {
  title: string;
  actions?: React.ReactNode;
}

const Topbar: React.FC<Props> = ({ title, actions }) => {
  const { settings } = useSettings();
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-brand-divider/50 bg-brand-surface-dark/80 sticky top-0 z-10">
      <div>
        <p className="text-xs text-brand-text-dark/60">Workspace</p>
        <h1 className="text-xl font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3 text-sm">
        {settings && <span className="text-brand-text-dark/70">v{settings.appVersion}</span>}
        {actions}
      </div>
    </header>
  );
};

export default Topbar;
