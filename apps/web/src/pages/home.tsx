import { AppShell } from '../components/app-shell';

// The "/" route. For now the whole app is the shell; Phase 1 adds real routes
// (e.g. `/n/$nodeId`) that drive the current Node from the URL.
export function HomePage() {
  return <AppShell />;
}
