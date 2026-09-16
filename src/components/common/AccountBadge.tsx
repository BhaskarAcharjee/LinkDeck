import React from 'react';
import type { AccountProfile } from '../../core/types';

interface AccountBadgeProps {
  account?: AccountProfile;
  isAskEveryTime?: boolean;
  size?: 'sm' | 'md';
  showName?: boolean;
  className?: string;
}

export const AccountBadge: React.FC<AccountBadgeProps> = ({
  account,
  isAskEveryTime = false,
  size = 'sm',
  showName = false,
  className = ''
}) => {
  if (isAskEveryTime) {
    return (
      <span
        title="Open with: Ask Every Time"
        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium font-mono border border-amber-500/30 bg-amber-500/10 text-amber-300 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
        Ask
      </span>
    );
  }

  if (!account) {
    return null;
  }

  const badgeSize = size === 'sm' ? 'w-4 h-4 text-[10px]' : 'w-5 h-5 text-xs';

  return (
    <span
      title={`Open with: ${account.name} (authuser=${account.googleAuthUserIndex})`}
      className={`inline-flex items-center gap-1.5 ${className}`}
    >
      <span
        className={`${badgeSize} rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-1 ring-white/10`}
        style={{ backgroundColor: account.avatarColor }}
      >
        {account.avatarLetter || account.name.charAt(0).toUpperCase()}
      </span>
      {showName && (
        <span className="text-xs text-slate-300 font-medium truncate max-w-[120px]">
          {account.name}
        </span>
      )}
    </span>
  );
};
