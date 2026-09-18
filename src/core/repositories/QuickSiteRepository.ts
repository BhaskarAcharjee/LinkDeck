import { db } from '../db/database';
import type { QuickSite, QuickSiteCategory } from '../types';

export class QuickSiteRepository {
  static async getAll(): Promise<QuickSite[]> {
    return db.quickSites.orderBy('sortOrder').toArray();
  }

  static async getById(id: string): Promise<QuickSite | undefined> {
    return db.quickSites.get(id);
  }

  static async create(site: Omit<QuickSite, 'id' | 'createdAt' | 'updatedAt' | 'openCount'>): Promise<QuickSite> {
    const now = Date.now();
    const id = 'qs_' + Math.random().toString(36).substring(2, 9) + '_' + now;
    const newSite: QuickSite = {
      ...site,
      id,
      openCount: 0,
      createdAt: now,
      updatedAt: now
    };
    await db.quickSites.add(newSite);
    return newSite;
  }

  static async update(id: string, updates: Partial<QuickSite>): Promise<void> {
    await db.quickSites.update(id, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  static async delete(id: string): Promise<void> {
    await db.quickSites.delete(id);
  }

  static async deleteAll(): Promise<void> {
    await db.quickSites.clear();
  }

  static async togglePin(id: string): Promise<void> {
    const site = await db.quickSites.get(id);
    if (site) {
      await db.quickSites.update(id, {
        isPinned: !site.isPinned,
        updatedAt: Date.now()
      });
    }
  }

  static async toggleHide(id: string): Promise<void> {
    const site = await db.quickSites.get(id);
    if (site) {
      await db.quickSites.update(id, {
        isHidden: !site.isHidden,
        updatedAt: Date.now()
      });
    }
  }

  static async recordOpen(id: string): Promise<void> {
    const site = await db.quickSites.get(id);
    if (site) {
      await db.quickSites.update(id, {
        openCount: (site.openCount || 0) + 1,
        lastOpenedAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }

  static async reorder(orderedIds: string[]): Promise<void> {
    await db.transaction('rw', db.quickSites, async () => {
      for (let i = 0; i < orderedIds.length; i++) {
        await db.quickSites.update(orderedIds[i], {
          sortOrder: i + 1,
          updatedAt: Date.now()
        });
      }
    });
  }

  /**
   * Deterministic local ranking algorithm:
   * score = pinnedWeight (100) + (openCount * 2) + recencyScore
   */
  static rankSites(sites: QuickSite[], activeCategory: QuickSiteCategory | 'all' = 'for_you'): QuickSite[] {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    let filtered = sites;

    if (activeCategory === 'for_you') {
      // In "For You", hide explicitly hidden sites
      filtered = sites.filter(s => !s.isHidden);
    } else if (activeCategory !== 'all') {
      // Filter by specific category
      filtered = sites.filter(s => s.category === activeCategory);
    }

    const scored = filtered.map(site => {
      let score = 0;

      // Pinned weight: guaranteed high placement
      if (site.isPinned) {
        score += 100;
      }

      // Frequency weight: 2 points per open
      score += Math.min((site.openCount || 0) * 2, 80);

      // Recency weight: deterministic time decay
      if (site.lastOpenedAt) {
        const timeDiff = now - site.lastOpenedAt;
        if (timeDiff < oneDay) {
          score += 20;
        } else if (timeDiff < oneWeek) {
          score += 10;
        } else if (timeDiff < oneMonth) {
          score += 5;
        }
      }

      return { site, score };
    });

    // Sort pinned items with explicit sortOrder first, otherwise by score descending
    scored.sort((a, b) => {
      if (a.site.isPinned && b.site.isPinned) {
        return (a.site.sortOrder || 0) - (b.site.sortOrder || 0);
      }
      if (a.site.isPinned && !b.site.isPinned) return -1;
      if (!a.site.isPinned && b.site.isPinned) return 1;
      return b.score - a.score;
    });

    return scored.map(item => item.site);
  }
}
