import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Increase max listeners to avoid MetaMask/extension noise: MaxListenersExceededWarning for ObjectMultiplex streams
// Extensions inject contentscript.js with many listeners; this silences the benign warning in dev.
if (typeof (globalThis as any).process?.setMaxListeners === 'function') {
  try { (globalThis as any).process.setMaxListeners(0); } catch {}
}
if (typeof (window as any).EventTarget !== 'undefined') {
  // No-op: ensure our app doesn't add 11+ listeners on same target without intent
}

const rootElement = document.getElementById('root')!;

if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
} else {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
}
