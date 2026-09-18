import { db } from '../../core/db/database';
import type { Bookmark, QuickSite, Article, QuickSiteCategory, ReadingStatus, ProjectStage } from '../../core/types';
import { detectService } from '../routing/serviceRegistry';
import { ArticleRepository } from '../../core/repositories/ArticleRepository';

export class ConversionService {
  /**
   * Helper to detect category from service or domain
   */
  static detectQuickSiteCategory(url: string): QuickSiteCategory {
    const service = detectService(url);
    if (service) {
      if (service.category === 'ai') return 'ai';
      if (service.category === 'developer' || service.category === 'cloud') return 'development';
      if (service.category === 'social') return 'social';
      if (service.category === 'design') return 'design';
      if (service.category === 'media') return 'media';
      if (service.category === 'shopping') return 'shopping';
      if (service.domains.some(d => d.includes('google'))) return 'google';
    }
    return 'utilities';
  }

  /**
   * Pure builder: Bookmark -> QuickSite object
   */
  static buildQuickSiteFromBookmark(
    bookmark: Bookmark,
    options?: { category?: QuickSiteCategory }
  ): QuickSite {
    const service = detectService(bookmark.url);
    const category = options?.category || this.detectQuickSiteCategory(bookmark.url);
    const siteId = 'site_' + Math.random().toString(36).substring(2, 9);

    return {
      id: siteId,
      serviceId: service?.id,
      title: bookmark.title,
      url: bookmark.url,
      cleanUrl: bookmark.cleanUrl,
      domain: bookmark.domain,
      icon: bookmark.favicon,
      category,
      accountProfileId: bookmark.accountProfileId,
      isPinned: bookmark.isPinned || bookmark.isFavorite,
      isHidden: false,
      openCount: bookmark.openCount || 0,
      lastOpenedAt: bookmark.lastOpenedAt,
      sortOrder: bookmark.sortOrder || Date.now(),
      createdAt: bookmark.createdAt || Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Bookmark -> Quick Site (with DB persistence)
   */
  static async bookmarkToQuickSite(
    bookmark: Bookmark,
    options?: { duplicate?: boolean; category?: QuickSiteCategory }
  ): Promise<QuickSite> {
    const site = this.buildQuickSiteFromBookmark(bookmark, options);

    await db.transaction('rw', [db.bookmarks, db.quickSites], async () => {
      await db.quickSites.put(site);
      if (!options?.duplicate) {
        await db.bookmarks.delete(bookmark.id);
      }
    });

    return site;
  }

  /**
   * Pure builder: Bookmark -> Article object
   */
  static buildArticleFromBookmark(
    bookmark: Bookmark,
    options?: { readingStatus?: ReadingStatus }
  ): Article {
    const artId = 'art_' + Math.random().toString(36).substring(2, 9);
    const estimatedTime = ArticleRepository.estimateReadingTime(
      bookmark.title + ' ' + (bookmark.notes || '') + ' ' + (bookmark.description || '')
    );

    return {
      id: artId,
      title: bookmark.title,
      url: bookmark.url,
      cleanUrl: bookmark.cleanUrl,
      domain: bookmark.domain,
      source: bookmark.domain,
      favicon: bookmark.favicon,
      excerpt: bookmark.notes || bookmark.description,
      tags: bookmark.tags || [],
      readingStatus: options?.readingStatus || 'unread',
      isFavorite: bookmark.isFavorite,
      estimatedReadingTime: estimatedTime,
      savedAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Bookmark -> Article (with DB persistence)
   */
  static async bookmarkToArticle(
    bookmark: Bookmark,
    options?: { duplicate?: boolean; readingStatus?: ReadingStatus }
  ): Promise<Article> {
    const article = this.buildArticleFromBookmark(bookmark, options);

    await db.transaction('rw', [db.bookmarks, db.articles], async () => {
      await db.articles.put(article);
      if (!options?.duplicate) {
        await db.bookmarks.delete(bookmark.id);
      }
    });

    return article;
  }

  /**
   * Pure builder: Quick Site -> Bookmark object
   */
  static buildBookmarkFromQuickSite(
    quickSite: QuickSite,
    collectionId?: string,
    options?: { projectId?: string; projectStage?: ProjectStage }
  ): Bookmark {
    const bmId = 'bm_' + Math.random().toString(36).substring(2, 9);

    return {
      id: bmId,
      title: quickSite.title,
      url: quickSite.url,
      cleanUrl: quickSite.cleanUrl,
      domain: quickSite.domain,
      favicon: quickSite.icon,
      collectionId: collectionId,
      projectId: options?.projectId,
      projectStage: options?.projectStage,
      accountProfileId: quickSite.accountProfileId,
      tags: [],
      isFavorite: quickSite.isPinned,
      isPinned: quickSite.isPinned,
      isArchived: false,
      openCount: quickSite.openCount || 0,
      lastOpenedAt: quickSite.lastOpenedAt,
      sortOrder: quickSite.sortOrder || Date.now(),
      createdAt: quickSite.createdAt || Date.now(),
      updatedAt: Date.now(),
      linkHealth: 'healthy'
    };
  }

  /**
   * Quick Site -> Bookmark (with DB persistence)
   */
  static async quickSiteToBookmark(
    quickSite: QuickSite,
    collectionId?: string,
    options?: { duplicate?: boolean; projectId?: string; projectStage?: ProjectStage }
  ): Promise<Bookmark> {
    const bookmark = this.buildBookmarkFromQuickSite(quickSite, collectionId, options);

    await db.transaction('rw', [db.quickSites, db.bookmarks], async () => {
      await db.bookmarks.put(bookmark);
      if (!options?.duplicate) {
        await db.quickSites.delete(quickSite.id);
      }
    });

    return bookmark;
  }

  /**
   * Pure builder: Quick Site -> Article object
   */
  static buildArticleFromQuickSite(
    quickSite: QuickSite,
    options?: { readingStatus?: ReadingStatus }
  ): Article {
    const artId = 'art_' + Math.random().toString(36).substring(2, 9);
    const estimatedTime = ArticleRepository.estimateReadingTime(quickSite.title);

    return {
      id: artId,
      title: quickSite.title,
      url: quickSite.url,
      cleanUrl: quickSite.cleanUrl,
      domain: quickSite.domain,
      source: quickSite.domain,
      favicon: quickSite.icon,
      tags: [],
      readingStatus: options?.readingStatus || 'unread',
      isFavorite: quickSite.isPinned,
      estimatedReadingTime: estimatedTime,
      savedAt: Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Quick Site -> Article (with DB persistence)
   */
  static async quickSiteToArticle(
    quickSite: QuickSite,
    options?: { duplicate?: boolean; readingStatus?: ReadingStatus }
  ): Promise<Article> {
    const article = this.buildArticleFromQuickSite(quickSite, options);

    await db.transaction('rw', [db.quickSites, db.articles], async () => {
      await db.articles.put(article);
      if (!options?.duplicate) {
        await db.quickSites.delete(quickSite.id);
      }
    });

    return article;
  }

  /**
   * Pure builder: Article -> Bookmark object
   */
  static buildBookmarkFromArticle(
    article: Article,
    collectionId?: string,
    options?: { projectId?: string; projectStage?: ProjectStage }
  ): Bookmark {
    const bmId = 'bm_' + Math.random().toString(36).substring(2, 9);

    return {
      id: bmId,
      title: article.title,
      url: article.url,
      cleanUrl: article.cleanUrl,
      domain: article.domain,
      favicon: article.favicon,
      notes: article.excerpt,
      tags: article.tags || [],
      collectionId: collectionId,
      projectId: options?.projectId,
      projectStage: options?.projectStage,
      isFavorite: article.isFavorite,
      isPinned: false,
      isArchived: article.readingStatus === 'archived',
      openCount: 0,
      sortOrder: Date.now(),
      createdAt: article.savedAt || Date.now(),
      updatedAt: Date.now(),
      linkHealth: 'healthy'
    };
  }

  /**
   * Article -> Bookmark (with DB persistence)
   */
  static async articleToBookmark(
    article: Article,
    collectionId?: string,
    options?: { duplicate?: boolean; projectId?: string; projectStage?: ProjectStage }
  ): Promise<Bookmark> {
    const bookmark = this.buildBookmarkFromArticle(article, collectionId, options);

    await db.transaction('rw', [db.articles, db.bookmarks], async () => {
      await db.bookmarks.put(bookmark);
      if (!options?.duplicate) {
        await db.articles.delete(article.id);
      }
    });

    return bookmark;
  }

  /**
   * Pure builder: Article -> Quick Site object
   */
  static buildQuickSiteFromArticle(
    article: Article,
    options?: { category?: QuickSiteCategory }
  ): QuickSite {
    const service = detectService(article.url);
    const category = options?.category || this.detectQuickSiteCategory(article.url);
    const siteId = 'site_' + Math.random().toString(36).substring(2, 9);

    return {
      id: siteId,
      serviceId: service?.id,
      title: article.title,
      url: article.url,
      cleanUrl: article.cleanUrl,
      domain: article.domain,
      icon: article.favicon,
      category,
      isPinned: article.isFavorite,
      isHidden: false,
      openCount: 0,
      sortOrder: Date.now(),
      createdAt: article.savedAt || Date.now(),
      updatedAt: Date.now()
    };
  }

  /**
   * Article -> Quick Site (with DB persistence)
   */
  static async articleToQuickSite(
    article: Article,
    options?: { duplicate?: boolean; category?: QuickSiteCategory }
  ): Promise<QuickSite> {
    const site = this.buildQuickSiteFromArticle(article, options);

    await db.transaction('rw', [db.articles, db.quickSites], async () => {
      await db.quickSites.put(site);
      if (!options?.duplicate) {
        await db.articles.delete(article.id);
      }
    });

    return site;
  }
}
