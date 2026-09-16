import React from 'react';
import { Sparkles, Upload, Plus } from 'lucide-react';

interface StarterPackPromptProps {
  onLoadStarterPack: () => void;
  onImportBookmarks: () => void;
  onNewBookmark: () => void;
}

export const StarterPackPrompt: React.FC<StarterPackPromptProps> = ({
  onLoadStarterPack,
  onImportBookmarks,
  onNewBookmark
}) => {
  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-3xl bg-deck-bg-card border border-deck-bg-border shadow-2xl text-center space-y-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[2px] mx-auto shadow-glow-cyan">
        <div className="w-full h-full bg-deck-bg-card rounded-[14px] flex items-center justify-center">
          <Sparkles size={28} className="text-cyan-400" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Your web, one shortcut away.
        </h2>
        <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
          LinkDeck is your local-first developer command center with smart Google multi-account routing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <button
          onClick={onLoadStarterPack}
          className="p-4 rounded-2xl bg-deck-bg-elevated hover:bg-deck-bg-hover border border-cyan-500/30 hover:border-cyan-500 transition text-left flex flex-col justify-between space-y-3 group shadow-card"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
            <Sparkles size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block group-hover:text-cyan-300 transition">
              Developer Starter Pack
            </span>
            <span className="text-[11px] text-slate-400 leading-snug block mt-0.5">
              Play Console, Firebase, AdMob, Cloud, & sample app workspace
            </span>
          </div>
        </button>

        <button
          onClick={onImportBookmarks}
          className="p-4 rounded-2xl bg-deck-bg-elevated hover:bg-deck-bg-hover border border-deck-bg-border hover:border-violet-500/40 transition text-left flex flex-col justify-between space-y-3 group shadow-card"
        >
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <Upload size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block group-hover:text-violet-300 transition">
              Import Bookmarks
            </span>
            <span className="text-[11px] text-slate-400 leading-snug block mt-0.5">
              Import from Chrome, Edge, Firefox, or Brave HTML export
            </span>
          </div>
        </button>

        <button
          onClick={onNewBookmark}
          className="p-4 rounded-2xl bg-deck-bg-elevated hover:bg-deck-bg-hover border border-deck-bg-border hover:border-emerald-500/40 transition text-left flex flex-col justify-between space-y-3 group shadow-card"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Plus size={16} />
          </div>
          <div>
            <span className="text-xs font-bold text-white block group-hover:text-emerald-300 transition">
              Add First Link
            </span>
            <span className="text-[11px] text-slate-400 leading-snug block mt-0.5">
              Paste or type any developer console URL
            </span>
          </div>
        </button>
      </div>

      <div className="pt-2 text-xs text-slate-500">
        100% Local-First • No Account Required • Zero Cloud Telemetry
      </div>
    </div>
  );
};
