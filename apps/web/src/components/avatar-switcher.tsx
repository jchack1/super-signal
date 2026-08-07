import { useState } from 'react';
import { Panel } from '@super-signal/ui/components/panel';
import { useAvatars } from '../hooks/use-avatars';
import { useSession } from '../hooks/use-session';

// The title-bar control for switching which of your avatars you're currently
// acting as. Same open/close-a-panel pattern as CommandSuggestions — a local
// toggle plus an absolutely-positioned Panel — rather than a Radix dropdown,
// since Radix/shadcn wiring is its own not-yet-started roadmap item.
export function AvatarSwitcher() {
  const { userId, avatarId, setAvatarId } = useSession();
  const { data: avatars } = useAvatars(userId);
  const [open, setOpen] = useState(false);

  const current = avatars?.find((avatar) => avatar.id === avatarId);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        // Close once focus leaves this whole control (button + dropdown), not
        // just the button itself. Chrome/Firefox focus a button on click, so
        // clicking a row moves focus there first and this correctly stays
        // open; Safari doesn't focus buttons on click at all, so the
        // `onMouseDown` below (same trick CommandSuggestions uses) stops focus
        // from ever leaving the toggle button in the first place, making this
        // check moot for row clicks there too.
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="font-mono text-xs text-foreground hover:text-primary"
      >
        {current?.displayName ?? '…'} <span className="text-muted-foreground">▾</span>
      </button>

      {open && avatars && avatars.length > 0 && (
        <Panel className="absolute right-0 top-full z-10 mt-1 min-w-32 bg-secondary py-1 font-mono text-xs">
          {avatars.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              // Keep focus on the toggle button so the click below reliably
              // registers before any blur-driven close (see the note above).
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setAvatarId(avatar.id);
                setOpen(false);
              }}
              className="flex w-full items-center px-3 py-1.5 text-left hover:bg-accent/50 aria-selected:text-primary"
              aria-selected={avatar.id === avatarId}
            >
              {avatar.displayName}
            </button>
          ))}
        </Panel>
      )}
    </div>
  );
}
