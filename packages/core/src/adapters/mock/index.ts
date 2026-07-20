import { MockMessageRepository } from './mock-message-repository';
import { MockNodeRepository } from './mock-node-repository';
import { MockUserRepository } from './mock-user-repository';
import * as seed from './seed';

export * from './seed';
export { MockNodeRepository, MockMessageRepository, MockUserRepository };

/** Build a full set of in-memory repositories, preloaded with the seed data. */
export function createMockRepositories() {
  return {
    nodes: new MockNodeRepository(seed.nodes),
    messages: new MockMessageRepository(seed.messages),
    users: new MockUserRepository(seed.users, seed.avatars),
  };
}