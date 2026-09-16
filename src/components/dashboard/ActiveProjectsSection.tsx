import React from 'react';
import { Layers, Plus, ArrowRight } from 'lucide-react';
import type { Project, Bookmark, AccountProfile } from '../../core/types';
import { AccountBadge } from '../common/AccountBadge';

interface ActiveProjectsSectionProps {
  projects: Project[];
  bookmarks: Bookmark[];
  accounts: AccountProfile[];
  onSelectProject: (project: Project) => void;
  onNewProject: () => void;
}

export const ActiveProjectsSection: React.FC<ActiveProjectsSectionProps> = ({
  projects,
  bookmarks,
  accounts,
  onSelectProject,
  onNewProject
}) => {
  const accountsMap = new Map(accounts.map(a => [a.id, a]));

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          App & Project Workspaces
        </span>
        <button
          onClick={onNewProject}
          className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition"
        >
          <Plus size={13} />
          <span>New Workspace</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(proj => {
          const projectBookmarks = bookmarks.filter(b => b.projectId === proj.id);
          const defaultAccount = proj.defaultAccountProfileId
            ? accountsMap.get(proj.defaultAccountProfileId)
            : undefined;

          const stages = new Set(projectBookmarks.map(b => b.projectStage).filter(Boolean));

          return (
            <div
              key={proj.id}
              onClick={() => onSelectProject(proj)}
              className="group p-4 rounded-2xl bg-deck-bg-card hover:bg-deck-bg-hover border border-deck-bg-border hover:border-violet-500/40 transition-all duration-200 cursor-pointer shadow-card flex flex-col justify-between space-y-3 hover:-translate-y-0.5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-sm"
                      style={{ backgroundColor: proj.color }}
                    >
                      <Layers size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition">
                        {proj.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {projectBookmarks.length} resources • {stages.size} stages
                      </span>
                    </div>
                  </div>

                  {defaultAccount && (
                    <AccountBadge account={defaultAccount} size="sm" />
                  )}
                </div>

                {proj.description && (
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-deck-bg-border/60 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {proj.tags.slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-deck-bg-elevated border border-deck-bg-border text-slate-400"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-1 text-slate-400 group-hover:text-cyan-400 font-semibold text-xs transition">
                  <span>Open</span>
                  <ArrowRight size={13} className="group-hover:translate-x-0.5 transition" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
