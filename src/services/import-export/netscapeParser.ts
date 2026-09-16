import type { Bookmark, Collection } from '../../core/types';

export interface ParsedBookmarkItem {
  title: string;
  url: string;
  folderPath: string[];
  addDate?: number;
  icon?: string;
}

export class NetscapeParser {
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
                  const title = a.textContent?.trim() || href;
                  const addDate = a.getAttribute('add_date') ? parseInt(a.getAttribute('add_date')!, 10) * 1000 : undefined;
                  const icon = a.getAttribute('icon') || undefined;

                  results.push({
                    title,
                    url: href,
                    folderPath: [...folderHierarchy],
                    addDate,
                    icon
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
          results.push({
            title: rawTitle || href,
            url: href,
            folderPath: [...folderStack]
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
