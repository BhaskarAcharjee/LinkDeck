import { db } from '../db/database';
import type { Project } from '../types';

export class ProjectRepository {
  static async getAll(): Promise<Project[]> {
    return db.projects.orderBy('sortOrder').toArray();
  }

  static async getById(id: string): Promise<Project | undefined> {
    return db.projects.get(id);
  }

  static async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project> {
    const now = Date.now();
    const id = 'proj_' + Math.random().toString(36).substring(2, 9);
    const newProject: Project = {
      ...project,
      id,
      createdAt: now,
      updatedAt: now
    };
    await db.projects.add(newProject);
    return newProject;
  }

  static async update(id: string, updates: Partial<Project>): Promise<void> {
    await db.projects.update(id, {
      ...updates,
      updatedAt: Date.now()
    });
  }

  static async delete(id: string): Promise<void> {
    await db.transaction('rw', [db.projects, db.bookmarks], async () => {
      // Unlink bookmarks associated with this project
      const associatedBookmarks = await db.bookmarks.where('projectId').equals(id).toArray();
      for (const bm of associatedBookmarks) {
        await db.bookmarks.update(bm.id, {
          projectId: undefined,
          projectStage: undefined
        });
      }
      await db.projects.delete(id);
    });
  }
}
