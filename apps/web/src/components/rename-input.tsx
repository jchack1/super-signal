import { useEffect, useRef, useState } from 'react';
import type { Node } from '@super-signal/core';
import { cn } from '@super-signal/ui/lib/utils';
import { useNodeActions } from '../hooks/use-node-actions';

// Swapped in for a row's normal button/label when "Rename" is chosen from its
// context menu. Submits on Enter or blur; Escape (or submitting the name
// unchanged) just backs out without calling rename at all.
export function RenameInput({
  node,
  onDone,
  className,
}: {
  node: Node;
  onDone: () => void;
  className?: string;
}) {
  const { rename } = useNodeActions();
  const [value, setValue] = useState(node.name);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed || trimmed === node.name) {
      onDone();
      return;
    }
    setPending(true);
    const result = await rename(node, trimmed);
    setPending(false);
    if (result.kind === 'error') setError(result.message);
    else onDone();
  };

  return (
    <div className="flex flex-1 flex-col">
      <input
        ref={inputRef}
        value={value}
        disabled={pending}
        onChange={(event) => {
          setValue(event.target.value);
          setError(null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter') void submit();
          if (event.key === 'Escape') onDone();
        }}
        onBlur={() => void submit()}
        className={cn(
          'w-full border border-t-bevel-lo border-l-bevel-lo border-b-bevel-hi border-r-bevel-hi bg-card font-mono text-foreground outline-none disabled:opacity-60',
          className,
        )}
      />
      {error && <span className="mt-0.5 px-1 font-mono text-[11px] text-tag">{error}</span>}
    </div>
  );
}
