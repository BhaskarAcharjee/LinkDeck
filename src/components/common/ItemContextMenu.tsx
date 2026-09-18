import React, { useState, useRef, useEffect } from 'react';
import {
  ExternalLink,
  Users,
  Star,
  Pin,
  Folder,
  Briefcase,
  Zap,
  BookOpen,
  Copy,
  Edit2,
  Archive,
  Trash2,
  EyeOff,
  CheckCircle,
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import type {
  Bookmark,
  QuickSite,
  Article,
  Collection,
  Project,
  AccountProfile,
  ReadingStatus
} from '../../core/types';

export type ContextMenuItem =
  | { type: 'bookmark'; data: Bookmark }
  | { type: 'quick_site'; data: QuickSite }
  | { type: 'article'; data: Article };

interface ItemContextMenuProps {
  item: ContextMenuItem;
  x: number;
  y: number;
  collections: Collection[];
  projects: Project[];
  accounts: AccountProfile[];
  onClose: () => void;
  // Common Actions
  onOpen: (item: ContextMenuItem, inNewTab?: boolean) => void;
  onOpenWithAccount?: (item: ContextMenuItem, account: AccountProfile) => void;
  onEdit: (item: ContextMenuItem) => void;
  onDelete: (item: ContextMenuItem) => void;
  // Conversions
  onConvert: (
    item: ContextMenuItem,
    targetType: 'bookmark' | 'quick_site' | 'article',
    duplicate?: boolean,
    collectionId?: string
  ) => void;
  // Bookmark specifics
  onToggleFavorite?: (item: ContextMenuItem) => void;
  onTogglePin?: (item: ContextMenuItem) => void;
  onMoveToCollection?: (bookmark: Bookmark, collectionId?: string) => void;
  onMoveToProject?: (bookmark: Bookmark, projectId?: string) => void;
  onToggleArchive?: (bookmark: Bookmark) => void;
  onNewCollection?: () => void;
  // QuickSite specifics
  onToggleHide?: (site: QuickSite) => void;
  // Article specifics
  onSetReadingStatus?: (article: Article, status: ReadingStatus) => void;
}

export const ItemContextMenu: React.FC<ItemContextMenuProps> = ({
  item,
  x,
  y,
  collections,
  projects,
  accounts,
  onClose,
  onOpen,
  onOpenWithAccount,
  onEdit,
  onDelete,
  onConvert,
  onToggleFavorite,
  onTogglePin,
  onMoveToCollection,
  onMoveToProject,
  onToggleArchive,
  onNewCollection,
  onToggleHide,
  onSetReadingStatus
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Position clamping
  const menuWidth = 220;
  const menuHeight = 340;
  const clampedX = Math.max(10, Math.min(x, window.innerWidth - menuWidth - 20));
  const clampedY = Math.max(10, Math.min(y, window.innerHeight - menuHeight - 20));

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const isBookmark = item.type === 'bookmark';
  const isQuickSite = item.type === 'quick_site';
  const isArticle = item.type === 'article';

  return (
    <div
      ref={menuRef}
      style={{ left: clampedX, top: clampedY }}
      className="fixed z-50 w-56 rounded-xl bg-slate-900/95 backdrop-blur-md border border-deck-border shadow-2xl p-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-150"
    >
      {/* Title Header */}
      <div className="px-2.5 py-1.5 border-b border-deck-border/40 mb-1 flex items-center justify-between">
        <span className="font-semibold text-white truncate max-w-[170px]">
          {item.data.title}
        </span>
        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          {item.type === 'quick_site' ? 'Quick Site' : item.type}
        </span>
      </div>

      {/* 1. Open Actions */}
      <button
        onClick={() => {
          onOpen(item, false);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        <span>Open</span>
      </button>

      <button
        onClick={() => {
          onOpen(item, true);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        <span>Open in new tab</span>
      </button>

      {/* Account Submenu (if Google/Routing service or bookmark/quicksite) */}
      {(isBookmark || isQuickSite) && accounts.length > 0 && (
        <div
          className="relative"
          onMouseEnter={() => setActiveSubmenu('account')}
          onMouseLeave={() => setActiveSubmenu(null)}
        >
          <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <div className="flex items-center gap-2.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Open with account</span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-500" />
          </button>

          {activeSubmenu === 'account' && (
            <div className="absolute left-full top-0 ml-1 w-52 rounded-xl bg-slate-900/95 backdrop-blur-md border border-deck-border shadow-2xl p-1.5 space-y-1">
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => {
                    onOpenWithAccount?.(item, acc);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left"
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-950 shrink-0"
                    style={{ backgroundColor: acc.avatarColor }}
                  >
                    {acc.avatarLetter}
                  </span>
                  <div className="truncate">
                    <div className="truncate font-medium">{acc.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">u/{acc.googleAuthUserIndex}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="my-1 border-t border-deck-border/40" />

      {/* 2. State & Organization (Bookmark Specific) */}
      {isBookmark && (
        <>
          <button
            onClick={() => {
              onToggleFavorite?.(item);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Star
              className={`w-3.5 h-3.5 ${
                (item.data as Bookmark).isFavorite
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-400'
              }`}
            />
            <span>{(item.data as Bookmark).isFavorite ? 'Unfavorite' : 'Favorite'}</span>
          </button>

          {/* Move to Collection Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveSubmenu('collection')}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <div className="flex items-center gap-2.5">
                <Folder className="w-3.5 h-3.5 text-indigo-400" />
                <span>Move to Collection</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </button>

            {activeSubmenu === 'collection' && (
              <div className="absolute left-full top-0 ml-1 w-52 max-h-64 overflow-y-auto rounded-xl bg-slate-900/95 backdrop-blur-md border border-deck-border shadow-2xl p-1.5 space-y-1">
                <button
                  onClick={() => {
                    onMoveToCollection?.(item.data as Bookmark, undefined);
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left text-slate-400"
                >
                  <span>Unassigned</span>
                </button>
                {collections.map(col => (
                  <button
                    key={col.id}
                    onClick={() => {
                      onMoveToCollection?.(item.data as Bookmark, col.id);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left ${
                      (item.data as Bookmark).collectionId === col.id ? 'text-cyan-400 font-semibold' : ''
                    }`}
                  >
                    <span className="truncate">{col.name}</span>
                  </button>
                ))}
                {onNewCollection && (
                  <>
                    <div className="border-t border-deck-border/40 my-1" />
                    <button
                      onClick={() => {
                        onNewCollection();
                        onClose();
                      }}
                      className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-cyan-400 hover:bg-slate-800 transition-colors text-left"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Collection</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Move to Project Submenu */}
          {projects.length > 0 && (
            <div
              className="relative"
              onMouseEnter={() => setActiveSubmenu('project')}
              onMouseLeave={() => setActiveSubmenu(null)}
            >
              <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Move to Project</span>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-500" />
              </button>

              {activeSubmenu === 'project' && (
                <div className="absolute left-full top-0 ml-1 w-52 max-h-64 overflow-y-auto rounded-xl bg-slate-900/95 backdrop-blur-md border border-deck-border shadow-2xl p-1.5 space-y-1">
                  <button
                    onClick={() => {
                      onMoveToProject?.(item.data as Bookmark, undefined);
                      onClose();
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left text-slate-400"
                  >
                    <span>None (Unassign)</span>
                  </button>
                  {projects.map(proj => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        onMoveToProject?.(item.data as Bookmark, proj.id);
                        onClose();
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left ${
                        (item.data as Bookmark).projectId === proj.id ? 'text-cyan-400 font-semibold' : ''
                      }`}
                    >
                      <span className="truncate">{proj.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* QuickSite Specific Pin / Hide */}
      {isQuickSite && (
        <>
          <button
            onClick={() => {
              onTogglePin?.(item);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Pin
              className={`w-3.5 h-3.5 ${
                (item.data as QuickSite).isPinned ? 'text-cyan-400 fill-cyan-400' : 'text-slate-400'
              }`}
            />
            <span>{(item.data as QuickSite).isPinned ? 'Unpin' : 'Pin to Top'}</span>
          </button>

          <button
            onClick={() => {
              onToggleHide?.(item.data as QuickSite);
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
            <span>{(item.data as QuickSite).isHidden ? 'Unhide' : 'Hide from For You'}</span>
          </button>
        </>
      )}

      {/* Article Specific Reading Status & Favorites */}
      {isArticle && (
        <>
          <button
            onClick={() => {
              const current = (item.data as Article).readingStatus;
              onSetReadingStatus?.(item.data as Article, current === 'read' ? 'unread' : 'read');
              onClose();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{(item.data as Article).readingStatus === 'read' ? 'Mark Unread' : 'Mark Read'}</span>
          </button>

          {/* Reading Status Submenu */}
          <div
            className="relative"
            onMouseEnter={() => setActiveSubmenu('readingStatus')}
            onMouseLeave={() => setActiveSubmenu(null)}
          >
            <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reading Status</span>
              </div>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </button>

            {activeSubmenu === 'readingStatus' && (
              <div className="absolute left-full top-0 ml-1 w-44 rounded-xl bg-slate-900/95 backdrop-blur-md border border-deck-border shadow-2xl p-1.5 space-y-1">
                {(['unread', 'reading', 'read', 'archived'] as ReadingStatus[]).map(status => (
                  <button
                    key={status}
                    onClick={() => {
                      onSetReadingStatus?.(item.data as Article, status);
                      onClose();
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left capitalize ${
                      (item.data as Article).readingStatus === status ? 'text-emerald-400 font-semibold' : ''
                    }`}
                  >
                    <span>{status}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div className="my-1 border-t border-deck-border/40" />

      {/* 3. Conversions */}
      {!isQuickSite && (
        <button
          onClick={() => {
            onConvert(item, 'quick_site', false);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Convert to Quick Link</span>
        </button>
      )}

      {!isArticle && (
        <button
          onClick={() => {
            onConvert(item, 'article', false);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
          <span>Convert to Article</span>
        </button>
      )}

      {!isBookmark && (
        <button
          onClick={() => {
            onConvert(item, 'bookmark', false);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Folder className="w-3.5 h-3.5 text-cyan-400" />
          <span>Convert to Bookmark</span>
        </button>
      )}

      {/* Duplicate Submenu */}
      <div
        className="relative"
        onMouseEnter={() => setActiveSubmenu('duplicate')}
        onMouseLeave={() => setActiveSubmenu(null)}
      >
        <button className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
          <div className="flex items-center gap-2.5">
            <Copy className="w-3.5 h-3.5 text-slate-400" />
            <span>Duplicate as...</span>
          </div>
          <ChevronRight className="w-3 h-3 text-slate-500" />
        </button>

        {activeSubmenu === 'duplicate' && (
          <div className="absolute left-full top-0 ml-1 w-44 rounded-xl bg-slate-900/95 backdrop-blur-md border border-deck-border shadow-2xl p-1.5 space-y-1">
            <button
              onClick={() => {
                onConvert(item, 'bookmark', true);
                onClose();
              }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left"
            >
              Bookmark
            </button>
            <button
              onClick={() => {
                onConvert(item, 'quick_site', true);
                onClose();
              }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left"
            >
              Quick Link
            </button>
            <button
              onClick={() => {
                onConvert(item, 'article', true);
                onClose();
              }}
              className="w-full px-2 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left"
            >
              Article
            </button>
          </div>
        )}
      </div>

      <div className="my-1 border-t border-deck-border/40" />

      {/* 4. Edit, Archive, Delete */}
      <button
        onClick={() => {
          onEdit(item);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
      >
        <Edit2 className="w-3.5 h-3.5 text-slate-400" />
        <span>Edit</span>
      </button>

      {isBookmark && onToggleArchive && (
        <button
          onClick={() => {
            onToggleArchive(item.data as Bookmark);
            onClose();
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
        >
          <Archive className="w-3.5 h-3.5 text-slate-400" />
          <span>{(item.data as Bookmark).isArchived ? 'Unarchive' : 'Archive'}</span>
        </button>
      )}

      <button
        onClick={() => {
          onDelete(item);
          onClose();
        }}
        className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-rose-500/15 text-rose-400 hover:text-rose-300 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>Delete</span>
      </button>
    </div>
  );
};
