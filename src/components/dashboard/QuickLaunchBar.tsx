import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import type { Bookmark, AccountProfile } from '../../core/types';
import { ServiceIcon } from '../common/ServiceIcon';
import { AccountBadge } from '../common/AccountBadge';

interface QuickLaunchBarProps {
  bookmarks: Bookmark[];
  accounts: AccountProfile[];
  onOpenBookmark: (bookmark: Bookmark, account?: AccountProfile) => void;
  onRequestAccountPick: (bookmark: Bookmark) => void;
}

export const QuickLaunchBar: React.FC<QuickLaunchBarProps> = ({
  bookmarks,
  accounts,
  onOpenBookmark,
  onRequestAccountPick
}) => {
  const accountsMap = new Map(accounts.map(a => [a.id, a]));

  // Get pinned or top-used shortcuts (up to 6)
  const quickLaunchItems = bookmarks
    .filter(b => b.isPinned && !b.isArchived)
    .slice(0, 6);

  if (quickLaunchItems.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          Quick Launch
        </span>
        <span className="text-[11px] text-slate-500 font-mono">1-Click Launchpad</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {quickLaunchItems.map(item => {
          const account = item.accountProfileId ? accountsMap.get(item.accountProfileId) : undefined;
          const isAsk = item.accountProfileId === 'ask';

          return (
            <button
              key={item.id}
              onClick={() => {
                if (isAsk) {
                  onRequestAccountPick(item);
                } else {
                  onOpenBookmark(item, account);
                }
              }}
              className="group relative p-3 rounded-2xl bg-deck-bg-card hover:bg-deck-bg-hover border border-deck-bg-border hover:border-cyan-500/50 transition-all duration-200 shadow-card hover:shadow-glow-cyan text-left flex flex-col justify-between h-24 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between w-full">
                <div className="w-9 h-9 rounded-xl bg-deck-bg-elevated border border-deck-bg-border flex items-center justify-center p-1.5 shadow-sm group-hover:border-cyan-500/40 transition">
                  <ServiceIcon url={item.url} customFavicon={item.favicon} size={20} />
                </div>

                <div className="flex items-center gap-1">
                  {isAsk ? (
                    <AccountBadge isAskEveryTime />
                  ) : account ? (
                    <AccountBadge account={account} size="sm" />
                  ) : null}
                  <ArrowUpRight
                    size={14}
                    className="text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition"
                  />
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition line-clamp-1 block">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono block truncate">
                  {item.domain}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
