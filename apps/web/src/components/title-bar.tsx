import { Panel } from '@super-signal/ui/components/panel';

// The window title bar — pure vintage chrome. The three "lights" are decorative
// (they don't control a real OS window); the wordmark anchors the app identity.
export function TitleBar() {
  return (
    <div className="flex items-center gap-3 border-b border-bevel-lo bg-secondary px-3 py-1.5">
      <div className="flex gap-1.5">
        <Panel className="size-3 bg-secondary" />
        <Panel className="size-3 bg-secondary" />
        <Panel className="size-3 bg-secondary" />
      </div>
      <span className="font-mono text-xs tracking-widest text-foreground">super-signal</span>
      <span className="ml-auto font-mono text-xs text-muted-foreground">
        anon @ mock data — connected
      </span>
    </div>
  );
}
