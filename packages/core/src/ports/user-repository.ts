import type { AvatarId, UserId } from '../domain/ids';
import type { Avatar, User } from '../domain/identity';

export interface UserRepository {
  getUser(id: UserId): Promise<User | null>;
  getAvatar(id: AvatarId): Promise<Avatar | null>;
  listAvatars(userId: UserId): Promise<Avatar[]>;
}
