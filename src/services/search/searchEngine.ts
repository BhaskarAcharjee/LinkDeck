import type { Bookmark, Project, Collection, AccountProfile } from '../../core/types';

export interface SearchResultItem {
  bookmark: Bookmark;
  score: number; // higher is better match
  matchedFields: string[];
  project?: Project;
  collection?: Collection;
  account?: AccountProfile;
}

export class LocalSearchEngine {
  /**
   * Fast multi-token fuzzy search across bookmarks, projects, collections, and accounts
   */
  static search(
    query: string,
    bookmarks: Bookmark[],
    projectsMap: Map<string, Project>,
    collectionsMap: Map<string, Collection>,
    accountsMap: Map<string, AccountProfile>,
    limit = 30
  ): SearchResultItem[] {
    const rawQuery = query.trim().toLowerCase();
    if (!rawQuery) {
      return bookmarks.slice(0, limit).map(b => ({
        bookmark: b,
        score: b.openCount * 0.1 + (b.isFavorite ? 5 : 0),
        matchedFields: [],
        project: b.projectId ? projectsMap.get(b.projectId) : undefined,
        collection: b.collectionId ? collectionsMap.get(b.collectionId) : undefined,
        account: b.accountProfileId ? accountsMap.get(b.accountProfileId) : undefined
      }));
    }

    const tokens = rawQuery.split(/\s+/).filter(Boolean);
    const results: SearchResultItem[] = [];

    for (const b of bookmarks) {
      if (b.isArchived) continue;

      const project = b.projectId ? projectsMap.get(b.projectId) : undefined;
      const collection = b.collectionId ? collectionsMap.get(b.collectionId) : undefined;
      const account = b.accountProfileId ? accountsMap.get(b.accountProfileId) : undefined;

      const titleLower = b.title.toLowerCase();
      const domainLower = b.domain.toLowerCase();
      const urlLower = b.url.toLowerCase();
      const notesLower = (b.notes || '').toLowerCase();
      const descLower = (b.description || '').toLowerCase();
      const tagsLower = b.tags.map(t => t.toLowerCase());
      const projNameLower = project?.name.toLowerCase() || '';
      const colNameLower = collection?.name.toLowerCase() || '';
      const accNameLower = account?.name.toLowerCase() || '';

      let score = 0;
      const matchedFields: string[] = [];
      let allTokensMatched = true;

      for (const token of tokens) {
        let tokenMatched = false;

        // Exact match boosts
        if (titleLower.includes(token)) {
          tokenMatched = true;
          score += 15;
          if (titleLower.startsWith(token)) score += 10;
          if (!matchedFields.includes('title')) matchedFields.push('title');
        }

        if (projNameLower.includes(token)) {
          tokenMatched = true;
          score += 14;
          if (!matchedFields.includes('project')) matchedFields.push('project');
        }

        if (tagsLower.some(t => t.includes(token))) {
          tokenMatched = true;
          score += 12;
          if (!matchedFields.includes('tags')) matchedFields.push('tags');
        }

        if (domainLower.includes(token)) {
          tokenMatched = true;
          score += 10;
          if (!matchedFields.includes('domain')) matchedFields.push('domain');
        }

        if (colNameLower.includes(token)) {
          tokenMatched = true;
          score += 8;
          if (!matchedFields.includes('collection')) matchedFields.push('collection');
        }

        if (accNameLower.includes(token)) {
          tokenMatched = true;
          score += 8;
          if (!matchedFields.includes('account')) matchedFields.push('account');
        }

        if (urlLower.includes(token)) {
          tokenMatched = true;
          score += 6;
          if (!matchedFields.includes('url')) matchedFields.push('url');
        }

        if (notesLower.includes(token) || descLower.includes(token)) {
          tokenMatched = true;
          score += 4;
          if (!matchedFields.includes('notes')) matchedFields.push('notes');
        }

        if (!tokenMatched) {
          allTokensMatched = false;
          break;
        }
      }

      if (allTokensMatched && score > 0) {
        // Boost for favorite, pinned, or frequently used
        if (b.isFavorite) score += 3;
        if (b.isPinned) score += 2;
        score += Math.min(b.openCount * 0.5, 10);

        results.push({
          bookmark: b,
          score,
          matchedFields,
          project,
          collection,
          account
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}
