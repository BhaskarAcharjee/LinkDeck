import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Globe } from 'lucide-react';
import type { AccountProfile, Bookmark } from '../../core/types';
import { ServiceIcon } from '../common/ServiceIcon';

interface AccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmark: Bookmark | null;
  accounts: AccountProfile[];
  onSelectAccount: (account?: AccountProfile) => void;
}

export const AccountPickerModal: React.FC<AccountPickerModalProps> = ({
  isOpen,
  onClose,
  bookmark,
  accounts,
  onSelectAccount
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Keyboard numbers 1, 2, 3...
      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= accounts.length) {
        e.preventDefault();
        onSelectAccount(accounts[num - 1]);
      } else if (e.key === '0') {
        e.preventDefault();
        onSelectAccount(undefined); // Browser default
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, accounts, onClose, onSelectAccount]);

  if (!isOpen || !bookmark) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-md bg-deck-bg-card border border-deck-bg-border rounded-xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-deck-bg-border bg-deck-bg-elevated/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <ServiceIcon url={bookmark.url} customFavicon={bookmark.favicon} size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white truncate max-w-[260px]">
                  {bookmark.title}
                </h3>
                <p className="text-[11px] text-slate-400">Choose Google Account to Launch</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Account Options List */}
          <div className="p-3 space-y-1.5 max-h-[380px] overflow-y-auto">
            {accounts.map((acc, idx) => {
              return (
                <button
                  key={acc.id}
                  onClick={() => onSelectAccount(acc)}
                  className="w-full text-left p-3 rounded-lg border border-transparent hover:border-cyan-500/40 hover:bg-slate-800/80 transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs ring-2 ring-white/10"
                      style={{ backgroundColor: acc.avatarColor }}
                    >
                      {acc.avatarLetter || acc.name.charAt(0).toUpperCase()}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-100 group-hover:text-cyan-300 transition">
                          {acc.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                          authuser={acc.googleAuthUserIndex}
                        </span>
                      </div>
                      {acc.email && (
                        <p className="text-xs text-slate-400 font-mono truncate max-w-[240px]">
                          {acc.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 border border-slate-700 text-slate-400 group-hover:text-cyan-300 group-hover:border-cyan-500/40">
                      {idx + 1}
                    </kbd>
                    <ExternalLink size={14} className="text-slate-500 group-hover:text-cyan-400 transition" />
                  </div>
                </button>
              );
            })}

            {/* Browser Default Option */}
            <button
              onClick={() => onSelectAccount(undefined)}
              className="w-full text-left p-3 rounded-lg border border-transparent hover:border-slate-600 hover:bg-slate-800/80 transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300">
                  <Globe size={16} />
                </span>
                <div>
                  <span className="text-sm font-medium text-slate-200 group-hover:text-white transition">
                    Browser Default Profile
                  </span>
                  <p className="text-xs text-slate-400">Open direct URL without account routing</p>
                </div>
              </div>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-slate-900 border border-slate-700 text-slate-400">
                0
              </kbd>
            </button>
          </div>

          <div className="p-3 bg-deck-bg-elevated/40 border-t border-deck-bg-border text-center">
            <span className="text-[11px] text-slate-500">
              Tip: Press <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">1</kbd>-
              <kbd className="px-1 py-0.5 bg-slate-800 rounded text-slate-300">{accounts.length}</kbd> to launch instantly
            </span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
