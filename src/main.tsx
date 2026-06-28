import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './i18n/i18n';
import './index.css';
import App from './App';
import { LanguageProvider } from './providers/LanguageProvider';
import { QueryProvider } from './providers/QueryProvider';
import { Toaster } from 'react-hot-toast';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryProvider>
        <LanguageProvider>
          <App />
          <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        </LanguageProvider>
      </QueryProvider>
    </BrowserRouter>
  </React.StrictMode>
);
