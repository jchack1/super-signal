import { useMemo, useRef, useState, type ChangeEvent, type KeyboardEvent } from 'react';
import type { NodeId } from '@super-signal/core';
import { Panel } from '@super-signal/ui/components/panel';
import { useCommandLine } from '../hooks/use-command-line';
import { useNavigateToNode } from '../hooks/use-navigate-to-node';
import { matchCommandSpecs, type CommandSpec } from '../lib/command-line/command-specs';
import type { Command, CommandResult, ResultRow } from '../lib/command-line/types';
import { CommandResults } from './command-results';
import { CommandSuggestions } from './command-suggestions';

// The single command line — the one place you type. Commands (cd/ls/find/mv/cp/
// create/mkdir/rename/rm) and messages (@ / #) both go here, disambiguated by
// the leading sigil. This is the whole "one bar" model: the top address bar is
// now read-only breadcrumbs.
export function CommandPrompt({ currentNodeId }: { currentNodeId: NodeId }) {
  const runCommand = useCommandLine(currentNodeId);
  const navigateToNode = useNavigateToNode();
  const inputRef = useRef<HTMLInputElement>(null);

  const [value, setValue] = useState('');
  // The last result that has something to show (listing/matches/info/error).
  // navigate/message produce no dropdown, so they leave this null.
  const [result, setResult] = useState<CommandResult | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const rows: ResultRow[] = useMemo(() => {
    if (result?.kind === 'listing') {
      return result.nodes.map((node) => ({
        id: node.id,
        name: node.name,
        type: node.type,
        subtitle: result.dirPath,
      }));
    }
    if (result?.kind === 'matches') {
      return result.matches.map((match) => ({
        id: match.node.id,
        name: match.node.name,
        type: match.node.type,
        subtitle: match.path,
      }));
    }
    return [];
  }, [result]);

  // Live "what can I type?" hint — only while there's no command output on
  // screen yet (CommandResults takes priority once something has actually run).
  const suggestions = useMemo(() => (result ? [] : matchCommandSpecs(value)), [value, result]);

  const applySuggestion = (spec: CommandSpec) => {
    setValue(`${spec.verb} `);
    inputRef.current?.focus();
  };

  const closeResults = () => {
    setResult(null);
    setSelectedIndex(0);
  };

  // Any edit means "I'm typing something new" — drop whatever result/confirm
  // is on screen so the live suggestions (or nothing, if empty) take over
  // again, instead of a stale error/listing/confirm blocking them.
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    if (result) closeResults();
  };

  const selectRow = (index: number) => {
    const row = rows[index];
    if (!row) return;
    navigateToNode(row.id);
    setValue('');
    closeResults();
  };

  const applyOutcome = (outcome: CommandResult) => {
    switch (outcome.kind) {
      case 'navigate':
      case 'message':
        setValue('');
        closeResults();
        break;
      case 'error':
      case 'confirm':
        // Keep the input so the warning/complaint sits next to what was typed.
        setResult(outcome);
        setSelectedIndex(0);
        break;
      default:
        // listing / matches / info — command consumed, show its output.
        setValue('');
        setResult(outcome);
        setSelectedIndex(0);
    }
  };

  const run = async () => applyOutcome(await runCommand(value));

  // Enter, a second time, while a destructive command (currently just `rm`) is
  // awaiting confirmation. Re-runs the *same* command it already resolved to
  // (with `confirmed: true` baked in) rather than re-parsing the input, so it
  // can't drift from what the warning message described.
  const confirmPending = async (command: Command) => applyOutcome(await runCommand(command));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (result?.kind === 'confirm') void confirmPending(result.command);
        // Empty input with an open listing = pick the highlighted row.
        else if (value.trim() === '' && rows.length > 0) selectRow(selectedIndex);
        else void run();
        break;
      case 'ArrowDown':
        if (rows.length > 0) {
          event.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, rows.length - 1));
        }
        break;
      case 'ArrowUp':
        if (rows.length > 0) {
          event.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
        }
        break;
      case 'Escape':
        // First Escape dismisses the dropdown; a second clears the input.
        if (result) closeResults();
        else setValue('');
        break;
    }
  };

  return (
    <div className="relative border-t border-bevel-lo bg-secondary p-2.5">
      {result ? (
        <CommandResults
          result={result}
          rows={rows}
          selectedIndex={selectedIndex}
          onSelect={selectRow}
        />
      ) : (
        suggestions.length > 0 && (
          <CommandSuggestions specs={suggestions} onSelect={applySuggestion} />
        )
      )}
      <Panel variant="inset" className="flex items-center gap-2 bg-card px-3 py-2">
        <span aria-hidden="true" className="font-mono text-sm text-primary">
          ›
        </span>
        <input
          ref={inputRef}
          value={value}
          onChange={onChange}
          onKeyDown={onKeyDown}
          aria-label="Command line"
          placeholder="cd · ls · find · mv · cp · create · rm    —    @ or # to message"
          className="flex-1 bg-transparent font-mono text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </Panel>
    </div>
  );
}
