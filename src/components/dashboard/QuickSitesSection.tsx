import React, { useState, useRef, useEffect } from 'react';
import { Plus, Pin, EyeOff, ExternalLink, MoreVertical, Trash2, User } from 'lucide-react';
import type { QuickSite, QuickSiteCategory, AccountProfile } from '../../core/types';
import { QuickSiteRepository } from '../../core/repositories/QuickSiteRepository';
import { BrandIcon } from '../common/BrandIcon';

interface QuickSitesSectionProps {
  quickSites: QuickSite[];
  accounts: AccountProfile[];
  onOpenSite: (site: QuickSite, chosenAccount?: AccountProfile) => void;
  onAddQuickSite: () => void;
}

const CATEGORIES: { id: QuickSiteCategory | 'all'; label: string }[] = [
  { id: 'for_you', label: 'For You' },
  { id: 'ai', label: 'AI' },
  { id: 'development', label: 'Dev' },
  { id: 'google', label: 'Google' },
  { id: 'social', label: 'Social' },
  { id: 'design', label: 'Design' },
  { id: 'media', label: 'Media' },
  { id: 'shopping', label: 'Shopping' }
];

export const QuickSitesSection: React.FC<QuickSitesSectionProps> = ({
  quickSites,
  accounts,
  onOpenSite,
  onAddQuickSite
}) => {
  const [activeCategory, setActiveCategory] = useState<QuickSiteCategory | 'all'>('for_you');
  const [contextMenu, setContextMenu] = useState<{
    site: QuickSite;
    x: number;
    y: number;
  } | null>(null);

  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close context menu on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const rankedSites = QuickSiteRepository.rankSites(quickSites, activeCategory);

  const handleContextMenu = (e: React.MouseEvent, site: QuickSite) => {
    e.preventDefault();
    e.stopPropagation();
    // Clamp coordinates within window
    const x = Math.min(e.clientX, window.innerWidth - 220);
    const y = Math.min(e.clientY, window.innerHeight - 300);
    setContextMenu({ site, x, y });
  };

  const handleTogglePin = async (site: QuickSite) => {
    await QuickSiteRepository.togglePin(site.id);
    setContextMenu(null);
  };

  const handleToggleHide = async (site: QuickSite) => {
    await QuickSiteRepository.toggleHide(site.id);
    setContextMenu(null);
  };

  const handleDelete = async (site: QuickSite) => {
    await QuickSiteRepository.delete(site.id);
    setContextMenu(null);
  };

  const handleSetAccount = async (site: QuickSite, accountId: string | undefined) => {
    await QuickSiteRepository.update(site.id, { accountProfileId: accountId });
    setContextMenu(null);
  };

  return (
    <section className="relative rounded-2xl bg-deck-card/70 backdrop-blur-md border border-deck-border/60 p-5 shadow-lg">
      {/* Top Bar: Title & Category Chips */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-deck-border/40">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Quick Sites
          </span>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-deck-accent/15 text-deck-accent border border-deck-accent/30">
            {rankedSites.length}
          </span>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-deck-accent text-white shadow-sm shadow-deck-accent/30 font-semibold'
                    : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-700/60'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Launcher Tiles */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 sm:gap-4 pt-5">
        {rankedSites.map(site => {
          const account = site.accountProfileId ? accounts.find(a => a.id === site.accountProfileId) : undefined;

          return (
            <div
              key={site.id}
              onContextMenu={e => handleContextMenu(e, site)}
              className="group relative flex flex-col items-center cursor-pointer select-none"
            >
              {/* Tile Container */}
              <button
                onClick={() => onOpenSite(site)}
                className="relative w-15 h-15 sm:w-16 sm:h-16 rounded-2xl bg-deck-elevated/80 border border-deck-border/70 hover:border-deck-accent/60 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-deck-accent/10 focus:outline-none focus:ring-2 focus:ring-deck-accent/50"
              >
                {/* Soft Brand Glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity blur-md"
                  style={{ backgroundColor: site.customColor || '#38BDF8' }}
                />

                {/* Brand Vector Icon */}
                <BrandIcon
                  serviceId={site.serviceId}
                  domain={site.domain}
                  size="lg"
                  className="transition-transform duration-200 group-hover:scale-110"
                />

                {/* Pin Badge */}
                {site.isPinned && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500/90 text-slate-900 flex items-center justify-center shadow-sm">
                    <Pin className="w-2.5 h-2.5 fill-current" />
                  </span>
                )}

                {/* Account Profile Badge */}
                {account && (
                  <span
                    className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shadow text-white"
                    style={{ backgroundColor: account.avatarColor }}
                    title={`Assigned to ${account.name}`}
                  >
                    {account.avatarLetter}
                  </span>
                )}
              </button>

              {/* Title Underneath */}
              <span className="mt-2 text-xs font-medium text-slate-300 group-hover:text-white truncate max-w-[4.8rem] text-center transition-colors">
                {site.title}
              </span>

              {/* Context Trigger Button */}
              <button
                onClick={e => handleContextMenu(e, site)}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-opacity"
                title="Options"
              >
                <MoreVertical className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        {/* Add Quick Site Tile */}
        <button
          onClick={onAddQuickSite}
          className="group flex flex-col items-center cursor-pointer focus:outline-none"
        >
          <div className="w-15 h-15 sm:w-16 sm:h-16 rounded-2xl border-2 border-dashed border-deck-border/60 hover:border-deck-accent/60 bg-slate-900/30 hover:bg-deck-accent/10 flex items-center justify-center transition-all duration-200 hover:scale-105">
            <Plus className="w-6 h-6 text-slate-500 group-hover:text-deck-accent transition-colors" />
          </div>
          <span className="mt-2 text-xs font-medium text-slate-500 group-hover:text-slate-400">
            Add
          </span>
        </button>
      </div>

      {/* Floating Right-Click / Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-56 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-deck-border shadow-2xl p-1.5 text-xs text-slate-200 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-3 py-2 border-b border-slate-800 mb-1">
            <p className="font-semibold text-white truncate">{contextMenu.site.title}</p>
            <p className="text-[10px] text-slate-400 truncate">{contextMenu.site.domain}</p>
          </div>

          <button
            onClick={() => {
              onOpenSite(contextMenu.site);
              setContextMenu(null);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open in New Tab</span>
          </button>

          {/* Google Account Profile Launchers */}
          {accounts.length > 0 && (
            <div className="py-1 border-y border-slate-800 my-1">
              <span className="px-3 py-1 text-[10px] uppercase font-semibold text-slate-400 tracking-wider flex items-center gap-1">
                <User className="w-3 h-3" /> Open with Account
              </span>
              {accounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between px-1 hover:bg-slate-800/80 rounded-lg">
                  <button
                    onClick={() => {
                      onOpenSite(contextMenu.site, acc);
                      setContextMenu(null);
                    }}
                    className="flex-1 flex items-center justify-between py-1.5 px-2 text-slate-300 hover:text-white transition-colors text-left"
                  >
                    <span className="truncate">{acc.name}</span>
                    <span
                      className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: acc.avatarColor }}
                    >
                      {acc.avatarLetter}
                    </span>
                  </button>
                  <button
                    onClick={() => handleSetAccount(contextMenu.site, contextMenu.site.accountProfileId === acc.id ? undefined : acc.id)}
                    className={`px-1.5 py-0.5 text-[10px] rounded hover:bg-slate-700 transition ${
                      contextMenu.site.accountProfileId === acc.id ? 'text-amber-400 font-bold' : 'text-slate-500 hover:text-slate-300'
                    }`}
                    title={contextMenu.site.accountProfileId === acc.id ? 'Default profile (Click to unset)' : 'Set as default launch profile'}
                  >
                    {contextMenu.site.accountProfileId === acc.id ? 'Default' : 'Set'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => handleTogglePin(contextMenu.site)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
          >
            <Pin className="w-3.5 h-3.5" />
            <span>{contextMenu.site.isPinned ? 'Unpin from Top' : 'Pin to Top'}</span>
          </button>

          <button
            onClick={() => handleToggleHide(contextMenu.site)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors text-left"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>{contextMenu.site.isHidden ? 'Unhide from For You' : 'Hide from For You'}</span>
          </button>

          <div className="pt-1 border-t border-slate-800 mt-1">
            <button
              onClick={() => handleDelete(contextMenu.site)}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-950/50 text-rose-400 hover:text-rose-300 transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove Launcher</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
