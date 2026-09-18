import React, { useState, useEffect } from 'react';
import { Sparkles, X, Zap, BookOpen, Folder } from 'lucide-react';
import type { Bookmark, QuickSite, Collection } from '../../core/types';
import { detectService } from '../../services/routing/serviceRegistry';

interface Suggestion {
  id: string;
  text: string;
  type: 'quick_site' | 'article' | 'collection';
  actionLabel: string;
  bookmark: Bookmark;
  targetCollectionId?: string;
}

interface SmartSuggestionsBarProps {
  bookmarks: Bookmark[];
  quickSites: QuickSite[];
  collections: Collection[];
  onConvertToQuickSite: (bookmark: Bookmark) => void;
  onConvertToArticle: (bookmark: Bookmark) => void;
  onMoveToCollection: (bookmark: Bookmark, collectionId: string) => void;
}

export const SmartSuggestionsBar: React.FC<SmartSuggestionsBarProps> = ({
  bookmarks,
  quickSites,
  collections,
  onConvertToQuickSite,
  onConvertToArticle,
  onMoveToCollection
}) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('linkdeck_dismissed_suggestions');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    const list: Suggestion[] = [];
    const quickSiteUrls = new Set(quickSites.map(s => s.cleanUrl));

    for (const bm of bookmarks) {
      if (dismissedIds.has(bm.id)) continue;

      const service = detectService(bm.url);
      // Check if it looks like a Quick Site
      if (
        service &&
        !quickSiteUrls.has(bm.cleanUrl) &&
        (bm.url.endsWith('/') || bm.cleanUrl.split('/').length <= 4)
      ) {
        list.push({
          id: bm.id,
          text: `"${bm.title}" looks like a Quick Site`,
          type: 'quick_site',
          actionLabel: 'Convert to Quick Site',
          bookmark: bm
        });
        if (list.length >= 2) break;
        continue;
      }

      // Check if it looks like an Article
      if (
        (bm.domain.includes('medium.com') ||
          bm.domain.includes('betterprogramming.pub') ||
          bm.domain.includes('freecodecamp.org')) &&
        !bm.isArchived
      ) {
        list.push({
          id: bm.id,
          text: `"${bm.title}" looks like a reading article`,
          type: 'article',
          actionLabel: 'Save to Articles',
          bookmark: bm
        });
        if (list.length >= 2) break;
        continue;
      }

      // Check unassigned dev links
      if (!bm.collectionId && (bm.domain.includes('github') || bm.domain.includes('compose'))) {
        const devCol = collections.find(c => c.slug.includes('dev') || c.name.toLowerCase().includes('development'));
        if (devCol) {
          list.push({
            id: bm.id,
            text: `Move "${bm.title}" to ${devCol.name}?`,
            type: 'collection',
            actionLabel: `Move to ${devCol.name}`,
            bookmark: bm,
            targetCollectionId: devCol.id
          });
          if (list.length >= 2) break;
        }
      }
    }

    setSuggestions(list);
  }, [bookmarks, quickSites, collections, dismissedIds]);

  if (suggestions.length === 0) return null;

  const handleDismiss = (id: string) => {
    const next = new Set(dismissedIds);
    next.add(id);
    setDismissedIds(next);
    try {
      localStorage.setItem('linkdeck_dismissed_suggestions', JSON.stringify(Array.from(next)));
    } catch {}
  };

  return (
    <div className="space-y-2">
      {suggestions.map(s => (
        <div
          key={s.id}
          className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/30 backdrop-blur-sm text-xs text-slate-200 animate-in fade-in duration-200"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{s.text}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (s.type === 'quick_site') onConvertToQuickSite(s.bookmark);
                else if (s.type === 'article') onConvertToArticle(s.bookmark);
                else if (s.type === 'collection' && s.targetCollectionId) {
                  onMoveToCollection(s.bookmark, s.targetCollectionId);
                }
                handleDismiss(s.id);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold transition-colors"
            >
              {s.type === 'quick_site' && <Zap className="w-3 h-3" />}
              {s.type === 'article' && <BookOpen className="w-3 h-3" />}
              {s.type === 'collection' && <Folder className="w-3 h-3" />}
              <span>{s.actionLabel}</span>
            </button>

            <button
              onClick={() => handleDismiss(s.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="Dismiss suggestion"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
