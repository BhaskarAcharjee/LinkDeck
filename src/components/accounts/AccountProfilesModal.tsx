import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  User,
  ShieldCheck,
  Star,
  ChevronUp,
  ChevronDown,
  Sparkles,
  HelpCircle,
  ArrowUpDown
} from 'lucide-react';
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

  // Quick URL detection state
  const [detectUrl, setDetectUrl] = useState('');
  const [detectedInfo, setDetectedInfo] = useState<{ index: number; email?: string } | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

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
      if (isDefault) {
        await AccountRepository.setDefault(editingAccount.id);
      }
    } else {
      const created = await AccountRepository.create({
        name: name.trim(),
        email: email.trim() || undefined,
        googleAuthUserIndex: Number(googleIndex),
        avatarColor,
        avatarLetter: name.trim().charAt(0).toUpperCase(),
        provider: 'google',
        notes: notes.trim() || undefined,
        isDefault
      });
      if (isDefault) {
        await AccountRepository.setDefault(created.id);
      }
    }

    setEditingAccount(null);
    onRefresh();
    setFeedbackMessage('Account profile saved');
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this account profile? Linked bookmarks will fall back to browser default.')) {
      await AccountRepository.delete(id);
      onRefresh();
    }
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    await AccountRepository.move(id, direction);
    onRefresh();
  };

  const handleSetDefault = async (id: string) => {
    await AccountRepository.setDefault(id);
    onRefresh();
    const acc = accounts.find(a => a.id === id);
    setFeedbackMessage(`"${acc?.name || 'Profile'}" is now your default Google account`);
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const handleSyncIndexes = async () => {
    if (confirm('Re-index accounts so top account is authuser=0, second is authuser=1, third is authuser=2, etc.?')) {
      await AccountRepository.syncGoogleAuthIndexes();
      onRefresh();
      setFeedbackMessage('Google authuser indexes synchronized with list order (0, 1, 2...)');
      setTimeout(() => setFeedbackMessage(null), 2500);
    }
  };

  const handleDetectUrlChange = (value: string) => {
    setDetectUrl(value);
    if (value.trim()) {
      const result = AccountRepository.detectFromGoogleUrl(value);
      setDetectedInfo(result);
    } else {
      setDetectedInfo(null);
    }
  };

  const handleApplyDetected = async () => {
    if (!detectedInfo) return;
    const existingMatch = accounts.find(a => a.googleAuthUserIndex === detectedInfo.index);
    if (existingMatch) {
      if (!confirm(`An account with index ${detectedInfo.index} already exists ("${existingMatch.name}"). Create another profile with this index anyway?`)) {
        return;
      }
    }

    const defaultProfileName = detectedInfo.email
      ? detectedInfo.email.split('@')[0].charAt(0).toUpperCase() + detectedInfo.email.split('@')[0].slice(1)
      : `Google Account ${detectedInfo.index}`;

    await AccountRepository.create({
      name: defaultProfileName,
      email: detectedInfo.email,
      googleAuthUserIndex: detectedInfo.index,
      avatarColor: AVATAR_COLORS[detectedInfo.index % AVATAR_COLORS.length],
      avatarLetter: defaultProfileName.charAt(0).toUpperCase(),
      provider: 'google',
      isDefault: accounts.length === 0
    });

    setDetectUrl('');
    setDetectedInfo(null);
    onRefresh();
    setFeedbackMessage(`Created profile "${defaultProfileName}" (authuser=${detectedInfo.index})`);
    setTimeout(() => setFeedbackMessage(null), 2500);
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
            {/* Feedback Notification Pill */}
            {feedbackMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2"
              >
                <Check size={14} className="text-cyan-400" />
                <span>{feedbackMessage}</span>
              </motion.div>
            )}

            {/* Account List & Quick Detect */}
            {!editingAccount && (
              <div className="space-y-4">
                {/* Quick Detect / Fetch from Google Tab URL */}
                <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                      <Sparkles size={15} className="text-cyan-400" />
                      <span>Quick Fetch & Detect from Google URL</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                    >
                      <HelpCircle size={13} />
                      <span>Can browsers auto-read accounts?</span>
                    </button>
                  </div>

                  {showHelp && (
                    <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
                      <p>
                        <strong className="text-white">Browser Security & Privacy Sandbox:</strong> Standard web browsers enforce strict Same-Origin Policies. For security, a web page cannot silently scrape cookies or read logged-in emails from <code className="text-cyan-300 font-mono">accounts.google.com</code> without your consent.
                      </p>
                      <p>
                        <strong className="text-white">Effortless 1-Click Detection:</strong> Simply copy and paste any URL from a Google tab you currently have open (Gmail, Play Console, Google Cloud, Drive, or Google Account Switcher). LinkDeck instantly detects your account index (<code className="text-cyan-300 font-mono">authuser=X</code> or <code className="text-cyan-300 font-mono">/u/X/</code>) and pre-fills your profile!
                      </p>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      placeholder="Paste any Google tab URL (e.g. mail.google.com/mail/u/1/ or ?authuser=2)..."
                      value={detectUrl}
                      onChange={e => handleDetectUrlChange(e.target.value)}
                      className="flex-1 bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none transition font-mono"
                    />
                    {detectedInfo ? (
                      <button
                        type="button"
                        onClick={handleApplyDetected}
                        className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center justify-center gap-1.5 transition shrink-0 shadow-sm"
                      >
                        <Plus size={14} />
                        <span>Add Profile (authuser={detectedInfo.index})</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleDetectUrlChange(detectUrl)}
                        disabled={!detectUrl.trim()}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center justify-center gap-1.5 transition shrink-0 disabled:opacity-40"
                      >
                        <span>Detect</span>
                      </button>
                    )}
                  </div>

                  {detectedInfo && (
                    <div className="text-[11px] text-emerald-400 flex items-center gap-2">
                      <Check size={13} />
                      <span>
                        Detected Google routing index: <strong className="font-mono">authuser={detectedInfo.index}</strong>
                        {detectedInfo.email ? ` • Email: ${detectedInfo.email}` : ''}
                      </span>
                    </div>
                  )}
                </div>

                {/* Toolbar */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Configured Profiles ({accounts.length})
                    </span>
                    {accounts.length > 1 && (
                      <button
                        type="button"
                        onClick={handleSyncIndexes}
                        title="Re-number authuser index (0, 1, 2...) according to this order"
                        className="text-[11px] text-slate-400 hover:text-cyan-300 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700 flex items-center gap-1 transition"
                      >
                        <ArrowUpDown size={11} />
                        <span>Sync authuser (0, 1, 2...)</span>
                      </button>
                    )}
                  </div>
                  <button
                    onClick={startCreate}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition"
                  >
                    <Plus size={14} />
                    <span>Add Profile</span>
                  </button>
                </div>

                {/* Animated Reorderable Account List */}
                <div className="space-y-2">
                  {accounts.map((acc, index) => (
                    <motion.div
                      key={acc.id}
                      layout
                      transition={{ duration: 0.18 }}
                      className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
                        acc.isDefault
                          ? 'bg-deck-bg-elevated border-amber-500/35 shadow-sm'
                          : 'bg-deck-bg-elevated/60 border-deck-bg-border hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Reorder Arrows */}
                        <div className="flex flex-col items-center justify-center -my-1 -ml-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleMove(acc.id, 'up')}
                            disabled={index === 0}
                            title="Move up"
                            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition"
                          >
                            <ChevronUp size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMove(acc.id, 'down')}
                            disabled={index === accounts.length - 1}
                            title="Move down"
                            className="p-1 rounded text-slate-400 hover:text-cyan-400 hover:bg-slate-800 disabled:opacity-20 disabled:hover:text-slate-400 disabled:hover:bg-transparent transition"
                          >
                            <ChevronDown size={14} />
                          </button>
                        </div>

                        {/* Avatar */}
                        <span
                          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm ring-2 ring-white/10 shrink-0"
                          style={{ backgroundColor: acc.avatarColor }}
                        >
                          {acc.avatarLetter || acc.name.charAt(0).toUpperCase()}
                        </span>

                        {/* Details */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-slate-100 truncate">
                              {acc.name}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 shrink-0">
                              authuser={acc.googleAuthUserIndex}
                            </span>
                            {acc.isDefault && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 shrink-0">
                                <Star size={10} className="fill-amber-300" />
                                <span>Default</span>
                              </span>
                            )}
                          </div>
                          {acc.email && (
                            <span className="text-xs text-slate-400 font-mono block truncate">
                              {acc.email}
                            </span>
                          )}
                          {acc.notes && (
                            <span className="text-xs text-slate-500 block mt-0.5 truncate">
                              {acc.notes}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Right Action Controls */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Make Default Button */}
                        {!acc.isDefault ? (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(acc.id)}
                            className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-amber-500/10 border border-slate-700 hover:border-amber-500/30 flex items-center gap-1.5 transition"
                            title="Set as Default Google Account"
                          >
                            <Star size={13} />
                            <span className="hidden sm:inline">Set Default</span>
                          </button>
                        ) : (
                          <span className="text-xs text-amber-400/90 font-medium px-2 py-1 flex items-center gap-1">
                            <Check size={13} />
                            <span className="hidden sm:inline">Active Default</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => startEdit(acc)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                          title="Edit profile"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(acc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition"
                          title="Delete profile"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
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
                      <option value={0}>0 (1st signed-in / browser default account)</option>
                      <option value={1}>1 (2nd signed-in account)</option>
                      <option value={2}>2 (3rd signed-in account)</option>
                      <option value={3}>3 (4th signed-in account)</option>
                      <option value={4}>4 (5th signed-in account)</option>
                      <option value={5}>5 (6th signed-in account)</option>
                    </select>
                  </div>
                </div>

                {/* Make Default Toggle */}
                <div className="p-3 rounded-lg bg-deck-bg-elevated/80 border border-deck-bg-border flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    id="isDefaultAccount"
                    checked={isDefault}
                    onChange={e => setIsDefault(e.target.checked)}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-500 bg-slate-900 border-slate-700 cursor-pointer"
                  />
                  <label htmlFor="isDefaultAccount" className="text-xs text-slate-200 cursor-pointer flex items-center gap-1.5">
                    <Star size={13} className={isDefault ? 'fill-amber-400 text-amber-400' : 'text-slate-400'} />
                    <span>Set as Default Google Account</span>
                  </label>
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
