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

  static async safeDelete(id: string, deleteContents = false): Promise<void> {
    await db.transaction('rw', [db.collections, db.bookmarks], async () => {
      const associatedBookmarks = await db.bookmarks.where('collectionId').equals(id).toArray();
      if (deleteContents) {
        for (const bm of associatedBookmarks) {
          await db.bookmarks.delete(bm.id);
        }
      } else {
        for (const bm of associatedBookmarks) {
          await db.bookmarks.update(bm.id, { collectionId: undefined });
        }
      }
      await db.collections.delete(id);
    });
  }

  static async delete(id: string): Promise<void> {
    return this.safeDelete(id, false);
  }

  static async merge(sourceId: string, targetId: string): Promise<void> {
    if (sourceId === targetId) return;
    await db.transaction('rw', [db.collections, db.bookmarks], async () => {
      const sourceBookmarks = await db.bookmarks.where('collectionId').equals(sourceId).toArray();
      for (const bm of sourceBookmarks) {
        await db.bookmarks.update(bm.id, { collectionId: targetId });
      }
      await db.collections.delete(sourceId);
    });
  }

  static async duplicate(id: string): Promise<Collection | undefined> {
    const col = await db.collections.get(id);
    if (!col) return undefined;
    const count = await db.collections.count();
    return this.create({
      name: `${col.name} (Copy)`,
      slug: `${col.slug}-copy`,
      icon: col.icon,
      color: col.color,
      description: col.description,
      isSystem: false,
      sortOrder: count + 1
    });
  }

  static async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.collections, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.collections.update(orderedIds[i], { sortOrder: i + 1 });
      }
    });
  }
}
