export type OperationType =
  | 'INSERT_TEXT'
  | 'DELETE_TEXT'
  | 'INSERT_NODE'
  | 'DELETE_NODE'
  | 'UPDATE_NODE'
  | 'MOVE_NODE';

export interface Operation {
  id: string;
  type: OperationType;
  timestamp: number;
  nodeKey: string;
  payload: unknown;
}

export interface InsertTextOp extends Operation {
  type: 'INSERT_TEXT';
  payload: {
    offset: number;
    text: string;
  };
}

export interface DeleteTextOp extends Operation {
  type: 'DELETE_TEXT';
  payload: {
    offset: number;
    length: number;
  };
}

export interface InsertNodeOp extends Operation {
  type: 'INSERT_NODE';
  payload: {
    parentKey: string;
    index: number;
    node: Record<string, unknown>;
  };
}

export interface DeleteNodeOp extends Operation {
  type: 'DELETE_NODE';
  payload: {
    nodeKey: string;
  };
}

export interface UpdateNodeOp extends Operation {
  type: 'UPDATE_NODE';
  payload: {
    updates: Record<string, unknown>;
  };
}

export interface MoveNodeOp extends Operation {
  type: 'MOVE_NODE';
  payload: {
    newParentKey: string;
    newIndex: number;
  };
}

export function generateOpId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
