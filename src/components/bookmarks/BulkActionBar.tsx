import React, { useState } from 'react';
import { Folder, Zap, Tag, Trash2, X, CheckSquare } from 'lucide-react';
import type { Collection } from '../../core/types';

interface BulkActionBarProps {
  selectedCount: number;
  collections: Collection[];
  onMoveToCollection: (collectionId: string) => void;
  onConvertToQuickLinks: () => void;
  onAddTag: (tag: string) => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  collections,
  onMoveToCollection,
  onConvertToQuickLinks,
  onAddTag,
  onDeleteSelected,
  onClearSelection
}) => {
  const [showCollections, setShowCollections] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagValue, setTagValue] = useState('');

  if (selectedCount === 0) return null;

  const handleAddTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagValue.trim()) {
      onAddTag(tagValue.trim());
      setTagValue('');
      setShowTagInput(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md text-white text-xs font-medium">
        {/* Count Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>{selectedCount} Selected</span>
        </div>

        <div className="h-4 w-px bg-slate-700 mx-1" />

        {/* Move to Collection */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCollections(!showCollections);
              setShowTagInput(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          >
            <Folder className="w-3.5 h-3.5 text-indigo-400" />
            <span>Move to...</span>
          </button>

          {showCollections && (
            <div className="absolute bottom-full left-0 mb-2 w-52 max-h-56 overflow-y-auto rounded-xl bg-slate-900 border border-deck-border shadow-2xl p-1.5 space-y-1">
              <span className="px-2 py-1 text-[10px] uppercase font-bold text-slate-400 block">
                Select Destination
              </span>
              {collections.map(col => (
                <button
                  key={col.id}
                  onClick={() => {
                    onMoveToCollection(col.id);
                    setShowCollections(false);
                  }}
                  className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-400 transition-colors truncate"
                >
                  {col.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Convert to Quick Links */}
        <button
          onClick={onConvertToQuickLinks}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Convert to Quick Links</span>
        </button>

        {/* Add Tag */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTagInput(!showTagInput);
              setShowCollections(false);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
          >
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Add Tag</span>
          </button>

          {showTagInput && (
            <form
              onSubmit={handleAddTagSubmit}
              className="absolute bottom-full left-0 mb-2 w-52 rounded-xl bg-slate-900 border border-deck-border shadow-2xl p-2 flex gap-1.5"
            >
              <input
                type="text"
                autoFocus
                placeholder="Tag name..."
                value={tagValue}
                onChange={e => setTagValue(e.target.value)}
                className="w-full bg-slate-800 border border-deck-border rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold"
              >
                Add
              </button>
            </form>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={onDeleteSelected}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete</span>
        </button>

        {/* Clear */}
        <button
          onClick={onClearSelection}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
          title="Deselect all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
