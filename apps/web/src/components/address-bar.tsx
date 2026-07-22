import type { NodeId } from '@super-signal/core';
import { Panel } from '@super-signal/ui/components/panel';
import { useNavigateToNode } from '../hooks/use-navigate-to-node';
import { useNodePath } from '../hooks/use-node-path';
import { nodeGlyph } from '../lib/node-display';

// Read-only breadcrumbs: the "you are here" path derived from the tree. Click any
// crumb to jump there (a shortcut for `cd`). Typing/commands live in the single
// command line at the bottom — this bar is orientation only.
export function AddressBar({ currentNodeId }: { currentNodeId: NodeId }) {
  const navigateToNode = useNavigateToNode();
  const { path } = useNodePath(currentNodeId);

  // The parent is the second-to-last node on the path; the root has none.
  const parent = path.length >= 2 ? path[path.length - 2] : undefined;

  return (
    <div className="flex items-center gap-2 border-b border-bevel-lo bg-secondary px-2.5 py-2">
      {/* Back / forward will wire to browser history in a later slice; for now
          they're inert. Up-one-level works today. */}
      <div className="flex items-center gap-1 font-mono text-sm">
        <span aria-hidden="true" className="text-muted-foreground/40">
          ◄
        </span>
        <span aria-hidden="true" className="text-muted-foreground/40">
          ►
        </span>
        <button
          type="button"
          onClick={() => parent && navigateToNode(parent.id)}
          disabled={!parent}
          aria-label="Up one level"
          title="Up one level"
          className="text-muted-foreground enabled:hover:text-primary disabled:opacity-40"
        >
          ▲
        </button>
      </div>

      <Panel
        variant="inset"
        className="flex min-h-[30px] flex-1 flex-wrap items-center gap-0.5 bg-card px-2 py-1 font-mono text-sm"
      >
        <span className="px-1 text-muted-foreground">/</span>
        {path.map((node, index) => {
          const isLast = index === path.length - 1;
          return (
            <span key={node.id} className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => navigateToNode(node.id)}
                className={
                  isLast
                    ? 'px-1 font-semibold text-primary'
                    : 'rounded-xs px-1 text-foreground hover:bg-accent hover:text-accent-foreground'
                }
              >
                {node.type === 'chat-channel' || node.type === 'voice-channel'
                  ? `${nodeGlyph(node.type)}${node.name}`
                  : node.name}
              </button>
              {!isLast && <span className="text-muted-foreground/60">/</span>}
            </span>
          );
        })}
      </Panel>
    </div>
  );
}
