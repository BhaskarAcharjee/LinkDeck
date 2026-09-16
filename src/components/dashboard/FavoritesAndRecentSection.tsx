import React, { useState } from 'react';
import { Star, Clock, Flame } from 'lucide-react';
import type { Bookmark, Project, Collection, AccountProfile } from '../../core/types';
import { BookmarkCard } from '../bookmarks/BookmarkCard';

interface FavoritesAndRecentSectionProps {
  bookmarks: Bookmark[];
  projects: Project[];
  collections: Collection[];
  accounts: AccountProfile[];
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onRequestAccountPick: (bookmark: Bookmark) => void;
  onOpenBookmark: (bookmark: Bookmark, account?: AccountProfile) => void;
}

export const FavoritesAndRecentSection: React.FC<FavoritesAndRecentSectionProps> = ({
  bookmarks,
  projects,
  collections,
  accounts,
  onEditBookmark,
  onDeleteBookmark,
  onRequestAccountPick,
  onOpenBookmark
}) => {
  const [filterTab, setFilterTab] = useState<'all' | 'favorites' | 'recent' | 'frequent'>('all');

  const projectsMap = new Map(projects.map(p => [p.id, p]));
  const collectionsMap = new Map(collections.map(c => [c.id, c]));
  const accountsMap = new Map(accounts.map(a => [a.id, a]));

  let displayedBookmarks: Bookmark[] = [];

  if (filterTab === 'favorites') {
    displayedBookmarks = bookmarks.filter(b => b.isFavorite && !b.isArchived);
  } else if (filterTab === 'recent') {
    displayedBookmarks = [...bookmarks]
      .filter(b => !!b.lastOpenedAt && !b.isArchived)
      .sort((a, b) => (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0))
      .slice(0, 12);
  } else if (filterTab === 'frequent') {
    displayedBookmarks = [...bookmarks]
      .filter(b => b.openCount > 0 && !b.isArchived)
      .sort((a, b) => b.openCount - a.openCount)
      .slice(0, 12);
  } else {
    // All active bookmarks
    displayedBookmarks = bookmarks.filter(b => !b.isArchived);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-deck-bg-border pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterTab === 'all'
                ? 'bg-deck-bg-elevated text-white border border-deck-bg-border shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bookmarks ({bookmarks.filter(b => !b.isArchived).length})
          </button>

          <button
            onClick={() => setFilterTab('favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              filterTab === 'favorites'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Star size={13} className="fill-amber-400/40 text-amber-400" />
            <span>Favorites</span>
          </button>

          <button
            onClick={() => setFilterTab('recent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              filterTab === 'recent'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-cyan-300'
            }`}
          >
            <Clock size={13} />
            <span>Recent</span>
          </button>

          <button
            onClick={() => setFilterTab('frequent')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
              filterTab === 'frequent'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <Flame size={13} />
            <span>Top Used</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 font-mono">
          Showing {displayedBookmarks.length} links
        </span>
      </div>

      {displayedBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayedBookmarks.map(b => (
            <BookmarkCard
              key={b.id}
              bookmark={b}
              project={b.projectId ? projectsMap.get(b.projectId) : undefined}
              collection={b.collectionId ? collectionsMap.get(b.collectionId) : undefined}
              account={b.accountProfileId ? accountsMap.get(b.accountProfileId) : undefined}
              accounts={accounts}
              onEdit={onEditBookmark}
              onDelete={onDeleteBookmark}
              onRequestAccountPick={onRequestAccountPick}
              onOpenBookmark={onOpenBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 text-sm">
          No bookmarks found in this section.
        </div>
      )}
    </div>
  );
};
