import React from 'react';
import { Zap, AlertCircle } from 'lucide-react';
import type { Bookmark } from '../../core/types';

interface DropConvertModalProps {
  isOpen: boolean;
  bookmark: Bookmark | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DropConvertModal: React.FC<DropConvertModalProps> = ({
  isOpen,
  bookmark,
  onConfirm,
  onCancel
}) => {
  if (!isOpen || !bookmark) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-deck-border p-5 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Convert to Quick Link?</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              "{bookmark.title}" will be moved to Quick Sites.
            </p>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-deck-border/40 text-[11px] text-slate-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <span>
            Metadata including URL, service identity, and account routing will be preserved.
          </span>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
          >
            Convert
          </button>
        </div>
      </div>
    </div>
  );
};
