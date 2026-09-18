import type {
  Bookmark,
  Project,
  Collection,
  AccountProfile,
  AppSettings,
  QuickSite,
  Article
} from '../../core/types';

import { db } from '../../core/db/database';

export interface LinkDeckBackupData {
  version: number;
  exportedAt: string;
  bookmarks: Bookmark[];
  projects: Project[];
  collections: Collection[];
  accountProfiles: AccountProfile[];
  quickSites?: QuickSite[];
  articles?: Article[];
  settings?: AppSettings;
}

export class BackupManager {
  /**
   * Pure validator for backup format
   */
  static validateBackup(data: any): {
    valid: boolean;
    error?: string;
    stats?: {
      bookmarks: number;
      quickSites: number;
      articles: number;
      projects: number;
      collections: number;
      accounts: number;
    };
  } {
    if (!data || typeof data !== 'object') {
      return { valid: false, error: 'Backup is not a valid JSON object.' };
    }
    if (!Array.isArray(data.bookmarks)) {
      return { valid: false, error: 'Backup is missing bookmarks array.' };
    }
    return {
      valid: true,
      stats: {
        bookmarks: data.bookmarks.length,
        quickSites: Array.isArray(data.quickSites) ? data.quickSites.length : 0,
        articles: Array.isArray(data.articles) ? data.articles.length : 0,
        projects: Array.isArray(data.projects) ? data.projects.length : 0,
        collections: Array.isArray(data.collections) ? data.collections.length : 0,
        accounts: Array.isArray(data.accountProfiles) ? data.accountProfiles.length : 0
      }
    };
  }

  /**
   * Generates a complete JSON backup of all LinkDeck data
   */
  static async exportBackup(): Promise<string> {
    const [bookmarks, projects, collections, accountProfiles, quickSites, articles, settings] = await Promise.all([
      db.bookmarks.toArray(),
      db.projects.toArray(),
      db.collections.toArray(),
      db.accountProfiles.toArray(),
      db.quickSites.toArray(),
      db.articles.toArray(),
      db.settings.get('current')
    ]);

    const backup: LinkDeckBackupData = {
      version: 2,
      exportedAt: new Date().toISOString(),
      bookmarks,
      projects,
      collections,
      accountProfiles,
      quickSites,
      articles,
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
    quickSitesCount?: number;
    articlesCount?: number;
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

    await db.transaction(
      'rw',
      [db.bookmarks, db.projects, db.collections, db.accountProfiles, db.quickSites, db.articles, db.settings],
      async () => {
        if (mode === 'replace') {
          await db.bookmarks.clear();
          await db.projects.clear();
          await db.collections.clear();
          await db.accountProfiles.clear();
          await db.quickSites.clear();
          await db.articles.clear();
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
        if (data.quickSites?.length) {
          await db.quickSites.bulkPut(data.quickSites);
        }
        if (data.articles?.length) {
          await db.articles.bulkPut(data.articles);
        }
        if (data.settings) {
          await db.settings.put(data.settings);
        }
      }
    );

    return {
      bookmarksCount: data.bookmarks?.length || 0,
      projectsCount: data.projects?.length || 0,
      collectionsCount: data.collections?.length || 0,
      accountsCount: data.accountProfiles?.length || 0,
      quickSitesCount: data.quickSites?.length || 0,
      articlesCount: data.articles?.length || 0
    };
  }
}
