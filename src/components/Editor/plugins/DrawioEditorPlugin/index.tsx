import { useEffect, useRef, useCallback } from 'react';
import { useEditor } from '../../hooks/useEditor';
import { useAuth } from '@site/src/context/AuthContext';
import { usePageDataStore } from '@site/src/store/pageDataStore';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getApiService } from '@site/src/services/api';
import { DrawioNode } from '../../core/types';

const DRAWIO_EDITOR_URL = 'https://embed.diagrams.net/?embed=1&proto=json&spin=1';

export default function DrawioEditorPlugin() {
  const { core } = useEditor();
  const { token } = useAuth();
  const { getActiveDocument } = usePageDataStore();
  const { siteConfig } = useDocusaurusContext();
  const { expressBackendUrl } = siteConfig.customFields as { expressBackendUrl: string };

  const editingNodeKeyRef = useRef<string | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const uploadEditedDiagram = useCallback(async (nodeKey: string, xml: string) => {
    if (!token || !expressBackendUrl) {
      console.warn('[DrawioEditor] Cannot upload - missing token or backend URL');
      return;
    }

    const activeDocument = getActiveDocument();
    if (!activeDocument) {
      console.warn('[DrawioEditor] Cannot upload - no active document');
      return;
    }

    try {
      const api = getApiService(expressBackendUrl);

      // Get the current node to check if it has an existing assetId
      const node = core?.getState().nodeMap.get(nodeKey) as DrawioNode;

      // Create a file from the XML
      const blob = new Blob([xml], { type: 'application/xml' });
      const file = new File([blob], 'diagram.drawio', { type: 'application/xml' });

      // Upload the edited diagram as a new asset
      const asset = await api.uploadAsset(token, activeDocument.id, file);

      console.log('[DrawioEditor] Uploaded edited diagram, new assetId:', asset.ID);

      // Update the node with both the new XML and the new assetId
      core?.dispatchCommand({
        type: 'UPDATE_DRAWIO_BY_KEY',
        payload: { key: nodeKey, diagramXML: xml, assetId: asset.ID }
      });
    } catch (error) {
      console.error('[DrawioEditor] Failed to upload edited diagram:', error);
      // Still update local state even if upload fails
      core?.dispatchCommand({
        type: 'UPDATE_DRAWIO_BY_KEY',
        payload: { key: nodeKey, diagramXML: xml }
      });
    }
  }, [token, expressBackendUrl, getActiveDocument, core]);

  const handleMessage = useCallback((event: MessageEvent) => {
    if (!event.data || typeof event.data !== 'string') return;

    try {
      const msg = JSON.parse(event.data);

      if (msg.event === 'init') {
        // Editor is ready, load the diagram
        if (editingNodeKeyRef.current && core) {
          const node = core.getState().nodeMap.get(editingNodeKeyRef.current) as DrawioNode;
          if (node?.diagramXML) {
            iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
              action: 'load',
              xml: node.diagramXML,
              autosave: 0
            }), '*');
          }
        }
      } else if (msg.event === 'save' || msg.event === 'exit') {
        // Save the diagram
        if (msg.xml && editingNodeKeyRef.current && core) {
          uploadEditedDiagram(editingNodeKeyRef.current, msg.xml);
        }

        // Close editor on exit
        if (msg.event === 'exit') {
          closeEditor();
        }
      } else if (msg.event === 'export') {
        // Handle export if needed
        if (msg.xml && editingNodeKeyRef.current && core) {
          uploadEditedDiagram(editingNodeKeyRef.current, msg.xml);
        }
        closeEditor();
      }
    } catch {
      // Not a JSON message, ignore
    }
  }, [core, uploadEditedDiagram]);

  const closeEditor = useCallback(() => {
    const modal = document.getElementById('drawio-editor-modal');
    if (modal) {
      modal.remove();
    }
    editingNodeKeyRef.current = null;
    iframeRef.current = null;
    window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  const openEditor = useCallback((nodeKey: string) => {
    if (!core) return;

    editingNodeKeyRef.current = nodeKey;
    window.addEventListener('message', handleMessage);

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'drawio-editor-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      z-index: 10000;
      display: flex;
      flex-direction: column;
    `;

    // Create header with close button
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 16px;
      background: #1a1a1a;
      color: white;
    `;

    const title = document.createElement('span');
    title.textContent = 'Edit Diagram';
    title.style.fontWeight = 'bold';

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Close';
    closeBtn.style.cssText = `
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    closeBtn.onclick = () => {
      // Request export before closing
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({
        action: 'export',
        format: 'xml',
        spin: 'Saving...'
      }), '*');
    };

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = DRAWIO_EDITOR_URL;
    iframe.style.cssText = `
      flex: 1;
      border: none;
      background: white;
    `;
    iframeRef.current = iframe;

    modal.appendChild(header);
    modal.appendChild(iframe);
    document.body.appendChild(modal);

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeEditor();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);
  }, [core, handleMessage, closeEditor]);

  useEffect(() => {
    if (!core) return;

    const container = core.getContainer();
    if (!container) return;

    // Listen for edit button clicks
    const handleClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const editBtn = target.closest('.editorDrawioEditBtn');
      if (editBtn) {
        const nodeKey = editBtn.getAttribute('data-node-key');
        if (nodeKey) {
          e.preventDefault();
          e.stopPropagation();
          openEditor(nodeKey);
        }
      }
    };

    container.addEventListener('click', handleClick);

    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [core, openEditor]);

  return null;
}
