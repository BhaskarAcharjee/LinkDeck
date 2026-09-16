import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Edit2, Check, User, ShieldCheck } from 'lucide-react';
import type { AccountProfile } from '../../core/types';
import { AccountRepository } from '../../core/repositories/AccountRepository';

interface AccountProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountProfile[];
  onRefresh: () => void;
}

const AVATAR_COLORS = [
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#3B82F6', // Blue
  '#EF4444'  // Red
];

export const AccountProfilesModal: React.FC<AccountProfilesModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onRefresh
}) => {
  const [editingAccount, setEditingAccount] = useState<Partial<AccountProfile> | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [googleIndex, setGoogleIndex] = useState(0);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [notes, setNotes] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  if (!isOpen) return null;

  const startCreate = () => {
    setEditingAccount({});
    setName('');
    setEmail('');
    setGoogleIndex(accounts.length);
    setAvatarColor(AVATAR_COLORS[accounts.length % AVATAR_COLORS.length]);
    setNotes('');
    setIsDefault(accounts.length === 0);
  };

  const startEdit = (acc: AccountProfile) => {
    setEditingAccount(acc);
    setName(acc.name);
    setEmail(acc.email || '');
    setGoogleIndex(acc.googleAuthUserIndex);
    setAvatarColor(acc.avatarColor);
    setNotes(acc.notes || '');
    setIsDefault(acc.isDefault || false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingAccount?.id) {
      await AccountRepository.update(editingAccount.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        googleAuthUserIndex: Number(googleIndex),
        avatarColor,
        avatarLetter: name.trim().charAt(0).toUpperCase(),
        notes: notes.trim() || undefined,
        isDefault
      });
    } else {
      await AccountRepository.create({
        name: name.trim(),
        email: email.trim() || undefined,
        googleAuthUserIndex: Number(googleIndex),
        avatarColor,
        avatarLetter: name.trim().charAt(0).toUpperCase(),
        provider: 'google',
        notes: notes.trim() || undefined,
        isDefault
      });
    }

    setEditingAccount(null);
    onRefresh();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this account profile? Linked bookmarks will fall back to browser default.')) {
      await AccountRepository.delete(id);
      onRefresh();
    }
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
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <User size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">
                  Google Account Profiles
                </h3>
                <p className="text-xs text-slate-400">
                  Manage logical profiles for Google URL routing (authuser indexes & emails)
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

          <div className="p-6 space-y-5">
            {/* Account List */}
            {!editingAccount && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Configured Profiles ({accounts.length})
                  </span>
                  <button
                    onClick={startCreate}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus size={14} />
                    <span>Add Profile</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {accounts.map(acc => (
                    <div
                      key={acc.id}
                      className="p-3.5 rounded-xl bg-deck-bg-elevated/60 border border-deck-bg-border hover:border-slate-700 flex items-center justify-between transition"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm ring-2 ring-white/10"
                          style={{ backgroundColor: acc.avatarColor }}
                        >
                          {acc.avatarLetter || acc.name.charAt(0).toUpperCase()}
                        </span>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-slate-100">
                              {acc.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                              authuser={acc.googleAuthUserIndex}
                            </span>
                            {acc.isDefault && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                Default
                              </span>
                            )}
                          </div>
                          {acc.email && (
                            <span className="text-xs text-slate-400 font-mono block">
                              {acc.email}
                            </span>
                          )}
                          {acc.notes && (
                            <span className="text-xs text-slate-500 block mt-0.5">
                              {acc.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(acc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(acc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Privacy Guarantee Note */}
                <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-2 text-slate-200 font-semibold">
                    <ShieldCheck size={16} className="text-emerald-400" />
                    <span>Privacy & Security Guarantee</span>
                  </div>
                  <p>
                    LinkDeck stores only logical routing indexes (0, 1, 2) and optional email labels.
                    Passwords, session tokens, and authentication cookies are never accessed or stored.
                  </p>
                </div>
              </div>
            )}

            {/* Create / Edit Form */}
            {editingAccount && (
              <form onSubmit={handleSave} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-deck-bg-border">
                  <span className="text-sm font-semibold text-white">
                    {editingAccount.id ? 'Edit Account Profile' : 'New Account Profile'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Profile Name <span className="text-cyan-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Developer Account, Personal, Work"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3.5 py-2 text-sm text-white outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. dev@company.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3.5 py-2 text-sm text-white font-mono outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Google Account Index (authuser / u-path)
                    </label>
                    <select
                      value={googleIndex}
                      onChange={e => setGoogleIndex(Number(e.target.value))}
                      className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-2 text-sm text-white font-mono outline-none transition"
                    >
                      <option value={0}>0 (1st signed-in / default account)</option>
                      <option value={1}>1 (2nd signed-in account)</option>
                      <option value={2}>2 (3rd signed-in account)</option>
                      <option value={3}>3 (4th signed-in account)</option>
                      <option value={4}>4 (5th signed-in account)</option>
                    </select>
                  </div>
                </div>

                {/* Avatar Color Picker */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    Profile Color / Avatar
                  </label>
                  <div className="flex items-center gap-2">
                    {AVATAR_COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setAvatarColor(c)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition ${
                          avatarColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c }}
                      >
                        {avatarColor === c && <Check size={14} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Owns Google Play Console and Firebase project"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3.5 py-2 text-xs text-white outline-none transition"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setEditingAccount(null)}
                    className="px-4 py-2 rounded-lg text-xs text-slate-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition"
                  >
                    Save Profile
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
