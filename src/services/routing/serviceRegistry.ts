import type { ServiceDefinition } from '../../core/types';

export const KNOWN_SERVICES: ServiceDefinition[] = [
  // Google Developer & Cloud Consoles
  {
    id: 'google_play_console',
    name: 'Google Play Console',
    domains: ['play.google.com'],
    pathPatterns: [/^\/console/i],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'Smartphone',
    brandColor: '#00875A',
    category: 'developer',
    docsUrl: 'https://support.google.com/googleplay/android-developer',
    consoleUrlTemplate: 'https://play.google.com/console'
  },
  {
    id: 'firebase_console',
    name: 'Firebase Console',
    domains: ['console.firebase.google.com', 'firebase.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'Flame',
    brandColor: '#FFCA28',
    category: 'cloud',
    docsUrl: 'https://firebase.google.com/docs',
    consoleUrlTemplate: 'https://console.firebase.google.com'
  },
  {
    id: 'google_cloud_console',
    name: 'Google Cloud Console',
    domains: ['console.cloud.google.com', 'cloud.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_AUTHUSER',
    iconName: 'Cloud',
    brandColor: '#4285F4',
    category: 'cloud',
    docsUrl: 'https://cloud.google.com/docs',
    consoleUrlTemplate: 'https://console.cloud.google.com'
  },
  {
    id: 'google_admob',
    name: 'Google AdMob',
    domains: ['admob.google.com', 'apps.admob.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_AUTHUSER',
    iconName: 'Coins',
    brandColor: '#EA4335',
    category: 'monetization',
    docsUrl: 'https://support.google.com/admob',
    consoleUrlTemplate: 'https://admob.google.com/home'
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    domains: ['analytics.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_AUTHUSER',
    iconName: 'BarChart2',
    brandColor: '#E37400',
    category: 'analytics',
    docsUrl: 'https://support.google.com/analytics',
    consoleUrlTemplate: 'https://analytics.google.com/analytics/web/'
  },
  {
    id: 'google_search_console',
    name: 'Google Search Console',
    domains: ['search.google.com'],
    pathPatterns: [/^\/search-console/i],
    defaultStrategy: 'GOOGLE_AUTHUSER',
    iconName: 'Search',
    brandColor: '#34A853',
    category: 'analytics',
    docsUrl: 'https://support.google.com/webmasters',
    consoleUrlTemplate: 'https://search.google.com/search-console'
  },

  // Google Productivity & Media
  {
    id: 'gmail',
    name: 'Gmail',
    domains: ['mail.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'Mail',
    brandColor: '#EA4335',
    category: 'productivity',
    consoleUrlTemplate: 'https://mail.google.com/mail'
  },
  {
    id: 'google_drive',
    name: 'Google Drive',
    domains: ['drive.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'HardDrive',
    brandColor: '#34A853',
    category: 'productivity',
    consoleUrlTemplate: 'https://drive.google.com'
  },
  {
    id: 'google_calendar',
    name: 'Google Calendar',
    domains: ['calendar.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'Calendar',
    brandColor: '#4285F4',
    category: 'productivity',
    consoleUrlTemplate: 'https://calendar.google.com'
  },
  {
    id: 'google_photos',
    name: 'Google Photos',
    domains: ['photos.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'Image',
    brandColor: '#4285F4',
    category: 'media',
    consoleUrlTemplate: 'https://photos.google.com'
  },
  {
    id: 'google_docs',
    name: 'Google Docs',
    domains: ['docs.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'FileText',
    brandColor: '#4285F4',
    category: 'productivity',
    consoleUrlTemplate: 'https://docs.google.com'
  },
  {
    id: 'google_keep',
    name: 'Google Keep',
    domains: ['keep.google.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'CheckSquare',
    brandColor: '#FBBC04',
    category: 'productivity',
    consoleUrlTemplate: 'https://keep.google.com'
  },

  // AI & LLM Assistants
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    domains: ['chatgpt.com', 'chat.openai.com', 'openai.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Sparkles',
    brandColor: '#10A37F',
    category: 'ai',
    consoleUrlTemplate: 'https://chatgpt.com'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    domains: ['gemini.google.com', 'bard.google.com'],
    defaultStrategy: 'GOOGLE_U_PATH',
    iconName: 'Sparkles',
    brandColor: '#1BA1E3',
    category: 'ai',
    consoleUrlTemplate: 'https://gemini.google.com'
  },
  {
    id: 'claude',
    name: 'Claude',
    domains: ['claude.ai', 'anthropic.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Sparkles',
    brandColor: '#D97706',
    category: 'ai',
    consoleUrlTemplate: 'https://claude.ai'
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    domains: ['perplexity.ai'],
    defaultStrategy: 'DIRECT',
    iconName: 'Search',
    brandColor: '#20B2AA',
    category: 'ai',
    consoleUrlTemplate: 'https://perplexity.ai'
  },

  // Developer Platforms & Utilities
  {
    id: 'github',
    name: 'GitHub',
    domains: ['github.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'GitBranch',
    brandColor: '#24292F',
    category: 'developer',
    consoleUrlTemplate: 'https://github.com'
  },
  {
    id: 'vercel',
    name: 'Vercel',
    domains: ['vercel.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Triangle',
    brandColor: '#000000',
    category: 'cloud',
    consoleUrlTemplate: 'https://vercel.com/dashboard'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    domains: ['supabase.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Database',
    brandColor: '#3ECF8E',
    category: 'cloud',
    consoleUrlTemplate: 'https://supabase.com/dashboard'
  },
  {
    id: 'linear',
    name: 'Linear',
    domains: ['linear.app'],
    defaultStrategy: 'DIRECT',
    iconName: 'CheckSquare',
    brandColor: '#5E6AD2',
    category: 'developer',
    consoleUrlTemplate: 'https://linear.app'
  },
  {
    id: 'sentry',
    name: 'Sentry',
    domains: ['sentry.io'],
    defaultStrategy: 'DIRECT',
    iconName: 'AlertTriangle',
    brandColor: '#362D59',
    category: 'developer',
    consoleUrlTemplate: 'https://sentry.io'
  },
  {
    id: 'revenuecat',
    name: 'RevenueCat',
    domains: ['app.revenuecat.com', 'revenuecat.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Receipt',
    brandColor: '#E84545',
    category: 'monetization',
    docsUrl: 'https://www.revenuecat.com/docs',
    consoleUrlTemplate: 'https://app.revenuecat.com'
  },
  {
    id: 'leetcode',
    name: 'LeetCode',
    domains: ['leetcode.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Code',
    brandColor: '#FFA116',
    category: 'developer',
    consoleUrlTemplate: 'https://leetcode.com'
  },
  {
    id: 'neetcode',
    name: 'NeetCode',
    domains: ['neetcode.io'],
    defaultStrategy: 'DIRECT',
    iconName: 'Code',
    brandColor: '#10B981',
    category: 'developer',
    consoleUrlTemplate: 'https://neetcode.io'
  },
  {
    id: 'geeksforgeeks',
    name: 'GeeksforGeeks',
    domains: ['geeksforgeeks.org'],
    defaultStrategy: 'DIRECT',
    iconName: 'BookOpen',
    brandColor: '#2F8D46',
    category: 'developer',
    consoleUrlTemplate: 'https://www.geeksforgeeks.org'
  },
  {
    id: 'wakatime',
    name: 'WakaTime',
    domains: ['wakatime.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Clock',
    brandColor: '#00C3FF',
    category: 'developer',
    consoleUrlTemplate: 'https://wakatime.com'
  },
  {
    id: 'overleaf',
    name: 'Overleaf',
    domains: ['overleaf.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'FileText',
    brandColor: '#439539',
    category: 'developer',
    consoleUrlTemplate: 'https://www.overleaf.com'
  },

  // Design & Media
  {
    id: 'canva',
    name: 'Canva',
    domains: ['canva.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Palette',
    brandColor: '#00C4CC',
    category: 'design',
    consoleUrlTemplate: 'https://www.canva.com'
  },
  {
    id: 'figma',
    name: 'Figma',
    domains: ['figma.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Figma',
    brandColor: '#F24E1E',
    category: 'design',
    consoleUrlTemplate: 'https://www.figma.com'
  },
  {
    id: 'youtube_studio',
    name: 'YouTube Studio',
    domains: ['studio.youtube.com'],
    defaultStrategy: 'GOOGLE_AUTHUSER',
    iconName: 'Video',
    brandColor: '#FF0000',
    category: 'media',
    consoleUrlTemplate: 'https://studio.youtube.com'
  },
  {
    id: 'youtube',
    name: 'YouTube',
    domains: ['youtube.com'],
    pathPatterns: [/^(?!\/studio)/],
    defaultStrategy: 'GOOGLE_AUTHUSER',
    iconName: 'Play',
    brandColor: '#FF0000',
    category: 'media',
    consoleUrlTemplate: 'https://youtube.com'
  },
  {
    id: 'spotify',
    name: 'Spotify',
    domains: ['spotify.com', 'open.spotify.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Music',
    brandColor: '#1DB954',
    category: 'media',
    consoleUrlTemplate: 'https://open.spotify.com'
  },

  // Social & Communication
  {
    id: 'discord',
    name: 'Discord',
    domains: ['discord.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'MessageSquare',
    brandColor: '#5865F2',
    category: 'social',
    consoleUrlTemplate: 'https://discord.com/app'
  },
  {
    id: 'slack',
    name: 'Slack',
    domains: ['slack.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'MessageCircle',
    brandColor: '#4A154B',
    category: 'social',
    consoleUrlTemplate: 'https://slack.com'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    domains: ['web.whatsapp.com', 'whatsapp.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'MessageCircle',
    brandColor: '#25D366',
    category: 'social',
    consoleUrlTemplate: 'https://web.whatsapp.com'
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    domains: ['linkedin.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Linkedin',
    brandColor: '#0A66C2',
    category: 'social',
    consoleUrlTemplate: 'https://www.linkedin.com'
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    domains: ['x.com', 'twitter.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Twitter',
    brandColor: '#000000',
    category: 'social',
    consoleUrlTemplate: 'https://x.com'
  },
  {
    id: 'reddit',
    name: 'Reddit',
    domains: ['reddit.com'],
    defaultStrategy: 'DIRECT',
    iconName: 'Share2',
    brandColor: '#FF4500',
    category: 'social',
    consoleUrlTemplate: 'https://www.reddit.com'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    domains: ['web.telegram.org', 'telegram.org'],
    defaultStrategy: 'DIRECT',
    iconName: 'Send',
    brandColor: '#24A1DE',
    category: 'social',
    consoleUrlTemplate: 'https://web.telegram.org'
  },

  // Productivity & Shopping & General
  {
    id: 'notion',
    name: 'Notion',
    domains: ['notion.so'],
    defaultStrategy: 'DIRECT',
    iconName: 'FileText',
    brandColor: '#000000',
    category: 'productivity',
    consoleUrlTemplate: 'https://notion.so'
  },
  {
    id: 'amazon',
    name: 'Amazon',
    domains: ['amazon.com', 'amazon.in', 'amazon.co.uk'],
    defaultStrategy: 'DIRECT',
    iconName: 'ShoppingBag',
    brandColor: '#FF9900',
    category: 'shopping',
    consoleUrlTemplate: 'https://www.amazon.com'
  }
];

export function detectService(rawUrl: string): ServiceDefinition | undefined {
  try {
    const parsed = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname;

    for (const service of KNOWN_SERVICES) {
      const hostMatch = service.domains.some(d => host === d || host.endsWith('.' + d));
      if (!hostMatch) continue;

      if (!service.pathPatterns || service.pathPatterns.length === 0) {
        return service;
      }

      const pathMatch = service.pathPatterns.some(pattern => pattern.test(pathname));
      if (pathMatch) {
        return service;
      }
    }

    // Generic Google check
    if (host.endsWith('google.com')) {
      return {
        id: 'google_generic',
        name: 'Google Service',
        domains: ['google.com'],
        defaultStrategy: 'GOOGLE_AUTHUSER',
        iconName: 'Globe',
        brandColor: '#4285F4',
        category: 'general'
      };
    }
  } catch {
    // Malformed URL
  }
  return undefined;
}

export function getServiceById(id: string): ServiceDefinition | undefined {
  return KNOWN_SERVICES.find(s => s.id === id);
}

