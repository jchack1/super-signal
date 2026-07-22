import { createRootRoute, createRoute, createRouter, Outlet, redirect } from '@tanstack/react-router';
import { NODE_GENERAL } from '@super-signal/core/adapters/mock';
import { AppShell } from './components/app-shell';

// The root route is the app-wide layout. `<Outlet />` renders the matched child.
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// "/" has no Node of its own, so it redirects to a default Node. `NODE_GENERAL`
// is a mock seed id used only here at the app boundary; a real backend would send
// the user to their last location or a home Node instead.
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/n/$nodeId', params: { nodeId: NODE_GENERAL } });
  },
});

// The Node route. The URL identifies "where you are" by stable Node id (`/n/:id`);
// the human-readable path is derived from the tree for display only. Renames and
// moves never break these links because the id never changes. AppShell stays
// mounted as the id changes, so tree state and scroll position persist.
const nodeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/n/$nodeId',
  component: AppShell,
});

const routeTree = rootRoute.addChildren([indexRoute, nodeRoute]);

export const router = createRouter({ routeTree });

// Registers our router's types globally so params, search, and links are all
// type-checked. This is what makes TanStack Router "type-safe".
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
