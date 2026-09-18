import React, { useState } from 'react';
import {
  Folder,
  Plus,
  Trash2,
  GitMerge,
  Copy,
  Edit2,
  ArrowUpDown
} from 'lucide-react';
import type { Collection, Bookmark, Project, AccountProfile } from '../../core/types';
import { BookmarkCard } from '../bookmarks/BookmarkCard';
import { CollectionRepository } from '../../core/repositories/CollectionRepository';
import { BookmarkRepository } from '../../core/repositories/BookmarkRepository';
import { SafeDeleteCollectionModal } from './SafeDeleteCollectionModal';
import { MergeCollectionModal } from './MergeCollectionModal';
import { BulkActionBar } from '../bookmarks/BulkActionBar';
import { UndoManager } from '../../services/undo/undoManager';
import { ConversionService } from '../../services/conversion/conversionService';

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
  onBookmarkContextMenu?: (e: React.MouseEvent, bookmark: Bookmark) => void;
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
  onRefresh,
  onBookmarkContextMenu
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(collections[0]?.id || '');
  const [newCollectionName, setNewCollectionName] = useState('');
  const [newCollectionDesc, setNewCollectionDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit / Rename Modal State
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState<{ col: Collection; count: number } | null>(null);

  // Merge Modal State
  const [mergeTarget, setMergeTarget] = useState<Collection | null>(null);

  // Sorting
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'frequent'>('recent');

  // Drag-over collection highlight
  const [dragOverColId, setDragOverColId] = useState<string | null>(null);

  // Multi-selection
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());

  const projectsMap = new Map(projects.map(p => [p.id, p]));
  const accountsMap = new Map(accounts.map(a => [a.id, a]));

  const activeCollection = collections.find(c => c.id === selectedCollectionId) || collections[0];
  let collectionBookmarks = bookmarks.filter(b => b.collectionId === activeCollection?.id);

  // Sort collection bookmarks
  if (sortBy === 'name') {
    collectionBookmarks = [...collectionBookmarks].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'frequent') {
    collectionBookmarks = [...collectionBookmarks].sort((a, b) => (b.openCount || 0) - (a.openCount || 0));
  } else {
    // recent
    collectionBookmarks = [...collectionBookmarks].sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCollectionName.trim()) return;

    await CollectionRepository.create({
      name: newCollectionName.trim(),
      slug: newCollectionName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: newCollectionDesc.trim() || undefined,
      sortOrder: collections.length + 1
    });

    setNewCollectionName('');
    setNewCollectionDesc('');
    setIsCreating(false);
    onRefresh();
  };

  const handleSaveEditCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCollection || !editName.trim()) return;

    const oldName = editingCollection.name;
    const newName = editName.trim();
    const id = editingCollection.id;

    await CollectionRepository.update(id, {
      name: newName,
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: editDesc.trim() || undefined
    });

    UndoManager.push(`Renamed "${oldName}" to "${newName}"`, async () => {
      await CollectionRepository.update(id, { name: oldName });
      onRefresh();
    });

    setEditingCollection(null);
    onRefresh();
  };

  const handleDuplicate = async (col: Collection) => {
    const duplicated = await CollectionRepository.duplicate(col.id);
    if (duplicated) {
      UndoManager.push(`Duplicated collection "${col.name}"`, async () => {
        await CollectionRepository.delete(duplicated.id);
        onRefresh();
      });
      onRefresh();
    }
  };

  const handleConfirmDelete = async (deleteContents: boolean) => {
    if (!deleteTarget) return;
    const { col } = deleteTarget;
    await CollectionRepository.safeDelete(col.id, deleteContents);
    setDeleteTarget(null);
    onRefresh();
  };

  const handleConfirmMerge = async (targetColId: string) => {
    if (!mergeTarget) return;
    const targetCol = collections.find(c => c.id === targetColId);
    await CollectionRepository.merge(mergeTarget.id, targetColId);
    setMergeTarget(null);
    if (targetCol) {
      setSelectedCollectionId(targetCol.id);
    }
    onRefresh();
  };

  // Drag and Drop onto collection item
  const handleDropOnCollection = async (e: React.DragEvent, targetColId: string) => {
    e.preventDefault();
    setDragOverColId(null);

    const bookmarkId = e.dataTransfer.getData('text/plain');
    if (!bookmarkId) return;

    const bm = bookmarks.find(b => b.id === bookmarkId);
    if (!bm || bm.collectionId === targetColId) return;

    const oldCollectionId = bm.collectionId;
    const targetCol = collections.find(c => c.id === targetColId);

    await BookmarkRepository.update(bm.id, { collectionId: targetColId });
    onRefresh();

    UndoManager.push(`Moved "${bm.title}" to ${targetCol?.name || 'collection'}`, async () => {
      await BookmarkRepository.update(bm.id, { collectionId: oldCollectionId });
      onRefresh();
    });
  };

  // Selection helpers
  const handleToggleSelectBookmark = (bookmarkId: string) => {
    const next = new Set(selectedBookmarkIds);
    if (next.has(bookmarkId)) next.delete(bookmarkId);
    else next.add(bookmarkId);
    setSelectedBookmarkIds(next);
  };

  const handleBulkMove = async (colId: string) => {
    const ids = Array.from(selectedBookmarkIds);
    const targetCol = collections.find(c => c.id === colId);
    const previousCols = new Map(bookmarks.filter(b => ids.includes(b.id)).map(b => [b.id, b.collectionId]));

    for (const id of ids) {
      await BookmarkRepository.update(id, { collectionId: colId });
    }
    setSelectedBookmarkIds(new Set());
    onRefresh();

    UndoManager.push(`Moved ${ids.length} bookmarks to ${targetCol?.name || 'collection'}`, async () => {
      for (const [bmId, oldColId] of previousCols.entries()) {
        await BookmarkRepository.update(bmId, { collectionId: oldColId });
      }
      onRefresh();
    });
  };

  const handleBulkConvertToQuickLinks = async () => {
    const ids = Array.from(selectedBookmarkIds);
    const bms = bookmarks.filter(b => ids.includes(b.id));

    for (const bm of bms) {
      await ConversionService.bookmarkToQuickSite(bm, { duplicate: false });
    }
    setSelectedBookmarkIds(new Set());
    onRefresh();
  };

  const handleBulkAddTag = async (tag: string) => {
    const ids = Array.from(selectedBookmarkIds);
    for (const id of ids) {
      const bm = bookmarks.find(b => b.id === id);
      if (bm && !bm.tags?.includes(tag)) {
        await BookmarkRepository.update(id, { tags: [...(bm.tags || []), tag] });
      }
    }
    setSelectedBookmarkIds(new Set());
    onRefresh();
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedBookmarkIds);
    if (confirm(`Delete ${ids.length} selected bookmarks?`)) {
      for (const id of ids) {
        await BookmarkRepository.delete(id);
      }
      setSelectedBookmarkIds(new Set());
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
          <form onSubmit={handleCreateCollection} className="p-3 rounded-xl bg-deck-bg-card border border-deck-bg-border space-y-2.5">
            <input
              type="text"
              autoFocus
              placeholder="Collection name..."
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              className="w-full bg-deck-bg-elevated border border-deck-bg-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
            />
            <input
              type="text"
              placeholder="Description (optional)..."
              value={newCollectionDesc}
              onChange={e => setNewCollectionDesc(e.target.value)}
              className="w-full bg-deck-bg-elevated border border-deck-bg-border rounded-lg px-2.5 py-1 text-[11px] text-white outline-none focus:border-cyan-500"
            />
            <div className="flex justify-end gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-2 py-1 text-[11px] text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-500 text-slate-950 font-semibold rounded-md text-[11px]"
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
            const isDragOver = dragOverColId === col.id;

            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollectionId(col.id)}
                onDragOver={e => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverColId(col.id);
                }}
                onDragLeave={() => setDragOverColId(null)}
                onDrop={e => handleDropOnCollection(e, col.id)}
                className={`group px-3 py-2.5 rounded-xl flex items-center justify-between cursor-pointer transition ${
                  isDragOver
                    ? 'bg-cyan-500/20 border border-cyan-400 scale-[1.02]'
                    : isSelected
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

                  {/* Actions for custom collections */}
                  {!col.isSystem && (
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition">
                      <button
                        title="Edit collection"
                        onClick={e => {
                          e.stopPropagation();
                          setEditingCollection(col);
                          setEditName(col.name);
                          setEditDesc(col.description || '');
                        }}
                        className="p-1 text-slate-500 hover:text-cyan-400 transition"
                      >
                        <Edit2 size={12} />
                      </button>

                      <button
                        title="Duplicate collection"
                        onClick={e => {
                          e.stopPropagation();
                          handleDuplicate(col);
                        }}
                        className="p-1 text-slate-500 hover:text-amber-400 transition"
                      >
                        <Copy size={12} />
                      </button>

                      <button
                        title="Merge collection into another"
                        onClick={e => {
                          e.stopPropagation();
                          setMergeTarget(col);
                        }}
                        className="p-1 text-slate-500 hover:text-indigo-400 transition"
                      >
                        <GitMerge size={12} />
                      </button>

                      <button
                        title="Delete collection"
                        onClick={e => {
                          e.stopPropagation();
                          setDeleteTarget({ col, count });
                        }}
                        className="p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-deck-bg-border">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Folder size={20} className="text-cyan-400" />
                <span>{activeCollection.name}</span>
              </h3>
              {activeCollection.description && (
                <p className="text-xs text-slate-400 mt-0.5">{activeCollection.description}</p>
              )}
              <p className="text-[11px] text-slate-500 mt-0.5">
                {collectionBookmarks.length} bookmark{collectionBookmarks.length === 1 ? '' : 's'} in this collection
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sort selector */}
              <div className="flex items-center gap-1 bg-deck-bg-card border border-deck-bg-border rounded-xl p-1 text-xs">
                <ArrowUpDown size={13} className="text-slate-400 ml-1.5" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-transparent text-slate-300 text-xs py-1 px-1.5 outline-none cursor-pointer"
                >
                  <option value="recent" className="bg-slate-900">Recent</option>
                  <option value="name" className="bg-slate-900">Name (A-Z)</option>
                  <option value="frequent" className="bg-slate-900">Most Opened</option>
                </select>
              </div>

              <button
                onClick={() => onNewBookmark(activeCollection.id)}
                className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 shadow transition"
              >
                <Plus size={14} />
                <span>Add Link</span>
              </button>
            </div>
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
                isSelected={selectedBookmarkIds.has(b.id)}
                onToggleSelect={handleToggleSelectBookmark}
                onContextMenu={onBookmarkContextMenu}
                onEdit={onEditBookmark}
                onDelete={onDeleteBookmark}
                onRequestAccountPick={onRequestAccountPick}
                onOpenBookmark={onOpenBookmark}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500 text-sm border border-dashed border-deck-bg-border rounded-2xl">
            No bookmarks in this collection yet. You can drag and drop bookmarks here or click Add Link.
          </div>
        )}
      </div>

      {/* Bulk Action Toolbar */}
      <BulkActionBar
        selectedCount={selectedBookmarkIds.size}
        collections={collections}
        onMoveToCollection={handleBulkMove}
        onConvertToQuickLinks={handleBulkConvertToQuickLinks}
        onAddTag={handleBulkAddTag}
        onDeleteSelected={handleBulkDelete}
        onClearSelection={() => setSelectedBookmarkIds(new Set())}
      />

      {/* Edit Collection Modal */}
      {editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleSaveEditCollection}
            className="w-full max-w-sm rounded-2xl bg-slate-900 border border-deck-border p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-white">Edit Collection</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-slate-800 border border-deck-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={editDesc}
                  onChange={e => setEditDesc(e.target.value)}
                  placeholder="Optional description..."
                  className="w-full bg-slate-800 border border-deck-border rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-deck-border/40">
              <button
                type="button"
                onClick={() => setEditingCollection(null)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 bg-cyan-500 text-slate-950 font-semibold text-xs rounded-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Safe Delete Collection Modal */}
      <SafeDeleteCollectionModal
        isOpen={deleteTarget !== null}
        collection={deleteTarget?.col || null}
        itemCount={deleteTarget?.count || 0}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Merge Collection Modal */}
      <MergeCollectionModal
        isOpen={mergeTarget !== null}
        sourceCollection={mergeTarget}
        collections={collections}
        onConfirm={handleConfirmMerge}
        onCancel={() => setMergeTarget(null)}
      />
    </div>
  );
};
