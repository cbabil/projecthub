import './styles.css';

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App.js';
import ToastContainer from './components/Toast.js';
import { DataProvider } from './context/DataContext.js';
import { MarketplaceProvider } from './context/MarketplaceContext.js';
import { PacksProvider } from './context/PacksContext.js';
import { SettingsProvider } from './context/SettingsContext.js';
import { ToastProvider } from './context/ToastContext.js';
import { TranslationProvider } from './context/TranslationContext.js';

type RootElement = HTMLElement & { dataset?: Record<string, string> };

const rootEl = document.getElementById('root') as RootElement;
if (!rootEl) throw new Error('Root element missing');

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <SettingsProvider>
      <MarketplaceProvider>
        <ToastProvider>
          <PacksProvider>
            <TranslationProvider>
              <DataProvider>
                <App />
                <ToastContainer />
              </DataProvider>
            </TranslationProvider>
          </PacksProvider>
        </ToastProvider>
      </MarketplaceProvider>
    </SettingsProvider>
  </React.StrictMode>
);
