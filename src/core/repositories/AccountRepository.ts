import { db } from '../db/database';
import type { AccountProfile } from '../types';

export class AccountRepository {
  static async getAll(): Promise<AccountProfile[]> {
    const list = await db.accountProfiles.toArray();
    return list.sort((a, b) => (a.sortOrder ?? a.googleAuthUserIndex) - (b.sortOrder ?? b.googleAuthUserIndex));
  }

  static async getById(id: string): Promise<AccountProfile | undefined> {
    return db.accountProfiles.get(id);
  }

  static async getDefault(): Promise<AccountProfile | undefined> {
    const list = await this.getAll();
    return list.find(a => a.isDefault) || list[0];
  }

  static async setDefault(id: string): Promise<void> {
    await db.transaction('rw', [db.accountProfiles, db.settings], async () => {
      const accounts = await db.accountProfiles.toArray();
      for (const acc of accounts) {
        await db.accountProfiles.update(acc.id, { isDefault: acc.id === id });
      }
      const settings = await db.settings.get('current');
      if (settings) {
        await db.settings.update('current', { defaultGoogleAccountProfileId: id });
      }
    });
  }

  static async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', [db.accountProfiles], async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.accountProfiles.update(orderedIds[i], { sortOrder: i });
      }
    });
  }

  static async move(id: string, direction: 'up' | 'down'): Promise<void> {
    const list = await this.getAll();
    const currentIndex = list.findIndex(a => a.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const reordered = [...list];
    const [removed] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    await this.reorder(reordered.map(a => a.id));
  }

  static async syncGoogleAuthIndexes(): Promise<void> {
    const list = await this.getAll();
    await db.transaction('rw', [db.accountProfiles], async () => {
      for (let i = 0; i < list.length; i++) {
        await db.accountProfiles.update(list[i].id, {
          sortOrder: i,
          googleAuthUserIndex: i
        });
      }
    });
  }

  static detectFromGoogleUrl(rawUrl: string): { index: number; email?: string } | null {
    try {
      const url = new URL(rawUrl.trim());
      let index: number | null = null;
      let email: string | undefined = undefined;

      const authUserParam = url.searchParams.get('authuser');
      if (authUserParam !== null && /^\d+$/.test(authUserParam)) {
        index = parseInt(authUserParam, 10);
      }

      const emailParam = url.searchParams.get('Email') || url.searchParams.get('email');
      if (emailParam && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailParam)) {
        email = emailParam;
      }

      const uMatch = url.pathname.match(/\/u\/(\d+)(?:\/|$)/);
      if (uMatch) {
        index = parseInt(uMatch[1], 10);
      }

      if (index !== null || email !== undefined) {
        return {
          index: index ?? 0,
          email
        };
      }
    } catch {
      // Not a valid URL
    }
    return null;
  }

  static async create(account: Omit<AccountProfile, 'id' | 'createdAt'>): Promise<AccountProfile> {
    const id = 'acc_' + Math.random().toString(36).substring(2, 9);
    const existing = await this.getAll();
    const sortOrder = account.sortOrder ?? existing.length;
    const newAccount: AccountProfile = {
      ...account,
      id,
      sortOrder,
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
