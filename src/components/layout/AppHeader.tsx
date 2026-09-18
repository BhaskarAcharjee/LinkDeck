import React from 'react';
import {
  Search,
  Plus,
  FlaskConical,
  Upload,
  Moon,
  Sun,
  Command
} from 'lucide-react';
import type { AccountProfile } from '../../core/types';
import { AccountBadge } from '../common/AccountBadge';

interface AppHeaderProps {
  activeAccount?: AccountProfile;
  onOpenPalette: () => void;
  onNewBookmark: () => void;
  onOpenRoutingLab: () => void;
  onOpenAccountManager: () => void;
  onOpenImportExport: () => void;
  theme: 'dark' | 'light' | 'system';
  onToggleTheme: () => void;
  currentView: 'dashboard' | 'project' | 'collections' | 'articles';
  onNavigateView: (view: 'dashboard' | 'collections' | 'articles') => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeAccount,
  onOpenPalette,
  onNewBookmark,
  onOpenRoutingLab,
  onOpenAccountManager,
  onOpenImportExport,
  theme,
  onToggleTheme,
  currentView,
  onNavigateView
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-deck-bg-border bg-deck-bg/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Views Navigation */}
        <div className="flex items-center gap-6">
          <div
            onClick={() => onNavigateView('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-violet-600 p-[1.5px] shadow-glow-cyan transition group-hover:scale-105">
              <div className="w-full h-full bg-deck-bg-card rounded-[10px] flex items-center justify-center">
                <img src="/logo.svg" alt="LinkDeck" className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-400 transition">
                  LinkDeck
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  DEV
                </span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <button
              onClick={() => onNavigateView('dashboard')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentView === 'dashboard'
                  ? 'bg-deck-bg-elevated text-cyan-400 border border-deck-bg-border'
                  : 'text-slate-400 hover:text-white hover:bg-deck-bg-elevated/40'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onNavigateView('collections')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentView === 'collections'
                  ? 'bg-deck-bg-elevated text-cyan-400 border border-deck-bg-border'
                  : 'text-slate-400 hover:text-white hover:bg-deck-bg-elevated/40'
              }`}
            >
              Collections
            </button>
            <button
              onClick={() => onNavigateView('articles')}
              className={`px-3 py-1.5 rounded-lg transition ${
                currentView === 'articles'
                  ? 'bg-deck-bg-elevated text-emerald-400 border border-deck-bg-border'
                  : 'text-slate-400 hover:text-white hover:bg-deck-bg-elevated/40'
              }`}
            >
              Articles
            </button>
          </nav>
        </div>

        {/* Search Bar Trigger for Command Palette */}
        <div className="flex-1 max-w-md hidden sm:block">
          <button
            onClick={onOpenPalette}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-deck-bg-elevated/80 hover:bg-deck-bg-elevated border border-deck-bg-border hover:border-cyan-500/40 text-slate-400 hover:text-slate-200 transition shadow-inner group"
          >
            <div className="flex items-center gap-2 text-xs">
              <Search size={15} className="group-hover:text-cyan-400 transition" />
              <span>Search bookmarks, apps, accounts...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 border border-slate-700 text-slate-400">
              <Command size={10} /> K
            </kbd>
          </button>
        </div>

        {/* Right Actions: Add button, Account Selector, Lab, Import, Theme */}
        <div className="flex items-center gap-2">
          {/* Quick Add Button */}
          <button
            onClick={onNewBookmark}
            title="Add Bookmark (Ctrl+N)"
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-xs shadow-glow-cyan flex items-center gap-1.5 transition"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add</span>
          </button>

          {/* Account Routing Lab */}
          <button
            onClick={onOpenRoutingLab}
            title="Account Routing Lab & URL Sandbox"
            className="p-2 rounded-xl bg-deck-bg-elevated border border-deck-bg-border text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition flex items-center gap-1.5 text-xs"
          >
            <FlaskConical size={16} />
            <span className="hidden lg:inline text-xs font-semibold">Routing Lab</span>
          </button>

          {/* Active Account Switcher */}
          <div className="relative">
            <button
              onClick={onOpenAccountManager}
              title="Manage Google Account Profiles"
              className="p-1.5 rounded-xl bg-deck-bg-elevated border border-deck-bg-border hover:border-violet-500/40 flex items-center gap-2 transition"
            >
              <AccountBadge account={activeAccount} size="md" />
              <span className="hidden md:inline text-xs font-semibold text-slate-300 max-w-[90px] truncate">
                {activeAccount ? activeAccount.name.split(' ')[0] : 'Default'}
              </span>
            </button>
          </div>

          {/* Import / Export */}
          <button
            onClick={onOpenImportExport}
            title="Import / Export Bookmarks"
            className="p-2 rounded-xl bg-deck-bg-elevated border border-deck-bg-border text-slate-400 hover:text-white transition"
          >
            <Upload size={16} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            title="Toggle Dark / Light Theme"
            className="p-2 rounded-xl bg-deck-bg-elevated border border-deck-bg-border text-slate-400 hover:text-amber-400 transition"
          >
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </div>
    </header>
  );
};
