import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useEditor } from '../../hooks/useEditor';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Plus,
  Trash2,
  Copy,
} from 'lucide-react';
import styles from './index.module.css';

interface MenuPosition {
  x: number;
  y: number;
}

interface TableContext {
  tableKey: string;
  rowIndex: number;
  colIndex: number;
  totalRows: number;
  totalCols: number;
}

type MenuType = 'column' | 'row' | null;

export default function TableMenuPlugin() {
  const editor = useEditor();
  const [menuType, setMenuType] = useState<MenuType>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [tableContext, setTableContext] = useState<TableContext | null>(null);
  const [columnHandles, setColumnHandles] = useState<{ x: number; y: number; width: number; colIndex: number; tableKey: string }[]>([]);
  const [rowHandles, setRowHandles] = useState<{ x: number; y: number; height: number; rowIndex: number; tableKey: string }[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Update handle positions when hovering over table
  const updateHandlePositions = useCallback(() => {
    const container = editor.core?.getContainer();
    if (!container) return;

    const tables = container.querySelectorAll('.editorTable');
    const newColHandles: typeof columnHandles = [];
    const newRowHandles: typeof rowHandles = [];

    tables.forEach(table => {
      const wrapper = table.closest('.editorTableWrapper');
      const tableKey = wrapper?.getAttribute('data-editor-key');
      if (!tableKey) return;

      const firstRow = table.querySelector('tr');
      if (!firstRow) return;

      // Get column handles (from first row cells) - positioned above each cell
      const cells = firstRow.querySelectorAll('td, th');
      cells.forEach((cell, colIndex) => {
        const rect = cell.getBoundingClientRect();
        newColHandles.push({
          x: rect.left,
          y: rect.top - 18,
          width: rect.width,
          colIndex,
          tableKey,
        });
      });

      // Get row handles (from each row) - positioned left of each row
      const rows = table.querySelectorAll('tr');
      rows.forEach((row, rowIndex) => {
        const rect = row.getBoundingClientRect();
        newRowHandles.push({
          x: rect.left - 18,
          y: rect.top,
          height: rect.height,
          rowIndex,
          tableKey,
        });
      });
    });

    setColumnHandles(newColHandles);
    setRowHandles(newRowHandles);
  }, [editor]);

  // Get table info from state
  const getTableInfo = useCallback((tableKey: string): { totalRows: number; totalCols: number } | null => {
    const state = editor.state;
    if (!state) return null;

    const table = state.nodeMap.get(tableKey);
    if (!table || table.type !== 'table') return null;

    const rows = (table as any).children;
    const totalRows = rows.length;

    if (totalRows === 0) return null;

    const firstRow = state.nodeMap.get(rows[0]);
    if (!firstRow || firstRow.type !== 'tablerow') return null;

    const totalCols = (firstRow as any).children.length;

    return { totalRows, totalCols };
  }, [editor]);

  const handleColumnClick = useCallback((colIndex: number, tableKey: string, x: number, y: number) => {
    const info = getTableInfo(tableKey);
    if (!info) return;

    setTableContext({
      tableKey,
      rowIndex: -1,
      colIndex,
      totalRows: info.totalRows,
      totalCols: info.totalCols,
    });
    setMenuPosition({ x, y: y + 20 });
    setMenuType('column');
  }, [getTableInfo]);

  const handleRowClick = useCallback((rowIndex: number, tableKey: string, x: number, y: number) => {
    const info = getTableInfo(tableKey);
    if (!info) return;

    setTableContext({
      tableKey,
      rowIndex,
      colIndex: -1,
      totalRows: info.totalRows,
      totalCols: info.totalCols,
    });
    setMenuPosition({ x: x + 20, y });
    setMenuType('row');
  }, [getTableInfo]);

  const closeMenu = useCallback(() => {
    setMenuType(null);
    setMenuPosition(null);
    setTableContext(null);
  }, []);

  // Menu actions
  const moveColumnLeft = useCallback(() => {
    if (!tableContext || tableContext.colIndex <= 0) return;
    editor.dispatchCommand({
      type: 'MOVE_TABLE_COL',
      payload: { tableKey: tableContext.tableKey, fromIndex: tableContext.colIndex, toIndex: tableContext.colIndex - 1 }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const moveColumnRight = useCallback(() => {
    if (!tableContext || tableContext.colIndex >= tableContext.totalCols - 1) return;
    editor.dispatchCommand({
      type: 'MOVE_TABLE_COL',
      payload: { tableKey: tableContext.tableKey, fromIndex: tableContext.colIndex, toIndex: tableContext.colIndex + 1 }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const insertColumnLeft = useCallback(() => {
    if (!tableContext) return;
    editor.dispatchCommand({
      type: 'INSERT_TABLE_COL_AT',
      payload: { tableKey: tableContext.tableKey, atIndex: tableContext.colIndex }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const insertColumnRight = useCallback(() => {
    if (!tableContext) return;
    editor.dispatchCommand({
      type: 'INSERT_TABLE_COL_AT',
      payload: { tableKey: tableContext.tableKey, atIndex: tableContext.colIndex + 1 }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const deleteColumn = useCallback(() => {
    if (!tableContext || tableContext.totalCols <= 1) return;
    editor.dispatchCommand({
      type: 'DELETE_TABLE_COL',
      payload: { tableKey: tableContext.tableKey, colIndex: tableContext.colIndex }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const moveRowUp = useCallback(() => {
    if (!tableContext || tableContext.rowIndex <= 0) return;
    editor.dispatchCommand({
      type: 'MOVE_TABLE_ROW',
      payload: { tableKey: tableContext.tableKey, fromIndex: tableContext.rowIndex, toIndex: tableContext.rowIndex - 1 }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const moveRowDown = useCallback(() => {
    if (!tableContext || tableContext.rowIndex >= tableContext.totalRows - 1) return;
    editor.dispatchCommand({
      type: 'MOVE_TABLE_ROW',
      payload: { tableKey: tableContext.tableKey, fromIndex: tableContext.rowIndex, toIndex: tableContext.rowIndex + 1 }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const insertRowAbove = useCallback(() => {
    if (!tableContext) return;
    editor.dispatchCommand({
      type: 'INSERT_TABLE_ROW_AT',
      payload: { tableKey: tableContext.tableKey, atIndex: tableContext.rowIndex }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const insertRowBelow = useCallback(() => {
    if (!tableContext) return;
    editor.dispatchCommand({
      type: 'INSERT_TABLE_ROW_AT',
      payload: { tableKey: tableContext.tableKey, atIndex: tableContext.rowIndex + 1 }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const deleteRow = useCallback(() => {
    if (!tableContext || tableContext.totalRows <= 1) return;
    editor.dispatchCommand({
      type: 'DELETE_TABLE_ROW',
      payload: { tableKey: tableContext.tableKey, rowIndex: tableContext.rowIndex }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const duplicateColumn = useCallback(() => {
    if (!tableContext) return;
    editor.dispatchCommand({
      type: 'DUPLICATE_TABLE_COL',
      payload: { tableKey: tableContext.tableKey, colIndex: tableContext.colIndex }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  const duplicateRow = useCallback(() => {
    if (!tableContext) return;
    editor.dispatchCommand({
      type: 'DUPLICATE_TABLE_ROW',
      payload: { tableKey: tableContext.tableKey, rowIndex: tableContext.rowIndex }
    } as any);
    closeMenu();
  }, [tableContext, editor, closeMenu]);

  // Update handles on scroll/resize
  useEffect(() => {
    const handleUpdate = () => {
      if (menuType) return; // Don't update while menu is open
      updateHandlePositions();
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    const interval = setInterval(handleUpdate, 500);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      clearInterval(interval);
    };
  }, [updateHandlePositions, menuType]);

  // Close menu on click outside
  useEffect(() => {
    if (!menuType) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuType, closeMenu]);

  // Close menu on escape
  useEffect(() => {
    if (!menuType) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuType, closeMenu]);

  return (
    <>
      {/* Column handles */}
      {columnHandles.map((handle, i) => (
        <div
          key={`col-${i}`}
          className={styles.columnHandle}
          style={{
            position: 'fixed',
            left: handle.x + 2,
            top: handle.y,
            width: handle.width - 4,
          }}
          onClick={() => handleColumnClick(handle.colIndex, handle.tableKey, handle.x + handle.width / 2, handle.y)}
        >
          <span className={styles.handleDot} />
          <span className={styles.handleDot} />
          <span className={styles.handleDot} />
        </div>
      ))}

      {/* Row handles */}
      {rowHandles.map((handle, i) => (
        <div
          key={`row-${i}`}
          className={styles.rowHandle}
          style={{
            position: 'fixed',
            left: handle.x,
            top: handle.y + 2,
            height: handle.height - 4,
          }}
          onClick={() => handleRowClick(handle.rowIndex, handle.tableKey, handle.x, handle.y + handle.height / 2)}
        >
          <span className={styles.handleDot} />
          <span className={styles.handleDot} />
          <span className={styles.handleDot} />
        </div>
      ))}

      {/* Column Menu */}
      {menuType === 'column' && menuPosition && tableContext && createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          style={{
            position: 'fixed',
            left: menuPosition.x - 100,
            top: menuPosition.y,
          }}
        >
          <button
            className={styles.menuItem}
            onClick={moveColumnLeft}
            disabled={tableContext.colIndex <= 0}
          >
            <ArrowLeft size={16} />
            <span>Move column left</span>
          </button>
          <button
            className={styles.menuItem}
            onClick={moveColumnRight}
            disabled={tableContext.colIndex >= tableContext.totalCols - 1}
          >
            <ArrowRight size={16} />
            <span>Move column right</span>
          </button>

          <div className={styles.menuDivider} />

          <button className={styles.menuItem} onClick={insertColumnLeft}>
            <Plus size={16} />
            <span>Insert column left</span>
          </button>
          <button className={styles.menuItem} onClick={insertColumnRight}>
            <Plus size={16} />
            <span>Insert column right</span>
          </button>

          <div className={styles.menuDivider} />

          <button className={styles.menuItem} onClick={duplicateColumn}>
            <Copy size={16} />
            <span>Duplicate column</span>
          </button>
          <button
            className={`${styles.menuItem} ${styles.danger}`}
            onClick={deleteColumn}
            disabled={tableContext.totalCols <= 1}
          >
            <Trash2 size={16} />
            <span>Delete column</span>
          </button>
        </div>,
        document.body
      )}

      {/* Row Menu */}
      {menuType === 'row' && menuPosition && tableContext && createPortal(
        <div
          ref={menuRef}
          className={styles.menu}
          style={{
            position: 'fixed',
            left: menuPosition.x,
            top: menuPosition.y - 100,
          }}
        >
          <button
            className={styles.menuItem}
            onClick={moveRowUp}
            disabled={tableContext.rowIndex <= 0}
          >
            <ArrowUp size={16} />
            <span>Move row up</span>
          </button>
          <button
            className={styles.menuItem}
            onClick={moveRowDown}
            disabled={tableContext.rowIndex >= tableContext.totalRows - 1}
          >
            <ArrowDown size={16} />
            <span>Move row down</span>
          </button>

          <div className={styles.menuDivider} />

          <button className={styles.menuItem} onClick={insertRowAbove}>
            <Plus size={16} />
            <span>Insert row above</span>
          </button>
          <button className={styles.menuItem} onClick={insertRowBelow}>
            <Plus size={16} />
            <span>Insert row below</span>
          </button>

          <div className={styles.menuDivider} />

          <button className={styles.menuItem} onClick={duplicateRow}>
            <Copy size={16} />
            <span>Duplicate row</span>
          </button>
          <button
            className={`${styles.menuItem} ${styles.danger}`}
            onClick={deleteRow}
            disabled={tableContext.totalRows <= 1}
          >
            <Trash2 size={16} />
            <span>Delete row</span>
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
