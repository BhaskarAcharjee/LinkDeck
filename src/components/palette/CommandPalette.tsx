import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Layers,
  Sparkles,
  Settings,
  Upload,
  Moon,
  Trash2,
  CornerDownLeft,
  X
} from 'lucide-react';
import type { Bookmark, Project, Collection, AccountProfile } from '../../core/types';
import { LocalSearchEngine, type SearchResultItem } from '../../services/search/searchEngine';
import { ServiceIcon } from '../common/ServiceIcon';
import { AccountBadge } from '../common/AccountBadge';
import { StageBadge } from '../common/StageBadge';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  projects: Project[];
  collections: Collection[];
  accounts: AccountProfile[];
  onOpenBookmark: (bookmark: Bookmark, account?: AccountProfile) => void;
  onNewBookmark: () => void;
  onNewProject: () => void;
  onOpenRoutingLab: () => void;
  onOpenAccountManager: () => void;
  onOpenImportExport: () => void;
  onToggleTheme: () => void;
  onDeleteAllBookmarks?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  bookmarks,
  projects,
  collections,
  accounts,
  onOpenBookmark,
  onNewBookmark,
  onNewProject,
  onOpenRoutingLab,
  onOpenAccountManager,
  onOpenImportExport,
  onToggleTheme,
  onDeleteAllBookmarks
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const projectsMap = new Map(projects.map(p => [p.id, p]));
  const collectionsMap = new Map(collections.map(c => [c.id, c]));
  const accountsMap = new Map(accounts.map(a => [a.id, a]));

  const searchResults: SearchResultItem[] = LocalSearchEngine.search(
    query,
    bookmarks,
    projectsMap,
    collectionsMap,
    accountsMap,
    15
  );

  const isCommandMode = query.startsWith('>');

  const actions = [
    {
      id: 'act_new_bookmark',
      title: 'Add New Bookmark',
      subtitle: 'Create a shortcut with smart account routing',
      icon: Plus,
      run: onNewBookmark
    },
    {
      id: 'act_new_project',
      title: 'Create Project Workspace',
      subtitle: 'Bundle app resources into Dev, Distribution, Monetization stages',
      icon: Layers,
      run: onNewProject
    },
    {
      id: 'act_routing_lab',
      title: 'Account Routing Lab',
      subtitle: 'Test Google account URL transformations & routing rules',
      icon: Sparkles,
      run: onOpenRoutingLab
    },
    {
      id: 'act_accounts',
      title: 'Manage Google Account Profiles',
      subtitle: 'Configure Developer, Personal, Work accounts and authuser indexes',
      icon: Settings,
      run: onOpenAccountManager
    },
    {
      id: 'act_import_export',
      title: 'Import & Export Bookmarks',
      subtitle: 'Chrome / Firefox / Edge Netscape HTML or JSON backup',
      icon: Upload,
      run: onOpenImportExport
    },
    {
      id: 'act_theme',
      title: 'Toggle Theme',
      subtitle: 'Switch between Dark and Light mode',
      icon: Moon,
      run: onToggleTheme
    },
    ...(onDeleteAllBookmarks && bookmarks.length > 0
      ? [
          {
            id: 'act_delete_all',
            title: 'Delete All Bookmarks',
            subtitle: `Permanently remove all ${bookmarks.length} bookmarks from local storage`,
            icon: Trash2,
            run: onDeleteAllBookmarks
          }
        ]
      : [])
  ];

  const filteredActions = isCommandMode
    ? actions.filter(a =>
        a.title.toLowerCase().includes(query.slice(1).trim().toLowerCase())
      )
    : [];

  const totalItems = isCommandMode ? filteredActions.length : searchResults.length;

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1 < totalItems ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 >= 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (isCommandMode) {
        const action = filteredActions[selectedIndex];
        if (action) {
          action.run();
          onClose();
        }
      } else {
        const result = searchResults[selectedIndex];
        if (result) {
          onOpenBookmark(result.bookmark, result.account);
          onClose();
        }
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-2xl bg-deck-bg-card border border-deck-bg-borderLight rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Top Search Input Bar */}
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-deck-bg-border bg-deck-bg-elevated/80">
            <Search size={20} className="text-cyan-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search bookmarks, apps, accounts, tags or type > for commands..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 text-sm outline-none font-medium"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded bg-slate-800 border border-slate-700 text-slate-400">
              ESC
            </kbd>
          </div>

          {/* Results List */}
          <div
            ref={listRef}
            className="max-h-[440px] overflow-y-auto p-2 divide-y divide-deck-bg-border/30"
          >
            {isCommandMode ? (
              filteredActions.length > 0 ? (
                filteredActions.map((action, idx) => {
                  const isSelected = idx === selectedIndex;
                  const Icon = action.icon;
                  return (
                    <div
                      key={action.id}
                      data-selected={isSelected}
                      onClick={() => {
                        action.run();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${
                        isSelected
                          ? 'bg-cyan-500/10 border border-cyan-500/30 text-white'
                          : 'hover:bg-deck-bg-elevated text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-cyan-400'
                          }`}
                        >
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="text-sm font-semibold">{action.title}</div>
                          <div className="text-xs text-slate-400">{action.subtitle}</div>
                        </div>
                      </div>
                      <CornerDownLeft size={14} className={isSelected ? 'text-cyan-400' : 'text-slate-600'} />
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No matching command actions found.
                </div>
              )
            ) : searchResults.length > 0 ? (
              searchResults.map((item, idx) => {
                const isSelected = idx === selectedIndex;
                const b = item.bookmark;

                return (
                  <div
                    key={b.id}
                    data-selected={isSelected}
                    onClick={() => {
                      onOpenBookmark(b, item.account);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-xl flex items-center justify-between cursor-pointer transition gap-3 ${
                      isSelected
                        ? 'bg-cyan-500/10 border border-cyan-500/40 text-white shadow-sm'
                        : 'hover:bg-deck-bg-elevated text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-deck-bg-elevated border border-deck-bg-border flex items-center justify-center shrink-0">
                        <ServiceIcon url={b.url} customFavicon={b.favicon} size={18} />
                      </div>

                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-semibold truncate ${
                              isSelected ? 'text-cyan-300' : 'text-slate-100'
                            }`}
                          >
                            {b.title}
                          </span>

                          {item.project && (
                            <span
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold shrink-0"
                              style={{
                                backgroundColor: `${item.project.color}20`,
                                color: item.project.color
                              }}
                            >
                              {item.project.name}
                            </span>
                          )}

                          {b.projectStage && (
                            <StageBadge stage={b.projectStage} size="sm" />
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono truncate">
                          <span className="truncate">{b.domain}</span>
                          {item.account && (
                            <>
                              <span>•</span>
                              <AccountBadge account={item.account} size="sm" showName />
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSelected && (
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          Launch <CornerDownLeft size={10} />
                        </kbd>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <p className="text-sm font-medium text-slate-300">
                  No bookmarks matching "{query}"
                </p>
                <p className="text-xs text-slate-500">
                  Try typing <span className="font-mono text-cyan-400">&gt;</span> to run commands or add this link directly.
                </p>
              </div>
            )}
          </div>

          {/* Footer Shortcuts Navigation Bar */}
          <div className="px-4 py-2.5 bg-deck-bg-elevated/90 border-t border-deck-bg-border flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-4 text-[11px]">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↑</kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↵</kbd>
                <span>Open with Account</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">&gt;</kbd>
                <span>Commands</span>
              </span>
            </div>

            <div className="text-[11px] font-mono text-cyan-400">LinkDeck v1.0</div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
