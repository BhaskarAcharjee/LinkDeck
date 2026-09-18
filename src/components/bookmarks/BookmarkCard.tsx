import React, { useState, useRef, useEffect } from 'react';
import {
  MoreVertical,
  Star,
  Pin,
  Copy,
  Check,
  Edit2,
  Trash2,
  Share2,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import type { Bookmark, Project, Collection, AccountProfile } from '../../core/types';
import { ServiceIcon } from '../common/ServiceIcon';
import { AccountBadge } from '../common/AccountBadge';
import { StageBadge } from '../common/StageBadge';
import { BookmarkRepository } from '../../core/repositories/BookmarkRepository';

interface BookmarkCardProps {
  bookmark: Bookmark;
  project?: Project;
  collection?: Collection;
  account?: AccountProfile;
  accounts: AccountProfile[];
  isSelected?: boolean;
  onToggleSelect?: (bookmarkId: string) => void;
  onContextMenu?: (e: React.MouseEvent, bookmark: Bookmark) => void;
  onEdit: (bookmark: Bookmark) => void;
  onDelete: (bookmarkId: string) => void;
  onRequestAccountPick: (bookmark: Bookmark) => void;
  onOpenBookmark: (bookmark: Bookmark, account?: AccountProfile) => void;
}

export const BookmarkCard: React.FC<BookmarkCardProps> = ({
  bookmark,
  project,
  collection,
  account,
  accounts: _accounts,
  isSelected,
  onToggleSelect,
  onContextMenu,
  onEdit,
  onDelete,
  onRequestAccountPick,
  onOpenBookmark
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedClean, setCopiedClean] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const handleLaunch = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bookmark.accountProfileId === 'ask') {
      onRequestAccountPick(bookmark);
    } else {
      onOpenBookmark(bookmark, account);
    }
  };

  const handleCopyUrl = (e: React.MouseEvent, clean = false) => {
    e.stopPropagation();
    const urlToCopy = clean ? bookmark.cleanUrl : bookmark.url;
    navigator.clipboard.writeText(urlToCopy);
    if (clean) {
      setCopiedClean(true);
      setTimeout(() => setCopiedClean(false), 1500);
    } else {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 1500);
    }
    setMenuOpen(false);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await BookmarkRepository.toggleFavorite(bookmark.id);
  };

  const handleTogglePin = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await BookmarkRepository.togglePin(bookmark.id);
  };

  const isAsk = bookmark.accountProfileId === 'ask';

  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('text/plain', bookmark.id);
        e.dataTransfer.setData('application/json', JSON.stringify({ type: 'bookmark', id: bookmark.id }));
      }}
      onContextMenu={e => {
        if (onContextMenu) {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(e, bookmark);
        }
      }}
      onClick={handleLaunch}
      className={`group relative bg-deck-bg-card hover:bg-deck-bg-hover/80 border ${
        isSelected
          ? 'border-cyan-500 ring-1 ring-cyan-500/50 bg-cyan-950/10'
          : 'border-deck-bg-border hover:border-cyan-500/40'
      } rounded-xl p-4 transition-all duration-200 cursor-pointer shadow-card hover:shadow-card-hover hover:-translate-y-0.5 flex flex-col justify-between`}
    >
      {/* Top row: Favicon, Account badge, Quick launch button */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2.5">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected || false}
                onChange={e => {
                  e.stopPropagation();
                  onToggleSelect(bookmark.id);
                }}
                onClick={e => e.stopPropagation()}
                className={`w-3.5 h-3.5 rounded border-slate-600 text-cyan-500 focus:ring-0 cursor-pointer ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                } transition-opacity`}
              />
            )}

            <div className="w-8 h-8 rounded-lg bg-deck-bg-elevated border border-deck-bg-border flex items-center justify-center p-1 shadow-inner group-hover:border-cyan-500/30 transition">
              <ServiceIcon url={bookmark.url} customFavicon={bookmark.favicon} size={20} />
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-mono text-slate-400 group-hover:text-slate-300 transition truncate max-w-[130px]">
                {bookmark.domain}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
            {/* Account Indicator */}
            {isAsk ? (
              <AccountBadge isAskEveryTime />
            ) : account ? (
              <AccountBadge account={account} size="sm" />
            ) : null}

            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              title={bookmark.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className={`p-1 rounded text-slate-400 hover:text-amber-400 transition opacity-0 group-hover:opacity-100 ${
                bookmark.isFavorite ? 'opacity-100 text-amber-400' : ''
              }`}
            >
              <Star size={14} className={bookmark.isFavorite ? 'fill-amber-400' : ''} />
            </button>

            {/* Context menu trigger */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={e => {
                  if (onContextMenu) {
                    e.preventDefault();
                    onContextMenu(e, bookmark);
                  } else {
                    setMenuOpen(!menuOpen);
                  }
                }}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-deck-bg-elevated transition opacity-0 group-hover:opacity-100"
              >
                <MoreVertical size={14} />
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-deck-bg-elevated border border-deck-bg-borderLight rounded-lg shadow-xl py-1 z-30 text-xs">
                  <button
                    onClick={handleLaunch}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300"
                  >
                    <ArrowUpRight size={13} />
                    <span>Open in new tab</span>
                  </button>

                  <button
                    onClick={() => {
                      onRequestAccountPick(bookmark);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-200 hover:bg-cyan-500/10 hover:text-cyan-300"
                  >
                    <Share2 size={13} />
                    <span>Open with account…</span>
                  </button>

                  <div className="border-t border-slate-700/60 my-1" />

                  <button
                    onClick={e => handleCopyUrl(e, false)}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-200 hover:bg-slate-700"
                  >
                    {copiedUrl ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedUrl ? 'Copied!' : 'Copy URL'}</span>
                  </button>

                  <button
                    onClick={e => handleCopyUrl(e, true)}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-200 hover:bg-slate-700"
                  >
                    {copiedClean ? <Check size={13} className="text-emerald-400" /> : <Sparkles size={13} />}
                    <span>{copiedClean ? 'Copied Clean URL' : 'Copy Clean URL'}</span>
                  </button>

                  <button
                    onClick={handleTogglePin}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-200 hover:bg-slate-700"
                  >
                    <Pin size={13} className={bookmark.isPinned ? 'text-cyan-400 fill-cyan-400' : ''} />
                    <span>{bookmark.isPinned ? 'Unpin' : 'Pin to Top'}</span>
                  </button>

                  <button
                    onClick={() => {
                      onEdit(bookmark);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-200 hover:bg-slate-700"
                  >
                    <Edit2 size={13} />
                    <span>Edit bookmark</span>
                  </button>

                  <div className="border-t border-slate-700/60 my-1" />

                  <button
                    onClick={() => {
                      onDelete(bookmark.id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-rose-400 hover:bg-rose-500/10"
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-100 group-hover:text-cyan-300 transition line-clamp-1 mb-1">
          {bookmark.title}
        </h4>

        {/* Description or Notes */}
        {bookmark.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {bookmark.description}
          </p>
        )}
      </div>

      {/* Footer tags: Project stage & tags */}
      <div className="pt-2.5 mt-auto border-t border-deck-bg-border/60 flex items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1.5 overflow-hidden">
          {project && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium font-mono truncate"
              style={{ backgroundColor: `${project.color}15`, color: project.color }}
            >
              <Layers size={10} />
              {project.name}
            </span>
          )}

          {bookmark.projectStage && (
            <StageBadge stage={bookmark.projectStage} size="sm" />
          )}

          {!project && collection && (
            <span className="text-slate-400 truncate max-w-[90px]">
              {collection.name}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 text-slate-400 shrink-0">
          <ArrowUpRight
            size={14}
            className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
          />
        </div>
      </div>
    </div>
  );
};
