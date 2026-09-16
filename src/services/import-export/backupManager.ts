import { db } from '../../core/db/database';
import type { Bookmark, Project, Collection, AccountProfile, AppSettings } from '../../core/types';

export interface LinkDeckBackupData {
  version: number;
  exportedAt: string;
  bookmarks: Bookmark[];
  projects: Project[];
  collections: Collection[];
  accountProfiles: AccountProfile[];
  settings?: AppSettings;
}

export class BackupManager {
  /**
   * Generates a complete JSON backup of all LinkDeck data
   */
  static async exportBackup(): Promise<string> {
    const [bookmarks, projects, collections, accountProfiles, settings] = await Promise.all([
      db.bookmarks.toArray(),
      db.projects.toArray(),
      db.collections.toArray(),
      db.accountProfiles.toArray(),
      db.settings.get('current')
    ]);

    const backup: LinkDeckBackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      bookmarks,
      projects,
      collections,
      accountProfiles,
      settings
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Validates and imports a JSON backup
   */
  static async importBackup(jsonString: string, mode: 'merge' | 'replace' = 'merge'): Promise<{
    bookmarksCount: number;
    projectsCount: number;
    collectionsCount: number;
    accountsCount: number;
  }> {
    let data: LinkDeckBackupData;
    try {
      data = JSON.parse(jsonString);
    } catch {
      throw new Error('Invalid JSON file format.');
    }

    if (!Array.isArray(data.bookmarks)) {
      throw new Error('Invalid backup: Missing bookmarks array.');
    }

    await db.transaction('rw', [db.bookmarks, db.projects, db.collections, db.accountProfiles, db.settings], async () => {
      if (mode === 'replace') {
        await db.bookmarks.clear();
        await db.projects.clear();
        await db.collections.clear();
        await db.accountProfiles.clear();
      }

      if (data.bookmarks?.length) {
        await db.bookmarks.bulkPut(data.bookmarks);
      }
      if (data.projects?.length) {
        await db.projects.bulkPut(data.projects);
      }
      if (data.collections?.length) {
        await db.collections.bulkPut(data.collections);
      }
      if (data.accountProfiles?.length) {
        await db.accountProfiles.bulkPut(data.accountProfiles);
      }
      if (data.settings) {
        await db.settings.put(data.settings);
      }
    });

    return {
      bookmarksCount: data.bookmarks?.length || 0,
      projectsCount: data.projects?.length || 0,
      collectionsCount: data.collections?.length || 0,
      accountsCount: data.accountProfiles?.length || 0
    };
  }
}
