import type { UndoAction } from '../../core/types';

type UndoListener = (action: UndoAction | null) => void;

export class UndoManager {
  private static currentAction: UndoAction | null = null;
  private static timeoutHandle: number | null = null;
  private static listeners: Set<UndoListener> = new Set();

  static subscribe(listener: UndoListener): () => void {
    this.listeners.add(listener);
    listener(this.currentAction);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify() {
    this.listeners.forEach(l => l(this.currentAction));
  }

  static push(description: string, executeUndo: () => Promise<void>, durationMs = 7000): void {
    if (this.timeoutHandle !== null) {
      window.clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }

    const action: UndoAction = {
      id: 'undo_' + Math.random().toString(36).substring(2, 9),
      description,
      executeUndo,
      timestamp: Date.now()
    };

    this.currentAction = action;
    this.notify();

    this.timeoutHandle = window.setTimeout(() => {
      if (this.currentAction?.id === action.id) {
        this.currentAction = null;
        this.timeoutHandle = null;
        this.notify();
      }
    }, durationMs);
  }

  static async undo(): Promise<void> {
    if (!this.currentAction) return;

    const actionToUndo = this.currentAction;
    this.dismiss();

    try {
      await actionToUndo.executeUndo();
    } catch (err) {
      console.error('Failed to execute undo:', err);
    }
  }

  static dismiss(): void {
    if (this.timeoutHandle !== null) {
      window.clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
    this.currentAction = null;
    this.notify();
  }
}
