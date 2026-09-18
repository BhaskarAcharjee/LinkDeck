import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  CheckCircle,
  ExternalLink,
  Star,
  Archive,
  Trash2,
  Search,
  Plus,
  BookMarked
} from 'lucide-react';
import type { Article, ReadingStatus } from '../../core/types';
import { ArticleRepository } from '../../core/repositories/ArticleRepository';

interface ArticlesViewProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  onNewArticle: () => void;
  onBackToDashboard: () => void;
  onContextMenu?: (e: React.MouseEvent, article: Article) => void;
}

export const ArticlesView: React.FC<ArticlesViewProps> = ({
  articles,
  onOpenArticle,
  onNewArticle,
  onContextMenu
}) => {
  const [activeStatus, setActiveStatus] = useState<ReadingStatus | 'all'>('unread');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Extract all unique tags
  const allTags = Array.from(new Set(articles.flatMap(a => a.tags || [])));

  const filteredArticles = articles.filter(art => {
    // Status filter
    if (activeStatus !== 'all' && art.readingStatus !== activeStatus) {
      return false;
    }
    // Tag filter
    if (selectedTag && !art.tags?.includes(selectedTag)) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = art.title.toLowerCase().includes(q);
      const matchDomain = art.domain.toLowerCase().includes(q);
      const matchExcerpt = art.excerpt?.toLowerCase().includes(q);
      return matchTitle || matchDomain || matchExcerpt;
    }
    return true;
  });

  const handleStatusChange = async (e: React.MouseEvent, article: Article, newStatus: ReadingStatus) => {
    e.stopPropagation();
    await ArticleRepository.setStatus(article.id, newStatus);
  };

  const handleToggleFavorite = async (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    await ArticleRepository.toggleFavorite(article.id);
  };

  const handleDelete = async (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    await ArticleRepository.delete(article.id);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-deck-border/60">
        <div>
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <h1 className="text-xl font-bold text-white tracking-tight">Articles & Reading Queue</h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              {articles.length} saved
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Local-first reading list with time estimates, progress tracking, and zero tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNewArticle}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Article</span>
          </button>
        </div>
      </div>

      {/* Filters Bar: Status Tabs + Search + Tags */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 bg-deck-card/80 p-1 rounded-xl border border-deck-border/60 overflow-x-auto">
          {(['all', 'unread', 'reading', 'read', 'archived'] as const).map(tab => {
            const count = tab === 'all' ? articles.length : articles.filter(a => a.readingStatus === tab).length;
            const isActive = activeStatus === tab;

            return (
              <button
                key={tab}
                onClick={() => setActiveStatus(tab)}
                onDragOver={e => {
                  if (tab !== 'all') {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                  }
                }}
                onDrop={async e => {
                  if (tab !== 'all') {
                    e.preventDefault();
                    const articleId = e.dataTransfer.getData('text/plain');
                    if (articleId) {
                      await ArticleRepository.setStatus(articleId, tab);
                    }
                  }
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all shrink-0 ${
                  isActive
                    ? 'bg-deck-accent text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {tab} <span className="text-[10px] opacity-70 ml-1">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-3 py-1.5 text-xs rounded-xl bg-deck-card/80 border border-deck-border/60 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-deck-accent/60"
          />
        </div>
      </div>

      {/* Tags Chips if available */}
      {allTags.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] text-slate-400 font-medium shrink-0 mr-1">Tags:</span>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full transition-colors shrink-0 ${
                selectedTag === tag
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
              }`}
            >
              #{tag}
            </button>
          ))}
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[10px] text-rose-400 hover:underline shrink-0 ml-1"
            >
              Clear tag
            </button>
          )}
        </div>
      )}

      {/* Articles Cards Grid */}
      {filteredArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl bg-deck-card/40 border border-dashed border-deck-border/60">
          <BookMarked className="w-10 h-10 text-slate-600 mb-3" />
          <p className="text-sm font-semibold text-slate-300">No articles found</p>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            {searchQuery || selectedTag
              ? 'Try adjusting your search or tag filters.'
              : 'Add links to articles, tutorials, or guides to save them to your local reading queue.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArticles.map(art => (
            <div
              key={art.id}
              draggable
              onDragStart={e => {
                e.dataTransfer.setData('text/plain', art.id);
                e.dataTransfer.setData('application/json', JSON.stringify({ type: 'article', id: art.id }));
              }}
              onContextMenu={e => {
                if (onContextMenu) {
                  e.preventDefault();
                  e.stopPropagation();
                  onContextMenu(e, art);
                }
              }}
              onClick={() => onOpenArticle(art)}
              className="group relative flex flex-col justify-between p-4 rounded-2xl bg-deck-card/80 hover:bg-deck-card border border-deck-border/60 hover:border-deck-accent/50 shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
            >
              <div>
                {/* Meta Row: Source, Reading Time, Favorite */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-semibold text-deck-accent uppercase tracking-wider truncate">
                    {art.source || art.domain}
                  </span>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {art.estimatedReadingTime || 4} min
                    </span>

                    <button
                      onClick={e => handleToggleFavorite(e, art)}
                      className={`p-1 rounded transition-colors ${
                        art.isFavorite ? 'text-amber-400' : 'text-slate-400 hover:text-amber-400'
                      }`}
                      title={art.isFavorite ? 'Unstar' : 'Star'}
                    >
                      <Star className={`w-3.5 h-3.5 ${art.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Article Title */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-deck-accent line-clamp-2 leading-snug transition-colors">
                  {art.title}
                </h3>

                {/* Excerpt */}
                {art.excerpt && (
                  <p className="mt-2 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {art.excerpt}
                  </p>
                )}

                {/* Tags */}
                {art.tags && art.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {art.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-[10px] font-medium rounded bg-slate-800 text-slate-400"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer: Status Actions & Open Link */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-deck-border/40 text-xs">
                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1">
                  {art.readingStatus !== 'unread' && (
                    <button
                      onClick={e => handleStatusChange(e, art, 'unread')}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 hover:text-slate-200"
                      title="Mark as Unread"
                    >
                      Unread
                    </button>
                  )}
                  {art.readingStatus !== 'reading' && (
                    <button
                      onClick={e => handleStatusChange(e, art, 'reading')}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-amber-950/40 text-amber-400 hover:bg-amber-900/50"
                      title="Move to Reading"
                    >
                      Reading
                    </button>
                  )}
                  {art.readingStatus !== 'read' && (
                    <button
                      onClick={e => handleStatusChange(e, art, 'read')}
                      className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50"
                      title="Mark as Read"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>Read</span>
                    </button>
                  )}
                  {art.readingStatus !== 'archived' && (
                    <button
                      onClick={e => handleStatusChange(e, art, 'archived')}
                      className="p-1 rounded text-slate-400 hover:text-slate-300 hover:bg-slate-800"
                      title="Archive"
                    >
                      <Archive className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={e => handleDelete(e, art)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                    title="Delete Article"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>

                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-deck-accent transition-colors" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
