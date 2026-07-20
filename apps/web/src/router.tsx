import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router';
import { HomePage } from './pages/home';

// The root route is the app-wide layout. `<Outlet />` is where the matched child
// route renders. For now it's just a pass-through; later it holds the shell
// (sidebar, breadcrumb bar, command line).
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// The home ("/") route. Phase 1 adds the real routes, e.g. `/n/$nodeId`.
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const routeTree = rootRoute.addChildren([indexRoute]);

export const router = createRouter({ routeTree });

// Registers our router's types globally so params, search, and links are all
// type-checked. This is what makes TanStack Router "type-safe".
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}