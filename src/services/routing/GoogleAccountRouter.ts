import type { AccountProfile, ResolvedLaunchResult } from '../../core/types';
import { detectService } from './serviceRegistry';

export class GoogleAccountRouter {
  /**
   * Resolves a destination URL to account-specific URL based on service and account profile.
   */
  static resolve(rawUrl: string, account?: AccountProfile): ResolvedLaunchResult {
    // 1. Sanitize & validate
    const cleanRaw = rawUrl.trim();
    if (!this.isValidUrl(cleanRaw)) {
      return {
        targetUrl: cleanRaw,
        resolvedUrl: cleanRaw,
        strategyApplied: 'DIRECT',
        routingExplanation: 'Invalid or unsupported URL scheme.',
        confidence: 'direct'
      };
    }

    // 2. If no account specified or non-Google default, open directly
    if (!account) {
      const detectedService = detectService(cleanRaw);
      return {
        targetUrl: cleanRaw,
        resolvedUrl: cleanRaw,
        service: detectedService,
        strategyApplied: 'DIRECT',
        routingExplanation: 'Browser default account / profile used directly.',
        confidence: 'direct'
      };
    }

    // 3. Detect known service
    const service = detectService(cleanRaw);

    // If it's not a Google service (e.g. GitHub, RevenueCat), routing is direct
    if (!service || (!service.domains.some(d => d.includes('google.com')) && service.id !== 'google_generic')) {
      return {
        targetUrl: cleanRaw,
        resolvedUrl: cleanRaw,
        service,
        account,
        strategyApplied: 'DIRECT',
        routingExplanation: `${service?.name || 'External service'} does not use Google account routing.`,
        confidence: 'direct'
      };
    }

    const index = account.googleAuthUserIndex;
    const strategy = service.defaultStrategy;

    try {
      const urlObj = new URL(cleanRaw);

      if (strategy === 'GOOGLE_U_PATH') {
        const transformedUrl = this.applyUPathTransform(urlObj, service.id, index);
        return {
          targetUrl: cleanRaw,
          resolvedUrl: transformedUrl,
          service,
          account,
          strategyApplied: 'GOOGLE_U_PATH',
          routingExplanation: `Injected account path segment /u/${index}/ for ${account.name}`,
          confidence: 'high'
        };
      }

      if (strategy === 'GOOGLE_AUTHUSER') {
        const transformedUrl = this.applyAuthUserTransform(urlObj, service.authuserParamName || 'authuser', index, account.email);
        return {
          targetUrl: cleanRaw,
          resolvedUrl: transformedUrl,
          service,
          account,
          strategyApplied: 'GOOGLE_AUTHUSER',
          routingExplanation: `Set authuser=${index} query parameter for ${account.name}`,
          confidence: 'high'
        };
      }

      if (strategy === 'GOOGLE_ACCOUNT_CHOOSER') {
        const chooserUrl = this.applyAccountChooserTransform(cleanRaw, account);
        return {
          targetUrl: cleanRaw,
          resolvedUrl: chooserUrl,
          service,
          account,
          strategyApplied: 'GOOGLE_ACCOUNT_CHOOSER',
          routingExplanation: `Wrapped with Google Account Chooser for ${account.email || account.name}`,
          confidence: 'high'
        };
      }
    } catch {
      // Fallback
    }

    return {
      targetUrl: cleanRaw,
      resolvedUrl: cleanRaw,
      service,
      account,
      strategyApplied: 'DIRECT',
      routingExplanation: 'Graceful fallback to direct URL.',
      confidence: 'fallback'
    };
  }

  /**
   * Applies the /u/{index}/ path routing transformation
   */
  private static applyUPathTransform(url: URL, serviceId: string, accountIndex: number): string {
    const pathname = url.pathname;

    // Check if URL already contains a /u/{digits}/ segment
    const uPathRegex = /\/u\/(\d+)\//;
    if (uPathRegex.test(pathname)) {
      url.pathname = pathname.replace(uPathRegex, `/u/${accountIndex}/`);
      return url.toString();
    }

    // Service-specific insertion points
    if (serviceId === 'google_play_console') {
      if (pathname.startsWith('/console')) {
        url.pathname = pathname.replace('/console', `/console/u/${accountIndex}`);
      } else {
        url.pathname = `/console/u/${accountIndex}${pathname}`;
      }
      return url.toString();
    }

    if (serviceId === 'firebase_console') {
      url.pathname = `/u/${accountIndex}${pathname}`;
      return url.toString();
    }

    if (serviceId === 'gmail') {
      if (pathname.startsWith('/mail')) {
        url.pathname = pathname.replace('/mail', `/mail/u/${accountIndex}`);
      } else {
        url.pathname = `/mail/u/${accountIndex}${pathname}`;
      }
      return url.toString();
    }

    if (serviceId === 'google_drive') {
      if (pathname.startsWith('/drive')) {
        url.pathname = pathname.replace('/drive', `/drive/u/${accountIndex}`);
      } else {
        url.pathname = `/drive/u/${accountIndex}${pathname}`;
      }
      return url.toString();
    }

    if (serviceId === 'google_calendar') {
      url.pathname = `/calendar/u/${accountIndex}/r`;
      return url.toString();
    }

    // Generic u-path prepend
    url.pathname = `/u/${accountIndex}${pathname}`;
    return url.toString();
  }

  /**
   * Applies authuser query param transform
   */
  private static applyAuthUserTransform(url: URL, paramName: string, accountIndex: number, _email?: string): string {
    url.searchParams.set(paramName, accountIndex.toString());
    return url.toString();
  }

  /**
   * Applies Google Account Chooser redirect
   */
  private static applyAccountChooserTransform(rawUrl: string, account: AccountProfile): string {
    if (account.email) {
      return `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(account.email)}&continue=${encodeURIComponent(rawUrl)}`;
    }
    return `https://accounts.google.com/AccountChooser?authuser=${account.googleAuthUserIndex}&continue=${encodeURIComponent(rawUrl)}`;
  }

  /**
   * Tests whether a URL is valid and safe to navigate to
   */
  public static isValidUrl(urlStr: string): boolean {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const trimmed = urlStr.trim().toLowerCase();

    // Reject dangerous schemes
    if (trimmed.startsWith('javascript:') || trimmed.startsWith('data:') || trimmed.startsWith('vbscript:')) {
      return false;
    }

    try {
      const parsed = new URL(urlStr.startsWith('http://') || urlStr.startsWith('https://') ? urlStr : `https://${urlStr}`);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
