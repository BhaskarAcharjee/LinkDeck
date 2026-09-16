import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  FlaskConical,
  Info
} from 'lucide-react';
import type { AccountProfile } from '../../core/types';
import { GoogleAccountRouter } from '../../services/routing/GoogleAccountRouter';
import { detectService } from '../../services/routing/serviceRegistry';

interface AccountRoutingLabProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: AccountProfile[];
}

const PRESET_TEST_URLS = [
  { name: 'Google Play Console', url: 'https://play.google.com/console' },
  { name: 'Play Console App Page', url: 'https://play.google.com/console/developers/app/pencilate' },
  { name: 'Firebase Console', url: 'https://console.firebase.google.com/project/pencilate-prod' },
  { name: 'Google Cloud Console', url: 'https://console.cloud.google.com/apis/dashboard' },
  { name: 'Google AdMob', url: 'https://admob.google.com/home' },
  { name: 'Google Analytics 4', url: 'https://analytics.google.com/analytics/web/#/p123456789' },
  { name: 'Search Console', url: 'https://search.google.com/search-console' },
  { name: 'Gmail', url: 'https://mail.google.com/mail' },
  { name: 'Google Drive', url: 'https://drive.google.com/drive' },
  { name: 'Non-Google: RevenueCat', url: 'https://app.revenuecat.com/projects/pencilate' },
  { name: 'Non-Google: GitHub', url: 'https://github.com/developer/pencilate' }
];

export const AccountRoutingLab: React.FC<AccountRoutingLabProps> = ({
  isOpen,
  onClose,
  accounts
}) => {
  const [testUrl, setTestUrl] = useState('https://play.google.com/console');
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);
  const result = GoogleAccountRouter.resolve(testUrl, selectedAccount);
  const detectedService = detectService(testUrl);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.resolvedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTestOpen = () => {
    window.open(result.resolvedUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl bg-deck-bg-card border border-deck-bg-border rounded-2xl shadow-2xl overflow-hidden my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-deck-bg-border bg-deck-bg-elevated/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <FlaskConical size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  Account Routing Lab & Sandbox
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Live Engine
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Inspect and verify how LinkDeck transforms destination URLs for different Google profiles
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

          <div className="p-6 space-y-6">
            {/* Presets Bar */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Quick Preset Scenarios
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_TEST_URLS.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => setTestUrl(preset.url)}
                    className={`px-2.5 py-1 text-xs rounded-lg border font-mono transition ${
                      testUrl === preset.url
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'bg-deck-bg-elevated border-deck-bg-border text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Inputs: URL and Account */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Original Destination URL
                </label>
                <input
                  type="text"
                  value={testUrl}
                  onChange={e => setTestUrl(e.target.value)}
                  placeholder="https://play.google.com/console or custom Google URL"
                  className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3.5 py-2 text-xs text-white font-mono outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Account Profile
                </label>
                <select
                  value={selectedAccountId}
                  onChange={e => setSelectedAccountId(e.target.value)}
                  className="w-full bg-deck-bg-elevated border border-deck-bg-border focus:border-cyan-500 rounded-lg px-3 py-2 text-xs text-white outline-none transition"
                >
                  <option value="">Browser Default (No Routing)</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} [Index: {acc.googleAuthUserIndex}]
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Routing Transformation Pipeline */}
            <div className="p-5 rounded-xl bg-deck-bg-elevated/60 border border-deck-bg-border space-y-4">
              <div className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <Sparkles size={14} className="text-cyan-400" />
                <span>Routing Resolution Pipeline</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-deck-bg-card border border-deck-bg-border">
                  <span className="text-[11px] text-slate-400 block mb-1">Detected Provider</span>
                  <div className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: detectedService?.brandColor || '#64748B' }}
                    />
                    <span>{detectedService?.name || 'External Service'}</span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-deck-bg-card border border-deck-bg-border">
                  <span className="text-[11px] text-slate-400 block mb-1">Routing Strategy</span>
                  <div className="text-sm font-semibold text-cyan-300 font-mono">
                    {result.strategyApplied}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-deck-bg-card border border-deck-bg-border">
                  <span className="text-[11px] text-slate-400 block mb-1">Account Target</span>
                  <div className="text-sm font-semibold text-violet-300">
                    {selectedAccount ? `${selectedAccount.name} (${selectedAccount.googleAuthUserIndex})` : 'Default Profile'}
                  </div>
                </div>
              </div>

              {/* Resolved URL box */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-slate-400">
                  Resolved Launch URL
                </span>
                <div className="p-3 rounded-lg bg-slate-950 border border-cyan-500/30 font-mono text-xs text-cyan-300 break-all flex items-center justify-between gap-3">
                  <span>{result.resolvedUrl}</span>
                  <button
                    onClick={handleCopy}
                    title="Copy Resolved URL"
                    className="p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white shrink-0 transition"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Explanation note */}
              <div className="flex items-start gap-2 text-xs text-slate-400 bg-deck-bg-card/50 p-2.5 rounded-lg border border-deck-bg-border">
                <Info size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                <span>{result.routingExplanation}</span>
              </div>
            </div>

            {/* Test Open Button */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500">
                Opens in a new browser tab with your selected account context
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition"
                >
                  Close
                </button>
                <button
                  onClick={handleTestOpen}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold text-xs shadow-glow-cyan flex items-center gap-2 transition"
                >
                  <ExternalLink size={14} />
                  <span>Test Launch in Browser</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
