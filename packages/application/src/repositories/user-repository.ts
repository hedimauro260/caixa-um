import type { User } from "@caixa-1/domain";

export interface UserRepository {
  findById(userId: string): Promise<User | null>;
  findByClerkId(clerkId: string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}
