import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.js';
import { DataProvider } from './context/DataContext.js';
import { SettingsProvider } from './context/SettingsContext.js';
import { TranslationProvider } from './context/TranslationContext.js';

type RootElement = HTMLElement & { dataset?: Record<string, string> };

const rootEl = document.getElementById('root') as RootElement;
if (!rootEl) throw new Error('Root element missing');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <SettingsProvider>
      <TranslationProvider>
        <DataProvider>
          <App />
        </DataProvider>
      </TranslationProvider>
    </SettingsProvider>
  </React.StrictMode>
);
