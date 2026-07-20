import { create } from 'zustand';

// Zustand holds global UI state that many far-apart components need to read or
// change. It starts tiny; in Phase 1 this grows to hold things like the current
// path, the current selection, and whether the command line is open.
//
// Components subscribe to just the slice they use (see the home page), so they
// only re-render when that slice changes.
interface UiState {
  commandLineOpen: boolean;
  setCommandLineOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  commandLineOpen: false,
  setCommandLineOpen: (open) => set({ commandLineOpen: open }),
}));