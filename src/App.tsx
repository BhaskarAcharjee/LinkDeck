import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import confetti from 'canvas-confetti';
import { db, seedInitialDataIfNeeded } from './core/db/database';
import type { Bookmark, Project, AccountProfile, ProjectStage, QuickSite, Article } from './core/types';
import { BookmarkRepository } from './core/repositories/BookmarkRepository';
import { ProjectRepository } from './core/repositories/ProjectRepository';
import { AccountRepository } from './core/repositories/AccountRepository';
import { SettingsRepository } from './core/repositories/SettingsRepository';
import { QuickSiteRepository } from './core/repositories/QuickSiteRepository';
import { ArticleRepository } from './core/repositories/ArticleRepository';
import { GoogleAccountRouter } from './services/routing/GoogleAccountRouter';

// UI Components
import { AppHeader } from './components/layout/AppHeader';
import { QuickSitesSection } from './components/dashboard/QuickSitesSection';
import { QuickLaunchBar } from './components/dashboard/QuickLaunchBar';
import { ActiveProjectsSection } from './components/dashboard/ActiveProjectsSection';
import { FavoritesAndRecentSection } from './components/dashboard/FavoritesAndRecentSection';
import { ReadLaterSection } from './components/dashboard/ReadLaterSection';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { CollectionsView } from './components/collections/CollectionsView';
import { ArticlesView } from './components/articles/ArticlesView';
import { CommandPalette } from './components/palette/CommandPalette';
import { BookmarkFormModal } from './components/bookmarks/BookmarkFormModal';
import { ProjectFormModal } from './components/projects/ProjectFormModal';
import { AccountProfilesModal } from './components/accounts/AccountProfilesModal';
import { AccountRoutingLab } from './components/accounts/AccountRoutingLab';
import { ImportExportModal } from './components/import-export/ImportExportModal';
import { AccountPickerModal } from './components/bookmarks/AccountPickerModal';
import { PasteHandler } from './components/bookmarks/PasteHandler';
import { StarterPackPrompt } from './components/starter/StarterPackPrompt';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { ItemContextMenu, type ContextMenuItem } from './components/common/ItemContextMenu';
import { DropConvertModal } from './components/common/DropConvertModal';
import { BulkActionBar } from './components/bookmarks/BulkActionBar';
import { SmartSuggestionsBar } from './components/dashboard/SmartSuggestionsBar';
import { UndoToast } from './components/common/UndoToast';
import { UndoManager } from './services/undo/undoManager';
import { ConversionService } from './services/conversion/conversionService';

export function App() {
  // Reactive IndexedDB data
  const bookmarks = useLiveQuery(() => db.bookmarks.orderBy('sortOrder').toArray()) || [];
  const quickSites = useLiveQuery(() => db.quickSites.orderBy('sortOrder').toArray()) || [];
  const articles = useLiveQuery(() => db.articles.orderBy('savedAt').reverse().toArray()) || [];
  const projects = useLiveQuery(() => db.projects.orderBy('sortOrder').toArray()) || [];
  const collections = useLiveQuery(() => db.collections.orderBy('sortOrder').toArray()) || [];
  const accounts = useLiveQuery(() => AccountRepository.getAll()) || [];
  const settings = useLiveQuery(() => db.settings.get('current'));

  // Active view state
  const [currentView, setCurrentView] = useState<'dashboard' | 'project' | 'collections' | 'articles'>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeAccountProfileId] = useState<string | null>(null);

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    item: ContextMenuItem;
    x: number;
    y: number;
  } | null>(null);

  // Drop Convert Bookmark State
  const [dropConvertBookmark, setDropConvertBookmark] = useState<Bookmark | null>(null);

  // Multi-Selection State for Dashboard Bookmarks
  const [selectedBookmarkIds, setSelectedBookmarkIds] = useState<Set<string>>(new Set());

  // Modal states
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isBookmarkModalOpen, setIsBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);
  const [presetUrlForBookmark, setPresetUrlForBookmark] = useState<string>('');
  const [presetProjectId, setPresetProjectId] = useState<string | undefined>(undefined);
  const [presetStage, setPresetStage] = useState<ProjectStage | undefined>(undefined);
  const [presetCollectionId, setPresetCollectionId] = useState<string | undefined>(undefined);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isRoutingLabOpen, setIsRoutingLabOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);

  // Delete All confirmation modal state
  const [isConfirmDeleteAllOpen, setIsConfirmDeleteAllOpen] = useState(false);

  // Floating account picker for "Ask Every Time"
  const [pickingAccountForBookmark, setPickingAccountForBookmark] = useState<Bookmark | null>(null);

  // Initialize database with starter data if empty
  useEffect(() => {
    seedInitialDataIfNeeded();
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    const theme = settings?.theme || 'dark';
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings?.theme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'k' && (e.ctrlKey || e.metaKey)) ||
        (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA')
      ) {
        e.preventDefault();
        setIsPaletteOpen(prev => !prev);
      } else if (e.key === 'n' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        setEditingProject(null);
        setIsProjectModalOpen(true);
      } else if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setEditingBookmark(null);
        setPresetUrlForBookmark('');
        setIsBookmarkModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Active account resolution
  const activeAccount = activeAccountProfileId
    ? accounts.find(a => a.id === activeAccountProfileId)
    : accounts.find(a => a.isDefault) || accounts[0];

  // Link Launch Executor
  const handleOpenBookmark = async (bookmark: Bookmark, chosenAccount?: AccountProfile) => {
    let targetAccount = chosenAccount;
    if (!targetAccount) {
      if (bookmark.accountProfileId && bookmark.accountProfileId !== 'default' && bookmark.accountProfileId !== 'ask') {
        targetAccount = accounts.find(a => a.id === bookmark.accountProfileId);
      } else if (activeAccount && bookmark.accountProfileId !== 'default') {
        targetAccount = activeAccount;
      }
    }

    const { resolvedUrl } = GoogleAccountRouter.resolve(bookmark.url, targetAccount);

    // Record open metrics locally
    await BookmarkRepository.recordOpen(bookmark.id);

    // Launch in browser
    window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
  };

  // Open "Ask Every Time" picker
  const handleRequestAccountPick = (bookmark: Bookmark) => {
    setPickingAccountForBookmark(bookmark);
  };

  const handleAccountPicked = (account?: AccountProfile) => {
    if (pickingAccountForBookmark) {
      handleOpenBookmark(pickingAccountForBookmark, account);
      setPickingAccountForBookmark(null);
    }
  };

  // Save Bookmark (Create or Update)
  const handleSaveBookmark = async (data: Partial<Bookmark>) => {
    if (editingBookmark) {
      await BookmarkRepository.update(editingBookmark.id, data);
    } else {
      await BookmarkRepository.create({
        url: data.url!,
        cleanUrl: data.cleanUrl!,
        domain: data.domain!,
        title: data.title!,
        description: data.description,
        projectId: presetProjectId || data.projectId,
        projectStage: presetStage || data.projectStage,
        collectionId: presetCollectionId || data.collectionId,
        accountProfileId: data.accountProfileId,
        tags: data.tags || [],
        notes: data.notes,
        isFavorite: !!data.isFavorite,
        isPinned: !!data.isPinned,
        isArchived: false,
        sortOrder: bookmarks.length + 1,
        linkHealth: 'healthy'
      });
    }
    setEditingBookmark(null);
    setPresetUrlForBookmark('');
    setPresetProjectId(undefined);
    setPresetStage(undefined);
    setPresetCollectionId(undefined);
  };

  // Save Project
  const handleSaveProject = async (data: Partial<Project>) => {
    if (editingProject) {
      await ProjectRepository.update(editingProject.id, data);
    } else {
      await ProjectRepository.create({
        name: data.name!,
        slug: data.slug!,
        description: data.description,
        color: data.color!,
        defaultAccountProfileId: data.defaultAccountProfileId,
        tags: data.tags || [],
        sortOrder: projects.length + 1
      });
    }
    setEditingProject(null);
  };

  // Quick Site Launch Executor
  const handleOpenQuickSite = async (site: QuickSite, chosenAccount?: AccountProfile) => {
    let targetAccount = chosenAccount;
    if (!targetAccount) {
      if (site.accountProfileId && site.accountProfileId !== 'default' && site.accountProfileId !== 'ask') {
        targetAccount = accounts.find(a => a.id === site.accountProfileId);
      } else if (activeAccount && site.accountProfileId !== 'default') {
        targetAccount = activeAccount;
      }
    }

    const { resolvedUrl } = GoogleAccountRouter.resolve(site.url, targetAccount);
    await QuickSiteRepository.recordOpen(site.id);
    window.open(resolvedUrl, '_blank', 'noopener,noreferrer');
  };

  // Article Launch Executor
  const handleOpenArticle = async (article: Article) => {
    if (article.readingStatus === 'unread') {
      await ArticleRepository.setStatus(article.id, 'reading');
    }
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  // Delete All (Bookmarks, Quick Sites, Articles)
  const handleConfirmDeleteAll = async () => {
    await BookmarkRepository.deleteAll();
    await QuickSiteRepository.deleteAll();
    await ArticleRepository.deleteAll();
  };

  // Toggle Dark/Light Theme
  const handleToggleTheme = async () => {
    const currentTheme = settings?.theme || 'dark';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    await SettingsRepository.update({ theme: nextTheme });
  };

  // Load Developer Starter Pack explicitly
  const handleLoadStarterPack = async () => {
    await seedInitialDataIfNeeded(true);
    confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
  };

  // Context Menu Trigger Handlers
  const handleOpenContextMenuForBookmark = (e: React.MouseEvent, bookmark: Bookmark) => {
    setContextMenu({
      item: { type: 'bookmark', data: bookmark },
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleOpenContextMenuForQuickSite = (e: React.MouseEvent, site: QuickSite) => {
    setContextMenu({
      item: { type: 'quick_site', data: site },
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleOpenContextMenuForArticle = (e: React.MouseEvent, article: Article) => {
    setContextMenu({
      item: { type: 'article', data: article },
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleContextMenuOpen = (item: ContextMenuItem, inNewTab = false) => {
    if (inNewTab) {
      window.open(item.data.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (item.type === 'bookmark') {
      handleOpenBookmark(item.data);
    } else if (item.type === 'quick_site') {
      handleOpenQuickSite(item.data);
    } else if (item.type === 'article') {
      handleOpenArticle(item.data);
    }
  };

  const handleContextMenuOpenWithAccount = (item: ContextMenuItem, account: AccountProfile) => {
    if (item.type === 'bookmark') {
      handleOpenBookmark(item.data, account);
    } else if (item.type === 'quick_site') {
      handleOpenQuickSite(item.data, account);
    }
  };

  const handleConvertItem = async (
    item: ContextMenuItem,
    targetType: 'bookmark' | 'quick_site' | 'article',
    duplicate = false,
    collectionId?: string
  ) => {
    if (item.type === 'bookmark') {
      if (targetType === 'quick_site') {
        const qs = await ConversionService.bookmarkToQuickSite(item.data, { duplicate });
        UndoManager.push(duplicate ? `Duplicated "${item.data.title}" as Quick Site` : `Converted "${item.data.title}" to Quick Site`, async () => {
          if (!duplicate) await ConversionService.quickSiteToBookmark(qs, item.data.collectionId);
          else await QuickSiteRepository.delete(qs.id);
        });
      } else if (targetType === 'article') {
        const art = await ConversionService.bookmarkToArticle(item.data, { duplicate });
        UndoManager.push(duplicate ? `Duplicated "${item.data.title}" as Article` : `Converted "${item.data.title}" to Article`, async () => {
          if (!duplicate) await ConversionService.articleToBookmark(art, item.data.collectionId);
          else await ArticleRepository.delete(art.id);
        });
      }
    } else if (item.type === 'quick_site') {
      if (targetType === 'bookmark') {
        const bm = await ConversionService.quickSiteToBookmark(item.data, collectionId, { duplicate });
        UndoManager.push(duplicate ? `Duplicated "${item.data.title}" as Bookmark` : `Converted "${item.data.title}" to Bookmark`, async () => {
          if (!duplicate) await ConversionService.bookmarkToQuickSite(bm);
          else await BookmarkRepository.delete(bm.id);
        });
      } else if (targetType === 'article') {
        const art = await ConversionService.quickSiteToArticle(item.data, { duplicate });
        UndoManager.push(duplicate ? `Duplicated "${item.data.title}" as Article` : `Converted "${item.data.title}" to Article`, async () => {
          if (!duplicate) await ConversionService.articleToQuickSite(art);
          else await ArticleRepository.delete(art.id);
        });
      }
    } else if (item.type === 'article') {
      if (targetType === 'bookmark') {
        const bm = await ConversionService.articleToBookmark(item.data, collectionId, { duplicate });
        UndoManager.push(duplicate ? `Duplicated "${item.data.title}" as Bookmark` : `Converted "${item.data.title}" to Bookmark`, async () => {
          if (!duplicate) await ConversionService.bookmarkToArticle(bm);
          else await BookmarkRepository.delete(bm.id);
        });
      } else if (targetType === 'quick_site') {
        const qs = await ConversionService.articleToQuickSite(item.data, { duplicate });
        UndoManager.push(duplicate ? `Duplicated "${item.data.title}" as Quick Site` : `Converted "${item.data.title}" to Quick Site`, async () => {
          if (!duplicate) await ConversionService.quickSiteToArticle(qs);
          else await QuickSiteRepository.delete(qs.id);
        });
      }
    }
  };

  const handleDeleteContextMenuItem = async (item: ContextMenuItem) => {
    if (item.type === 'bookmark') {
      const bm = item.data;
      await BookmarkRepository.delete(bm.id);
      UndoManager.push(`Deleted "${bm.title}"`, async () => {
        await BookmarkRepository.create(bm);
      });
    } else if (item.type === 'quick_site') {
      const qs = item.data;
      await QuickSiteRepository.delete(qs.id);
      UndoManager.push(`Deleted "${qs.title}"`, async () => {
        await QuickSiteRepository.create(qs);
      });
    } else if (item.type === 'article') {
      const art = item.data;
      await ArticleRepository.delete(art.id);
      UndoManager.push(`Deleted "${art.title}"`, async () => {
        await ArticleRepository.create(art);
      });
    }
  };

  const handleEditContextMenuItem = (item: ContextMenuItem) => {
    if (item.type === 'bookmark') {
      setEditingBookmark(item.data);
      setIsBookmarkModalOpen(true);
    } else if (item.type === 'quick_site') {
      setEditingBookmark({
        id: item.data.id,
        title: item.data.title,
        url: item.data.url,
        cleanUrl: item.data.cleanUrl,
        domain: item.data.domain,
        favicon: item.data.icon,
        accountProfileId: item.data.accountProfileId,
        tags: [],
        isFavorite: item.data.isPinned,
        isPinned: item.data.isPinned,
        isArchived: false,
        openCount: item.data.openCount,
        createdAt: item.data.createdAt,
        updatedAt: item.data.updatedAt,
        sortOrder: item.data.sortOrder
      });
      setIsBookmarkModalOpen(true);
    } else if (item.type === 'article') {
      setEditingBookmark({
        id: item.data.id,
        title: item.data.title,
        url: item.data.url,
        cleanUrl: item.data.cleanUrl,
        domain: item.data.domain,
        favicon: item.data.favicon,
        notes: item.data.excerpt,
        tags: item.data.tags || [],
        isFavorite: item.data.isFavorite,
        isPinned: false,
        isArchived: item.data.readingStatus === 'archived',
        openCount: 0,
        createdAt: item.data.savedAt,
        updatedAt: item.data.updatedAt,
        sortOrder: 0
      });
      setIsBookmarkModalOpen(true);
    }
  };

  // Drag-and-drop Bookmark -> Quick Site confirmation
  const handleConfirmDropConvert = async () => {
    if (!dropConvertBookmark) return;
    const bm = dropConvertBookmark;
    const qs = await ConversionService.bookmarkToQuickSite(bm, { duplicate: false });
    setDropConvertBookmark(null);
    UndoManager.push(`Converted "${bm.title}" to Quick Site`, async () => {
      await ConversionService.quickSiteToBookmark(qs, bm.collectionId);
    });
  };

  // Bulk actions on dashboard
  const handleToggleSelectBookmark = (bookmarkId: string) => {
    const next = new Set(selectedBookmarkIds);
    if (next.has(bookmarkId)) next.delete(bookmarkId);
    else next.add(bookmarkId);
    setSelectedBookmarkIds(next);
  };

  const handleBulkMove = async (colId: string) => {
    const ids = Array.from(selectedBookmarkIds);
    const targetCol = collections.find(c => c.id === colId);
    const previousCols = new Map(bookmarks.filter(b => ids.includes(b.id)).map(b => [b.id, b.collectionId]));

    for (const id of ids) {
      await BookmarkRepository.update(id, { collectionId: colId });
    }
    setSelectedBookmarkIds(new Set());

    UndoManager.push(`Moved ${ids.length} bookmarks to ${targetCol?.name || 'collection'}`, async () => {
      for (const [bmId, oldColId] of previousCols.entries()) {
        await BookmarkRepository.update(bmId, { collectionId: oldColId });
      }
    });
  };

  const handleBulkConvertToQuickLinks = async () => {
    const ids = Array.from(selectedBookmarkIds);
    const bms = bookmarks.filter(b => ids.includes(b.id));

    for (const bm of bms) {
      await ConversionService.bookmarkToQuickSite(bm, { duplicate: false });
    }
    setSelectedBookmarkIds(new Set());
    UndoManager.push(`Converted ${ids.length} bookmarks to Quick Sites`, async () => {
      // Undo handled by individual conversions
    });
  };

  const handleBulkAddTag = async (tag: string) => {
    const ids = Array.from(selectedBookmarkIds);
    for (const id of ids) {
      const bm = bookmarks.find(b => b.id === id);
      if (bm && !bm.tags?.includes(tag)) {
        await BookmarkRepository.update(id, { tags: [...(bm.tags || []), tag] });
      }
    }
    setSelectedBookmarkIds(new Set());
  };

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedBookmarkIds);
    if (confirm(`Delete ${ids.length} selected bookmarks?`)) {
      for (const id of ids) {
        await BookmarkRepository.delete(id);
      }
      setSelectedBookmarkIds(new Set());
    }
  };

  const selectedProject = projects.find(p => p.id === activeProjectId);

  return (
    <div className="min-h-screen bg-deck-bg text-slate-100 bg-grid-pattern pb-16">
      {/* Header */}
      <AppHeader
        activeAccount={activeAccount}
        onOpenPalette={() => setIsPaletteOpen(true)}
        onNewBookmark={() => {
          setEditingBookmark(null);
          setPresetUrlForBookmark('');
          setIsBookmarkModalOpen(true);
        }}
        onOpenRoutingLab={() => setIsRoutingLabOpen(true)}
        onOpenAccountManager={() => setIsAccountModalOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        theme={settings?.theme || 'dark'}
        onToggleTheme={handleToggleTheme}
        currentView={currentView}
        onNavigateView={view => {
          setCurrentView(view);
          setActiveProjectId(null);
        }}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {bookmarks.length === 0 && quickSites.length === 0 && articles.length === 0 ? (
          // Empty state on fresh run or after delete all
          <StarterPackPrompt
            onLoadStarterPack={handleLoadStarterPack}
            onImportBookmarks={() => setIsImportExportOpen(true)}
            onNewBookmark={() => {
              setEditingBookmark(null);
              setIsBookmarkModalOpen(true);
            }}
          />
        ) : currentView === 'articles' ? (
          // Full Articles / Read Later View
          <ArticlesView
            articles={articles}
            onOpenArticle={handleOpenArticle}
            onNewArticle={() => {
              setEditingBookmark(null);
              setPresetUrlForBookmark('');
              setIsBookmarkModalOpen(true);
            }}
            onBackToDashboard={() => setCurrentView('dashboard')}
            onContextMenu={handleOpenContextMenuForArticle}
          />
        ) : currentView === 'project' && selectedProject ? (
          // Project Workspace View
          <ProjectDetailView
            project={selectedProject}
            bookmarks={bookmarks}
            accounts={accounts}
            collections={collections}
            onBack={() => {
              setCurrentView('dashboard');
              setActiveProjectId(null);
            }}
            onEditProject={proj => {
              setEditingProject(proj);
              setIsProjectModalOpen(true);
            }}
            onDeleteProject={async id => {
              await ProjectRepository.delete(id);
              setCurrentView('dashboard');
            }}
            onNewBookmarkForProject={(projId, stage) => {
              setEditingBookmark(null);
              setPresetProjectId(projId);
              setPresetStage(stage);
              setIsBookmarkModalOpen(true);
            }}
            onEditBookmark={b => {
              setEditingBookmark(b);
              setIsBookmarkModalOpen(true);
            }}
            onDeleteBookmark={async id => {
              await BookmarkRepository.delete(id);
            }}
            onRequestAccountPick={handleRequestAccountPick}
            onOpenBookmark={handleOpenBookmark}
          />
        ) : currentView === 'collections' ? (
          // Collections View
          <CollectionsView
            collections={collections}
            bookmarks={bookmarks}
            projects={projects}
            accounts={accounts}
            onEditBookmark={b => {
              setEditingBookmark(b);
              setIsBookmarkModalOpen(true);
            }}
            onDeleteBookmark={async id => {
              await BookmarkRepository.delete(id);
            }}
            onRequestAccountPick={handleRequestAccountPick}
            onOpenBookmark={handleOpenBookmark}
            onNewBookmark={colId => {
              setEditingBookmark(null);
              setPresetCollectionId(colId);
              setIsBookmarkModalOpen(true);
            }}
            onRefresh={() => {}}
            onBookmarkContextMenu={handleOpenContextMenuForBookmark}
          />
        ) : (
          // Primary Developer Dashboard
          <div className="space-y-8">
            {/* Smart Suggestions Bar (Non-intrusive) */}
            <SmartSuggestionsBar
              bookmarks={bookmarks}
              quickSites={quickSites}
              collections={collections}
              onConvertToQuickSite={async bm => {
                const qs = await ConversionService.bookmarkToQuickSite(bm, { duplicate: false });
                UndoManager.push(`Converted "${bm.title}" to Quick Site`, async () => {
                  await ConversionService.quickSiteToBookmark(qs, bm.collectionId);
                });
              }}
              onConvertToArticle={async bm => {
                const art = await ConversionService.bookmarkToArticle(bm, { duplicate: false });
                UndoManager.push(`Converted "${bm.title}" to Article`, async () => {
                  await ConversionService.articleToBookmark(art, bm.collectionId);
                });
              }}
              onMoveToCollection={async (bm, colId) => {
                const prevColId = bm.collectionId;
                await BookmarkRepository.update(bm.id, { collectionId: colId });
                const colName = collections.find(c => c.id === colId)?.name || 'collection';
                UndoManager.push(`Moved "${bm.title}" to ${colName}`, async () => {
                  await BookmarkRepository.update(bm.id, { collectionId: prevColId });
                });
              }}
            />

            {/* 1. Quick Sites Launcher (Large icon launchers ARC/macOS style) */}
            {quickSites.length > 0 && (
              <QuickSitesSection
                quickSites={quickSites}
                accounts={accounts}
                onOpenSite={handleOpenQuickSite}
                onAddQuickSite={() => {
                  setEditingBookmark(null);
                  setPresetUrlForBookmark('');
                  setIsBookmarkModalOpen(true);
                }}
                onDropBookmark={bmId => {
                  const bm = bookmarks.find(b => b.id === bmId);
                  if (bm) setDropConvertBookmark(bm);
                }}
                onContextMenu={handleOpenContextMenuForQuickSite}
              />
            )}

            {/* 2. Quick Launch Bar (Continue / Recent Strip) */}
            <QuickLaunchBar
              bookmarks={bookmarks}
              accounts={accounts}
              onOpenBookmark={handleOpenBookmark}
              onRequestAccountPick={handleRequestAccountPick}
            />

            {/* 3. Project Workspaces Strip */}
            {projects.length > 0 && (
              <ActiveProjectsSection
                projects={projects}
                bookmarks={bookmarks}
                accounts={accounts}
                onSelectProject={proj => {
                  setActiveProjectId(proj.id);
                  setCurrentView('project');
                }}
                onNewProject={() => {
                  setEditingProject(null);
                  setIsProjectModalOpen(true);
                }}
              />
            )}

            {/* 4. Favorites, Recents, and Categorized Bookmarks */}
            <FavoritesAndRecentSection
              bookmarks={bookmarks}
              projects={projects}
              collections={collections}
              accounts={accounts}
              selectedBookmarkIds={selectedBookmarkIds}
              onToggleSelectBookmark={handleToggleSelectBookmark}
              onBookmarkContextMenu={handleOpenContextMenuForBookmark}
              onEditBookmark={b => {
                setEditingBookmark(b);
                setIsBookmarkModalOpen(true);
              }}
              onDeleteBookmark={async id => {
                const bm = bookmarks.find(b => b.id === id);
                await BookmarkRepository.delete(id);
                if (bm) {
                  UndoManager.push(`Deleted "${bm.title}"`, async () => {
                    await BookmarkRepository.create(bm);
                  });
                }
              }}
              onDeleteAllBookmarks={() => setIsConfirmDeleteAllOpen(true)}
              onRequestAccountPick={handleRequestAccountPick}
              onOpenBookmark={handleOpenBookmark}
            />

            {/* 5. Read Later Section */}
            {articles.length > 0 && (
              <ReadLaterSection
                articles={articles}
                onOpenArticle={handleOpenArticle}
                onViewAllArticles={() => setCurrentView('articles')}
                onContextMenu={handleOpenContextMenuForArticle}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Bulk Action Bar */}
      {currentView === 'dashboard' && selectedBookmarkIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedBookmarkIds.size}
          collections={collections}
          onMoveToCollection={handleBulkMove}
          onConvertToQuickLinks={handleBulkConvertToQuickLinks}
          onAddTag={handleBulkAddTag}
          onDeleteSelected={handleBulkDelete}
          onClearSelection={() => setSelectedBookmarkIds(new Set())}
        />
      )}

      {/* Global Modals */}

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        bookmarks={bookmarks}
        quickSites={quickSites}
        articles={articles}
        projects={projects}
        collections={collections}
        accounts={accounts}
        onOpenBookmark={handleOpenBookmark}
        onOpenQuickSite={handleOpenQuickSite}
        onOpenArticle={handleOpenArticle}
        onSelectProject={proj => {
          setActiveProjectId(proj.id);
          setCurrentView('project');
        }}
        onNewBookmark={() => {
          setEditingBookmark(null);
          setPresetUrlForBookmark('');
          setIsBookmarkModalOpen(true);
        }}
        onNewProject={() => {
          setEditingProject(null);
          setIsProjectModalOpen(true);
        }}
        onOpenRoutingLab={() => setIsRoutingLabOpen(true)}
        onOpenAccountManager={() => setIsAccountModalOpen(true)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onToggleTheme={handleToggleTheme}
        onDeleteAllBookmarks={() => setIsConfirmDeleteAllOpen(true)}
      />

      {/* Bookmark Create/Edit Modal */}
      <BookmarkFormModal
        isOpen={isBookmarkModalOpen}
        onClose={() => {
          setIsBookmarkModalOpen(false);
          setEditingBookmark(null);
          setPresetUrlForBookmark('');
          setPresetProjectId(undefined);
          setPresetStage(undefined);
          setPresetCollectionId(undefined);
        }}
        onSave={handleSaveBookmark}
        initialData={editingBookmark}
        initialUrl={presetUrlForBookmark}
        projects={projects}
        collections={collections}
        accounts={accounts}
      />

      {/* Project Create/Edit Modal */}
      <ProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialData={editingProject}
        accounts={accounts}
      />

      {/* Account Routing Lab */}
      <AccountRoutingLab
        isOpen={isRoutingLabOpen}
        onClose={() => setIsRoutingLabOpen(false)}
        accounts={accounts}
      />

      {/* Account Profiles Manager Modal */}
      <AccountProfilesModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        accounts={accounts}
        onRefresh={() => {}}
      />

      {/* Browser Import / Export Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        bookmarks={bookmarks}
        collections={collections}
        onRefresh={() => {}}
        onDeleteAllBookmarks={() => setIsConfirmDeleteAllOpen(true)}
      />

      {/* Floating Account Picker for "Ask Every Time" */}
      <AccountPickerModal
        isOpen={!!pickingAccountForBookmark}
        onClose={() => setPickingAccountForBookmark(null)}
        bookmark={pickingAccountForBookmark}
        accounts={accounts}
        onSelectAccount={handleAccountPicked}
      />

      {/* Confirm Delete All Modal */}
      <ConfirmDeleteModal
        isOpen={isConfirmDeleteAllOpen}
        onClose={() => setIsConfirmDeleteAllOpen(false)}
        onConfirm={handleConfirmDeleteAll}
        title="Delete All Bookmarks"
        description="Are you sure you want to delete all bookmarks? This will permanently remove all links from your local database."
        confirmButtonText="Yes, Delete All"
        count={bookmarks.length}
      />

      {/* Global Clipboard Paste Listener */}
      <PasteHandler
        onAddFromPaste={url => {
          setEditingBookmark(null);
          setPresetUrlForBookmark(url);
          setIsBookmarkModalOpen(true);
        }}
      />

      {/* Universal Context Menu */}
      {contextMenu && (
        <ItemContextMenu
          item={contextMenu.item}
          x={contextMenu.x}
          y={contextMenu.y}
          collections={collections}
          projects={projects}
          accounts={accounts}
          onClose={() => setContextMenu(null)}
          onOpen={handleContextMenuOpen}
          onOpenWithAccount={handleContextMenuOpenWithAccount}
          onEdit={handleEditContextMenuItem}
          onDelete={handleDeleteContextMenuItem}
          onConvert={handleConvertItem}
          onToggleFavorite={async item => {
            if (item.type === 'bookmark') {
              await BookmarkRepository.toggleFavorite(item.data.id);
            } else if (item.type === 'article') {
              await ArticleRepository.toggleFavorite(item.data.id);
            }
          }}
          onTogglePin={async item => {
            if (item.type === 'bookmark') {
              await BookmarkRepository.togglePin(item.data.id);
            } else if (item.type === 'quick_site') {
              await QuickSiteRepository.togglePin(item.data.id);
            }
          }}
          onMoveToCollection={async (bookmark, colId) => {
            const prevColId = bookmark.collectionId;
            await BookmarkRepository.update(bookmark.id, { collectionId: colId });
            const colName = collections.find(c => c.id === colId)?.name || 'Unsorted';
            UndoManager.push(`Moved "${bookmark.title}" to ${colName}`, async () => {
              await BookmarkRepository.update(bookmark.id, { collectionId: prevColId });
            });
          }}
          onMoveToProject={async (bookmark, projId) => {
            const prevProjId = bookmark.projectId;
            await BookmarkRepository.update(bookmark.id, { projectId: projId });
            const projName = projects.find(p => p.id === projId)?.name || 'None';
            UndoManager.push(`Moved "${bookmark.title}" to ${projName}`, async () => {
              await BookmarkRepository.update(bookmark.id, { projectId: prevProjId });
            });
          }}
          onToggleArchive={async bookmark => {
            await BookmarkRepository.update(bookmark.id, { isArchived: !bookmark.isArchived });
          }}
          onToggleHide={async site => {
            await QuickSiteRepository.toggleHide(site.id);
          }}
          onSetReadingStatus={async (article, status) => {
            await ArticleRepository.setStatus(article.id, status);
          }}
          onNewCollection={() => {
            setCurrentView('collections');
          }}
        />
      )}

      {/* Drag & Drop Convert to Quick Link Confirmation Modal */}
      <DropConvertModal
        isOpen={!!dropConvertBookmark}
        bookmark={dropConvertBookmark}
        onConfirm={handleConfirmDropConvert}
        onCancel={() => setDropConvertBookmark(null)}
      />

      {/* Global Temporary Undo Notification Toast */}
      <UndoToast />
    </div>
  );
}

export default App;
