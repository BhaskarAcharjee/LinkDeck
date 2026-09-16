import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Upload,
  Download,
  FileCode,
  FileJson,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { Bookmark, Collection } from '../../core/types';
import { NetscapeParser, type ParsedBookmarkItem } from '../../services/import-export/netscapeParser';
import { BackupManager } from '../../services/import-export/backupManager';
import { BookmarkRepository } from '../../core/repositories/BookmarkRepository';
import { CollectionRepository } from '../../core/repositories/CollectionRepository';
import { UrlNormalizer } from '../../services/routing/urlNormalizer';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  collections: Collection[];
  onRefresh: () => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  collections,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [parsedItems, setParsedItems] = useState<ParsedBookmarkItem[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isJsonBackup, setIsJsonBackup] = useState(false);
  const [jsonRaw, setJsonRaw] = useState<string>('');
  const [duplicateCount, setDuplicateCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
        setJsonRaw(content);
        try {
          const parsed = JSON.parse(content);
          setParsedItems(
            (parsed.bookmarks || []).map((b: Bookmark) => ({
              title: b.title,
              url: b.url,
              folderPath: []
            }))
          );
        } catch {
          alert('Invalid JSON file format.');
        }
      } else {
        // Standard HTML bookmark export
        setIsJsonBackup(false);
        const items = NetscapeParser.parse(content);
        setParsedItems(items);

        // Check duplicate count against current database
        const existingCleanUrls = new Set(bookmarks.map(b => b.cleanUrl));
        const dupes = items.filter(i => existingCleanUrls.has(UrlNormalizer.clean(i.url)));
        setDuplicateCount(dupes.length);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    if (parsedItems.length === 0) return;
    setImporting(true);

    try {
      if (isJsonBackup) {
        await BackupManager.importBackup(jsonRaw, 'merge');
      } else {
        // Import HTML bookmarks and create collections if needed
        const collectionMap = new Map<string, string>();
        for (const col of collections) {
          collectionMap.set(col.name.toLowerCase(), col.id);
        }

        const newBookmarks: Bookmark[] = [];
        const now = Date.now();

        for (let i = 0; i < parsedItems.length; i++) {
          const item = parsedItems[i];
          const clean = UrlNormalizer.clean(item.url);
          const domain = UrlNormalizer.getDomain(item.url);

          // Get or create collection from folder name
          let colId: string | undefined = undefined;
          if (item.folderPath.length > 0) {
            const folderName = item.folderPath[item.folderPath.length - 1];
            const lowerFolder = folderName.toLowerCase();
            if (collectionMap.has(lowerFolder)) {
              colId = collectionMap.get(lowerFolder);
            } else {
              const newCol = await CollectionRepository.create({
                name: folderName,
                slug: folderName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                sortOrder: collections.length + 1
              });
              collectionMap.set(lowerFolder, newCol.id);
              colId = newCol.id;
            }
          }

          newBookmarks.push({
            id: 'bm_imp_' + Math.random().toString(36).substring(2, 9) + '_' + (now + i),
            title: item.title,
            url: item.url,
            cleanUrl: clean,
            domain,
            collectionId: colId,
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

        await BookmarkRepository.bulkAdd(newBookmarks);
      }

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      setSuccessMessage(`Successfully imported ${parsedItems.length} bookmarks!`);
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
          className="w-full max-w-2xl bg-deck-bg-card border border-deck-bg-border rounded-2xl shadow-2xl overflow-hidden my-8"
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
                  Escape browser fragmentation & maintain full ownership of your bookmarks
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
                <label className="border-2 border-dashed border-deck-bg-border hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer bg-deck-bg-elevated/30 hover:bg-deck-bg-elevated/60 transition group text-center">
                  <Upload size={32} className="text-slate-500 group-hover:text-cyan-400 transition mb-3" />
                  <span className="text-sm font-semibold text-slate-200 group-hover:text-white mb-1">
                    Select Bookmark Export File
                  </span>
                  <span className="text-xs text-slate-400 max-w-sm">
                    Accepts standard HTML exports from Chrome, Edge, Firefox, Brave, Safari, or LinkDeck JSON backups
                  </span>
                  <input
                    type="file"
                    accept=".html,.htm,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {/* File Summary Preview */}
                {parsedItems.length > 0 && (
                  <div className="p-4 rounded-xl bg-deck-bg-elevated border border-deck-bg-border space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isJsonBackup ? <FileJson size={18} className="text-cyan-400" /> : <FileCode size={18} className="text-emerald-400" />}
                        <span className="text-xs font-semibold text-white truncate max-w-[280px]">
                          {fileName}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-cyan-400 font-semibold">
                        {parsedItems.length} links found
                      </span>
                    </div>

                    {!isJsonBackup && duplicateCount > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>
                          {duplicateCount} duplicate links detected. Existing links will be preserved.
                        </span>
                      </div>
                    )}

                    {/* Preview list sample */}
                    <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-800">
                      {parsedItems.slice(0, 6).map((item, idx) => (
                        <div key={idx} className="pt-1 text-xs flex items-center justify-between text-slate-300">
                          <span className="truncate max-w-[340px] font-medium">{item.title}</span>
                          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[150px]">
                            {item.folderPath.join(' / ') || 'Root'}
                          </span>
                        </div>
                      ))}
                      {parsedItems.length > 6 && (
                        <div className="text-[11px] text-slate-500 pt-1 text-center">
                          + {parsedItems.length - 6} more links...
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleExecuteImport}
                      disabled={importing}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-xs shadow-glow-cyan transition flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} />
                      <span>{importing ? 'Importing...' : `Import ${parsedItems.length} Bookmarks`}</span>
                    </button>
                  </div>
                )}

                {successMessage && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{successMessage}</span>
                  </div>
                )}
              </div>
            ) : (
              /* Export View */
              <div className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Export all your LinkDeck bookmarks, projects, collections, and Google routing rules.
                  You can restore this backup on any browser or machine without an account.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-2xl bg-deck-bg-elevated border border-deck-bg-border hover:border-cyan-500/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <FileJson size={20} />
                      </div>
                      <h4 className="text-sm font-semibold text-white">Full LinkDeck JSON Backup</h4>
                      <p className="text-xs text-slate-400">
                        Includes bookmarks, projects, stages, collections, tags, account profiles, and preferences.
                      </p>
                    </div>
                    <button
                      onClick={handleExportJson}
                      className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition flex items-center justify-center gap-2 shadow"
                    >
                      <Download size={14} />
                      <span>Download JSON Backup</span>
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl bg-deck-bg-elevated border border-deck-bg-border hover:border-violet-500/40 transition flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                        <FileCode size={20} />
                      </div>
                      <h4 className="text-sm font-semibold text-white">Browser HTML Export</h4>
                      <p className="text-xs text-slate-400">
                        Standard Netscape HTML format compatible with Chrome, Safari, Firefox, Edge, and Brave.
                      </p>
                    </div>
                    <button
                      onClick={handleExportHtml}
                      className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow"
                    >
                      <Download size={14} />
                      <span>Download HTML Bookmarks</span>
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
