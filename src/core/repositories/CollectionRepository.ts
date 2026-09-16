import { db } from '../db/database';
import type { Collection } from '../types';

export class CollectionRepository {
  static async getAll(): Promise<Collection[]> {
    return db.collections.orderBy('sortOrder').toArray();
  }

  static async getById(id: string): Promise<Collection | undefined> {
    return db.collections.get(id);
  }

  static async create(collection: Omit<Collection, 'id' | 'createdAt'>): Promise<Collection> {
    const id = 'col_' + Math.random().toString(36).substring(2, 9);
    const newCollection: Collection = {
      ...collection,
      id,
      createdAt: Date.now()
    };
    await db.collections.add(newCollection);
    return newCollection;
  }

  static async update(id: string, updates: Partial<Collection>): Promise<void> {
    await db.collections.update(id, updates);
  }

  static async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.collections, db.bookmarks], async () => {
      const associatedBookmarks = await db.bookmarks.where('collectionId').equals(id).toArray();
      for (const bm of associatedBookmarks) {
        await db.bookmarks.update(bm.id, { collectionId: undefined });
      }
      await db.collections.delete(id);
    });
  }
}
