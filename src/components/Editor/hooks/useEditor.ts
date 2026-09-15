import { createContext, useContext, useEffect, useReducer, useRef, RefObject } from 'react';
import { EditorCore, EditorState, EditorSelection, EditorCommand, TextFormat } from '../core';

export interface EditorContextValue {
  core: EditorCore | null;
  state: EditorState | null;
  selection: EditorSelection | null;
  dispatchCommand: (command: EditorCommand) => void;
  getActiveFormats: () => TextFormat;
  getActiveBlockType: () => string;
  canUndo: () => boolean;
  canRedo: () => boolean;
}

export const EditorContext = createContext<EditorContextValue | null>(null);

export function useEditor(): EditorContextValue {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  // Return a safe default when context is null (during initialization)
  if (context === null) {
    return {
      core: null,
      state: null,
      selection: null,
      dispatchCommand: () => {},
      getActiveFormats: () => ({}),
      getActiveBlockType: () => 'paragraph',
      canUndo: () => false,
      canRedo: () => false,
    };
  }
  return context;
}

export function useEditorContext(
  core: EditorCore | null
): [EditorContextValue, RefObject<HTMLDivElement>] {
  const containerRef = useRef<HTMLDivElement>(null) as RefObject<HTMLDivElement>;
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    if (!core) return;

    const unsubscribe = core.subscribe(() => {
      forceUpdate();
    });

    return unsubscribe;
  }, [core]);

  const value: EditorContextValue = {
    core,
    state: core?.getState() || null,
    selection: core?.getSelection() || null,
    dispatchCommand: (command) => core?.dispatchCommand(command),
    getActiveFormats: () => core?.getActiveFormats() || {},
    getActiveBlockType: () => core?.getActiveBlockType() || 'paragraph',
    canUndo: () => core?.canUndo() || false,
    canRedo: () => core?.canRedo() || false,
  };

  return [value, containerRef];
}
