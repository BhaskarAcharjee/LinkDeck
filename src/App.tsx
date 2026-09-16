import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import confetti from 'canvas-confetti';
import { db, seedInitialDataIfNeeded } from './core/db/database';
import type { Bookmark, Project, AccountProfile, ProjectStage } from './core/types';
import { BookmarkRepository } from './core/repositories/BookmarkRepository';
import { ProjectRepository } from './core/repositories/ProjectRepository';
import { AccountRepository } from './core/repositories/AccountRepository';
import { SettingsRepository } from './core/repositories/SettingsRepository';
import { GoogleAccountRouter } from './services/routing/GoogleAccountRouter';

// UI Components
import { AppHeader } from './components/layout/AppHeader';
import { QuickLaunchBar } from './components/dashboard/QuickLaunchBar';
import { ActiveProjectsSection } from './components/dashboard/ActiveProjectsSection';
import { FavoritesAndRecentSection } from './components/dashboard/FavoritesAndRecentSection';
import { ProjectDetailView } from './components/projects/ProjectDetailView';
import { CollectionsView } from './components/collections/CollectionsView';
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

export function App() {
  // Reactive IndexedDB data
  const bookmarks = useLiveQuery(() => db.bookmarks.orderBy('sortOrder').toArray()) || [];
  const projects = useLiveQuery(() => db.projects.orderBy('sortOrder').toArray()) || [];
  const collections = useLiveQuery(() => db.collections.orderBy('sortOrder').toArray()) || [];
  const accounts = useLiveQuery(() => AccountRepository.getAll()) || [];
  const settings = useLiveQuery(() => db.settings.get('current'));

  // Active view state
  const [currentView, setCurrentView] = useState<'dashboard' | 'project' | 'collections'>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeAccountProfileId] = useState<string | null>(null);

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

  // Delete All Bookmarks
  const handleConfirmDeleteAll = async () => {
    await BookmarkRepository.deleteAll();
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
        {bookmarks.length === 0 ? (
          // Empty state on fresh run or after delete all
          <StarterPackPrompt
            onLoadStarterPack={handleLoadStarterPack}
            onImportBookmarks={() => setIsImportExportOpen(true)}
            onNewBookmark={() => {
              setEditingBookmark(null);
              setIsBookmarkModalOpen(true);
            }}
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
          />
        ) : (
          // Primary Developer Dashboard
          <div className="space-y-8">
            {/* 1. Quick Launch Bar */}
            <QuickLaunchBar
              bookmarks={bookmarks}
              accounts={accounts}
              onOpenBookmark={handleOpenBookmark}
              onRequestAccountPick={handleRequestAccountPick}
            />

            {/* 2. Project Workspaces Strip */}
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

            {/* 3. Favorites, Recents, and Categorized Bookmarks */}
            <FavoritesAndRecentSection
              bookmarks={bookmarks}
              projects={projects}
              collections={collections}
              accounts={accounts}
              onEditBookmark={b => {
                setEditingBookmark(b);
                setIsBookmarkModalOpen(true);
              }}
              onDeleteBookmark={async id => {
                await BookmarkRepository.delete(id);
              }}
              onDeleteAllBookmarks={() => setIsConfirmDeleteAllOpen(true)}
              onRequestAccountPick={handleRequestAccountPick}
              onOpenBookmark={handleOpenBookmark}
            />
          </div>
        )}
      </main>

      {/* Global Modals */}

      {/* Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        bookmarks={bookmarks}
        projects={projects}
        collections={collections}
        accounts={accounts}
        onOpenBookmark={handleOpenBookmark}
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
    </div>
  );
}

export default App;
