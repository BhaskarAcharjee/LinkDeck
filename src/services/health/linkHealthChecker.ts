import type { Bookmark } from '../../core/types';
import { BookmarkRepository } from '../../core/repositories/BookmarkRepository';

export class LinkHealthChecker {
  /**
   * Checks link health without violating CORS or triggering alerts
   */
  static async check(url: string): Promise<Bookmark['linkHealth']> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      // We use no-cors to avoid CORS blocks on external sites
      await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return 'healthy';
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return 'unknown'; // Timeout may simply mean slow or CDN blocked HEAD
      }
      return 'unknown';
    }
  }

  /**
   * Updates health status in the database
   */
  static async updateHealth(bookmarkId: string, url: string): Promise<void> {
    const health = await this.check(url);
    await BookmarkRepository.update(bookmarkId, { linkHealth: health });
  }
}
