import { useEffect } from 'react';

import { useSettings } from '../context/SettingsContext.js';

export const useSettingsEvents = () => {
  const { refresh } = useSettings();

  useEffect(() => {
    const onChanged = () => refresh();
    const onOpenSettings = () => {
      const nav = document.getElementById('nav-settings');
      nav?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    };

    window.projecthub?.ipc?.on?.('settings:changed', onChanged);
    window.projecthub?.ipc?.on?.('ui:open-settings', onOpenSettings);

    return () => {
      window.projecthub?.ipc?.removeAllListeners?.('settings:changed');
      window.projecthub?.ipc?.removeAllListeners?.('ui:open-settings');
    };
  }, [refresh]);
};
