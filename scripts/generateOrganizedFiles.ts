import fs from 'fs';
import path from 'path';

// Load raw bookmarks from assets
const sourceHtmlPath = path.resolve(process.cwd(), 'src/assets/bookmarks_9_16_26.html');
const content = fs.readFileSync(sourceHtmlPath, 'utf8');

// Parse raw bookmarks with full attributes (including ICON)
interface RawBookmark {
  index: number;
  url: string;
  title: string;
  icon?: string;
  addDate?: string;
  folderPath: string;
}

const lines = content.split('\n');
const folderStack: string[] = [];
const rawItems: RawBookmark[] = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  const folderMatch = line.match(/<DT><H3[^>]*>(.*?)<\/H3>/i);
  if (folderMatch) {
    folderStack.push(folderMatch[1]);
  }
  if (line.includes('</DL>') && folderStack.length > 0) {
    folderStack.pop();
  }
  const aMatch = line.match(/<DT><A\s+HREF="([^"]*)"([^>]*)>(.*?)<\/A>/i);
  if (aMatch) {
    const url = aMatch[1];
    const attrs = aMatch[2];
    let title = aMatch[3];

    // Extract icon if present
    const iconMatch = attrs.match(/ICON="([^"]*)"/i);
    const icon = iconMatch ? iconMatch[1] : undefined;

    // Extract add_date
    const dateMatch = attrs.match(/ADD_DATE="([^"]*)"/i);
    const addDate = dateMatch ? dateMatch[1] : undefined;

    rawItems.push({
      index: rawItems.length + 1,
      url,
      title: title.trim(),
      icon,
      addDate,
      folderPath: folderStack.join(' > ') || 'Root'
    });
  }
}

console.log(`Loaded ${rawItems.length} raw items from source.`);

// Definitions for clean architecture
const articleUrls = new Set([
  'https://betterprogramming.pub/the-art-of-swing-effect-with-jetpack-compose-e6f4c8cb0d88',
  'https://www.pushing-pixels.org/2022/04/09/shader-based-render-effects-in-compose-desktop-with-skia.html',
  'https://data-flair.training/blogs/expense-tracker-python/',
  'https://medium.com/%40theymakedesign/mobile-ui-design-examples-vol-219-0a5d086f942e',
  'https://medium.com/@kappdev/how-to-create-a-shimmering-text-animation-in-jetpack-compose-eb4a553d924c',
  'https://www.freecodecamp.org/news/how-to-build-a-fullstack-authentication-system-with-react-express-mongodb-heroku-and-netlify/',
  'https://www.freecodecamp.org/news/how-to-dockerize-a-flask-app/',
  'https://x-engineer.org/category/automotive-engineering/vehicle/electric-vehicles/page/2/'
]);

const quickSiteCategories: Record<string, string> = {
  'https://www.google.com/webhp?authuser=2': 'google',
  'https://drive.google.com/drive/u/2/my-drive': 'google',
  'https://docs.google.com/forms/u/3/': 'google',
  'https://photos.google.com/u/3/': 'google',
  'https://calendar.google.com/calendar/u/3/r': 'google',
  'https://www.linkedin.com/feed/': 'social',
  'https://discord.com/channels/@me': 'social',
  'https://twitter.com/_bha_S_kar_': 'social',
  'https://github.com/BhaskarAcharjee': 'development',
  'https://chat.openai.com/chat': 'ai',
  'https://claude.ai/projects': 'ai',
  'https://gemini.google.com/app?hl=en-IN': 'ai',
  'https://gemini.google.com/u/1/app?hl=en-IN&pageId=none': 'ai',
  'https://web.telegram.org/z/': 'social',
  'https://www.amazon.in/': 'shopping',
  'https://www.canva.com/': 'design',
  'https://www.figma.com/files/recents-and-sharing/recently-viewed?fuid=1135235786730672380': 'design',
  'https://leetcode.com/problemset/all/': 'development',
  'https://neetcode.io/': 'development',
  'https://wakatime.com/': 'development',
  'https://www.overleaf.com/project': 'development',
  'https://studio.youtube.com/channel/UCO_UxS0RpQMd6TwlrdbWNcQ': 'media',
  'https://www.typingtest.com/test.html?minutes=1&textfile=easyText.txt&mode=sent&result_url=result.html&bt=0&gt=normal': 'utilities',
  'https://www.irctc.co.in/nget/train-search': 'utilities',
  'https://play.google.com/console/u/1/developers/8336037616564665249': 'development',
  'https://admob.google.com/v2/home?_ga=2.15929590.1799960708.1734939761-1251990158.1734122994&_gl=1*1bxblrv*_ga*MTI1MTk5MDE1OC4xNzM0MTIyOTk0*_ga_6R1K8XRD9P*MTczNDkzOTc2MS4zLjAuMTczNDkzOTc2MS4wLjAuMA..&sac=true&authuser=1&pli=1': 'google',
  'https://console.firebase.google.com/u/2/': 'development',
  'https://analytics.google.com/analytics/web/?authuser=2#/p469798020/reports/reportinghub?params=_u..nav%3Dmaui': 'google',
  'https://vercel.com/bhaskar-acharjees-projects': 'development',
  'https://dashboard.render.com/': 'development',
  'https://railway.app/': 'development',
  'https://aistudio.google.com/u/1/prompts/new_chat': 'ai',
  'https://colab.research.google.com/?authuser=3': 'development',
  'https://coinmarketcap.com/portfolio-tracker/': 'finance',
  'https://www.coingecko.com/': 'finance'
};

const pencilateMap: Record<string, { stage: string; title: string }> = {
  'https://pencilate.corvas.xyz/': { stage: 'web', title: 'Pencilate - App Landing' },
  'https://pencilate.blogspot.com/p/home_11.html': { stage: 'web', title: 'Pencilate - Blog Site' },
  'https://console.firebase.google.com/u/2/project/pencilate-app/crashlytics/app/android:com.corvas.pencilate/issues?utm_source=studio&time=last-seven-days&types=crash&state=open&tag=all&sort=eventCount': {
    stage: 'analytics',
    title: 'Pencilate - Crashlytics'
  },
  'https://www.figma.com/design/6SC2ujqw9biw6jNg2WkjJk/Pencilate?node-id=0-1&node-type=canvas&t=Ll8hfcOGuf6ceBrM-0': {
    stage: 'development',
    title: 'Pencilate - Figma Design'
  }
};

const reactionCamMap: Record<string, { stage: string; title: string }> = {
  'https://reactioncam.corvas.xyz/': { stage: 'web', title: 'ReactionCam - App Landing' },
  'https://console.firebase.google.com/u/2/project/reaction-cam-app/crashlytics/app/android:com.corvas.reactioncam/issues?utm_source=studio&state=open&time=7d&types=crash&tag=all&sort=eventCount': {
    stage: 'analytics',
    title: 'ReactionCam - Crashlytics'
  },
  'https://clarity.microsoft.com/projects/view/x9kvbyl109/gettingstarted/trackingCode#android': {
    stage: 'analytics',
    title: 'ReactionCam - Microsoft Clarity'
  },
  'https://app.revenuecat.com/overview': {
    stage: 'monetization',
    title: 'ReactionCam - RevenueCat'
  }
};

// Clean titles for bookmarks bar items that had empty titles
const cleanTitles: Record<string, string> = {
  'https://www.google.com/webhp?authuser=2': 'Google Search',
  'https://drive.google.com/drive/u/2/my-drive': 'Google Drive',
  'https://docs.google.com/forms/u/3/': 'Google Forms',
  'https://photos.google.com/u/3/': 'Google Photos',
  'https://calendar.google.com/calendar/u/3/r': 'Google Calendar',
  'https://www.linkedin.com/feed/': 'LinkedIn',
  'https://discord.com/channels/@me': 'Discord',
  'https://twitter.com/_bha_S_kar_': 'Twitter / X',
  'https://github.com/BhaskarAcharjee': 'GitHub',
  'https://chat.openai.com/chat': 'ChatGPT',
  'https://claude.ai/projects': 'Claude',
  'https://gemini.google.com/app?hl=en-IN': 'Gemini',
  'https://gemini.google.com/u/1/app?hl=en-IN&pageId=none': 'Gemini Pro',
  'https://web.telegram.org/z/': 'Telegram',
  'https://www.amazon.in/': 'Amazon India',
  'https://www.canva.com/': 'Canva',
  'https://www.figma.com/files/recents-and-sharing/recently-viewed?fuid=1135235786730672380': 'Figma Recents',
  'https://leetcode.com/problemset/all/': 'LeetCode',
  'https://www.geeksforgeeks.org/problem-of-the-day?itm_source=geeksforgeeks&itm_medium=main_header&itm_campaign=practice_header': 'GeeksforGeeks POTD',
  'https://neetcode.io/': 'NeetCode',
  'https://wakatime.com/': 'WakaTime',
  'https://www.overleaf.com/project': 'Overleaf',
  'https://studio.youtube.com/channel/UCO_UxS0RpQMd6TwlrdbWNcQ': 'YouTube Studio',
  'https://www.typingtest.com/test.html?minutes=1&textfile=easyText.txt&mode=sent&result_url=result.html&bt=0&gt=normal': 'TypingTest',
  'https://www.irctc.co.in/nget/train-search': 'IRCTC Ticket Booking',
  'https://www.photoroom.com/tools/background-remover': 'PhotoRoom Background Remover',
  'https://www.remove.bg/': 'Remove.bg',
  'https://picsart.com/video-background-remover/': 'PicsArt Video BG'
};

// Classification containers
interface StructuredItem {
  url: string;
  title: string;
  icon?: string;
  addDate: string;
  type: 'quick_site' | 'bookmark' | 'article';
  category?: string;
  collection?: string;
  project?: string;
  stage?: string;
  readStatus?: string;
  readTime?: number;
  authuser?: number;
}

const classifiedItems: StructuredItem[] = [];

for (const raw of rawItems) {
  let title = cleanTitles[raw.url] || raw.title;
  if (!title) title = 'Untitled Bookmark';

  const addDate = raw.addDate || Math.floor(Date.now() / 1000).toString();

  // Extract authuser
  let authuser: number | undefined;
  if (raw.url.includes('authuser=')) {
    const m = raw.url.match(/authuser=(\d+)/);
    if (m) authuser = parseInt(m[1], 10);
  } else if (raw.url.includes('/u/')) {
    const m = raw.url.match(/\/u\/(\d+)\//);
    if (m) authuser = parseInt(m[1], 10);
  }

  // 1. Articles
  if (articleUrls.has(raw.url)) {
    classifiedItems.push({
      url: raw.url,
      title,
      icon: raw.icon,
      addDate,
      type: 'article',
      readStatus: 'unread',
      readTime: 5,
      authuser
    });
    continue;
  }

  // 2. Quick Sites
  if (quickSiteCategories[raw.url]) {
    classifiedItems.push({
      url: raw.url,
      title,
      icon: raw.icon,
      addDate,
      type: 'quick_site',
      category: quickSiteCategories[raw.url],
      authuser
    });
    continue;
  }

  // 3. Projects
  if (pencilateMap[raw.url]) {
    const p = pencilateMap[raw.url];
    classifiedItems.push({
      url: raw.url,
      title: p.title,
      icon: raw.icon,
      addDate,
      type: 'bookmark',
      project: 'Pencilate',
      stage: p.stage,
      authuser
    });
    continue;
  }

  if (reactionCamMap[raw.url]) {
    const p = reactionCamMap[raw.url];
    classifiedItems.push({
      url: raw.url,
      title: p.title,
      icon: raw.icon,
      addDate,
      type: 'bookmark',
      project: 'ReactionCam',
      stage: p.stage,
      authuser
    });
    continue;
  }

  // 4. Collections
  const folder = raw.folderPath.toLowerCase();
  const domain = (new URL(raw.url).hostname || '').toLowerCase();
  const lowerTitle = title.toLowerCase();

  let collection = 'Other Resources';

  if (folder.includes('tcs') || domain.includes('ultimatix') || domain.includes('tcs')) {
    collection = 'TCS & Corporate';
  } else if (folder.includes('finance') || domain.includes('crypto') || domain.includes('coin')) {
    collection = 'Finance & Crypto';
  } else if (folder.includes('portfolio') || domain.includes('corvas.xyz') || raw.url.includes('bhaskaracharjee.github.io')) {
    collection = 'Portfolio & Web Apps';
  } else if (domain.includes('anime') || raw.url.includes('gogoanime') || raw.url.includes('hianime')) {
    collection = 'Entertainment';
  } else if (
    domain.includes('codechef') || domain.includes('geeksforgeeks') || domain.includes('ieee') ||
    domain.includes('conference') || lowerTitle.includes('dsa') || lowerTitle.includes('panna')
  ) {
    collection = 'Learning & Practice';
  } else if (
    domain.includes('icon') || domain.includes('svg') || domain.includes('font') ||
    domain.includes('color') || domain.includes('design') || domain.includes('mobbin') ||
    domain.includes('refero') || domain.includes('uideck') || domain.includes('mockuphone') ||
    domain.includes('sinasamaki') || domain.includes('codepen') || domain.includes('css') ||
    domain.includes('remove') || domain.includes('watermark') || domain.includes('pixelcut') ||
    domain.includes('imagy') || domain.includes('photoroom') || domain.includes('picsart') ||
    domain.includes('cloudconvert') || domain.includes('uxwing') || raw.url.includes('habitized')
  ) {
    collection = 'Design & Creative Assets';
  } else if (
    domain.includes('console.cloud.google') || domain.includes('search.google.com') ||
    domain.includes('seller.samsungapps') || domain.includes('hostinger') ||
    domain.includes('sanity.io') || domain.includes('razorpay') || domain.includes('meesho') ||
    domain.includes('stitch.withgoogle') || domain.includes('blogger') || domain.includes('pay.google') ||
    domain.includes('sites.google') || domain.includes('takeout.google') || domain.includes('remotedesktop') ||
    domain.includes('cloud.mongodb') || lowerTitle.includes('internal app sharing') || lowerTitle.includes('playstore') ||
    lowerTitle.includes('payments profile')
  ) {
    collection = 'Cloud Consoles & Services';
  } else if (
    domain.includes('composables') || domain.includes('jetpackcompose') ||
    domain.includes('angrytools') || domain.includes('developers.google.com') ||
    domain.includes('material.io') || domain.includes('multiplatform') ||
    domain.includes('support.google.com/admanager') || domain.includes('stackoverflow') ||
    domain.includes('mvnrepository') || domain.includes('sweethome3d') || domain.includes('aistudio') ||
    domain.includes('svg2android') || raw.url.includes('awesome-github-profile')
  ) {
    collection = 'App Development';
  }

  classifiedItems.push({
    url: raw.url,
    title,
    icon: raw.icon,
    addDate,
    type: 'bookmark',
    collection,
    authuser
  });
}

console.log(`Classified ${classifiedItems.length} items.`);

// Group into sections for HTML generation
const foldersMap: Record<string, StructuredItem[]> = {};

function addToFolder(folder: string, item: StructuredItem) {
  if (!foldersMap[folder]) foldersMap[folder] = [];
  foldersMap[folder].push(item);
}

for (const it of classifiedItems) {
  if (it.type === 'quick_site') {
    addToFolder('Quick Links', it);
  } else if (it.type === 'article') {
    addToFolder('Articles & Read Later', it);
  } else if (it.project) {
    addToFolder(it.project, it);
  } else if (it.collection) {
    addToFolder(it.collection, it);
  }
}

// 1. GENERATE NETSCAPE HTML
let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated LinkDeck bookmark export file.
     It contains enhanced LinkDeck metadata while remaining 100% valid Netscape HTML. -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>LinkDeck Organized Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

for (const [folderName, items] of Object.entries(foldersMap)) {
  const now = Math.floor(Date.now() / 1000);
  html += `    <DT><H3 ADD_DATE="${now}" LAST_MODIFIED="${now}">${folderName}</H3>\n    <DL><p>\n`;

  for (const item of items) {
    let tag = `        <DT><A HREF="${escapeHtml(item.url)}" ADD_DATE="${item.addDate}"`;
    if (item.icon) tag += ` ICON="${item.icon}"`;
    tag += ` DATA-LINKDECK-TYPE="${item.type}"`;
    if (item.category) tag += ` DATA-LINKDECK-CATEGORY="${item.category}"`;
    if (item.collection) tag += ` DATA-LINKDECK-COLLECTION="${escapeHtml(item.collection)}"`;
    if (item.project) tag += ` DATA-LINKDECK-PROJECT="${escapeHtml(item.project)}"`;
    if (item.stage) tag += ` DATA-LINKDECK-STAGE="${item.stage}"`;
    if (item.readStatus) tag += ` DATA-LINKDECK-READ-STATE="${item.readStatus}"`;
    if (item.readTime) tag += ` DATA-LINKDECK-READ-TIME="${item.readTime}"`;
    if (item.authuser !== undefined) tag += ` DATA-LINKDECK-AUTHUSER="${item.authuser}"`;
    tag += `>${escapeHtml(item.title)}</A>\n`;
    html += tag;
  }

  html += `    </DL><p>\n`;
}

html += `</DL><p>\n`;

const targetHtmlPath = path.resolve(process.cwd(), 'src/assets/linkdeck_organized_bookmarks.html');
fs.writeFileSync(targetHtmlPath, html, 'utf8');
console.log(`Generated ${targetHtmlPath}`);

// 2. GENERATE LINKDECK BACKUP JSON
const nowMs = Date.now();

// Build Collections
const collectionNames = Array.from(
  new Set(classifiedItems.filter(i => i.collection).map(i => i.collection!))
);
const collections = collectionNames.map((name, idx) => ({
  id: 'col_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
  name,
  slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  sortOrder: idx + 1,
  createdAt: nowMs
}));
const colMap = new Map(collections.map(c => [c.name, c.id]));

// Build Projects
const projects = [
  {
    id: 'proj_pencilate',
    name: 'Pencilate',
    slug: 'pencilate',
    description: 'Text to Handwriting conversion Android app & web tools',
    color: '#06B6D4',
    icon: 'Edit3',
    defaultAccountProfileId: 'acc_dev',
    tags: ['android', 'handwriting', 'app'],
    sortOrder: 1,
    createdAt: nowMs,
    updatedAt: nowMs
  },
  {
    id: 'proj_reactioncam',
    name: 'ReactionCam',
    slug: 'reaction-cam',
    description: 'Reaction video recorder Android app',
    color: '#EC4899',
    icon: 'Video',
    defaultAccountProfileId: 'acc_dev',
    tags: ['android', 'camera', 'reaction'],
    sortOrder: 2,
    createdAt: nowMs,
    updatedAt: nowMs
  }
];
const projMap = new Map(projects.map(p => [p.name, p.id]));

// Build Quick Sites
const quickSites = classifiedItems
  .filter(i => i.type === 'quick_site')
  .map((i, idx) => {
    let domain = '';
    try {
      domain = new URL(i.url).hostname.replace(/^www\./, '');
    } catch {
      domain = i.url;
    }
    return {
      id: 'site_' + Math.random().toString(36).substring(2, 9),
      title: i.title,
      url: i.url,
      cleanUrl: i.url.split('?')[0].replace(/\/$/, ''),
      domain,
      icon: i.icon,
      category: i.category as any,
      accountProfileId: i.authuser !== undefined ? (i.authuser === 1 ? 'acc_dev' : i.authuser === 2 ? 'acc_work' : 'acc_personal') : undefined,
      isPinned: false,
      isHidden: false,
      openCount: 0,
      sortOrder: idx + 1,
      createdAt: nowMs,
      updatedAt: nowMs
    };
  });

// Build Articles
const articles = classifiedItems
  .filter(i => i.type === 'article')
  .map(i => {
    let domain = '';
    try {
      domain = new URL(i.url).hostname.replace(/^www\./, '');
    } catch {
      domain = i.url;
    }
    return {
      id: 'art_' + Math.random().toString(36).substring(2, 9),
      title: i.title,
      url: i.url,
      cleanUrl: i.url.split('?')[0].replace(/\/$/, ''),
      domain,
      source: domain,
      favicon: i.icon,
      tags: ['tutorial', 'reading'],
      readingStatus: 'unread' as const,
      isFavorite: false,
      estimatedReadingTime: i.readTime || 5,
      savedAt: nowMs,
      updatedAt: nowMs
    };
  });

// Build Bookmarks
const bookmarks = classifiedItems
  .filter(i => i.type === 'bookmark')
  .map((i, idx) => {
    let domain = '';
    try {
      domain = new URL(i.url).hostname.replace(/^www\./, '');
    } catch {
      domain = i.url;
    }
    return {
      id: 'bm_' + Math.random().toString(36).substring(2, 9),
      title: i.title,
      url: i.url,
      cleanUrl: i.url.split('?')[0].replace(/\/$/, ''),
      domain,
      favicon: i.icon,
      collectionId: i.collection ? colMap.get(i.collection) : undefined,
      projectId: i.project ? projMap.get(i.project) : undefined,
      projectStage: i.stage as any,
      accountProfileId: i.authuser !== undefined ? (i.authuser === 1 ? 'acc_dev' : i.authuser === 2 ? 'acc_work' : 'acc_personal') : undefined,
      tags: [],
      isFavorite: false,
      isPinned: false,
      isArchived: false,
      openCount: 0,
      sortOrder: idx + 1,
      createdAt: nowMs,
      updatedAt: nowMs,
      linkHealth: 'healthy' as const
    };
  });

const backupJson = {
  version: 2,
  exportedAt: new Date().toISOString(),
  quickSites,
  articles,
  projects,
  collections,
  bookmarks,
  accountProfiles: [
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
      createdAt: nowMs
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
      createdAt: nowMs
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
      createdAt: nowMs
    }
  ],
  settings: {
    id: 'current',
    theme: 'dark',
    defaultGoogleAccountProfileId: 'acc_dev',
    defaultOpenInNewTab: true,
    showHealthBadges: true,
    compactView: false,
    searchIncludeNotes: true,
    keyboardShortcutsEnabled: true,
    starterPackLoaded: true
  }
};

const targetJsonPath = path.resolve(process.cwd(), 'src/assets/linkdeck_backup.json');
fs.writeFileSync(targetJsonPath, JSON.stringify(backupJson, null, 2), 'utf8');
console.log(`Generated ${targetJsonPath}`);

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
