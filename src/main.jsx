import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App, { preloadPages } from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);

// Offline support (production only, so the dev server is never cached)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
    // When the browser is idle, fetch the other pages so they open instantly and work offline
    const idle = window.requestIdleCallback ?? ((cb) => setTimeout(cb, 2500));
    idle(() => preloadPages().catch(() => {}));
  });
}
