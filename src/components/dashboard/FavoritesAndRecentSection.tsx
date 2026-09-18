import React, { useState } from 'react';
import { Star, Clock, Flame, Trash2 } from 'lucide-react';
import type { Bookmark, Project, Collection, AccountProfile } from '../../core/types';
import { BookmarkCard } from '../bookmarks/BookmarkCard';

interface FavoritesAndRecentSectionProps {
  bookmarks: Bookmark[];
  projects: Project[];
  collections: Collection[];
  accounts: AccountProfile[];
  selectedBookmarkIds?: Set<string>;
  onToggleSelectBookmark?: (bookmarkId: string) => void;
  onBookmarkContextMenu?: (e: React.MouseEvent, bookmark: Bookmark) => void;
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onDeleteAllBookmarks: () => void;
  onRequestAccountPick: (bookmark: Bookmark) => void;
  onOpenBookmark: (bookmark: Bookmark, account?: AccountProfile) => void;
}

export const FavoritesAndRecentSection: React.FC<FavoritesAndRecentSectionProps> = ({
  bookmarks,
  projects,
  collections,
  accounts,
  selectedBookmarkIds,
  onToggleSelectBookmark,
  onBookmarkContextMenu,
  onEditBookmark,
  onDeleteBookmark,
  onDeleteAllBookmarks,
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
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
              filterTab === 'all'
                ? 'bg-deck-bg-elevated text-white border border-deck-bg-border shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Bookmarks ({bookmarks.filter(b => !b.isArchived).length})
          </button>

          <button
            onClick={() => setFilterTab('favorites')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
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
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shrink-0 ${
              filterTab === 'frequent'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <Flame size={13} />
            <span>Top Used</span>
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 font-mono">
            Showing {displayedBookmarks.length} links
          </span>

          {bookmarks.length > 0 && (
            <button
              onClick={onDeleteAllBookmarks}
              className="px-2.5 py-1 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-slate-800 hover:border-rose-500/30 rounded-lg transition flex items-center gap-1.5"
              title="Delete all bookmarks"
            >
              <Trash2 size={13} />
              <span>Delete All</span>
            </button>
          )}
        </div>
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
              isSelected={selectedBookmarkIds?.has(b.id)}
              onToggleSelect={onToggleSelectBookmark}
              onContextMenu={onBookmarkContextMenu}
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
