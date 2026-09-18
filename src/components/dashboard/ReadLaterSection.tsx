import React from 'react';
import { BookOpen, Clock, CheckCircle, ArrowRight, ExternalLink } from 'lucide-react';
import type { Article } from '../../core/types';
import { ArticleRepository } from '../../core/repositories/ArticleRepository';

interface ReadLaterSectionProps {
  articles: Article[];
  onOpenArticle: (article: Article) => void;
  onViewAllArticles: () => void;
}

export const ReadLaterSection: React.FC<ReadLaterSectionProps> = ({
  articles,
  onOpenArticle,
  onViewAllArticles
}) => {
  const unreadArticles = articles.filter(a => a.readingStatus === 'unread' || a.readingStatus === 'reading').slice(0, 4);

  if (unreadArticles.length === 0) {
    return null;
  }

  const handleMarkRead = async (e: React.MouseEvent, article: Article) => {
    e.stopPropagation();
    await ArticleRepository.setStatus(article.id, 'read');
  };

  return (
    <section className="rounded-2xl bg-deck-card/70 backdrop-blur-md border border-deck-border/60 p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-deck-border/40 mb-4">
        <div className="flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Read Later & Articles
          </span>
          <span className="px-2 py-0.5 text-[11px] font-medium rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            {unreadArticles.length} unread
          </span>
        </div>

        <button
          onClick={onViewAllArticles}
          className="flex items-center gap-1 text-xs font-medium text-deck-accent hover:text-deck-accent/80 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {unreadArticles.map(art => (
          <div
            key={art.id}
            onClick={() => onOpenArticle(art)}
            className="group relative flex flex-col justify-between p-3.5 rounded-xl bg-deck-elevated/70 hover:bg-deck-elevated border border-deck-border/60 hover:border-emerald-500/40 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] font-medium text-emerald-400/90 truncate uppercase tracking-wider">
                  {art.source || art.domain}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {art.estimatedReadingTime || 3} min
                </span>
              </div>

              <h4 className="text-xs font-semibold text-slate-200 group-hover:text-white line-clamp-2 leading-relaxed">
                {art.title}
              </h4>

              {art.excerpt && (
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-normal">
                  {art.excerpt}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-deck-border/40">
              <span className="text-[10px] text-slate-400 truncate max-w-[130px]">
                {art.domain}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={e => handleMarkRead(e, art)}
                  className="p-1 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                  title="Mark as Read"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                </button>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-slate-300" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
