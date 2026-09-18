import assert from 'node:assert';
import { GoogleAccountRouter } from '../src/services/routing/GoogleAccountRouter.ts';
import { UrlNormalizer } from '../src/services/routing/urlNormalizer.ts';
import { NetscapeParser } from '../src/services/import-export/netscapeParser.ts';
import { LocalSearchEngine } from '../src/services/search/searchEngine.ts';
import { detectService, getServiceById } from '../src/services/routing/serviceRegistry.ts';
import { AccountRepository } from '../src/core/repositories/AccountRepository.ts';
import { QuickSiteRepository } from '../src/core/repositories/QuickSiteRepository.ts';
import { ArticleRepository } from '../src/core/repositories/ArticleRepository.ts';

console.log('--- RUNNING LINKDECK TEST SUITE ---');

// Mock account profiles
const devAccount = {
  id: 'acc_dev',
  name: 'Developer',
  email: 'dev@gmail.com',
  googleAuthUserIndex: 1,
  avatarColor: '#06B6D4',
  avatarLetter: 'D',
  provider: 'google',
  createdAt: Date.now()
};

const personalAccount = {
  id: 'acc_personal',
  name: 'Personal',
  email: 'personal@gmail.com',
  googleAuthUserIndex: 0,
  avatarColor: '#8B5CF6',
  avatarLetter: 'P',
  provider: 'google',
  createdAt: Date.now()
};

const workAccount = {
  id: 'acc_work',
  name: 'Work',
  email: 'work@company.com',
  googleAuthUserIndex: 2,
  avatarColor: '#10B981',
  avatarLetter: 'W',
  provider: 'google',
  createdAt: Date.now()
};

// ==========================================
// TEST 1: Service Detection
// ==========================================
console.log('[Test 1] Service Detection');
assert.strictEqual(detectService('https://play.google.com/console')?.id, 'google_play_console');
assert.strictEqual(detectService('https://console.firebase.google.com/project/demo')?.id, 'firebase_console');
assert.strictEqual(detectService('https://console.cloud.google.com')?.id, 'google_cloud_console');
assert.strictEqual(detectService('https://admob.google.com/home')?.id, 'google_admob');
assert.strictEqual(detectService('https://analytics.google.com/analytics/web/')?.id, 'google_analytics');
assert.strictEqual(detectService('https://app.revenuecat.com')?.id, 'revenuecat');
assert.strictEqual(detectService('https://github.com/torvalds/linux')?.id, 'github');
console.log('✓ Service Detection Passed');

// ==========================================
// TEST 2: Google Play Console Routing (GOOGLE_U_PATH)
// ==========================================
console.log('[Test 2] Google Play Console URL Routing');
const playDev = GoogleAccountRouter.resolve('https://play.google.com/console', devAccount);
assert.strictEqual(playDev.strategyApplied, 'GOOGLE_U_PATH');
assert.ok(playDev.resolvedUrl.includes('/console/u/1'), `Expected /console/u/1, got: ${playDev.resolvedUrl}`);

const playWorkApp = GoogleAccountRouter.resolve('https://play.google.com/console/developers/app/sample-app', workAccount);
assert.ok(playWorkApp.resolvedUrl.includes('/console/u/2/developers/app/sample-app'), `Expected /console/u/2/..., got: ${playWorkApp.resolvedUrl}`);
console.log('✓ Google Play Console Routing Passed');

// ==========================================
// TEST 3: Firebase Console Routing (GOOGLE_U_PATH)
// ==========================================
console.log('[Test 3] Firebase Console URL Routing');
const firebaseDev = GoogleAccountRouter.resolve('https://console.firebase.google.com/project/sample-app-prod', devAccount);
assert.strictEqual(firebaseDev.strategyApplied, 'GOOGLE_U_PATH');
assert.ok(firebaseDev.resolvedUrl.includes('/u/1/project/sample-app-prod'), `Expected /u/1/project/sample-app-prod, got: ${firebaseDev.resolvedUrl}`);
console.log('✓ Firebase Console Routing Passed');

// ==========================================
// TEST 4: Google Cloud Console & AdMob Routing (GOOGLE_AUTHUSER)
// ==========================================
console.log('[Test 4] Google Cloud & AdMob URL Routing');
const cloudWork = GoogleAccountRouter.resolve('https://console.cloud.google.com/apis/dashboard', workAccount);
assert.strictEqual(cloudWork.strategyApplied, 'GOOGLE_AUTHUSER');
assert.ok(cloudWork.resolvedUrl.includes('authuser=2'), `Expected authuser=2, got: ${cloudWork.resolvedUrl}`);

const admobDev = GoogleAccountRouter.resolve('https://admob.google.com/home', devAccount);
assert.strictEqual(admobDev.strategyApplied, 'GOOGLE_AUTHUSER');
assert.ok(admobDev.resolvedUrl.includes('authuser=1'), `Expected authuser=1, got: ${admobDev.resolvedUrl}`);
console.log('✓ Google Cloud & AdMob Routing Passed');

// ==========================================
// TEST 5: Non-Google Direct Routing
// ==========================================
console.log('[Test 5] Non-Google Direct Routing');
const revCat = GoogleAccountRouter.resolve('https://app.revenuecat.com/projects/sample-app', devAccount);
assert.strictEqual(revCat.strategyApplied, 'DIRECT');
assert.strictEqual(revCat.resolvedUrl, 'https://app.revenuecat.com/projects/sample-app');

const github = GoogleAccountRouter.resolve('https://github.com/developer/sample-app', devAccount);
assert.strictEqual(github.strategyApplied, 'DIRECT');
assert.strictEqual(github.resolvedUrl, 'https://github.com/developer/sample-app');
console.log('✓ Non-Google Direct Routing Passed');

// ==========================================
// TEST 6: URL Normalization & Tracking Stripping
// ==========================================
console.log('[Test 6] URL Normalization & Tracking Param Stripping');
const dirtyUrl = 'https://www.example.com/page/?utm_source=twitter&utm_medium=social&fbclid=12345&tab=billing&authuser=1';
const cleanUrl = UrlNormalizer.clean(dirtyUrl);
assert.ok(!cleanUrl.includes('utm_source'), 'utm_source should be stripped');
assert.ok(!cleanUrl.includes('fbclid'), 'fbclid should be stripped');
assert.ok(cleanUrl.includes('tab=billing'), 'tab=billing should be preserved');
assert.ok(cleanUrl.includes('authuser=1'), 'authuser=1 should be preserved');
console.log('✓ URL Normalization Passed');

// ==========================================
// TEST 7: Netscape Bookmark HTML Parsing & Exporting
// ==========================================
console.log('[Test 7] Netscape HTML Bookmark Import & Export');
const sampleNetscapeHtml = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
    <DT><H3 ADD_DATE="1600000000">Android Tools</H3>
    <DL><p>
        <DT><A HREF="https://play.google.com/console" ADD_DATE="1600000001">Google Play Console</A>
        <DT><A HREF="https://console.firebase.google.com" ADD_DATE="1600000002">Firebase Console</A>
    </DL><p>
</DL><p>`;

const parsed = NetscapeParser.parse(sampleNetscapeHtml);
assert.strictEqual(parsed.length, 2);
assert.strictEqual(parsed[0].title, 'Google Play Console');
assert.strictEqual(parsed[0].url, 'https://play.google.com/console');
assert.deepStrictEqual(parsed[0].folderPath, ['Android Tools']);

const exportedHtml = NetscapeParser.exportToNetscapeHtml(
  [
    {
      id: '1',
      title: 'Google Play Console',
      url: 'https://play.google.com/console',
      cleanUrl: 'https://play.google.com/console',
      domain: 'play.google.com',
      collectionId: 'col1',
      tags: [],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      openCount: 0,
      createdAt: 1600000000000,
      updatedAt: 1600000000000,
      sortOrder: 1
    }
  ],
  [{ id: 'col1', name: 'Android Tools', slug: 'android-tools', sortOrder: 1, createdAt: 1600000000000 }]
);
assert.ok(exportedHtml.includes('<!DOCTYPE NETSCAPE-Bookmark-file-1>'));
assert.ok(exportedHtml.includes('Android Tools'));
assert.ok(exportedHtml.includes('https://play.google.com/console'));
console.log('✓ Netscape HTML Import & Export Passed');

// ==========================================
// TEST 8: Multi-Token Fuzzy Search Engine
// ==========================================
console.log('[Test 8] Multi-Token Fuzzy Search Engine');
const sampleBookmarks = [
  {
    id: 'b1',
    title: 'Play Console Listing',
    url: 'https://play.google.com/console',
    cleanUrl: 'https://play.google.com/console',
    domain: 'play.google.com',
    projectId: 'p1',
    tags: ['android', 'store'],
    isFavorite: true,
    isPinned: false,
    isArchived: false,
    openCount: 10,
    createdAt: 1000,
    updatedAt: 1000,
    sortOrder: 1
  },
  {
    id: 'b2',
    title: 'Firebase Crashlytics',
    url: 'https://console.firebase.google.com',
    cleanUrl: 'https://console.firebase.google.com',
    domain: 'console.firebase.google.com',
    projectId: 'p1',
    tags: ['backend', 'database'],
    isFavorite: false,
    isPinned: false,
    isArchived: false,
    openCount: 5,
    createdAt: 1000,
    updatedAt: 1000,
    sortOrder: 2
  }
];

const projectsMap = new Map([
  ['p1', { id: 'p1', name: 'Sample App', slug: 'sample-app', color: '#06B6D4', tags: ['android'], sortOrder: 1, createdAt: 1000, updatedAt: 1000 }]
]);

// Test multi-token query: "firebase sample-app"
const results1 = LocalSearchEngine.search('firebase sample-app', sampleBookmarks, projectsMap, new Map(), new Map());
assert.strictEqual(results1.length, 1);
assert.strictEqual(results1[0].bookmark.title, 'Firebase Crashlytics');

// Test query: "play"
const results2 = LocalSearchEngine.search('play', sampleBookmarks, projectsMap, new Map(), new Map());
assert.strictEqual(results2.length, 1);
assert.strictEqual(results2[0].bookmark.title, 'Play Console Listing');
console.log('✓ Multi-Token Fuzzy Search Passed');

// ==========================================
// TEST 9: Google Account URL Auto-Detection
// ==========================================
console.log('[Test 9] Google Account URL Auto-Detection');
const detectedUPath = AccountRepository.detectFromGoogleUrl('https://mail.google.com/mail/u/2/#inbox');
assert.strictEqual(detectedUPath?.index, 2);

const detectedAuthUser = AccountRepository.detectFromGoogleUrl('https://console.cloud.google.com/apis/dashboard?authuser=1&project=demo');
assert.strictEqual(detectedAuthUser?.index, 1);

const detectedChooser = AccountRepository.detectFromGoogleUrl('https://accounts.google.com/AccountChooser?Email=developer@company.com&continue=https://play.google.com');
assert.strictEqual(detectedChooser?.email, 'developer@company.com');
assert.strictEqual(detectedChooser?.index, 0);

assert.strictEqual(AccountRepository.detectFromGoogleUrl('https://github.com/developer/repo'), null);
console.log('✓ Google Account URL Auto-Detection Passed');

// ==========================================
// TEST 10: Expanded Service Registry (AI, Dev, Media, Design)
// ==========================================
console.log('[Test 10] Expanded Service Registry & Detection');
assert.strictEqual(detectService('https://chatgpt.com/c/123')?.id, 'chatgpt');
assert.strictEqual(detectService('https://chat.openai.com/auth/login')?.id, 'chatgpt');
assert.strictEqual(detectService('https://gemini.google.com/app')?.id, 'gemini');
assert.strictEqual(detectService('https://claude.ai/chats')?.id, 'claude');
assert.strictEqual(detectService('https://canva.com/design')?.id, 'canva');
assert.strictEqual(detectService('https://youtube.com/watch?v=123')?.id, 'youtube');
assert.strictEqual(detectService('https://studio.youtube.com/channel/123')?.id, 'youtube_studio');
assert.strictEqual(detectService('https://overleaf.com/project/123')?.id, 'overleaf');
assert.strictEqual(detectService('https://wakatime.com/dashboard')?.id, 'wakatime');
assert.strictEqual(getServiceById('chatgpt')?.brandColor, '#10A37F');
console.log('✓ Expanded Service Registry Passed');

// ==========================================
// TEST 11: Quick Site Deterministic Ranking Engine
// ==========================================
console.log('[Test 11] Quick Site Deterministic Ranking Engine');
const mockQuickSites = [
  {
    id: 's1',
    title: 'Regular Site',
    url: 'https://example.com',
    cleanUrl: 'https://example.com',
    domain: 'example.com',
    category: 'utilities',
    isPinned: false,
    isHidden: false,
    openCount: 2,
    createdAt: 1000,
    updatedAt: 1000,
    sortOrder: 2
  },
  {
    id: 's2',
    title: 'Pinned High Site',
    url: 'https://pinned.com',
    cleanUrl: 'https://pinned.com',
    domain: 'pinned.com',
    category: 'ai',
    isPinned: true,
    isHidden: false,
    openCount: 0,
    createdAt: 1000,
    updatedAt: 1000,
    sortOrder: 1
  },
  {
    id: 's3',
    title: 'Hidden Site',
    url: 'https://hidden.com',
    cleanUrl: 'https://hidden.com',
    domain: 'hidden.com',
    category: 'social',
    isPinned: false,
    isHidden: true,
    openCount: 50,
    createdAt: 1000,
    updatedAt: 1000,
    sortOrder: 3
  }
];

const rankedForYou = QuickSiteRepository.rankSites(mockQuickSites, 'for_you');
// Pinned site must be #1
assert.strictEqual(rankedForYou[0].id, 's2', 'Pinned site should rank first');
// Hidden site must NOT appear in for_you
assert.ok(!rankedForYou.some(s => s.id === 's3'), 'Hidden site should not appear in For You');

// Category filter must only return that category
const rankedAi = QuickSiteRepository.rankSites(mockQuickSites, 'ai');
assert.strictEqual(rankedAi.length, 1);
assert.strictEqual(rankedAi[0].id, 's2');
console.log('✓ Quick Site Ranking Passed');

// ==========================================
// TEST 12: Article Reading Time Estimation
// ==========================================
console.log('[Test 12] Article Reading Time Estimation');
const shortArticleTime = ArticleRepository.estimateReadingTime('Short Title');
assert.ok(shortArticleTime >= 1 && shortArticleTime <= 5, 'Short article should have reasonable reading time');

const longText = 'word '.repeat(800);
const longArticleTime = ArticleRepository.estimateReadingTime('Deep Tech Guide', longText);
assert.strictEqual(longArticleTime, 4, '800 words should equal ~4 minutes');
console.log('✓ Article Reading Time Passed');

// ==========================================
// TEST 13: Bookmark HTML Auto-Classifier & Empty Title Resolution
// ==========================================
console.log('[Test 13] Bookmark HTML Auto-Classifier & Empty Title Resolution');

// 1. Chrome Bookmarks bar empty title test
const classifiedEmptyChatGpt = NetscapeParser.classifyItem('https://chat.openai.com/auth/login', '', ['Bookmarks bar']);
assert.strictEqual(classifiedEmptyChatGpt.title, 'ChatGPT', 'Empty title should resolve to service name');
assert.strictEqual(classifiedEmptyChatGpt.suggestedType, 'quick_site', 'Service root on bar should be quick_site');

// 2. Blog / Article detection
const classifiedMedium = NetscapeParser.classifyItem(
  'https://medium.com/@androiddev/modern-architecture-guide-2026',
  'Modern Android Architecture Guide',
  ['App Dev', 'Articles']
);
assert.strictEqual(classifiedMedium.suggestedType, 'article', 'Medium URL should be classified as article');

// 3. Deep Developer Console Link detection
const classifiedConsole = NetscapeParser.classifyItem(
  'https://play.google.com/console/developers/app/12345/tracks',
  'Production Releases',
  ['App', 'Pencilate']
);
assert.strictEqual(classifiedConsole.suggestedType, 'bookmark', 'Deep console app link should be bookmark');
console.log('✓ Bookmark HTML Auto-Classifier Passed');

// ==========================================
// TEST 14: Universal Search Engine with Power Prefix Filters
// ==========================================
console.log('[Test 14] Universal Search Engine with Power Prefix Filters');
const testQuickSitesWithChat = [
  ...mockQuickSites,
  {
    id: 'qs_chat',
    title: 'ChatGPT Assistant',
    url: 'https://chatgpt.com',
    cleanUrl: 'https://chatgpt.com',
    domain: 'chatgpt.com',
    category: 'ai',
    serviceId: 'chatgpt',
    isPinned: true,
    isHidden: false,
    openCount: 10,
    createdAt: 1000,
    updatedAt: 1000,
    sortOrder: 0
  }
];

const searchUniversalResults = LocalSearchEngine.searchUniversal(
  '@ai chat',
  sampleBookmarks,
  testQuickSitesWithChat,

  [
    {
      id: 'art1',
      title: 'Guide to AI Agents in 2026',
      url: 'https://medium.com/ai-agents',
      cleanUrl: 'https://medium.com/ai-agents',
      domain: 'medium.com',
      tags: ['ai', 'agents'],
      readingStatus: 'unread',
      isFavorite: false,
      savedAt: 1000,
      updatedAt: 1000
    }
  ],
  [
    {
      id: 'p1',
      name: 'AI Camera App',
      slug: 'ai-camera-app',
      color: '#06B6D4',
      tags: ['ai'],
      sortOrder: 1,
      createdAt: 1000,
      updatedAt: 1000
    }
  ]
);

// Under @ai prefix, only AI items should be returned (no general non-AI bookmarks)
assert.ok(searchUniversalResults.length > 0);
for (const res of searchUniversalResults) {
  assert.ok(
    res.badge.toLowerCase().includes('ai') || res.title.toLowerCase().includes('ai'),
    `Result ${res.title} should match AI criteria`
  );
}
console.log('✓ Universal Search Engine with Prefix Filters Passed');

console.log('\n=============================================');
console.log('ALL 14 LINKDECK TEST SUITES PASSED SUCCESSFULLY!');
console.log('=============================================');

