import { Operation, generateOpId, OperationType } from './Operations';

export class OperationLogger {
  private operations: Operation[] = [];
  private lastSyncedOpId: string | null = null;
  private onFlush: (ops: Operation[]) => void;
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushDebounceMs: number;

  constructor(onFlush: (ops: Operation[]) => void, debounceMs = 1000) {
    this.onFlush = onFlush;
    this.flushDebounceMs = debounceMs;
  }

  log(type: OperationType, nodeKey: string, payload: unknown): void {
    const op: Operation = {
      id: generateOpId(),
      type,
      timestamp: Date.now(),
      nodeKey,
      payload,
    };

    this.operations.push(op);
    this.scheduleFlush();
  }

  logTextInsert(nodeKey: string, offset: number, text: string): void {
    const lastOp = this.operations[this.operations.length - 1];
    if (
      lastOp &&
      lastOp.type === 'INSERT_TEXT' &&
      lastOp.nodeKey === nodeKey
    ) {
      const lastPayload = lastOp.payload as { offset: number; text: string };
      if (lastPayload.offset + lastPayload.text.length === offset) {
        lastPayload.text += text;
        lastOp.timestamp = Date.now();
        this.scheduleFlush();
        return;
      }
    }

    this.log('INSERT_TEXT', nodeKey, { offset, text });
  }

  logTextDelete(nodeKey: string, offset: number, length: number): void {
    const lastOp = this.operations[this.operations.length - 1];
    if (
      lastOp &&
      lastOp.type === 'DELETE_TEXT' &&
      lastOp.nodeKey === nodeKey
    ) {
      const lastPayload = lastOp.payload as { offset: number; length: number };
      if (offset + length === lastPayload.offset) {
        lastPayload.offset = offset;
        lastPayload.length += length;
        lastOp.timestamp = Date.now();
        this.scheduleFlush();
        return;
      }
    }

    this.log('DELETE_TEXT', nodeKey, { offset, length });
  }

  logNodeInsert(nodeKey: string, parentKey: string, index: number, node: Record<string, unknown>): void {
    this.log('INSERT_NODE', nodeKey, { parentKey, index, node });
  }

  logNodeDelete(nodeKey: string): void {
    this.log('DELETE_NODE', nodeKey, { nodeKey });
  }

  logNodeUpdate(nodeKey: string, updates: Record<string, unknown>): void {
    this.log('UPDATE_NODE', nodeKey, { updates });
  }

  logNodeMove(nodeKey: string, newParentKey: string, newIndex: number): void {
    this.log('MOVE_NODE', nodeKey, { newParentKey, newIndex });
  }

  private scheduleFlush(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    this.flushTimer = setTimeout(() => this.flush(), this.flushDebounceMs);
  }

  getUnsynced(): Operation[] {
    if (!this.lastSyncedOpId) {
      return [...this.operations];
    }
    const idx = this.operations.findIndex(op => op.id === this.lastSyncedOpId);
    return this.operations.slice(idx + 1);
  }

  markSynced(lastOpId: string): void {
    this.lastSyncedOpId = lastOpId;
    if (this.operations.length > 100) {
      const idx = this.operations.findIndex(op => op.id === lastOpId);
      if (idx > 50) {
        this.operations = this.operations.slice(idx - 50);
      }
    }
  }

  private flush(): void {
    const unsynced = this.getUnsynced();
    if (unsynced.length === 0) return;
    this.onFlush(unsynced);
  }

  flushNow(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    this.flush();
  }

  clear(): void {
    this.operations = [];
    this.lastSyncedOpId = null;
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
  }
}
