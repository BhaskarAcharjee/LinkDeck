import type { ServiceDefinition } from '../../core/types';

export const KNOWN_SERVICES: ServiceDefinition[] = [
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
    id: 'revenuecat',
    name: 'RevenueCat',
    domains: ['app.revenuecat.com', 'revenuecat.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'DIRECT',
    iconName: 'Receipt',
    brandColor: '#E84545',
    category: 'monetization',
    docsUrl: 'https://www.revenuecat.com/docs',
    consoleUrlTemplate: 'https://app.revenuecat.com'
  },
  {
    id: 'github',
    name: 'GitHub',
    domains: ['github.com'],
    pathPatterns: [/.*/],
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
    pathPatterns: [/.*/],
    defaultStrategy: 'DIRECT',
    iconName: 'Triangle',
    brandColor: '#000000',
    category: 'cloud',
    consoleUrlTemplate: 'https://vercel.com/dashboard'
  },
  {
    id: 'figma',
    name: 'Figma',
    domains: ['figma.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'DIRECT',
    iconName: 'Figma',
    brandColor: '#F24E1E',
    category: 'design',
    consoleUrlTemplate: 'https://www.figma.com'
  },
  {
    id: 'linear',
    name: 'Linear',
    domains: ['linear.app'],
    pathPatterns: [/.*/],
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
    pathPatterns: [/.*/],
    defaultStrategy: 'DIRECT',
    iconName: 'AlertTriangle',
    brandColor: '#362D59',
    category: 'developer',
    consoleUrlTemplate: 'https://sentry.io'
  },
  {
    id: 'supabase',
    name: 'Supabase',
    domains: ['supabase.com'],
    pathPatterns: [/.*/],
    defaultStrategy: 'DIRECT',
    iconName: 'Database',
    brandColor: '#3ECF8E',
    category: 'cloud',
    consoleUrlTemplate: 'https://supabase.com/dashboard'
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
