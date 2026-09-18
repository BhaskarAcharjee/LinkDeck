import type { Bookmark, Project, Collection, AccountProfile, QuickSite, Article } from '../../core/types';

export interface SearchResultItem {
  bookmark: Bookmark;
  score: number; // higher is better match
  matchedFields: string[];
  project?: Project;
  collection?: Collection;
  account?: AccountProfile;
}

export type UniversalResultType = 'quick_site' | 'bookmark' | 'article' | 'project';

export interface UniversalSearchResult {
  id: string;
  type: UniversalResultType;
  title: string;
  url?: string;
  cleanUrl?: string;
  domain?: string;
  score: number;
  badge: string;
  subtext?: string;
  iconName?: string;
  serviceId?: string;
  customColor?: string;
  account?: AccountProfile;
  item: Bookmark | QuickSite | Article | Project;
}

export class LocalSearchEngine {
  /**
   * Universal search across Quick Sites, Bookmarks, Articles, and Projects
   * Supports power prefixes: @ai, @dev, @article, @project, @social
   */
  static searchUniversal(
    rawQuery: string,
    bookmarks: Bookmark[],
    quickSites: QuickSite[] = [],
    articles: Article[] = [],
    projects: Project[] = [],
    collectionsMap: Map<string, Collection> = new Map(),
    accountsMap: Map<string, AccountProfile> = new Map(),
    limit = 30
  ): UniversalSearchResult[] {
    const trimmed = rawQuery.trim().toLowerCase();

    // Check for power prefix filters
    let filterCategory: 'ai' | 'dev' | 'article' | 'project' | 'social' | null = null;
    let queryWithoutPrefix = trimmed;

    if (trimmed.startsWith('@ai')) {
      filterCategory = 'ai';
      queryWithoutPrefix = trimmed.replace(/^@ai\s*/, '');
    } else if (trimmed.startsWith('@dev')) {
      filterCategory = 'dev';
      queryWithoutPrefix = trimmed.replace(/^@dev\s*/, '');
    } else if (trimmed.startsWith('@article')) {
      filterCategory = 'article';
      queryWithoutPrefix = trimmed.replace(/^@article\s*/, '');
    } else if (trimmed.startsWith('@project')) {
      filterCategory = 'project';
      queryWithoutPrefix = trimmed.replace(/^@project\s*/, '');
    } else if (trimmed.startsWith('@social')) {
      filterCategory = 'social';
      queryWithoutPrefix = trimmed.replace(/^@social\s*/, '');
    }

    const tokens = queryWithoutPrefix.split(/\s+/).filter(Boolean);
    const results: UniversalSearchResult[] = [];

    // 1. Search Quick Sites (unless filtered out)
    if (!filterCategory || filterCategory === 'ai' || filterCategory === 'dev' || filterCategory === 'social') {
      for (const qs of quickSites) {
        if (filterCategory === 'ai' && qs.category !== 'ai') continue;
        if (filterCategory === 'dev' && qs.category !== 'development') continue;
        if (filterCategory === 'social' && qs.category !== 'social') continue;

        let score = 20; // Quick sites get a base boost for being primary launchers
        if (qs.isPinned) score += 10;
        score += Math.min((qs.openCount || 0) * 1.5, 15);

        if (tokens.length > 0) {
          let allMatch = true;
          const text = `${qs.title} ${qs.domain} ${qs.category} ${qs.serviceId || ''}`.toLowerCase();
          for (const tok of tokens) {
            if (text.includes(tok)) {
              score += 15;
              if (qs.title.toLowerCase().startsWith(tok)) score += 10;
            } else {
              allMatch = false;
              break;
            }
          }
          if (!allMatch) continue;
        }

        results.push({
          id: qs.id,
          type: 'quick_site',
          title: qs.title,
          url: qs.url,
          cleanUrl: qs.cleanUrl,
          domain: qs.domain,
          score,
          badge: `Quick Site · ${qs.category.toUpperCase()}`,
          subtext: qs.domain,
          serviceId: qs.serviceId,
          customColor: qs.customColor,
          account: qs.accountProfileId ? accountsMap.get(qs.accountProfileId) : undefined,
          item: qs
        });
      }
    }

    // 2. Search Articles (unless filtered out)
    if (!filterCategory || filterCategory === 'article' || filterCategory === 'dev') {
      for (const art of articles) {
        let score = 10;
        if (art.isFavorite) score += 5;
        if (art.readingStatus === 'unread') score += 5;

        if (tokens.length > 0) {
          let allMatch = true;
          const text = `${art.title} ${art.domain} ${art.excerpt || ''} ${(art.tags || []).join(' ')}`.toLowerCase();
          for (const tok of tokens) {
            if (text.includes(tok)) {
              score += 12;
              if (art.title.toLowerCase().startsWith(tok)) score += 8;
            } else {
              allMatch = false;
              break;
            }
          }
          if (!allMatch) continue;
        }

        results.push({
          id: art.id,
          type: 'article',
          title: art.title,
          url: art.url,
          cleanUrl: art.cleanUrl,
          domain: art.domain,
          score,
          badge: `Article · ${art.estimatedReadingTime || 4} min`,
          subtext: `${art.source || art.domain} • ${art.readingStatus}`,
          item: art
        });
      }
    }

    // 3. Search Projects (unless filtered out)
    if (!filterCategory || filterCategory === 'project' || filterCategory === 'dev') {
      for (const proj of projects) {
        let score = 15;
        if (tokens.length > 0) {
          let allMatch = true;
          const text = `${proj.name} ${proj.slug} ${proj.description || ''} ${(proj.tags || []).join(' ')}`.toLowerCase();
          for (const tok of tokens) {
            if (text.includes(tok)) {
              score += 14;
              if (proj.name.toLowerCase().startsWith(tok)) score += 10;
            } else {
              allMatch = false;
              break;
            }
          }
          if (!allMatch) continue;
        }

        results.push({
          id: proj.id,
          type: 'project',
          title: proj.name,
          score,
          badge: 'Project Workspace',
          subtext: proj.description || proj.tags.join(', ') || 'Developer workspace',
          customColor: proj.color,
          item: proj
        });
      }
    }

    // 4. Search Bookmarks (unless filtered out)
    if (!filterCategory || filterCategory === 'dev') {
      const legacyResults = LocalSearchEngine.search(
        queryWithoutPrefix,
        bookmarks,
        new Map(projects.map(p => [p.id, p])),
        collectionsMap,
        accountsMap,
        limit
      );

      for (const res of legacyResults) {
        results.push({
          id: res.bookmark.id,
          type: 'bookmark',
          title: res.bookmark.title,
          url: res.bookmark.url,
          cleanUrl: res.bookmark.cleanUrl,
          domain: res.bookmark.domain,
          score: res.score,
          badge: res.project ? `Bookmark · ${res.project.name}` : 'Bookmark',
          subtext: res.bookmark.domain,
          account: res.account,
          item: res.bookmark
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }

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
      const projSlugLower = project?.slug?.toLowerCase() || '';
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

        if (projNameLower.includes(token) || projSlugLower.includes(token)) {
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
