import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { queryClient } from './lib/query-client';
import { router } from './router';
import '@super-signal/ui/globals.css';

// getElementById is typed as `HTMLElement | null` under our strict config,
// so we guard it rather than assert.
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element #root was not found in index.html');
}

// Providers wrap the whole app:
// - QueryClientProvider gives every component access to the shared data cache.
// - RouterProvider renders whichever route matches the URL.
createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
