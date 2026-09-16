import React, { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Layers,
  Rocket,
  Code,
  Coins,
  BarChart,
  Globe
} from 'lucide-react';
import type { Project, Bookmark, AccountProfile, Collection, ProjectStage } from '../../core/types';
import { BookmarkCard } from '../bookmarks/BookmarkCard';
import { AccountBadge } from '../common/AccountBadge';

interface ProjectDetailViewProps {
  project: Project;
  bookmarks: Bookmark[];
  accounts: AccountProfile[];
  collections: Collection[];
  onBack: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
  onNewBookmarkForProject: (projectId: string, defaultStage?: ProjectStage) => void;
  onEditBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (bookmarkId: string) => void;
  onRequestAccountPick: (bookmark: Bookmark) => void;
  onOpenBookmark: (bookmark: Bookmark, account?: AccountProfile) => void;
}

const STAGES: { id: ProjectStage | 'all'; label: string; icon: React.ElementType }[] = [
  { id: 'all', label: 'All Resources', icon: Layers },
  { id: 'distribution', label: 'Distribution & Store', icon: Rocket },
  { id: 'development', label: 'Development & Code', icon: Code },
  { id: 'monetization', label: 'Monetization & Ads', icon: Coins },
  { id: 'analytics', label: 'Analytics & Growth', icon: BarChart },
  { id: 'web', label: 'Web & Compliance', icon: Globe }
];

export const ProjectDetailView: React.FC<ProjectDetailViewProps> = ({
  project,
  bookmarks,
  accounts,
  collections,
  onBack,
  onEditProject,
  onDeleteProject,
  onNewBookmarkForProject,
  onEditBookmark,
  onDeleteBookmark,
  onRequestAccountPick,
  onOpenBookmark
}) => {
  const [selectedStage, setSelectedStage] = useState<ProjectStage | 'all'>('all');

  const collectionsMap = new Map(collections.map(c => [c.id, c]));
  const accountsMap = new Map(accounts.map(a => [a.id, a]));

  const defaultAccount = project.defaultAccountProfileId
    ? accountsMap.get(project.defaultAccountProfileId)
    : undefined;

  const projectBookmarks = bookmarks.filter(b => b.projectId === project.id);
  const filteredBookmarks = selectedStage === 'all'
    ? projectBookmarks
    : projectBookmarks.filter(b => b.projectStage === selectedStage);

  return (
    <div className="space-y-6">
      {/* Project Header Banner */}
      <div className="p-6 rounded-2xl bg-deck-bg-card border border-deck-bg-border relative overflow-hidden shadow-card">
        {/* Glow accent */}
        <div
          className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: project.color }}
        />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition mb-1"
            >
              <ArrowLeft size={14} />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white text-xl shadow-lg ring-2 ring-white/10"
                style={{ backgroundColor: project.color }}
              >
                <Layers size={24} />
              </div>

              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {project.name}
                  </h2>
                  {defaultAccount && (
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      Default: <AccountBadge account={defaultAccount} size="sm" showName />
                    </span>
                  )}
                </div>
                {project.description && (
                  <p className="text-sm text-slate-400 mt-0.5 max-w-xl">
                    {project.description}
                  </p>
                )}
              </div>
            </div>

            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {project.tags.map(t => (
                  <span
                    key={t}
                    className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-deck-bg-elevated border border-deck-bg-border text-slate-400"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onNewBookmarkForProject(project.id, selectedStage !== 'all' ? selectedStage : 'development')}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-glow-cyan transition"
            >
              <Plus size={15} />
              <span>Add Resource</span>
            </button>

            <button
              onClick={() => onEditProject(project)}
              className="p-2.5 rounded-xl bg-deck-bg-elevated border border-deck-bg-border text-slate-300 hover:text-white hover:border-slate-600 transition"
              title="Edit Project"
            >
              <Edit2 size={16} />
            </button>

            <button
              onClick={() => {
                if (confirm(`Delete project "${project.name}"? Bookmarks will be preserved as unassigned.`)) {
                  onDeleteProject(project.id);
                  onBack();
                }
              }}
              className="p-2.5 rounded-xl bg-deck-bg-elevated border border-deck-bg-border text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition"
              title="Delete Project"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Stage Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {STAGES.map(stage => {
          const Icon = stage.icon;
          const count = stage.id === 'all'
            ? projectBookmarks.length
            : projectBookmarks.filter(b => b.projectStage === stage.id).length;

          const isSelected = selectedStage === stage.id;

          return (
            <button
              key={stage.id}
              onClick={() => setSelectedStage(stage.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition shrink-0 ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-deck-bg-card border border-deck-bg-border text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon size={14} />
              <span>{stage.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bookmarks Grid */}
      {filteredBookmarks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredBookmarks.map(b => (
            <BookmarkCard
              key={b.id}
              bookmark={b}
              project={project}
              collection={b.collectionId ? collectionsMap.get(b.collectionId) : undefined}
              account={b.accountProfileId ? accountsMap.get(b.accountProfileId) : defaultAccount}
              accounts={accounts}
              onEdit={onEditBookmark}
              onDelete={onDeleteBookmark}
              onRequestAccountPick={onRequestAccountPick}
              onOpenBookmark={onOpenBookmark}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 rounded-2xl bg-deck-bg-card/40 border border-dashed border-deck-bg-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Layers size={24} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300">
              No resources in this stage yet
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Add your Play Console, Firebase, GitHub, or AdMob links for {project.name}.
            </p>
          </div>
          <button
            onClick={() => onNewBookmarkForProject(project.id, selectedStage !== 'all' ? selectedStage : 'development')}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold inline-flex items-center gap-1.5 border border-cyan-500/30 transition"
          >
            <Plus size={14} />
            <span>Add Resource</span>
          </button>
        </div>
      )}
    </div>
  );
};
