import type { Bookmark, Collection, QuickSiteCategory } from '../../core/types';
import { detectService } from '../routing/serviceRegistry';

export interface ParsedBookmarkItem {
  title: string;
  url: string;
  domain: string;
  folderPath: string[];
  addDate?: number;
  icon?: string;
  suggestedType: 'quick_site' | 'bookmark' | 'article';
  serviceId?: string;
  category?: QuickSiteCategory;
}

export class NetscapeParser {
  /**
   * Helper to clean up empty titles and classify link destinations
   */
  static classifyItem(url: string, rawTitle: string, folderPath: string[]): {
    title: string;
    domain: string;
    suggestedType: 'quick_site' | 'bookmark' | 'article';
    serviceId?: string;
    category?: QuickSiteCategory;
  } {
    let domain = '';
    let pathname = '';
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      domain = parsed.hostname.toLowerCase().replace(/^www\./, '');
      pathname = parsed.pathname.toLowerCase();
    } catch {
      domain = url;
    }

    const service = detectService(url);
    const serviceId = service?.id;

    // 1. Resolve Title
    let title = rawTitle ? rawTitle.trim() : '';
    if (!title || title === url || title.startsWith('http://') || title.startsWith('https://')) {
      if (service) {
        title = service.name;
      } else if (domain) {
        // Capitalize domain without TLD: e.g. typingtest.com -> Typingtest
        const parts = domain.split('.');
        const brand = parts.length > 1 ? parts[0] : domain;
        title = brand.charAt(0).toUpperCase() + brand.slice(1);
      } else {
        title = 'Untitled Bookmark';
      }
    }

    // 2. Classify Link Type
    let suggestedType: 'quick_site' | 'bookmark' | 'article' = 'bookmark';
    let category: QuickSiteCategory | undefined;

    // Article heuristics (blogs, tutorials, news, medium, dev.to, papers)
    const isArticleDomain = [
      'medium.com',
      'dev.to',
      'hashnode.dev',
      'freecodecamp.org',
      'data-flair.training',
      'geeksforgeeks.org',
      'towardsdatascience.com',
      'arxiv.org',
      'ieeexplore.ieee.org',
      'hackernoon.com',
      'substack.com'
    ].some(d => domain === d || domain.endsWith('.' + d));

    const isArticlePath =
      pathname.includes('/blog/') ||
      pathname.includes('/article/') ||
      pathname.includes('/news/') ||
      pathname.includes('/tutorial/') ||
      pathname.includes('/guide/') ||
      pathname.includes('/posts/') ||
      /\/\d{4}\/\d{2}\//.test(pathname);

    if (isArticleDomain && (pathname.length > 1 || isArticlePath)) {
      suggestedType = 'article';
    } else if (isArticlePath) {
      suggestedType = 'article';
    } else if (
      // Quick Site heuristics:
      // Recognized service root or major top level tool
      service && (pathname === '/' || pathname === '' || pathname.startsWith('/chats') || pathname.startsWith('/app') || pathname.startsWith('/login') || pathname.startsWith('/home') || folderPath.some(f => f.toLowerCase().includes('bar')))
    ) {
      suggestedType = 'quick_site';
      if (service.category === 'ai') category = 'ai';
      else if (service.category === 'developer') category = 'development';
      else if (service.category === 'cloud') category = 'development';
      else if (service.category === 'social') category = 'social';
      else if (service.category === 'design') category = 'design';
      else if (service.category === 'media') category = 'media';
      else if (service.category === 'shopping') category = 'shopping';
      else if (service.domains.some(d => d.includes('google'))) category = 'google';
      else category = 'utilities';
    } else if (
      // Root domain in Bookmarks Bar with minimal path
      folderPath.some(f => f.toLowerCase().includes('bar')) &&
      (pathname === '/' || pathname === '')
    ) {
      suggestedType = 'quick_site';
      category = 'utilities';
    }

    return { title, domain, suggestedType, serviceId, category };
  }

  /**
   * Parses standard Netscape Bookmark HTML file format (Chrome, Edge, Firefox, Brave)
   * Works both with DOMParser (in browser) and with regex tokenizer fallback (in Node.js / worker).
   */
  static parse(htmlContent: string): ParsedBookmarkItem[] {
    if (typeof DOMParser !== 'undefined') {
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');
        const results: ParsedBookmarkItem[] = [];

        function traverse(node: Element, folderHierarchy: string[]) {
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            const tagName = child.tagName.toUpperCase();

            if (tagName === 'DT') {
              const h3 = child.querySelector(':scope > h3');
              const dl = child.querySelector(':scope > dl');
              const a = child.querySelector(':scope > a');

              if (h3) {
                const folderName = h3.textContent?.trim() || 'Imported';
                const nextHierarchy = [...folderHierarchy, folderName];
                if (dl) {
                  traverse(dl, nextHierarchy);
                }
              } else if (a) {
                const href = a.getAttribute('href');
                if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                  const rawTitle = a.textContent?.trim() || '';
                  const addDate = a.getAttribute('add_date') ? parseInt(a.getAttribute('add_date')!, 10) * 1000 : undefined;
                  const icon = a.getAttribute('icon') || undefined;

                  const classification = NetscapeParser.classifyItem(href, rawTitle, folderHierarchy);

                  results.push({
                    title: classification.title,
                    url: href,
                    domain: classification.domain,
                    folderPath: [...folderHierarchy],
                    addDate,
                    icon,
                    suggestedType: classification.suggestedType,
                    serviceId: classification.serviceId,
                    category: classification.category
                  });
                }
              }
            } else if (tagName === 'DL') {
              traverse(child, folderHierarchy);
            } else if (child.children.length > 0) {
              traverse(child, folderHierarchy);
            }
          }
        }

        const body = doc.body;
        if (body) {
          traverse(body, []);
        }

        if (results.length > 0) {
          return results;
        }
      } catch {
        // Fall back to regex parser
      }
    }

    // Robust Regex parser for Netscape HTML format
    const results: ParsedBookmarkItem[] = [];
    const lines = htmlContent.split(/\r?\n/);
    const folderStack: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      // Check for folder header <H3 ...>FolderName</H3>
      const h3Match = trimmed.match(/<H3[^>]*>(.*?)<\/H3>/i);
      if (h3Match) {
        const folderName = h3Match[1].replace(/<[^>]*>/g, '').trim();
        folderStack.push(folderName);
        continue;
      }

      // Check for folder close </DL>
      if (trimmed.toUpperCase().includes('</DL>')) {
        folderStack.pop();
        continue;
      }

      // Check for link <A HREF="url" ...>Title</A>
      const aMatch = trimmed.match(/<A\s+[^>]*HREF=["']([^"']+)["'][^>]*>(.*?)<\/A>/i);
      if (aMatch) {
        const href = aMatch[1];
        const rawTitle = aMatch[2].replace(/<[^>]*>/g, '').trim();
        if (href.startsWith('http://') || href.startsWith('https://')) {
          const classification = NetscapeParser.classifyItem(href, rawTitle, folderStack);
          results.push({
            title: classification.title,
            url: href,
            domain: classification.domain,
            folderPath: [...folderStack],
            suggestedType: classification.suggestedType,
            serviceId: classification.serviceId,
            category: classification.category
          });
        }
      }
    }

    return results;
  }


  /**
   * Generates Netscape Bookmark HTML file content for browser export
   */
  static exportToNetscapeHtml(bookmarks: Bookmark[], collections: Collection[]): string {
    const colMap = new Map(collections.map(c => [c.id, c.name]));
    
    // Group bookmarks by collection
    const grouped = new Map<string, Bookmark[]>();
    grouped.set('Bookmarks Bar', []);

    for (const b of bookmarks) {
      const colName = b.collectionId ? (colMap.get(b.collectionId) || 'Uncategorized') : 'Bookmarks Bar';
      if (!grouped.has(colName)) {
        grouped.set(colName, []);
      }
      grouped.get(colName)!.push(b);
    }

    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    for (const [folderName, items] of grouped.entries()) {
      if (items.length === 0) continue;
      const nowSec = Math.floor(Date.now() / 1000);
      html += `    <DT><H3 ADD_DATE="${nowSec}" LAST_MODIFIED="${nowSec}">${this.escapeHtml(folderName)}</H3>\n    <DL><p>\n`;
      for (const item of items) {
        const itemSec = Math.floor((item.createdAt || Date.now()) / 1000);
        html += `        <DT><A HREF="${this.escapeHtml(item.url)}" ADD_DATE="${itemSec}">${this.escapeHtml(item.title)}</A>\n`;
      }
      html += `    </DL><p>\n`;
    }

    html += `</DL><p>\n`;
    return html;
  }

  private static escapeHtml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
