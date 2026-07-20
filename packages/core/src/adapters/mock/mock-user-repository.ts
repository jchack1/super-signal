import type { AvatarId, UserId } from '../../domain/ids';
import type { Avatar, User } from '../../domain/identity';
import type { UserRepository } from '../../ports/user-repository';

/** An in-memory store of users and their avatars. */
export class MockUserRepository implements UserRepository {
  private readonly users = new Map<UserId, User>();
  private readonly avatars = new Map<AvatarId, Avatar>();

  constructor(seedUsers: User[], seedAvatars: Avatar[]) {
    for (const user of seedUsers) {
      this.users.set(user.id, user);
    }
    for (const avatar of seedAvatars) {
      this.avatars.set(avatar.id, avatar);
    }
  }

  async getUser(id: UserId): Promise<User | null> {
    return this.users.get(id) ?? null;
  }

  async getAvatar(id: AvatarId): Promise<Avatar | null> {
    return this.avatars.get(id) ?? null;
  }

  async listAvatars(userId: UserId): Promise<Avatar[]> {
    return [...this.avatars.values()].filter((avatar) => avatar.userId === userId);
  }
}