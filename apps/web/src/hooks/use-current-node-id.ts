import { useParams } from '@tanstack/react-router';
import { asNodeId, type NodeId } from '@super-signal/core';

// Reads the current Node id from the URL (`/n/$nodeId`) — the single source of
// truth for "where am I". Centralised here so components don't touch the router
// directly and the URL scheme can change in one place.
export function useCurrentNodeId(): NodeId {
  const { nodeId } = useParams({ from: '/n/$nodeId' });
  return asNodeId(nodeId);
}
