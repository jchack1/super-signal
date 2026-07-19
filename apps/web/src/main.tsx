import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import '@super-signal/ui/globals.css';

// getElementById is typed as `HTMLElement | null` under our strict config,
// so we guard it rather than assert — a small example of the strictness paying off.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
