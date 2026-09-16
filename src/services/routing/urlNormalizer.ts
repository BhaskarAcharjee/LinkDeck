const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'utm_id',
  'fbclid',
  'gclid',
  'dclid',
  'msclkid',
  'ref_src',
  'ref',
  'igshid',
  '_hsenc',
  '_hsmi',
  'mc_eid',
  'si' // youtube share id
]);

export class UrlNormalizer {
  /**
   * Normalizes a URL by cleaning tracking parameters while preserving functional/application state
   */
  static clean(rawUrl: string): string {
    if (!rawUrl || typeof rawUrl !== 'string') return '';
    let trimmed = rawUrl.trim();

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      trimmed = 'https://' + trimmed;
    }

    try {
      const url = new URL(trimmed);

      // Remove tracking parameters
      const paramsToDelete: string[] = [];
      url.searchParams.forEach((_, key) => {
        if (TRACKING_PARAMS.has(key.toLowerCase()) || key.toLowerCase().startsWith('utm_')) {
          paramsToDelete.push(key);
        }
      });
      paramsToDelete.forEach(p => url.searchParams.delete(p));

      // Normalize hostname (lowercase)
      url.hostname = url.hostname.toLowerCase();

      // Normalize pathname trailing slash (remove trailing slash except for root)
      if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1);
      }

      return url.toString();
    } catch {
      return rawUrl;
    }
  }

  /**
   * Extracts clean domain name for display
   */
  static getDomain(rawUrl: string): string {
    try {
      const formatted = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;
      const url = new URL(formatted);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  }

  /**
   * Generates a high-quality favicon URL (Google Favicon API with fallbacks)
   */
  static getFaviconUrl(rawUrl: string, size = 64): string {
    const domain = this.getDomain(rawUrl);
    if (!domain) return '';
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=${size}`;
  }
}
