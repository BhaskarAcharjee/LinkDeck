import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles } from 'lucide-react';
import { GoogleAccountRouter } from '../../services/routing/GoogleAccountRouter';
import { UrlNormalizer } from '../../services/routing/urlNormalizer';

interface PasteHandlerProps {
  onAddFromPaste: (url: string) => void;
}

export const PasteHandler: React.FC<PasteHandlerProps> = ({ onAddFromPaste }) => {
  const [pastedUrl, setPastedUrl] = useState<string | null>(null);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignore if user is currently focused on an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      const text = e.clipboardData?.getData('text')?.trim();
      if (text && GoogleAccountRouter.isValidUrl(text)) {
        setPastedUrl(text);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  if (!pastedUrl) return null;

  const domain = UrlNormalizer.getDomain(pastedUrl);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 max-w-md bg-deck-bg-card border border-cyan-500/50 shadow-glow-cyan rounded-xl p-4 flex items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-cyan-400" />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-white block">Add link to LinkDeck?</span>
            <span className="text-[11px] text-cyan-300/80 font-mono truncate block max-w-[220px]">
              {domain || pastedUrl}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              onAddFromPaste(pastedUrl);
              setPastedUrl(null);
            }}
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs flex items-center gap-1.5 transition shadow"
          >
            <Plus size={14} />
            <span>Add</span>
          </button>
          <button
            onClick={() => setPastedUrl(null)}
            className="p-1 rounded-md text-slate-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
