import { db } from '../db/database';
import type { AppSettings } from '../types';

export class SettingsRepository {
  static async get(): Promise<AppSettings> {
    const settings = await db.settings.get('current');
    if (settings) {
      return settings;
    }
    const defaultSettings: AppSettings = {
      id: 'current',
      theme: 'dark',
      defaultOpenInNewTab: true,
      showHealthBadges: true,
      compactView: false,
      searchIncludeNotes: true,
      keyboardShortcutsEnabled: true,
      starterPackLoaded: false
    };
    await db.settings.put(defaultSettings);
    return defaultSettings;
  }

  static async update(updates: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.get();
    const updated = { ...current, ...updates };
    await db.settings.put(updated);
    return updated;
  }
}
