import { Panel } from '@super-signal/ui/components/panel';
import { cn } from '@super-signal/ui/lib/utils';
import type { CommandResult, ResultRow } from '../lib/command-line/types';
import { nodeGlyph } from '../lib/node-display';

// The transient surface above the prompt. Shows ls/find rows (keyboard- and
// click-navigable), or a one-line info/error status. Rendering only — selection
// state and key handling live in CommandPrompt, which owns the focused input.
export function CommandResults({
  result,
  rows,
  selectedIndex,
  onSelect,
}: {
  result: CommandResult;
  rows: ResultRow[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  // Status-only results (no navigable rows).
  if (result.kind === 'info' || result.kind === 'error') {
    return (
      <Panel className="absolute inset-x-0 bottom-full mb-1 bg-secondary px-3 py-2 font-mono text-xs">
        <span className={result.kind === 'error' ? 'text-tag' : 'text-muted-foreground'}>
          {result.message}
        </span>
      </Panel>
    );
  }

  // Everything else (navigate/message) produces no dropdown; the prompt only ever
  // passes listing/matches through here, but this keeps the render exhaustive.
  if (result.kind !== 'listing' && result.kind !== 'matches') return null;

  const header =
    result.kind === 'matches'
      ? `${rows.length} ${rows.length === 1 ? 'match' : 'matches'} for "${result.query}"`
      : result.dirPath;

  return (
    <Panel className="absolute inset-x-0 bottom-full mb-1 max-h-64 overflow-auto bg-secondary py-1 font-mono text-sm">
      <div className="px-3 py-1 text-[11px] text-muted-foreground/70">{header}</div>
      {rows.length === 0 ? (
        <div className="px-3 py-1.5 text-xs text-muted-foreground">empty</div>
      ) : (
        rows.map((row, index) => (
          <button
            key={row.id}
            type="button"
            // Keep focus on the input so the arrow keys keep working after a click.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(index)}
            className={cn(
              'flex w-full items-baseline gap-2 px-3 py-1.5 text-left',
              index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50',
            )}
          >
            <span className="text-primary">{nodeGlyph(row.type)}</span>
            <span className="text-foreground">{row.name}</span>
            <span className="ml-auto truncate pl-3 text-[11px] text-muted-foreground/70">
              {row.subtitle}
            </span>
          </button>
        ))
      )}
    </Panel>
  );
}
