import React, { useEffect, useState } from 'react';
import { RotateCcw, X } from 'lucide-react';
import type { UndoAction } from '../../core/types';
import { UndoManager } from '../../services/undo/undoManager';

export const UndoToast: React.FC = () => {
  const [action, setAction] = useState<UndoAction | null>(null);

  useEffect(() => {
    return UndoManager.subscribe(current => {
      setAction(current);
    });
  }, []);

  if (!action) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md text-white text-xs font-medium">
        <span className="text-slate-200">{action.description}</span>
        
        <div className="h-4 w-px bg-slate-700 mx-0.5" />

        <button
          onClick={() => UndoManager.undo()}
          className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>

        <button
          onClick={() => UndoManager.dismiss()}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
