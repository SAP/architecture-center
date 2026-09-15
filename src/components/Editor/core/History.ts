import { EditorState, EditorSelection } from './types';
import { cloneState } from './EditorState';

interface HistoryEntry {
  state: EditorState;
  selection: EditorSelection | null;
}

export class HistoryManager {
  private undoStack: HistoryEntry[] = [];
  private redoStack: HistoryEntry[] = [];
  private maxSize: number;
  private lastPushTime: number = 0;
  private debounceMs: number = 300;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  // Push current state to history
  push(state: EditorState, selection: EditorSelection | null): void {
    const now = Date.now();

    // Debounce rapid changes (like continuous typing)
    if (now - this.lastPushTime < this.debounceMs && this.undoStack.length > 0) {
      // Update the last entry instead of creating a new one
      this.undoStack[this.undoStack.length - 1] = {
        state: cloneState(state),
        selection,
      };
    } else {
      // Push new entry
      this.undoStack.push({
        state: cloneState(state),
        selection,
      });

      // Limit stack size
      if (this.undoStack.length > this.maxSize) {
        this.undoStack.shift();
      }
    }

    // Clear redo stack on new changes
    this.redoStack = [];
    this.lastPushTime = now;
  }

  // Force push (bypass debounce)
  forcePush(state: EditorState, selection: EditorSelection | null): void {
    this.undoStack.push({
      state: cloneState(state),
      selection,
    });

    if (this.undoStack.length > this.maxSize) {
      this.undoStack.shift();
    }

    this.redoStack = [];
    this.lastPushTime = Date.now();
  }

  // Undo - returns previous state or null
  undo(currentState: EditorState, currentSelection: EditorSelection | null): HistoryEntry | null {
    if (this.undoStack.length === 0) return null;

    // Move current state to redo stack
    this.redoStack.push({
      state: cloneState(currentState),
      selection: currentSelection,
    });

    // Pop and return previous state
    const entry = this.undoStack.pop()!;
    return {
      state: cloneState(entry.state),
      selection: entry.selection,
    };
  }

  // Redo - returns next state or null
  redo(currentState: EditorState, currentSelection: EditorSelection | null): HistoryEntry | null {
    if (this.redoStack.length === 0) return null;

    // Move current state to undo stack
    this.undoStack.push({
      state: cloneState(currentState),
      selection: currentSelection,
    });

    // Pop and return next state
    const entry = this.redoStack.pop()!;
    return {
      state: cloneState(entry.state),
      selection: entry.selection,
    };
  }

  canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
  }
}
