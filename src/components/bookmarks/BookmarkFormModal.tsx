import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  AlertCircle,
  Layers,
  User,
  Star,
  Pin,
  Check,
  Globe,
  Bookmark as BookmarkIcon,
  BookOpen
} from 'lucide-react';
import type { Bookmark, Project, Collection, AccountProfile, ProjectStage, LinkType } from '../../core/types';
import { UrlNormalizer } from '../../services/routing/urlNormalizer';
import { detectService } from '../../services/routing/serviceRegistry';
import { DuplicateDetector } from '../../services/routing/duplicateDetector';
import { ServiceIcon } from '../common/ServiceIcon';
import { QuickSiteRepository } from '../../core/repositories/QuickSiteRepository';
import { ArticleRepository } from '../../core/repositories/ArticleRepository';
import { NetscapeParser } from '../../services/import-export/netscapeParser';

interface BookmarkFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bookmarkData: Partial<Bookmark>) => Promise<void>;
  initialData?: Bookmark | null;
  projects: Project[];
  collections: Collection[];
  accounts: AccountProfile[];
  initialUrl?: string;
  initialType?: LinkType;
}

export const BookmarkFormModal: React.FC<BookmarkFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  projects,
  collections,
  accounts,
  initialUrl = '',
  initialType = 'bookmark'
}) => {
  const [linkType, setLinkType] = useState<LinkType>(initialType);
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');

  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState<string>('');
  const [projectStage, setProjectStage] = useState<ProjectStage>('development');
  const [collectionId, setCollectionId] = useState<string>('');
  const [accountProfileId, setAccountProfileId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);

  // Duplicate detection state
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Initialize form state
  useEffect(() => {
    if (initialData) {
      setUrl(initialData.url);
      setTitle(initialData.title);
      setDescription(initialData.description || '');
      setProjectId(initialData.projectId || '');
      setProjectStage(initialData.projectStage || 'development');
      setCollectionId(initialData.collectionId || '');
      setAccountProfileId(initialData.accountProfileId || '');
      setTags(initialData.tags || []);
      setNotes(initialData.notes || '');
      setIsFavorite(initialData.isFavorite || false);
      setIsPinned(initialData.isPinned || false);
    } else {
      const startingUrl = initialUrl || '';
      setUrl(startingUrl);
      setTitle('');
      setDescription('');
      setProjectId('');
      setProjectStage('development');
      setCollectionId(collections[0]?.id || '');
      setAccountProfileId('');
      setTags([]);
      setNotes('');
      setIsFavorite(false);
      setIsPinned(false);

      if (startingUrl) {
        autoDetectMetadata(startingUrl);
      }
    }
  }, [initialData, initialUrl, isOpen, collections]);

  // Check duplicates and auto-detect metadata on URL change
  const autoDetectMetadata = async (rawUrl: string) => {
    if (!rawUrl.trim()) {
      setDuplicateWarning(null);
      return;
    }

    const domain = UrlNormalizer.getDomain(rawUrl);
    const service = detectService(rawUrl);

    // Auto-detect link classification if not editing
    if (!initialData) {
      const classification = NetscapeParser.classifyItem(rawUrl, title, []);
      if (classification.suggestedType) {
        setLinkType(classification.suggestedType);
      }
    }

    // Auto-prefill title if currently empty
    if (!title) {
      if (service) {
        setTitle(service.name);
      } else if (domain) {
        // Humanize domain (e.g. docs.github.com -> GitHub Docs)
        const parts = domain.split('.');
        const mainName = parts.length > 1 ? parts[parts.length - 2] : domain;
        setTitle(mainName.charAt(0).toUpperCase() + mainName.slice(1));
      }
    }

    // Duplicate check
    const dupResult = await DuplicateDetector.check(rawUrl, title, initialData?.id);
    if (dupResult.isDuplicate && dupResult.existingBookmark) {
      setDuplicateWarning(`A bookmark with this destination already exists: "${dupResult.existingBookmark.title}"`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    autoDetectMetadata(val);
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || !title.trim()) return;

    setLoading(true);
    try {
      const cleanUrl = UrlNormalizer.clean(url);
      const domain = UrlNormalizer.getDomain(url);

      if (linkType === 'quick_site' && !initialData) {
        const service = detectService(url);
        await QuickSiteRepository.create({
          serviceId: service?.id,
          title: title.trim(),
          url: url.trim(),
          cleanUrl,
          domain,
          category: (service?.category as any) || 'utilities',
          accountProfileId: accountProfileId || undefined,
          isPinned,
          isHidden: false,
          sortOrder: 99
        });
        onClose();
        return;
      }

      if (linkType === 'article' && !initialData) {
        await ArticleRepository.create({
          title: title.trim(),
          url: url.trim(),
          cleanUrl,
          domain,
          source: domain,
          excerpt: description.trim() || undefined,
          tags,
          readingStatus: 'unread',
          isFavorite
        });
        onClose();
        return;
      }

      // Default: Bookmark
      await onSave({
        url: url.trim(),
        cleanUrl,
        domain,
        title: title.trim(),
        description: description.trim() || undefined,
        projectId: projectId || undefined,
        projectStage: projectId ? projectStage : undefined,
        collectionId: collectionId || undefined,
        accountProfileId: accountProfileId || undefined,
        tags,
        notes: notes.trim() || undefined,
        isFavorite,
        isPinned
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-xl bg-deck-bg-card border border-deck-bg-border rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-deck-bg-border bg-deck-bg-elevated/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <ServiceIcon url={url} size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {initialData ? 'Edit Bookmark' : 'Add New Link'}
                </h3>
                <p className="text-xs text-slate-400">
                  {initialData ? 'Update bookmark metadata and routing' : 'Save as Quick Site, Bookmark, or Article'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Save As Selector */}
          {!initialData && (
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-deck-bg-border mx-6 mt-4">
              <button
                type="button"
                onClick={() => setLinkType('bookmark')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  linkType === 'bookmark'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookmarkIcon className="w-3.5 h-3.5" />
                <span>Bookmark</span>
              </button>
              <button
                type="button"
                onClick={() => setLinkType('quick_site')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  linkType === 'quick_site'
                    ? 'bg-deck-accent text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Quick Site</span>
              </button>
              <button
                type="button"
                onClick={() => setLinkType('article')}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  linkType === 'article'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Article</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Duplicate warning banner */}
            {duplicateWarning && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold">{duplicateWarning}</span>
                  <p className="text-[11px] text-amber-200/80 mt-1">
                    You can continue to save it as a separate link, or cancel to avoid duplicates.
                  </p>
                </div>
              </div>
            )}

            {/* URL field */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Destination URL <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="https://play.google.com/console or https://console.firebase.google.com"
                  value={url}
                  onChange={handleUrlChange}
                  className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition font-mono"
                />
              </div>
            </div>

            {/* Title & Collection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Title / Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Play Console Listing"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Collection
                </label>
                <select
                  value={collectionId}
                  onChange={e => setCollectionId(e.target.value)}
                  className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-white outline-none transition"
                >
                  <option value="">None (Top Level)</option>
                  {collections.map(col => (
                    <option key={col.id} value={col.id}>
                      {col.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project & Stage */}
            <div className="p-4 rounded-xl bg-deck-bg-elevated/40 border border-deck-bg-border space-y-3">
              <div className="flex items-center gap-2">
                <Layers size={14} className="text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">Project Workspace Association</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Project</label>
                  <select
                    value={projectId}
                    onChange={e => setProjectId(e.target.value)}
                    className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none transition"
                  >
                    <option value="">No Project (General)</option>
                    {projects.map(proj => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </select>
                </div>

                {projectId && (
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Workflow Stage</label>
                    <select
                      value={projectStage}
                      onChange={e => setProjectStage(e.target.value as ProjectStage)}
                      className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none transition"
                    >
                      <option value="development">💻 Development (GitHub, Firebase, CI/CD)</option>
                      <option value="distribution">🚀 Distribution (Play Console, Store)</option>
                      <option value="monetization">💰 Monetization (AdMob, RevenueCat)</option>
                      <option value="analytics">📈 Analytics (GA, Search Console)</option>
                      <option value="web">🌐 Web & Legal (Landing, Privacy Policy)</option>
                      <option value="other">General Resource</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Smart Google Account Routing Binding */}
            <div className="p-4 rounded-xl bg-deck-bg-elevated/40 border border-deck-bg-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-violet-400" />
                  <span className="text-xs font-semibold text-slate-200">Google Account Routing</span>
                </div>
                <span className="text-[10px] text-cyan-400 font-mono">Multi-Account Engine</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Choose which Google account opens this link automatically, or choose "Ask Every Time".
              </p>

              <select
                value={accountProfileId}
                onChange={e => setAccountProfileId(e.target.value)}
                className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-violet-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
              >
                <option value="">Browser Default Profile (No URL routing)</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (authuser={acc.googleAuthUserIndex}) {acc.email ? `— ${acc.email}` : ''}
                  </option>
                ))}
                <option value="ask">🔔 Ask Every Time (Prompt account picker on click)</option>
              </select>
            </div>

            {/* Tags & Notes */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Tags</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type tag and press Enter"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                    className="flex-1 bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition"
                  >
                    Add
                  </button>
                </div>

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags.map(t => (
                      <span
                        key={t}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px] border border-slate-700 font-mono"
                      >
                        #{t}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          className="hover:text-rose-400 transition"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Useful notes, keywords, or console shortcuts..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition resize-none"
                />
              </div>
            </div>

            {/* Toggles: Favorite & Pin */}
            <div className="flex items-center gap-6 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isFavorite}
                  onChange={e => setIsFavorite(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <Star size={14} className={isFavorite ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
                <span className="text-xs text-slate-300">Add to Favorites</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isPinned}
                  onChange={e => setIsPinned(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
                <Pin size={14} className={isPinned ? 'text-cyan-400 fill-cyan-400' : 'text-slate-400'} />
                <span className="text-xs text-slate-300">Pin to Top</span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-deck-bg-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow-glow-cyan transition flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Check size={14} />
                    <span>{initialData ? 'Save Changes' : 'Create Bookmark'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
