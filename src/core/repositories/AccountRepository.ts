import { db } from '../db/database';
import type { AccountProfile } from '../types';

export class AccountRepository {
  static async getAll(): Promise<AccountProfile[]> {
    return db.accountProfiles.toArray();
  }

  static async getById(id: string): Promise<AccountProfile | undefined> {
    return db.accountProfiles.get(id);
  }

  static async getDefault(): Promise<AccountProfile | undefined> {
    const list = await db.accountProfiles.toArray();
    return list.find(a => a.isDefault) || list[0];
  }

  static async create(account: Omit<AccountProfile, 'id' | 'createdAt'>): Promise<AccountProfile> {
    const id = 'acc_' + Math.random().toString(36).substring(2, 9);
    const newAccount: AccountProfile = {
      ...account,
      id,
      createdAt: Date.now()
    };
    if (newAccount.isDefault) {
      await this.clearDefault();
    }
    await db.accountProfiles.add(newAccount);
    return newAccount;
  }

  static async update(id: string, updates: Partial<AccountProfile>): Promise<void> {
    if (updates.isDefault) {
      await this.clearDefault();
    }
    await db.accountProfiles.update(id, updates);
  }

  static async delete(id: string): Promise<void> {
    await db.accountProfiles.delete(id);
  }

  private static async clearDefault(): Promise<void> {
    const accounts = await db.accountProfiles.toArray();
    for (const acc of accounts) {
      if (acc.isDefault) {
        await db.accountProfiles.update(acc.id, { isDefault: false });
      }
    }
  }
}
