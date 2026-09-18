import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Download,
  FileCode,
  FileJson,
  CheckCircle2,
  Zap,
  BookOpen,
  Folder,
  Briefcase,
  Layers,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../core/db/database';
import type { Bookmark, Collection, QuickSite, Article } from '../../core/types';
import { NetscapeParser, type ParsedBookmarkItem } from '../../services/import-export/netscapeParser';
import { BackupManager, type LinkDeckBackupData } from '../../services/import-export/backupManager';
import { BookmarkRepository } from '../../core/repositories/BookmarkRepository';
import { QuickSiteRepository } from '../../core/repositories/QuickSiteRepository';
import { ArticleRepository } from '../../core/repositories/ArticleRepository';
import { CollectionRepository } from '../../core/repositories/CollectionRepository';
import { ProjectRepository } from '../../core/repositories/ProjectRepository';
import { UrlNormalizer } from '../../services/routing/urlNormalizer';

interface ImportItemWithSelection extends ParsedBookmarkItem {
  selectedType: 'quick_site' | 'bookmark' | 'article' | 'skip';
  isDuplicate?: boolean;
  isUncertain?: boolean;
}

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  collections: Collection[];
  onRefresh: () => void;
  onDeleteAllBookmarks?: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  collections,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [parsedItems, setParsedItems] = useState<ImportItemWithSelection[]>([]);
  const [jsonBackupData, setJsonBackupData] = useState<LinkDeckBackupData | null>(null);
  const [isJsonBackup, setIsJsonBackup] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Inspection sub-tab
  const [inspectTab, setInspectTab] = useState<'all' | 'quick_site' | 'article' | 'collections' | 'projects' | 'duplicates' | 'uncertain'>('all');

  // Advanced options
  const [includeQuickSites, setIncludeQuickSites] = useState(true);
  const [includeBookmarks, setIncludeBookmarks] = useState(true);
  const [includeArticles, setIncludeArticles] = useState(true);
  const [includeProjects, setIncludeProjects] = useState(true);
  const [includeCollections, setIncludeCollections] = useState(true);
  const [duplicateHandling, setDuplicateHandling] = useState<'skip' | 'merge' | 'keep'>('skip');

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setSuccessMessage(null);

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;

      if (file.name.endsWith('.json')) {
        setIsJsonBackup(true);
        try {
          const parsed: LinkDeckBackupData = JSON.parse(content);
          setJsonBackupData(parsed);

          const items: ImportItemWithSelection[] = [];
          (parsed.quickSites || []).forEach(qs => {
            items.push({
              title: qs.title,
              url: qs.url,
              domain: qs.domain,
              folderPath: ['Quick Links'],
              suggestedType: 'quick_site',
              selectedType: 'quick_site',
              category: qs.category
            });
          });
          (parsed.articles || []).forEach(art => {
            items.push({
              title: art.title,
              url: art.url,
              domain: art.domain,
              folderPath: ['Articles & Read Later'],
              suggestedType: 'article',
              selectedType: 'article',
              readingStatus: art.readingStatus,
              estimatedReadingTime: art.estimatedReadingTime
            });
          });
          (parsed.bookmarks || []).forEach(bm => {
            const isDupe = bookmarks.some(b => b.cleanUrl === bm.cleanUrl);
            items.push({
              title: bm.title,
              url: bm.url,
              domain: bm.domain,
              folderPath: bm.collectionId ? ['Bookmarks'] : [],
              suggestedType: 'bookmark',
              selectedType: 'bookmark',
              isDuplicate: isDupe
            });
          });

          setParsedItems(items);
        } catch {
          alert('Invalid JSON file format.');
        }
      } else {
        // Netscape HTML
        setIsJsonBackup(false);
        setJsonBackupData(null);
        const items = NetscapeParser.parse(content);
        const existingCleanUrls = new Set(bookmarks.map(b => b.cleanUrl));

        const enrichedItems: ImportItemWithSelection[] = items.map(item => {
          const clean = UrlNormalizer.clean(item.url);
          const isDupe = existingCleanUrls.has(clean);
          const isUncertain = !item.serviceId && item.folderPath.length === 0;

          return {
            ...item,
            selectedType: item.suggestedType,
            isDuplicate: isDupe,
            isUncertain
          };
        });

        setParsedItems(enrichedItems);
      }
    };
    reader.readAsText(file);
  };

  // Metric counts
  const quickLinksCount = isJsonBackup && jsonBackupData?.quickSites
    ? jsonBackupData.quickSites.length
    : parsedItems.filter(i => i.selectedType === 'quick_site').length;

  const articlesCount = isJsonBackup && jsonBackupData?.articles
    ? jsonBackupData.articles.length
    : parsedItems.filter(i => i.selectedType === 'article').length;

  const bookmarksCount = isJsonBackup && jsonBackupData?.bookmarks
    ? jsonBackupData.bookmarks.length
    : parsedItems.filter(i => i.selectedType === 'bookmark').length;

  const projectsCount = isJsonBackup && jsonBackupData?.projects
    ? jsonBackupData.projects.length
    : Array.from(new Set(parsedItems.filter(i => i.projectName).map(i => i.projectName))).length;

  const collectionsCount = isJsonBackup && jsonBackupData?.collections
    ? jsonBackupData.collections.length
    : Array.from(new Set(parsedItems.filter(i => i.collectionName).map(i => i.collectionName))).length;

  const duplicatesCount = parsedItems.filter(i => i.isDuplicate).length;
  const uncertainCount = parsedItems.filter(i => i.isUncertain).length;

  // Filtered items for inspection
  const displayedItems = parsedItems.filter(i => {
    if (inspectTab === 'quick_site') return i.selectedType === 'quick_site';
    if (inspectTab === 'article') return i.selectedType === 'article';
    if (inspectTab === 'duplicates') return i.isDuplicate;
    if (inspectTab === 'uncertain') return i.isUncertain;
    if (inspectTab === 'projects') return !!i.projectName;
    if (inspectTab === 'collections') return !!i.collectionName && i.selectedType === 'bookmark';
    return true;
  });

  const handleExecuteImport = async (importAll = false) => {
    if (parsedItems.length === 0 && !jsonBackupData) return;
    setImporting(true);

    try {
      if (isJsonBackup && jsonBackupData) {
        // Native LinkDeck Backup import
        if (importAll) {
          await BackupManager.importBackup(JSON.stringify(jsonBackupData), 'merge');
        } else {
          // Selective import based on checkboxes
          await db.transaction(
            'rw',
            [db.bookmarks, db.projects, db.collections, db.quickSites, db.articles],
            async () => {
              if (includeQuickSites && jsonBackupData.quickSites?.length) {
                await db.quickSites.bulkPut(jsonBackupData.quickSites);
              }
              if (includeArticles && jsonBackupData.articles?.length) {
                await db.articles.bulkPut(jsonBackupData.articles);
              }
              if (includeProjects && jsonBackupData.projects?.length) {
                await db.projects.bulkPut(jsonBackupData.projects);
              }
              if (includeCollections && jsonBackupData.collections?.length) {
                await db.collections.bulkPut(jsonBackupData.collections);
              }
              if (includeBookmarks && jsonBackupData.bookmarks?.length) {
                let toImport = jsonBackupData.bookmarks;
                if (duplicateHandling === 'skip') {
                  const existing = new Set(bookmarks.map(b => b.cleanUrl));
                  toImport = toImport.filter(b => !existing.has(b.cleanUrl));
                }
                await db.bookmarks.bulkPut(toImport);
              }
            }
          );
        }
      } else {
        // HTML Import
        const now = Date.now();
        const collectionMap = new Map<string, string>();
        for (const col of collections) {
          collectionMap.set(col.name.toLowerCase(), col.id);
        }

        const projectMap = new Map<string, string>();
        const existingProjects = await ProjectRepository.getAll();
        for (const proj of existingProjects) {
          projectMap.set(proj.name.toLowerCase(), proj.id);
        }

        const newBookmarks: Bookmark[] = [];
        const newQuickSites: QuickSite[] = [];
        const newArticles: Article[] = [];
        const existingCleanUrls = new Set(bookmarks.map(b => b.cleanUrl));

        for (let i = 0; i < parsedItems.length; i++) {
          const item = parsedItems[i];
          if (item.selectedType === 'skip') continue;

          const clean = UrlNormalizer.clean(item.url);
          const domain = item.domain || UrlNormalizer.getDomain(item.url);

          // Check duplicate mode
          if (existingCleanUrls.has(clean)) {
            if (duplicateHandling === 'skip') continue;
          }

          if (item.selectedType === 'quick_site') {
            if (!includeQuickSites && !importAll) continue;
            newQuickSites.push({
              id: 'qs_imp_' + Math.random().toString(36).substring(2, 9) + '_' + (now + i),
              serviceId: item.serviceId,
              title: item.title,
              url: item.url,
              cleanUrl: clean,
              domain,
              icon: item.icon,
              category: item.category || 'utilities',
              accountProfileId: item.googleAuthUser !== undefined ? (item.googleAuthUser === 1 ? 'acc_dev' : item.googleAuthUser === 2 ? 'acc_work' : 'acc_personal') : undefined,
              isPinned: false,
              isHidden: false,
              openCount: 0,
              sortOrder: newQuickSites.length + 1,
              createdAt: item.addDate || now,
              updatedAt: now
            });
          } else if (item.selectedType === 'article') {
            if (!includeArticles && !importAll) continue;
            newArticles.push({
              id: 'art_imp_' + Math.random().toString(36).substring(2, 9) + '_' + (now + i),
              title: item.title,
              url: item.url,
              cleanUrl: clean,
              domain,
              source: domain,
              favicon: item.icon,
              tags: item.folderPath.map(f => f.toLowerCase().replace(/\s+/g, '-')),
              readingStatus: item.readingStatus || 'unread',
              isFavorite: false,
              estimatedReadingTime: item.estimatedReadingTime || ArticleRepository.estimateReadingTime(item.title),
              savedAt: item.addDate || now,
              updatedAt: now
            });
          } else {
            // Bookmark
            if (!includeBookmarks && !importAll) continue;

            // Project resolution
            let projId: string | undefined;
            if (item.projectName && (includeProjects || importAll)) {
              const lowerProj = item.projectName.toLowerCase();
              if (projectMap.has(lowerProj)) {
                projId = projectMap.get(lowerProj);
              } else {
                const newProj = await ProjectRepository.create({
                  name: item.projectName,
                  slug: item.projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  color: '#06B6D4',
                  sortOrder: existingProjects.length + 1,
                  tags: [item.projectName.toLowerCase()]
                });
                projectMap.set(lowerProj, newProj.id);
                projId = newProj.id;
              }
            }

            // Collection resolution
            let colId: string | undefined;
            const colName = item.collectionName || (item.folderPath.length > 0 ? item.folderPath[item.folderPath.length - 1] : undefined);
            if (colName && (includeCollections || importAll)) {
              const lowerCol = colName.toLowerCase();
              if (collectionMap.has(lowerCol)) {
                colId = collectionMap.get(lowerCol);
              } else {
                const newCol = await CollectionRepository.create({
                  name: colName,
                  slug: colName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  sortOrder: collections.length + 1
                });
                collectionMap.set(lowerCol, newCol.id);
                colId = newCol.id;
              }
            }

            newBookmarks.push({
              id: 'bm_imp_' + Math.random().toString(36).substring(2, 9) + '_' + (now + i),
              title: item.title,
              url: item.url,
              cleanUrl: clean,
              domain,
              favicon: item.icon,
              collectionId: colId,
              projectId: projId,
              projectStage: item.projectStage,
              accountProfileId: item.googleAuthUser !== undefined ? (item.googleAuthUser === 1 ? 'acc_dev' : item.googleAuthUser === 2 ? 'acc_work' : 'acc_personal') : undefined,
              tags: item.folderPath.map(f => f.toLowerCase().replace(/\s+/g, '-')),
              isFavorite: false,
              isPinned: false,
              isArchived: false,
              openCount: 0,
              createdAt: item.addDate || now,
              updatedAt: now,
              sortOrder: bookmarks.length + i + 1,
              linkHealth: 'healthy'
            });
          }
        }

        if (newBookmarks.length > 0) await BookmarkRepository.bulkAdd(newBookmarks);
        for (const qs of newQuickSites) {
          await QuickSiteRepository.create(qs);
        }
        for (const art of newArticles) {
          await ArticleRepository.create(art);
        }
      }

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 }
      });

      const totalImported = quickLinksCount + bookmarksCount + articlesCount;
      setSuccessMessage(`Successfully imported ${totalImported} items into LinkDeck!`);
      onRefresh();
    } catch (err) {
      alert('Import failed: ' + (err as Error).message);
    } finally {
      setImporting(false);
    }
  };

  const handleExportJson = async () => {
    const json = await BackupManager.exportBackup();
    downloadFile(json, `linkdeck-backup-${new Date().toISOString().slice(0, 10)}.json`, 'application/json');
  };

  const handleExportHtml = () => {
    const html = NetscapeParser.exportToNetscapeHtml(bookmarks, collections);
    downloadFile(html, `linkdeck-bookmarks-${new Date().toISOString().slice(0, 10)}.html`, 'text/html');
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl bg-deck-bg-card border border-deck-bg-border rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-deck-bg-border bg-deck-bg-elevated/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Upload size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Data Portability, Import & Export
                </h3>
                <p className="text-xs text-slate-400">
                  Chrome Bookmark HTML & LinkDeck Native Backup
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

          {/* Navigation Tabs */}
          <div className="flex border-b border-deck-bg-border bg-deck-bg-elevated/40 px-6 pt-2">
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'import'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Upload size={14} />
              <span>Import Bookmarks</span>
            </button>
            <button
              onClick={() => setActiveTab('export')}
              className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition flex items-center gap-2 ${
                activeTab === 'export'
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Download size={14} />
              <span>Export & Backup</span>
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'import' ? (
              <div className="space-y-5">
                {/* File Drop Area */}
                <label className="border-2 border-dashed border-deck-bg-border hover:border-cyan-500/50 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer bg-deck-bg-elevated/30 hover:bg-deck-bg-elevated/60 transition group text-center">
                  <Upload size={28} className="text-slate-500 group-hover:text-cyan-400 transition mb-2" />
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white mb-1">
                    Select Bookmark HTML or LinkDeck JSON File
                  </span>
                  <span className="text-xs text-slate-400 max-w-sm">
                    Upload your Chrome/Edge HTML export or native linkdeck_backup.json
                  </span>
                  <input
                    type="file"
                    accept=".html,.htm,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* Import Analysis Summary */}
                {parsedItems.length > 0 && (
                  <div className="space-y-4">
                    {/* Summary Badges Grid */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Import Analysis ({fileName})
                        </span>
                        {isJsonBackup ? (
                          <span className="text-[11px] font-mono text-cyan-400 flex items-center gap-1">
                            <FileJson size={13} /> LinkDeck Native Backup
                          </span>
                        ) : (
                          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                            <FileCode size={13} /> Netscape Bookmark HTML
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-deck-border text-center">
                          <div className="text-[11px] text-amber-400 font-medium flex items-center justify-center gap-1">
                            <Zap size={12} /> Quick Links
                          </div>
                          <div className="text-base font-bold text-white mt-1">{quickLinksCount}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-deck-border text-center">
                          <div className="text-[11px] text-cyan-400 font-medium flex items-center justify-center gap-1">
                            <Layers size={12} /> Bookmarks
                          </div>
                          <div className="text-base font-bold text-white mt-1">{bookmarksCount}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-deck-border text-center">
                          <div className="text-[11px] text-emerald-400 font-medium flex items-center justify-center gap-1">
                            <BookOpen size={12} /> Articles
                          </div>
                          <div className="text-base font-bold text-white mt-1">{articlesCount}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-deck-border text-center">
                          <div className="text-[11px] text-pink-400 font-medium flex items-center justify-center gap-1">
                            <Briefcase size={12} /> Projects
                          </div>
                          <div className="text-base font-bold text-white mt-1">{projectsCount}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-deck-border text-center">
                          <div className="text-[11px] text-indigo-400 font-medium flex items-center justify-center gap-1">
                            <Folder size={12} /> Collections
                          </div>
                          <div className="text-base font-bold text-white mt-1">{collectionsCount}</div>
                        </div>

                        <div className="p-2.5 rounded-xl bg-slate-900/80 border border-deck-border text-center">
                          <div className="text-[11px] text-slate-400 font-medium flex items-center justify-center gap-1">
                            <Copy size={12} /> Duplicates
                          </div>
                          <div className="text-base font-bold text-white mt-1">{duplicatesCount}</div>
                        </div>
                      </div>
                    </div>

                    {/* Inspection Sub-tabs */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-deck-border/60">
                      {[
                        { id: 'all', label: `All (${parsedItems.length})` },
                        { id: 'quick_site', label: `Quick Links (${quickLinksCount})` },
                        { id: 'article', label: `Articles (${articlesCount})` },
                        { id: 'collections', label: `Collections (${collectionsCount})` },
                        { id: 'projects', label: `Projects (${projectsCount})` },
                        { id: 'duplicates', label: `Duplicates (${duplicatesCount})` },
                        { id: 'uncertain', label: `Uncertain (${uncertainCount})` }
                      ].map(t => (
                        <button
                          key={t.id}
                          onClick={() => setInspectTab(t.id as any)}
                          className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition ${
                            inspectTab === t.id
                              ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Inspection List View */}
                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 rounded-xl bg-slate-950/60 border border-deck-border/40">
                      {displayedItems.length > 0 ? (
                        displayedItems.slice(0, 40).map((it, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg bg-slate-900/60 text-xs"
                          >
                            <div className="truncate">
                              <span className="font-semibold text-slate-200">{it.title}</span>
                              <span className="text-[11px] text-slate-400 ml-2">{it.domain}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {it.isDuplicate && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                                  Duplicate
                                </span>
                              )}
                              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                                {it.selectedType}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-slate-500 text-xs">
                          No items in this filter.
                        </div>
                      )}
                    </div>

                    {/* Advanced Import Options */}
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-deck-border/40 space-y-3">
                      <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                        Import Options
                      </span>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeQuickSites}
                            onChange={e => setIncludeQuickSites(e.target.checked)}
                            className="text-cyan-500 rounded focus:ring-0"
                          />
                          <span className="text-slate-300">Quick Links</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeBookmarks}
                            onChange={e => setIncludeBookmarks(e.target.checked)}
                            className="text-cyan-500 rounded focus:ring-0"
                          />
                          <span className="text-slate-300">Bookmarks</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeArticles}
                            onChange={e => setIncludeArticles(e.target.checked)}
                            className="text-cyan-500 rounded focus:ring-0"
                          />
                          <span className="text-slate-300">Articles</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeProjects}
                            onChange={e => setIncludeProjects(e.target.checked)}
                            className="text-cyan-500 rounded focus:ring-0"
                          />
                          <span className="text-slate-300">Projects</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={includeCollections}
                            onChange={e => setIncludeCollections(e.target.checked)}
                            className="text-cyan-500 rounded focus:ring-0"
                          />
                          <span className="text-slate-300">Collections</span>
                        </label>
                      </div>

                      {/* Duplicate handling */}
                      <div className="pt-2 border-t border-deck-border/40 flex flex-wrap items-center gap-4 text-xs">
                        <span className="text-slate-400 font-medium">Duplicate handling:</span>
                        {(['skip', 'merge', 'keep'] as const).map(mode => (
                          <label key={mode} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              name="dupMode"
                              value={mode}
                              checked={duplicateHandling === mode}
                              onChange={() => setDuplicateHandling(mode)}
                              className="text-cyan-500 focus:ring-0"
                            />
                            <span className="text-slate-300 capitalize">
                              {mode === 'skip' ? 'Skip duplicates' : mode === 'merge' ? 'Merge metadata' : 'Keep both'}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                      <div className="text-xs text-slate-400">
                        Zero data loss. Non-destructive import.
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          disabled={importing}
                          onClick={() => handleExecuteImport(false)}
                          className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
                        >
                          Import Selected
                        </button>
                        <button
                          disabled={importing}
                          onClick={() => handleExecuteImport(true)}
                          className="flex-1 sm:flex-none px-5 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
                        >
                          {importing ? (
                            <span>Importing...</span>
                          ) : (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Import Everything</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Export Tab */
              <div className="space-y-4">
                <p className="text-xs text-slate-400">
                  Export your LinkDeck library at any time. Your data stays 100% yours.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-deck-bg-elevated/40 border border-deck-bg-border space-y-3">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <FileCode className="text-emerald-400" size={18} />
                      <span>Netscape Bookmark HTML</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Standard bookmark file compatible with Chrome, Edge, Safari, Firefox, and Brave.
                    </p>
                    <button
                      onClick={handleExportHtml}
                      className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Download size={14} />
                      <span>Export HTML Bookmarks</span>
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-deck-bg-elevated/40 border border-deck-bg-border space-y-3">
                    <div className="flex items-center gap-2 text-white font-semibold text-sm">
                      <FileJson className="text-cyan-400" size={18} />
                      <span>LinkDeck Native JSON Backup</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      Full backup preserving Quick Sites, Articles, Projects, Collections, and Google accounts.
                    </p>
                    <button
                      onClick={handleExportJson}
                      className="w-full py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                    >
                      <Download size={14} />
                      <span>Export JSON Backup</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
