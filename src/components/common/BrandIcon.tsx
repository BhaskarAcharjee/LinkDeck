import React from 'react';
import { Globe } from 'lucide-react';

interface BrandIconProps {
  serviceId?: string;
  domain?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showGlow?: boolean;
}

export const BrandIcon: React.FC<BrandIconProps> = ({
  serviceId,
  domain,
  className = '',
  size = 'md',
  showGlow = false
}) => {
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Render Crisp Vector SVGs for Recognized Services
  const renderSvg = () => {
    switch (serviceId) {
      case 'chatgpt':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a4 4 0 0 0-4 4v1.5a4 4 0 0 0-2.5 1.5 4 4 0 0 0 .5 5.5A4 4 0 0 0 6 18v1.5a4 4 0 0 0 4 4 4 4 0 0 0 4-2.5 4 4 0 0 0 5.5.5 4 4 0 0 0 1.5-2.5 4 4 0 0 0-1.5-5.5 4 4 0 0 0 0-4 4 4 0 0 0-4-4V4a4 4 0 0 0-4-2z" stroke="#10A37F" />
            <circle cx="12" cy="12" r="2.5" fill="#10A37F" />
          </svg>
        );

      case 'gemini':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C12 7.52 7.52 12 2 12C7.52 12 12 16.48 12 22C12 16.48 16.48 12 22 12C16.48 12 12 7.52 12 2Z"
              fill="url(#gemini-grad)"
            />
            <defs>
              <linearGradient id="gemini-grad" x1="2" y1="2" x2="22" y2="22" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1BA1E3" />
                <stop offset="0.5" stopColor="#9B72CB" />
                <stop offset="1" stopColor="#D96570" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'claude':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#D97706">
            <path d="M13.8 3.5l3.2 17h-2.9l-.7-4.1H9.8l-.7 4.1H6.2l3.2-17h4.4zm-1.8 3.6l-1.7 6.8h3.3l-1.6-6.8z" />
          </svg>
        );

      case 'perplexity':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none" stroke="#20B2AA" strokeWidth="2.5">
            <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M4.93 19.07l14.14-14.14" strokeLinecap="round" />
            <circle cx="12" cy="12" r="3" fill="#20B2AA" stroke="none" />
          </svg>
        );

      case 'google_play_console':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M3.6 2.5a1.5 1.5 0 0 0-.6 1.2v16.6a1.5 1.5 0 0 0 .6 1.2l9.4-9.5-9.4-9.5z" fill="#00C3FF" />
            <path d="M16.5 8.9L13 12l3.5 3.1 3.9-2.2c1.3-.7 1.3-1.9 0-2.6l-3.9-1.4z" fill="#FFD200" />
            <path d="M3.6 21.5l9.4-9.5 3.5 3.1-8.5 4.9c-1.8 1-3.6.5-4.4-1.5z" fill="#FF334B" />
            <path d="M3.6 2.5C4.4.5 6.2 0 8 1l8.5 4.9-3.5 3.1-9.4-9.5z" fill="#00E676" />
          </svg>
        );

      case 'firebase_console':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M4.6 17.6l2.1-13.3a1 1 0 0 1 1.9-.3l3.2 6-7.2 7.6z" fill="#FFA000" />
            <path d="M15.5 8.5l-3.7-7a1 1 0 0 0-1.8 0L3.8 17.7l11.7-9.2z" fill="#F57C00" />
            <path d="M20.2 17.6L16.8 4.7a1 1 0 0 0-1.9-.2L3.8 17.7 11.2 22a1.8 1.8 0 0 0 1.6 0l7.4-4.4z" fill="#FFCA28" />
          </svg>
        );

      case 'google_cloud_console':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" fill="#4285F4" />
          </svg>
        );

      case 'google_admob':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="3" width="18" height="18" rx="4" fill="#EA4335" />
            <circle cx="12" cy="12" r="5" fill="#FFCA28" />
            <rect x="7" y="10" width="10" height="4" rx="2" fill="#4285F4" />
          </svg>
        );

      case 'google_analytics':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#E37400">
            <rect x="4" y="14" width="3.5" height="7" rx="1.5" />
            <rect x="10.25" y="9" width="3.5" height="12" rx="1.5" />
            <rect x="16.5" y="4" width="3.5" height="17" rx="1.5" />
          </svg>
        );

      case 'google_search_console':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="#34A853" strokeWidth="2.5" />
            <path d="M20 20l-4.2-4.2" stroke="#4285F4" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M8 11h6M11 8v6" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );

      case 'gmail':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M2 5.5V19a2 2 0 0 0 2 2h2V9.5l6 4.5 6-4.5V21h2a2 2 0 0 0 2-2V5.5c0-1.8-2-2.8-3.4-1.7L12 8.7 3.4 3.8C2 2.7 2 3.7 2 5.5z" fill="#EA4335" />
            <path d="M4 21V9.5l8 6 8-6V21H4z" fill="#C5221F" />
          </svg>
        );

      case 'google_drive':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M8 2l4.5 7.8H21L16.5 2H8z" fill="#FFC107" />
            <path d="M2.5 19.5L7 11.7l4.5 7.8H2.5z" fill="#2196F3" />
            <path d="M7 11.7L11.5 19.5H21l-4.5-7.8H7z" fill="#4CAF50" />
          </svg>
        );

      case 'google_calendar':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <rect x="3" y="4" width="18" height="17" rx="3" fill="#4285F4" />
            <path d="M3 9h18" stroke="#FFFFFF" strokeWidth="2" />
            <rect x="7" y="2" width="2" height="4" rx="1" fill="#EA4335" />
            <rect x="15" y="2" width="2" height="4" rx="1" fill="#EA4335" />
            <text x="12" y="17" fill="#FFFFFF" fontSize="7" fontWeight="bold" textAnchor="middle">31</text>
          </svg>
        );

      case 'google_photos':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="8" r="4" fill="#EA4335" />
            <circle cx="16" cy="8" r="4" fill="#FBBC04" />
            <circle cx="16" cy="16" r="4" fill="#34A853" />
            <circle cx="8" cy="16" r="4" fill="#4285F4" />
          </svg>
        );

      case 'google_docs':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#4285F4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4zm3 14H8v-2h8v2zm0-4H8v-2h8v2z" />
          </svg>
        );

      case 'google_keep':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#FBBC04">
            <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z" />
          </svg>
        );

      case 'youtube':
      case 'youtube_studio':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#FF0000">
            <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1 31.5 31.5 0 0 0 .5-5.8 31.5 31.5 0 0 0-.5-5.8zM9.5 15.5V8.5l6.5 3.5-6.5 3.5z" />
          </svg>
        );

      case 'github':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="currentColor">
            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
          </svg>
        );

      case 'canva':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="11" fill="url(#canva-grad)" />
            <path d="M12.8 16.5c-2.8 0-4.5-1.9-4.5-4.5 0-2.8 2-4.5 4.8-4.5 1.4 0 2.6.5 3.3 1.2l-1.3 1.5c-.6-.5-1.3-.8-2-.8-1.5 0-2.4 1.1-2.4 2.6 0 1.4.9 2.5 2.4 2.5.8 0 1.6-.3 2.1-.9l1.2 1.4c-.9 1-2.1 1.5-3.6 1.5z" fill="#FFFFFF" />
            <defs>
              <linearGradient id="canva-grad" x1="2" y1="2" x2="22" y2="22">
                <stop stopColor="#00C4CC" />
                <stop offset="1" stopColor="#7D2AE8" />
              </linearGradient>
            </defs>
          </svg>
        );

      case 'figma':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M8 24c2.2 0 4-1.8 4-4v-4H8c-2.2 0-4 1.8-4 4s1.8 4 4 4z" fill="#0ACF83" />
            <path d="M4 12c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#A259FF" />
            <path d="M4 4c0-2.2 1.8-4 4-4h4v8H8c-2.2 0-4-1.8-4-4z" fill="#F24E1E" />
            <path d="M12 0h4c2.2 0 4 1.8 4 4s-1.8 4-4 4h-4V0z" fill="#FF7262" />
            <circle cx="16" cy="12" r="4" fill="#1ABCFE" />
          </svg>
        );

      case 'discord':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#5865F2">
            <path d="M20.3 4.4A19.8 19.8 0 0 0 15.3 2.9a.1.1 0 0 0-.1.1 13.8 13.8 0 0 0-.6 1.3 18.3 18.3 0 0 0-5.3 0 12.3 12.3 0 0 0-.6-1.3.1.1 0 0 0-.1-.1 19.7 19.7 0 0 0-5 1.5.1.1 0 0 0-.1.1C1 9.9 1.7 15.2 2.6 20.4a.1.1 0 0 0 .1.1 19.9 19.9 0 0 0 6 3 .1.1 0 0 0 .1 0c.5-.6.9-1.3 1.3-2a.1.1 0 0 0-.1-.1 13.1 13.1 0 0 1-1.9-.9.1.1 0 0 1 0-.2c.1-.1.3-.2.4-.3a14.2 14.2 0 0 0 12.2 0c.1.1.3.2.4.3a.1.1 0 0 1 0 .2c-.6.3-1.2.6-1.8.9a.1.1 0 0 0-.1.1c.4.7.8 1.4 1.3 2a.1.1 0 0 0 .1 0 19.8 19.8 0 0 0 6.1-3 .1.1 0 0 0 .1-.1c1-5.7.3-11-2.4-16.1a.1.1 0 0 0-.1 0zM8.5 15.8c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5c1.3 0 2.3 1.1 2.2 2.5 0 1.4-1 2.5-2.2 2.5zm7 0c-1.2 0-2.2-1.1-2.2-2.5s1-2.5 2.2-2.5c1.3 0 2.3 1.1 2.2 2.5 0 1.4-1 2.5-2.2 2.5z" />
          </svg>
        );

      case 'slack':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M5.5 10.5a2.5 2.5 0 0 1-2.5-2.5v-5a2.5 2.5 0 0 1 5 0v5a2.5 2.5 0 0 1-2.5 2.5z" fill="#36C5F0" />
            <path d="M8 8a2.5 2.5 0 0 1 2.5-2.5h5a2.5 2.5 0 0 1 0 5h-5A2.5 2.5 0 0 1 8 8z" fill="#2EB67D" />
            <path d="M18.5 13.5a2.5 2.5 0 0 1 2.5 2.5v5a2.5 2.5 0 0 1-5 0v-5a2.5 2.5 0 0 1 2.5-2.5z" fill="#ECB22E" />
            <path d="M16 16a2.5 2.5 0 0 1-2.5 2.5h-5a2.5 2.5 0 0 1 0-5h5A2.5 2.5 0 0 1 16 16z" fill="#E01E5A" />
          </svg>
        );

      case 'whatsapp':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#25D366">
            <path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.5 5.5 5.6-1.5A9.9 9.9 0 1 0 12 2zm5.7 14c-.2.6-1.3 1.2-1.8 1.2-.5 0-1.1.2-3.7-.8-3.1-1.3-5-4.4-5.2-4.6-.2-.2-1.3-1.7-1.3-3.2s.8-2.3 1.1-2.6c.3-.3.6-.4.9-.4h.6c.2 0 .4 0 .6.5.2.5.8 1.9.8 2 0 .2 0 .4-.1.6-.1.2-.2.3-.4.5-.2.2-.4.4-.2.7.5 1 1.2 1.8 2.2 2.5.8.5 1.5.8 1.9 1 .3.1.5.1.7-.1.2-.3.9-1 1.1-1.4.2-.3.5-.3.8-.2.3.1 1.9.9 2.2 1.1.3.2.5.3.6.4.1.3.1 1.1-.1 1.7z" />
          </svg>
        );

      case 'linkedin':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#0A66C2">
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3c0-2.8-1.5-4.1-3.5-4.1-1.6 0-2.3.9-2.7 1.5v-1.3H9.5v9.2h2.8v-5.1c0-1.3.3-2.6 1.9-2.6 1.6 0 1.6 1.5 1.6 2.7v5h2.7M6.7 7.7a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2m1.4 10.8V9.3H5.3v9.2h2.8z" />
          </svg>
        );

      case 'twitter':
      case 'x':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );

      case 'reddit':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#FF4500">
            <circle cx="12" cy="12" r="10" />
            <circle cx="9" cy="12" r="1.5" fill="#FFFFFF" />
            <circle cx="15" cy="12" r="1.5" fill="#FFFFFF" />
            <path d="M9 15.5c1 1 5 1 6 0" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        );

      case 'amazon':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <text x="12" y="13" fill="currentColor" fontSize="11" fontWeight="900" textAnchor="middle">a</text>
            <path d="M5 16c4 3 10 3 14 0" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
            <path d="M19 16l-2 1" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );

      case 'telegram':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#24A1DE">
            <circle cx="12" cy="12" r="11" />
            <path d="M5.5 11.5l12.5-5-3.5 12-3.5-3-2-2v-2l5-4-6.5 4" fill="#FFFFFF" />
          </svg>
        );

      case 'spotify':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#1DB954">
            <circle cx="12" cy="12" r="11" />
            <path d="M7 9.5c3.5-1 7.5-.5 10 1M7.5 12.5c3-.8 6-.4 8.5.8M8 15.5c2.5-.5 5 0 7 1" stroke="#000000" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        );

      case 'notion':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="currentColor">
            <rect x="3" y="3" width="18" height="18" rx="3" fill="#000000" />
            <text x="12" y="17" fill="#FFFFFF" fontSize="13" fontWeight="900" textAnchor="middle">N</text>
          </svg>
        );

      case 'vercel':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L24 22H0L12 2Z" />
          </svg>
        );

      case 'supabase':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M13.8 22.8c-.8 1-2.4.4-2.3-1l.7-8.3H3.8c-1.3 0-2-1.6-1.1-2.6L12.5.6c.8-1 2.4-.4 2.3 1l-.7 8.3h8.4c1.3 0 2 1.6 1.1 2.6l-9.8 10.3z" fill="#3ECF8E" />
          </svg>
        );

      case 'leetcode':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="none">
            <path d="M16 4l-7 7 7 7" stroke="#FFA116" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M11 12h9" stroke="#555" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        );

      case 'overleaf':
        return (
          <svg className={currentSize} viewBox="0 0 24 24" fill="#439539">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 4c-3 4-3 10 0 14 3-4 3-10 0-14z" fill="#FFFFFF" />
          </svg>
        );

      default:
        return null;
    }
  };

  const svgElement = renderSvg();

  if (svgElement) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
        {showGlow && (
          <div className="absolute inset-0 bg-primary/20 blur-md rounded-full -z-10 animate-pulse-slow" />
        )}
        {svgElement}
      </div>
    );
  }

  // Fallback 1: Domain-based Google Favicon API
  if (domain) {
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    return (
      <img
        src={faviconUrl}
        alt={domain}
        className={`${currentSize} rounded object-contain shrink-0 ${className}`}
        onError={(e) => {
          (e.target as HTMLElement).style.display = 'none';
        }}
      />
    );
  }

  // Fallback 2: Generic category glyph
  return (
    <div className={`flex items-center justify-center shrink-0 rounded-lg bg-slate-800/80 text-slate-400 ${currentSize} ${className}`}>
      <Globe className="w-4 h-4" />
    </div>
  );
};
