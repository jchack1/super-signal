import { NODE_SERVER } from '@super-signal/core/adapters/mock';
import { Button } from '@super-signal/ui/components/button';
import { useNode } from '../hooks/use-node';
import { useUiStore } from '../stores/ui-store';

// A temporary placeholder page that proves the plumbing works. It will be
// replaced by the real filesystem UI in Phase 1.
export function HomePage() {
  // TanStack Query: read a node from the mock data layer.
  const { data: server, isLoading } = useNode(NODE_SERVER);

  // Zustand: subscribe to just the pieces of global UI state we use.
  const commandLineOpen = useUiStore((state) => state.commandLineOpen);
  const setCommandLineOpen = useUiStore((state) => state.setCommandLineOpen);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">Super Signal</h1>
      <p className="text-muted-foreground">Filesystem underneath, Signal/Discord on top.</p>
      <p className="text-sm">
        {isLoading ? 'Loading…' : `Loaded from the mock data layer: ${server?.name ?? 'not found'}`}
      </p>
      <Button onClick={() => setCommandLineOpen(!commandLineOpen)}>
        Command line: {commandLineOpen ? 'open' : 'closed'}
      </Button>
    </main>
  );
}
