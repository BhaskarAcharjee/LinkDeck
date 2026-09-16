import Dexie, { type Table } from 'dexie';
import type { Bookmark, Project, Collection, AccountProfile, AppSettings } from '../types';

export class LinkDeckDatabase extends Dexie {
  bookmarks!: Table<Bookmark, string>;
  projects!: Table<Project, string>;
  collections!: Table<Collection, string>;
  accountProfiles!: Table<AccountProfile, string>;
  settings!: Table<AppSettings, string>;

  constructor() {
    super('LinkDeckDB');

    this.version(1).stores({
      bookmarks: 'id, url, cleanUrl, domain, projectId, projectStage, collectionId, accountProfileId, isFavorite, isPinned, isArchived, openCount, lastOpenedAt, createdAt, updatedAt, sortOrder, *tags',
      projects: 'id, name, slug, defaultAccountProfileId, sortOrder, createdAt',
      collections: 'id, name, slug, parentId, sortOrder, createdAt',
      accountProfiles: 'id, name, googleAuthUserIndex, isDefault, createdAt',
      settings: 'id'
    });
  }
}

export const db = new LinkDeckDatabase();

// Seed initial default accounts, collections, and settings if empty
export async function seedInitialDataIfNeeded(forceStarterPack = false): Promise<void> {
  const existingSettings = await db.settings.get('current');
  if (existingSettings && !forceStarterPack) {
    return;
  }

  const now = Date.now();

  // 1. Initial Account Profiles
  const defaultAccounts: AccountProfile[] = [
    {
      id: 'acc_dev',
      name: 'Developer Account',
      email: 'developer@gmail.com',
      googleAuthUserIndex: 1,
      avatarColor: '#06B6D4',
      avatarLetter: 'D',
      provider: 'google',
      isDefault: false,
      notes: 'Primary Google Play Console, Firebase, and AdMob account',
      createdAt: now
    },
    {
      id: 'acc_personal',
      name: 'Personal Account',
      email: 'personal@gmail.com',
      googleAuthUserIndex: 0,
      avatarColor: '#8B5CF6',
      avatarLetter: 'P',
      provider: 'google',
      isDefault: true,
      notes: 'Default browser account (authuser=0)',
      createdAt: now
    },
    {
      id: 'acc_work',
      name: 'Work / Secondary',
      email: 'work@organization.com',
      googleAuthUserIndex: 2,
      avatarColor: '#10B981',
      avatarLetter: 'W',
      provider: 'google',
      isDefault: false,
      notes: 'Client / Work Google Console',
      createdAt: now
    }
  ];

  // 2. Initial Collections
  const defaultCollections: Collection[] = [
    {
      id: 'col_dev',
      name: 'Development & Code',
      slug: 'development',
      icon: 'Code2',
      color: '#06B6D4',
      isSystem: true,
      sortOrder: 1,
      createdAt: now
    },
    {
      id: 'col_android',
      name: 'Android & Mobile',
      slug: 'android',
      icon: 'Smartphone',
      color: '#10B981',
      isSystem: true,
      sortOrder: 2,
      createdAt: now
    },
    {
      id: 'col_cloud',
      name: 'Cloud & Consoles',
      slug: 'cloud',
      icon: 'Cloud',
      color: '#3B82F6',
      isSystem: true,
      sortOrder: 3,
      createdAt: now
    },
    {
      id: 'col_monetization',
      name: 'Monetization & Ads',
      slug: 'monetization',
      icon: 'Coins',
      color: '#F59E0B',
      isSystem: true,
      sortOrder: 4,
      createdAt: now
    },
    {
      id: 'col_analytics',
      name: 'Analytics & Growth',
      slug: 'analytics',
      icon: 'BarChart3',
      color: '#EC4899',
      isSystem: true,
      sortOrder: 5,
      createdAt: now
    },
    {
      id: 'col_ai',
      name: 'AI & Machine Learning',
      slug: 'ai',
      icon: 'Sparkles',
      color: '#8B5CF6',
      isSystem: true,
      sortOrder: 6,
      createdAt: now
    },
    {
      id: 'col_design',
      name: 'Design & Assets',
      slug: 'design',
      icon: 'Palette',
      color: '#A855F7',
      isSystem: true,
      sortOrder: 7,
      createdAt: now
    }
  ];

  if (!forceStarterPack) {
    // Fresh run: Only seed accounts, collections, and default settings.
    // Do NOT seed bookmarks or projects so LinkDeck opens to the clean default welcome screen.
    await db.transaction('rw', [db.accountProfiles, db.collections, db.settings], async () => {
      await db.accountProfiles.bulkPut(defaultAccounts);
      await db.collections.bulkPut(defaultCollections);
      await db.settings.put({
        id: 'current',
        theme: 'dark',
        defaultGoogleAccountProfileId: 'acc_dev',
        defaultOpenInNewTab: true,
        showHealthBadges: true,
        compactView: false,
        searchIncludeNotes: true,
        keyboardShortcutsEnabled: true,
        starterPackLoaded: false
      });
    });
    return;
  }

  // 3. Starter Sample Projects (Loaded ONLY when user clicks "Developer Starter Pack")
  const starterProjects: Project[] = [
    {
      id: 'proj_mobile_app',
      name: 'Mobile App Workspace',
      slug: 'mobile-app',
      description: 'Android & multiplatform app developer workspace',
      color: '#06B6D4',
      icon: 'Smartphone',
      defaultAccountProfileId: 'acc_dev',
      tags: ['android', 'kotlin', 'mobile'],
      sortOrder: 1,
      createdAt: now,
      updatedAt: now
    }
  ];

  // 4. Starter Bookmarks (Loaded ONLY when user clicks "Developer Starter Pack")
  const starterBookmarks: Bookmark[] = [
    // Top Quick Launch shortcuts
    {
      id: 'bm_play_console',
      title: 'Google Play Console',
      url: 'https://play.google.com/console',
      cleanUrl: 'https://play.google.com/console',
      domain: 'play.google.com',
      description: 'Publish and monitor Android apps on Google Play',
      collectionId: 'col_android',
      accountProfileId: 'acc_dev',
      tags: ['google', 'android', 'store', 'distribution'],
      isFavorite: true,
      isPinned: true,
      isArchived: false,
      openCount: 42,
      lastOpenedAt: now - 3600000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 1,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_firebase',
      title: 'Firebase Console',
      url: 'https://console.firebase.google.com',
      cleanUrl: 'https://console.firebase.google.com',
      domain: 'console.firebase.google.com',
      description: 'Firebase backend, Auth, Firestore, and Crashlytics',
      collectionId: 'col_cloud',
      accountProfileId: 'acc_dev',
      tags: ['google', 'backend', 'crashlytics', 'database'],
      isFavorite: true,
      isPinned: true,
      isArchived: false,
      openCount: 38,
      lastOpenedAt: now - 7200000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 2,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_admob',
      title: 'Google AdMob',
      url: 'https://admob.google.com/home',
      cleanUrl: 'https://admob.google.com/home',
      domain: 'admob.google.com',
      description: 'Mobile app monetization, banners, rewarded ads',
      collectionId: 'col_monetization',
      accountProfileId: 'acc_dev',
      tags: ['google', 'ads', 'revenue', 'monetization'],
      isFavorite: true,
      isPinned: true,
      isArchived: false,
      openCount: 29,
      lastOpenedAt: now - 14400000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 3,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_revenuecat',
      title: 'RevenueCat Dashboard',
      url: 'https://app.revenuecat.com',
      cleanUrl: 'https://app.revenuecat.com',
      domain: 'app.revenuecat.com',
      description: 'In-app subscriptions and purchase management',
      collectionId: 'col_monetization',
      accountProfileId: undefined, // Browser default
      tags: ['subscriptions', 'iap', 'monetization'],
      isFavorite: true,
      isPinned: true,
      isArchived: false,
      openCount: 25,
      lastOpenedAt: now - 28800000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 4,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_gcloud',
      title: 'Google Cloud Console',
      url: 'https://console.cloud.google.com',
      cleanUrl: 'https://console.cloud.google.com',
      domain: 'console.cloud.google.com',
      description: 'APIs, Service Accounts, Cloud Storage, and Billing',
      collectionId: 'col_cloud',
      accountProfileId: 'acc_dev',
      tags: ['google', 'cloud', 'apis', 'iam'],
      isFavorite: true,
      isPinned: false,
      isArchived: false,
      openCount: 19,
      lastOpenedAt: now - 86400000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 5,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_github',
      title: 'GitHub Repositories',
      url: 'https://github.com',
      cleanUrl: 'https://github.com',
      domain: 'github.com',
      description: 'Git repositories, Actions CI/CD, and Issues',
      collectionId: 'col_dev',
      tags: ['git', 'code', 'ci/cd'],
      isFavorite: true,
      isPinned: true,
      isArchived: false,
      openCount: 55,
      lastOpenedAt: now - 1800000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 6,
      linkHealth: 'healthy'
    },

    // Sample Mobile App Project Specific Links
    {
      id: 'bm_sample_play',
      title: 'Sample App — Play Console Listing',
      url: 'https://play.google.com/console/developers/app/sample-app',
      cleanUrl: 'https://play.google.com/console/developers/app/sample-app',
      domain: 'play.google.com',
      description: 'Production releases, store presence, and Android vitals',
      projectId: 'proj_mobile_app',
      projectStage: 'distribution',
      collectionId: 'col_android',
      accountProfileId: 'acc_dev',
      tags: ['sample-app', 'play-store', 'releases'],
      isFavorite: true,
      isPinned: true,
      isArchived: false,
      openCount: 31,
      lastOpenedAt: now - 3600000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 1,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_sample_firebase',
      title: 'Sample App — Firebase Project',
      url: 'https://console.firebase.google.com/project/sample-app-prod',
      cleanUrl: 'https://console.firebase.google.com/project/sample-app-prod',
      domain: 'console.firebase.google.com',
      description: 'Crashlytics and Realtime DB for Sample App',
      projectId: 'proj_mobile_app',
      projectStage: 'development',
      collectionId: 'col_cloud',
      accountProfileId: 'acc_dev',
      tags: ['sample-app', 'firebase', 'crashlytics'],
      isFavorite: true,
      isPinned: true,
      isArchived: false,
      openCount: 22,
      lastOpenedAt: now - 7200000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 2,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_sample_revcat',
      title: 'Sample App — RevenueCat Paywalls',
      url: 'https://app.revenuecat.com/projects/sample-app/paywalls',
      cleanUrl: 'https://app.revenuecat.com/projects/sample-app/paywalls',
      domain: 'app.revenuecat.com',
      description: 'Subscription tiers: Pro Monthly & Annual Lifetime',
      projectId: 'proj_mobile_app',
      projectStage: 'monetization',
      collectionId: 'col_monetization',
      tags: ['sample-app', 'subscriptions', 'paywall'],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      openCount: 14,
      lastOpenedAt: now - 20000000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 3,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_sample_github',
      title: 'Sample App — GitHub Repository',
      url: 'https://github.com/developer/sample-app-android',
      cleanUrl: 'https://github.com/developer/sample-app-android',
      domain: 'github.com',
      description: 'Jetpack Compose & Kotlin source code',
      projectId: 'proj_mobile_app',
      projectStage: 'development',
      collectionId: 'col_dev',
      tags: ['sample-app', 'android', 'compose', 'kotlin'],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      openCount: 18,
      lastOpenedAt: now - 8000000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 4,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_sample_analytics',
      title: 'Sample App — Google Analytics',
      url: 'https://analytics.google.com/analytics/web/#/p123456789',
      cleanUrl: 'https://analytics.google.com/analytics/web/#/p123456789',
      domain: 'analytics.google.com',
      description: 'User engagement, retention curves, daily actives',
      projectId: 'proj_mobile_app',
      projectStage: 'analytics',
      collectionId: 'col_analytics',
      accountProfileId: 'acc_dev',
      tags: ['sample-app', 'analytics', 'engagement'],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      openCount: 11,
      lastOpenedAt: now - 40000000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 5,
      linkHealth: 'healthy'
    },
    {
      id: 'bm_sample_privacy',
      title: 'Sample App — Privacy Policy & Terms',
      url: 'https://sample-app.example.com/privacy',
      cleanUrl: 'https://sample-app.example.com/privacy',
      domain: 'sample-app.example.com',
      description: 'Public Google Play required compliance document',
      projectId: 'proj_mobile_app',
      projectStage: 'web',
      collectionId: 'col_android',
      tags: ['sample-app', 'compliance', 'legal', 'privacy'],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      openCount: 5,
      lastOpenedAt: now - 150000000,
      createdAt: now,
      updatedAt: now,
      sortOrder: 6,
      linkHealth: 'healthy'
    }
  ];

  await db.transaction('rw', [db.accountProfiles, db.collections, db.projects, db.bookmarks, db.settings], async () => {
    if (forceStarterPack) {
      await db.bookmarks.clear();
      await db.projects.clear();
      await db.collections.clear();
      await db.accountProfiles.clear();
    }

    await db.accountProfiles.bulkPut(defaultAccounts);
    await db.collections.bulkPut(defaultCollections);
    await db.projects.bulkPut(starterProjects);
    await db.bookmarks.bulkPut(starterBookmarks);

    await db.settings.put({
      id: 'current',
      theme: 'dark',
      defaultGoogleAccountProfileId: 'acc_dev',
      defaultOpenInNewTab: true,
      showHealthBadges: true,
      compactView: false,
      searchIncludeNotes: true,
      keyboardShortcutsEnabled: true,
      starterPackLoaded: true
    });
  });
}
