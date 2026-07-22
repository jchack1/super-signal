import { create } from 'zustand';

// Global, UI-only state that far-apart components need to share — Zustand gives
// selective subscriptions with no provider re-renders. It's intentionally empty
// right now: "where am I" lives in the URL (`useCurrentNodeId`), and the command
// line keeps its own local input/results state. Kept as the wired-in template for
// the first piece of genuinely shared UI state that lands (e.g. panel layout).
export type UiState = Record<string, never>;

export const useUiStore = create<UiState>(() => ({}));
