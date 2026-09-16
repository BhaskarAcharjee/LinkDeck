import { db } from '../db/database';
import type { Bookmark, ProjectStage } from '../types';

export class BookmarkRepository {
  static async getAll(): Promise<Bookmark[]> {
    return db.bookmarks.orderBy('sortOrder').toArray();
  }

  static async getById(id: string): Promise<Bookmark | undefined> {
    return db.bookmarks.get(id);
  }

  static async getByProject(projectId: string): Promise<Bookmark[]> {
    return db.bookmarks.where('projectId').equals(projectId).sortBy('sortOrder');
  }

  static async getByCollection(collectionId: string): Promise<Bookmark[]> {
    return db.bookmarks.where('collectionId').equals(collectionId).sortBy('sortOrder');
  }

  static async getFavorites(): Promise<Bookmark[]> {
    return db.bookmarks.filter(b => b.isFavorite && !b.isArchived).toArray();
  }

  static async getPinned(): Promise<Bookmark[]> {
    return db.bookmarks.filter(b => b.isPinned && !b.isArchived).sortBy('sortOrder');
  }

  static async getRecent(limit = 10): Promise<Bookmark[]> {
    return db.bookmarks
      .filter(b => !!b.lastOpenedAt && !b.isArchived)
      .reverse()
      .sortBy('lastOpenedAt')
      .then(items => items.slice(0, limit));
  }

  static async getFrequentlyUsed(limit = 8): Promise<Bookmark[]> {
    return db.bookmarks
      .filter(b => b.openCount > 0 && !b.isArchived)
      .reverse()
      .sortBy('openCount')
      .then(items => items.slice(0, limit));
  }

  static async create(bookmark: Omit<Bookmark, 'id' | 'createdAt' | 'updatedAt' | 'openCount'>): Promise<Bookmark> {
    const now = Date.now();
    const id = 'bm_' + Math.random().toString(36).substring(2, 9) + '_' + now;
    const newBookmark: Bookmark = {
      ...bookmark,
      id,
      openCount: 0,
      createdAt: now,
      updatedAt: now
    };
    await db.bookmarks.add(newBookmark);
    return newBookmark;
  }

  static async update(id: string, updates: Partial<Bookmark>): Promise<void> {
    await db.bookmarks.update(id, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  static async delete(id: string): Promise<void> {
    await db.bookmarks.delete(id);
  }

  static async deleteAll(): Promise<void> {
    await db.bookmarks.clear();
  }

  static async recordOpen(id: string): Promise<void> {
    const bookmark = await db.bookmarks.get(id);
    if (!bookmark) return;

    await db.bookmarks.update(id, {
      openCount: (bookmark.openCount || 0) + 1,
      lastOpenedAt: Date.now(),
      updatedAt: Date.now()
    });
  }

  static async toggleFavorite(id: string): Promise<boolean> {
    const bookmark = await db.bookmarks.get(id);
    if (!bookmark) return false;
    const nextState = !bookmark.isFavorite;
    await db.bookmarks.update(id, { isFavorite: nextState, updatedAt: Date.now() });
    return nextState;
  }

  static async togglePin(id: string): Promise<boolean> {
    const bookmark = await db.bookmarks.get(id);
    if (!bookmark) return false;
    const nextState = !bookmark.isPinned;
    await db.bookmarks.update(id, { isPinned: nextState, updatedAt: Date.now() });
    return nextState;
  }

  static async setProjectStage(id: string, projectId: string, stage: ProjectStage): Promise<void> {
    await db.bookmarks.update(id, {
      projectId,
      projectStage: stage,
      updatedAt: Date.now()
    });
  }

  static async bulkAdd(bookmarks: Bookmark[]): Promise<void> {
    await db.bookmarks.bulkPut(bookmarks);
  }
}
