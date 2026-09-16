export type RoutingStrategy =
  | 'DIRECT'
  | 'GOOGLE_AUTHUSER'
  | 'GOOGLE_U_PATH'
  | 'GOOGLE_ACCOUNT_CHOOSER'
  | 'CUSTOM_TRANSFORM';

export type ProjectStage =
  | 'development'
  | 'distribution'
  | 'monetization'
  | 'analytics'
  | 'web'
  | 'other';

export interface AccountProfile {
  id: string;
  name: string;
  email?: string;
  googleAuthUserIndex: number; // 0, 1, 2, etc. (order of account login)
  avatarColor: string;
  avatarLetter: string;
  provider: 'google' | 'custom';
  isDefault?: boolean;
  notes?: string;
  createdAt: number;
}

export interface Bookmark {
  id: string;
  title: string;
  url: string;
  cleanUrl: string;
  domain: string;
  favicon?: string;
  description?: string;
  projectId?: string;
  projectStage?: ProjectStage;
  collectionId?: string;
  accountProfileId?: string; // ID of AccountProfile, or 'default', or 'ask'
  tags: string[];
  notes?: string;
  isFavorite: boolean;
  isPinned: boolean;
  isArchived: boolean;
  openCount: number;
  lastOpenedAt?: number;
  createdAt: number;
  updatedAt: number;
  sortOrder: number;
  linkHealth?: 'healthy' | 'redirected' | 'unknown' | 'error';
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  defaultAccountProfileId?: string;
  tags: string[];
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  color?: string;
  parentId?: string;
  isSystem?: boolean;
  sortOrder: number;
  createdAt: number;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  domains: string[];
  pathPatterns?: RegExp[];
  defaultStrategy: RoutingStrategy;
  iconName: string;
  brandColor: string;
  authuserParamName?: string;
  category: 'developer' | 'cloud' | 'analytics' | 'productivity' | 'design' | 'monetization' | 'general';
  docsUrl?: string;
  consoleUrlTemplate?: string;
}

export interface AppSettings {
  id: string; // 'current'
  theme: 'dark' | 'light' | 'system';
  defaultGoogleAccountProfileId?: string;
  defaultOpenInNewTab: boolean;
  showHealthBadges: boolean;
  compactView: boolean;
  searchIncludeNotes: boolean;
  keyboardShortcutsEnabled: boolean;
  starterPackLoaded: boolean;
}

export interface ResolvedLaunchResult {
  targetUrl: string;
  resolvedUrl: string;
  service?: ServiceDefinition;
  account?: AccountProfile;
  strategyApplied: RoutingStrategy;
  routingExplanation: string;
  confidence: 'high' | 'fallback' | 'direct';
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchType?: 'exact_url' | 'normalized_url' | 'domain_title';
  existingBookmark?: Bookmark;
  similarityScore?: number;
}
