import { createMockRepositories } from '@super-signal/core/adapters/mock';
import { PermissionService } from '@super-signal/core/services';

// This is the "composition root": the single place that picks which data
// implementation the app uses. Right now that's the in-memory mock. When we add
// Supabase, we swap the repositories here and nothing else in the app changes.
const repositories = createMockRepositories();

export const dataLayer = {
  nodes: repositories.nodes,
  messages: repositories.messages,
  users: repositories.users,
  permissions: new PermissionService(repositories.nodes),
};
