import type { Node } from '@super-signal/core';
import { nodeGlyph } from '../lib/node-display';

// Fallback view for Node kinds whose dedicated view isn't built yet (server,
// folder, voice, document). Keeps navigation coherent while those land in later
// slices.
export function NodePlaceholder({ node }: { node: Node }) {
  return (
    <section className="flex min-w-0 flex-1 flex-col items-center justify-center gap-2 bg-card p-8 text-center">
      <div className="font-mono text-sm text-primary">
        {nodeGlyph(node.type)} {node.name}
      </div>
      <p className="max-w-sm text-sm text-muted-foreground">
        This is a <span className="font-mono text-foreground">{node.type}</span> node. Its view
        (folder listing, document, voice room) arrives in a later slice — open{' '}
        <span className="font-mono text-foreground">general</span> in the tree to see chat.
      </p>
    </section>
  );
}
