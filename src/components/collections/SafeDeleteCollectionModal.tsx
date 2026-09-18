import React, { useState } from 'react';
import { Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Collection } from '../../core/types';

interface SafeDeleteCollectionModalProps {
  isOpen: boolean;
  collection: Collection | null;
  itemCount: number;
  onConfirm: (deleteContents: boolean) => void;
  onCancel: () => void;
}

export const SafeDeleteCollectionModal: React.FC<SafeDeleteCollectionModalProps> = ({
  isOpen,
  collection,
  itemCount,
  onConfirm,
  onCancel
}) => {
  const [deleteContents, setDeleteContents] = useState(false);

  if (!isOpen || !collection) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-deck-border p-6 shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              Delete "{collection.name}"?
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              This collection contains {itemCount} bookmark{itemCount === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          <label
            onClick={() => setDeleteContents(false)}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              !deleteContents
                ? 'bg-slate-800/90 border-cyan-500/60 text-white'
                : 'bg-slate-800/40 border-deck-border/40 text-slate-300 hover:border-slate-600'
            }`}
          >
            <input
              type="radio"
              name="deleteOption"
              checked={!deleteContents}
              onChange={() => setDeleteContents(false)}
              className="mt-0.5 text-cyan-500 focus:ring-cyan-500"
            />
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Delete collection only (Preserve bookmarks)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bookmarks will be moved to Unsorted / Unassigned so you don't lose any links.
              </p>
            </div>
          </label>

          <label
            onClick={() => setDeleteContents(true)}
            className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
              deleteContents
                ? 'bg-rose-950/30 border-rose-500/60 text-white'
                : 'bg-slate-800/40 border-deck-border/40 text-slate-300 hover:border-slate-600'
            }`}
          >
            <input
              type="radio"
              name="deleteOption"
              checked={deleteContents}
              onChange={() => setDeleteContents(true)}
              className="mt-0.5 text-rose-500 focus:ring-rose-500"
            />
            <div>
              <div className="text-xs font-semibold flex items-center gap-1.5 text-rose-300">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete collection AND its {itemCount} bookmarks</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Permanently deletes the collection and all links saved inside it.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-deck-border/40">
          <button
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(deleteContents)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors shadow-lg shadow-rose-600/20"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
};
