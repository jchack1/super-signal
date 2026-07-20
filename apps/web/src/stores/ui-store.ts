import { create } from 'zustand';
import type { NodeId } from '@super-signal/core';

// Zustand holds global UI state that many far-apart components need to read or
// change. Components subscribe to just the slice they use, so they only re-render
// when that slice changes.
//
// `currentNodeId` is the "where am I" pointer that drives the address bar, the
// main view, and the tree selection. It's null until the shell picks a default;
// later this will be sourced from the URL (`/n/$nodeId`) instead.
interface UiState {
  currentNodeId: NodeId | null;
  selectNode: (id: NodeId) => void;

  commandLineOpen: boolean;
  setCommandLineOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  currentNodeId: null,
  selectNode: (id) => set({ currentNodeId: id }),

  commandLineOpen: false,
  setCommandLineOpen: (open) => set({ commandLineOpen: open }),
}));
