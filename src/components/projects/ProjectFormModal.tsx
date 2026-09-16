import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Check } from 'lucide-react';
import type { Project, AccountProfile } from '../../core/types';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: Partial<Project>) => Promise<void>;
  initialData?: Project | null;
  accounts: AccountProfile[];
}

const PROJECT_COLORS = [
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#6366F1'  // Indigo
];

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  accounts
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [defaultAccountProfileId, setDefaultAccountProfileId] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setColor(initialData.color || PROJECT_COLORS[0]);
      setDefaultAccountProfileId(initialData.defaultAccountProfileId || '');
      setTags(initialData.tags || []);
    } else {
      setName('');
      setDescription('');
      setColor(PROJECT_COLORS[0]);
      setDefaultAccountProfileId(accounts[0]?.id || '');
      setTags([]);
    }
  }, [initialData, accounts, isOpen]);

  const handleAddTag = () => {
    const trimmed = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await onSave({
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
        color,
        defaultAccountProfileId: defaultAccountProfileId || undefined,
        tags,
        sortOrder: initialData?.sortOrder || 1
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-deck-bg-card border border-deck-bg-border rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          <div className="flex items-center justify-between p-5 border-b border-deck-bg-border bg-deck-bg-elevated/80">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: color }}
              >
                <Layers size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  {initialData ? 'Edit Project' : 'New Project Workspace'}
                </h3>
                <p className="text-xs text-slate-400">
                  Organize links around your indie apps (Play Console, Firebase, GitHub...)
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

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Project / App Name <span className="text-cyan-400">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Pencilate, FaceShape AI"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3.5 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                rows={2}
                placeholder="Brief description of the app or purpose..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition resize-none"
              />
            </div>

            {/* Color Accent */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Project Color</label>
              <div className="flex items-center gap-2.5">
                {PROJECT_COLORS.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                      color === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{ backgroundColor: c }}
                  >
                    {color === c && <Check size={14} className="text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Default Google Account for this project */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Default Google Account for Project
              </label>
              <select
                value={defaultAccountProfileId}
                onChange={e => setDefaultAccountProfileId(e.target.value)}
                className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
              >
                <option value="">Browser Default Profile</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} (authuser={acc.googleAuthUserIndex})
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Tags</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="e.g. android, kotlin, saas"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-1.5 text-xs text-white outline-none transition"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 transition"
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
                        onClick={() => setTags(tags.filter(tag => tag !== t))}
                        className="hover:text-rose-400"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-deck-bg-border">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white shadow transition"
              >
                {loading ? 'Saving...' : initialData ? 'Save Changes' : 'Create Project'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
