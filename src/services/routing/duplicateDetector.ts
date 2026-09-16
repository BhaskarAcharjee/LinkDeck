import { db } from '../../core/db/database';
import type { DuplicateCheckResult } from '../../core/types';
import { UrlNormalizer } from './urlNormalizer';

export class DuplicateDetector {
  /**
   * Checks if an incoming URL matches an existing bookmark in the database
   */
  static async check(incomingUrl: string, title?: string, excludeBookmarkId?: string): Promise<DuplicateCheckResult> {
    if (!incomingUrl) {
      return { isDuplicate: false };
    }

    const cleanIncoming = UrlNormalizer.clean(incomingUrl);
    const domainIncoming = UrlNormalizer.getDomain(incomingUrl);

    const allBookmarks = await db.bookmarks.toArray();
    const filtered = excludeBookmarkId ? allBookmarks.filter(b => b.id !== excludeBookmarkId) : allBookmarks;

    // 1. Exact URL Match
    const exactMatch = filtered.find(b => b.url.trim().toLowerCase() === incomingUrl.trim().toLowerCase());
    if (exactMatch) {
      return {
        isDuplicate: true,
        matchType: 'exact_url',
        existingBookmark: exactMatch,
        similarityScore: 1.0
      };
    }

    // 2. Normalized URL Match (e.g. diff tracking params or trailing slash)
    const normMatch = filtered.find(b => b.cleanUrl === cleanIncoming);
    if (normMatch) {
      return {
        isDuplicate: true,
        matchType: 'normalized_url',
        existingBookmark: normMatch,
        similarityScore: 0.95
      };
    }

    // 3. Domain + Title Match (e.g. slight path variation but identical page)
    if (title && domainIncoming) {
      const normalizedTitle = title.trim().toLowerCase();
      const domainTitleMatch = filtered.find(b =>
        b.domain.toLowerCase() === domainIncoming.toLowerCase() &&
        b.title.trim().toLowerCase() === normalizedTitle
      );
      if (domainTitleMatch) {
        return {
          isDuplicate: true,
          matchType: 'domain_title',
          existingBookmark: domainTitleMatch,
          similarityScore: 0.85
        };
      }
    }

    return { isDuplicate: false };
  }
}
