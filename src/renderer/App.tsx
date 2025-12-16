import React, { lazy, Suspense, useEffect, useMemo, useState } from 'react';

import Modal from './components/Modal.js';
import SettingsModalContent from './components/settings/SettingsModalContent.js';
import Sidebar from './components/Sidebar.js';
import TitleBar from './components/TitleBar.js';
import { useSettingsEvents } from './listeners/useSettingsEvents.js';

// Lazy load pages for code splitting
const Projects = lazy(() => import('./pages/Projects.js'));
const Templates = lazy(() => import('./pages/Templates.js'));
const Libraries = lazy(() => import('./pages/Libraries.js'));
const SettingsPage = lazy(() => import('./pages/Settings.js'));

const PageLoader: React.FC = () => (
  <div className="flex-1 flex items-center justify-center text-brand-text-dark/50">
    <span className="animate-pulse">Loading...</span>
  </div>
);

const routes = {
  projects: { title: 'Projects', Component: Projects },
  templates: { title: 'Templates', Component: Templates },
  libraries: { title: 'Libraries', Component: Libraries },
  settings: { title: 'Settings', Component: SettingsPage }
};

const App: React.FC = () => {
  useSettingsEvents();
  const [route, setRoute] = useState<string>('projects');
  const [isElectron, setIsElectron] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const baseRoute = (route.startsWith('templates:') ? 'templates' : route) as keyof typeof routes;
  const { Component } = useMemo(() => routes[baseRoute], [baseRoute]);

  useEffect(() => {
    setIsElectron(typeof window !== 'undefined' && Boolean(window.projecthub));
  }, []);

  const layoutClasses = [
    'flex h-screen min-h-screen bg-brand-bg-dark text-brand-text-dark',
    isElectron ? 'pt-11' : ''
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={layoutClasses}>
      {isElectron ? <TitleBar onOpenSettings={() => setSettingsModalOpen(true)} /> : null}
      <Sidebar active={route} onSelect={(key) => setRoute(key)} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <section className="flex-1 overflow-auto px-4 pb-6 pt-6 space-y-4 flex flex-col">
          <Suspense fallback={<PageLoader />}>
            <Component />
          </Suspense>
        </section>
      </main>
      <Modal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} title="Settings">
        <SettingsModalContent open={settingsModalOpen} />
      </Modal>
    </div>
  );
};

export default App;
