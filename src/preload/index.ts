import { ipcRenderer } from 'electron';

import { exposeApi } from './api.js';

const installConsoleRelay = () => {
  const levels: Array<keyof Console> = ['log', 'info', 'warn', 'error', 'debug'];
  levels.forEach((level) => {
    const original = console[level];
    console[level] = (...args: unknown[]) => {
      // mirror renderer logs to main process while keeping DevTools output
      try {
        ipcRenderer.invoke('log:renderer', level, ...args);
      } catch {
        // ignore relay failures to avoid breaking renderer logging
      }
      original?.apply(console, args as []);
    };
  });
};

exposeApi();
installConsoleRelay();
