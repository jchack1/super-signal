import { Panel } from '@super-signal/ui/components/panel';
import type { CommandSpec } from '../lib/command-line/command-specs';

// The "what can I type?" hint — matching command syntaxes shown live as you
// type, before you've run anything. Same panel styling as CommandResults so
// the two don't feel like different UI (they never show at the same time:
// this is replaced by CommandResults the moment a command actually executes).
export function CommandSuggestions({
  specs,
  onSelect,
}: {
  specs: CommandSpec[];
  onSelect: (spec: CommandSpec) => void;
}) {
  return (
    <Panel className="absolute inset-x-0 bottom-full mb-1 max-h-64 overflow-auto bg-secondary py-1 font-mono text-sm">
      {specs.map((spec) => (
        <button
          key={spec.verb}
          type="button"
          // Keep focus on the input so typing keeps working after a click.
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => onSelect(spec)}
          className="flex w-full items-baseline gap-2 px-3 py-1.5 text-left hover:bg-accent/50"
        >
          <span className="text-primary">{spec.syntax}</span>
          <span className="ml-auto truncate pl-3 text-[11px] text-muted-foreground/70">
            {spec.description}
          </span>
        </button>
      ))}
    </Panel>
  );
}
