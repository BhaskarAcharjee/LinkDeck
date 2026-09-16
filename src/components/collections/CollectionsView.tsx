import React, { useState } from 'react';
import { Folder, Plus, Trash2 } from 'lucide-react';
import type { Collection, Bookmark, Project, AccountProfile } from '../../core/types';
import { BookmarkCard } from '../bookmarks/BookmarkCard';
import { CollectionRepository } from '../../core/repositories/CollectionRepository';

interface CollectionsViewProps {
  collections: Collection[];
  bookmarks: Bookmark[];
  projects: Project[];
  accounts: AccountProfile[];
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onRequestAccountPick: (bookmark: Bookmark) => void;
  onOpenBookmark: (bookmark: Bookmark, account?: AccountProfile) => void;
  onNewBookmark: (collectionId?: string) => void;
  onRefresh: () => void;
}

export const CollectionsView: React.FC<CollectionsViewProps> = ({
  collections,
  bookmarks,
  projects,
  accounts,
  onEditBookmark,
  onDeleteBookmark,
  onRequestAccountPick,
  onOpenBookmark,
  onNewBookmark,
  onRefresh
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(collections[0]?.id || '');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const projectsMap = new Map(projects.map(p => [p.id, p]));
  const accountsMap = new Map(accounts.map(a => [a.id, a]));

  const activeCollection = collections.find(c => c.id === selectedCollectionId) || collections[0];
  const collectionBookmarks = bookmarks.filter(b => b.collectionId === activeCollection?.id);

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    await CollectionRepository.create({
      name: newCollectionName.trim(),
      slug: newCollectionName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      sortOrder: collections.length + 1
    });

    setNewCollectionName('');
    setIsCreating(false);
    onRefresh();
  };

  const handleDeleteCollection = async (id: string, name: string) => {
    if (confirm(`Delete collection "${name}"? Bookmarks inside will remain in LinkDeck as unassigned.`)) {
      await CollectionRepository.delete(id);
      onRefresh();
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Left Sidebar: Collections list */}
      <div className="md:col-span-1 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-deck-bg-border">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Collections ({collections.length})
          </span>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
          >
            <Plus size={14} />
            <span>New</span>
          </button>
        </div>

        {isCreating && (
          <form onSubmit={handleCreateCollection} className="p-2.5 rounded-xl bg-deck-bg-card border border-deck-bg-border space-y-2">
            <input
              type="text"
              autoFocus
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              className="w-full bg-deck-bg-elevated border border-deck-bg-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-1.5">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-1 bg-cyan-500 text-slate-950 font-semibold rounded-md text-[11px]"
              >
                Create
              </button>
            </div>
          </form>
        )}

        <div className="space-y-1">
          {collections.map(col => {
            const count = bookmarks.filter(b => b.collectionId === col.id).length;
            const isSelected = activeCollection?.id === col.id;

            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                className={`group px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                  isSelected
                    ? 'bg-deck-bg-card border border-cyan-500/40 text-cyan-300 shadow-sm'
                    : 'text-slate-300 hover:bg-deck-bg-card/50 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Folder
                    size={16}
                    className={isSelected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}
                  />
                  <span className="text-xs font-semibold truncate">{col.name}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-deck-bg-elevated text-slate-400">
                    {count}
                  </span>
                  {!col.isSystem && (
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleDeleteCollection(col.id, col.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Bookmarks inside active collection */}
      <div className="md:col-span-3 space-y-4">
        {activeCollection && (
          <div className="flex items-center justify-between pb-3 border-b border-deck-bg-border">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Folder size={20} className="text-cyan-400" />
                <span>{activeCollection.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {collectionBookmarks.length} bookmarks in this collection
              </p>
            </div>

            <button
              onClick={() => onNewBookmark(activeCollection.id)}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow transition"
            >
              <Plus size={14} />
              <span>Add Link to {activeCollection.name}</span>
            </button>
          </div>
        )}

        {collectionBookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {collectionBookmarks.map(b => (
              <BookmarkCard
                key={b.id}
                bookmark={b}
                project={b.projectId ? projectsMap.get(b.projectId) : undefined}
                collection={activeCollection}
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
            No bookmarks in this collection yet.
          </div>
        )}
      </div>
    </div>
  );
};
