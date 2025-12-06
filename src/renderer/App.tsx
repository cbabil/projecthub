import React, { useEffect, useMemo, useState } from 'react';

import Modal from './components/Modal.js';
import SettingsModalContent from './components/settings/SettingsModalContent.js';
import Sidebar from './components/Sidebar.js';
import TitleBar from './components/TitleBar.js';
import { useSettingsEvents } from './listeners/useSettingsEvents.js';
import Libraries from './pages/Libraries.js';
import Projects from './pages/Projects.js';
import SettingsPage from './pages/Settings.js';
import Templates from './pages/Templates.js';

const routes = {
  projects: { title: 'Projects', element: <Projects /> },
  templates: { title: 'Templates', element: <Templates /> },
  libraries: { title: 'Libraries', element: <Libraries /> },
  settings: { title: 'Settings', element: <SettingsPage /> }
};

const App: React.FC = () => {
  useSettingsEvents();
  const [route, setRoute] = useState<string>('projects');
  const [isElectron, setIsElectron] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const baseRoute = (route.startsWith('templates:') ? 'templates' : route) as keyof typeof routes;
  const current = useMemo(() => routes[baseRoute], [baseRoute]);

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
        <section className="flex-1 overflow-auto px-4 pb-6 pt-6 space-y-4 flex flex-col">{current.element}</section>
      </main>
      <Modal open={settingsModalOpen} onClose={() => setSettingsModalOpen(false)} title="Settings">
        <SettingsModalContent open={settingsModalOpen} />
      </Modal>
    </div>
  );
};

export default App;
