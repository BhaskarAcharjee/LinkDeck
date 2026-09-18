import { db } from '../db/database';
import type { Article, ReadingStatus } from '../types';

export class ArticleRepository {
  static async getAll(): Promise<Article[]> {
    return db.articles.orderBy('savedAt').reverse().toArray();
  }

  static async getById(id: string): Promise<Article | undefined> {
    return db.articles.get(id);
  }

  static async getByStatus(status: ReadingStatus): Promise<Article[]> {
    return db.articles.where('readingStatus').equals(status).reverse().sortBy('savedAt');
  }

  static async getUnread(limit = 6): Promise<Article[]> {
    return db.articles
      .where('readingStatus')
      .equals('unread')
      .reverse()
      .sortBy('savedAt')
      .then(items => items.slice(0, limit));
  }

  static estimateReadingTime(title: string, excerpt?: string): number {
    const text = `${title} ${excerpt || ''}`.trim();
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    // Assume average 200 words per minute; if minimal text, estimate typical online article 3-5 mins
    if (wordCount < 100) return 4;
    return Math.max(1, Math.round(wordCount / 200));
  }

  static async create(article: Omit<Article, 'id' | 'savedAt' | 'updatedAt'>): Promise<Article> {
    const now = Date.now();
    const id = 'art_' + Math.random().toString(36).substring(2, 9) + '_' + now;
    const estimatedReadingTime = article.estimatedReadingTime || this.estimateReadingTime(article.title, article.excerpt);

    const newArticle: Article = {
      ...article,
      id,
      estimatedReadingTime,
      savedAt: now,
      updatedAt: now
    };

    await db.articles.add(newArticle);
    return newArticle;
  }

  static async update(id: string, updates: Partial<Article>): Promise<void> {
    await db.articles.update(id, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  static async setStatus(id: string, readingStatus: ReadingStatus): Promise<void> {
    const updates: Partial<Article> = {
      readingStatus,
      updatedAt: Date.now()
    };
    if (readingStatus === 'read') {
      updates.readAt = Date.now();
    }
    await db.articles.update(id, updates);
  }

  static async toggleFavorite(id: string): Promise<void> {
    const art = await db.articles.get(id);
    if (art) {
      await db.articles.update(id, {
        isFavorite: !art.isFavorite,
        updatedAt: Date.now()
      });
    }
  }

  static async delete(id: string): Promise<void> {
    await db.articles.delete(id);
  }

  static async deleteAll(): Promise<void> {
    await db.articles.clear();
  }
}
