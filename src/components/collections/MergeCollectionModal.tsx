import React, { useState } from 'react';
import { GitMerge, ArrowRight } from 'lucide-react';
import type { Collection } from '../../core/types';

interface MergeCollectionModalProps {
  isOpen: boolean;
  sourceCollection: Collection | null;
  collections: Collection[];
  onConfirm: (targetCollectionId: string) => void;
  onCancel: () => void;
}

export const MergeCollectionModal: React.FC<MergeCollectionModalProps> = ({
  isOpen,
  sourceCollection,
  collections,
  onConfirm,
  onCancel
}) => {
  const [targetId, setTargetId] = useState<string>('');

  if (!isOpen || !sourceCollection) return null;

  const otherCollections = collections.filter(c => c.id !== sourceCollection.id);
  const selectedTargetId = targetId || otherCollections[0]?.id || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-deck-border p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Merge "{sourceCollection.name}"
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Move all bookmarks from this collection into another, then delete this collection.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-300 block">
            Target Collection
          </label>
          <div className="grid grid-cols-1 gap-1.5 max-h-52 overflow-y-auto">
            {otherCollections.map(col => (
              <button
                key={col.id}
                type="button"
                onClick={() => setTargetId(col.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs text-left transition-colors ${
                  selectedTargetId === col.id
                    ? 'bg-indigo-500/15 border-indigo-500/60 text-white font-semibold'
                    : 'bg-slate-800/40 border-deck-border/40 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{col.name}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-deck-border/40">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={!selectedTargetId}
            onClick={() => onConfirm(selectedTargetId)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors shadow-lg shadow-indigo-600/20 disabled:opacity-50"
          >
            Merge Collections
          </button>
        </div>
      </div>
    </div>
  );
};
