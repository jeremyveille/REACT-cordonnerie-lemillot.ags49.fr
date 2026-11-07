import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Puck, type Data as PuckData } from '@measured/puck';
import {
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  Smartphone,
  Tablet,
  Monitor,
  Tv,
  Undo2,
  Redo2,
  Maximize2,
} from 'lucide-react';
import { storageAdapter } from '../firebase/storageAdapter';
import { puckConfig, puckViewports } from '../puck/config';
import type { PageRecord } from '../types/page';

export const AdminEditor: React.FC = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();

  const [page, setPage] = useState<PageRecord | null>(null);
  const [editorData, setEditorData] = useState<PuckData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [activeViewport, setActiveViewport] = useState<number | 'auto'>('auto');

  // History stack management
  const [history, setHistory] = useState<PuckData[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const isUndoRedoActionRef = useRef<boolean>(false);

  // Ref to hold current data for publication
  const currentDataRef = useRef<PuckData | null>(null);

  useEffect(() => {
    if (!pageId) return;

    let isMounted = true;
    setLoading(true);

    storageAdapter
      .getPageById(pageId)
      .then((record) => {
        if (isMounted) {
          if (!record) {
            navigate('/admin');
            return;
          }
          setPage(record);
          const initialData = record.draftData || record.publishedData || { content: [], root: { props: { title: record.title } } };
          setEditorData(initialData);
          currentDataRef.current = initialData;
          setHistory([initialData]);
          setHistoryIndex(0);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error loading page in editor:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [pageId, navigate]);

  // Debounced auto-save handler for Puck onChange
  const handlePuckChange = useCallback(
    (data: PuckData) => {
      if (!pageId) return;
      currentDataRef.current = data;

      // Update history if this wasn't an internal undo/redo trigger
      if (!isUndoRedoActionRef.current) {
        setHistory((prev) => {
          const upToCurrent = prev.slice(0, historyIndex + 1);
          // Avoid duplicate state if identical
          if (JSON.stringify(upToCurrent[upToCurrent.length - 1]) === JSON.stringify(data)) {
            return prev;
          }
          const next = [...upToCurrent, data];
          setHistoryIndex(next.length - 1);
          return next;
        });
      }
      isUndoRedoActionRef.current = false;

      setIsSaving(true);
      setSaveSuccess(false);

      storageAdapter
        .saveDraft(pageId, data)
        .then(() => {
          setIsSaving(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 2000);
        })
        .catch((err) => {
          console.error('Draft auto-save error:', err);
          setIsSaving(false);
        });
    },
    [pageId, historyIndex]
  );

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const targetData = history[prevIndex];
      if (targetData) {
        isUndoRedoActionRef.current = true;
        setHistoryIndex(prevIndex);
        setEditorData(targetData);
        currentDataRef.current = targetData;
        if (pageId) {
          storageAdapter.saveDraft(pageId, targetData).catch(console.error);
        }
      }
    }
  }, [history, historyIndex, pageId]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      const targetData = history[nextIndex];
      if (targetData) {
        isUndoRedoActionRef.current = true;
        setHistoryIndex(nextIndex);
        setEditorData(targetData);
        currentDataRef.current = targetData;
        if (pageId) {
          storageAdapter.saveDraft(pageId, targetData).catch(console.error);
        }
      }
    }
  }, [history, historyIndex, pageId]);

  // Keyboard shortcuts (Ctrl+Z / Ctrl+Y or Ctrl+Shift+Z)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Publish handler
  const handlePublish = async (data: PuckData) => {
    if (!pageId) return;
    setIsSaving(true);
    try {
      await storageAdapter.publishPage(pageId, data);
      setIsSaving(false);
      alert('Page publiée avec succès ! Elle est désormais visible sur le site public.');
    } catch (err: any) {
      console.error('Error publishing page:', err);
      setIsSaving(false);
      alert('Erreur lors de la publication : ' + (err.message || 'Échec de synchronisation'));
    }
  };

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-title)',
          color: 'var(--cordo-chocolate)',
          fontSize: '1.2rem',
        }}
      >
        Initialisation de l’Éditeur Visuel Puck...
      </div>
    );
  }

  if (!page || !editorData) {
    return null;
  }

  const publicUrl = page.slug === '/' ? '/' : `/${page.slug.replace(/^\//, '')}`;
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="puck-editor-wrapper">
      {/* Top Editor Custom Bar */}
      <div className="puck-top-bar">
        {/* Left: Back to Admin and Page Title */}
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="btn btn-outline btn-sm"
            style={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.4)' }}
            title="Retour au Tableau de Bord"
          >
            <ArrowLeft size={16} />
            <span>Tableau de Bord</span>
          </Link>
          <div style={{ borderLeft: '1px solid rgba(255, 255, 255, 0.2)', paddingLeft: '0.75rem' }}>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '0.95rem' }}>
              {page.title}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
              URL : <code>{page.slug}</code>
            </div>
          </div>
        </div>

        {/* Center-Left: Undo / Redo Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '0.2rem 0.4rem',
            borderRadius: 'var(--radius-sm)',
            gap: '0.35rem',
          }}
          className="editor-history-controls"
        >
          <button
            type="button"
            onClick={handleUndo}
            disabled={!canUndo}
            className="btn btn-sm"
            style={{
              padding: '0.3rem 0.5rem',
              backgroundColor: 'transparent',
              color: canUndo ? 'white' : 'rgba(255, 255, 255, 0.35)',
              border: 'none',
              boxShadow: 'none',
              cursor: canUndo ? 'pointer' : 'not-allowed',
            }}
            title="Annuler (Ctrl+Z)"
          >
            <Undo2 size={16} />
          </button>
          <button
            type="button"
            onClick={handleRedo}
            disabled={!canRedo}
            className="btn btn-sm"
            style={{
              padding: '0.3rem 0.5rem',
              backgroundColor: 'transparent',
              color: canRedo ? 'white' : 'rgba(255, 255, 255, 0.35)',
              border: 'none',
              boxShadow: 'none',
              cursor: canRedo ? 'pointer' : 'not-allowed',
            }}
            title="Rétablir (Ctrl+Y)"
          >
            <Redo2 size={16} />
          </button>
        </div>

        {/* Center: Responsive Viewport Switcher (375px, 768px, 1200px, 1440px, Plein écran) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.25)',
            padding: '0.2rem 0.4rem',
            borderRadius: 'var(--radius-sm)',
            gap: '0.25rem',
          }}
          className="editor-viewports"
        >
          <button
            type="button"
            onClick={() => setActiveViewport(375)}
            className="btn btn-sm"
            style={{
              padding: '0.3rem 0.5rem',
              backgroundColor: activeViewport === 375 ? 'var(--cordo-gold)' : 'transparent',
              color: 'white',
              border: 'none',
              boxShadow: 'none',
            }}
            title="📱 Mobile (375px)"
          >
            <Smartphone size={16} />
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>375</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewport(768)}
            className="btn btn-sm"
            style={{
              padding: '0.3rem 0.5rem',
              backgroundColor: activeViewport === 768 ? 'var(--cordo-gold)' : 'transparent',
              color: 'white',
              border: 'none',
              boxShadow: 'none',
            }}
            title="📟 Tablette (768px)"
          >
            <Tablet size={16} />
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>768</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewport(1200)}
            className="btn btn-sm"
            style={{
              padding: '0.3rem 0.5rem',
              backgroundColor: activeViewport === 1200 ? 'var(--cordo-gold)' : 'transparent',
              color: 'white',
              border: 'none',
              boxShadow: 'none',
            }}
            title="💻 Ordinateur (1200px)"
          >
            <Monitor size={16} />
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>1200</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewport(1440)}
            className="btn btn-sm"
            style={{
              padding: '0.3rem 0.5rem',
              backgroundColor: activeViewport === 1440 ? 'var(--cordo-gold)' : 'transparent',
              color: 'white',
              border: 'none',
              boxShadow: 'none',
            }}
            title="🖥️ Grand Écran (1440px)"
          >
            <Tv size={16} />
            <span style={{ fontSize: '0.75rem', marginLeft: '0.25rem' }}>1440</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveViewport('auto')}
            className="btn btn-sm"
            style={{
              padding: '0.3rem 0.5rem',
              backgroundColor: activeViewport === 'auto' ? 'var(--cordo-gold)' : 'transparent',
              color: 'white',
              border: 'none',
              boxShadow: 'none',
            }}
            title="Plein Écran Fluide (100%)"
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Right: Autosave status & Publish Button */}
        <div className="flex items-center gap-3">
          <div style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            {isSaving ? (
              <span style={{ opacity: 0.8 }}>Sauvegarde du brouillon...</span>
            ) : saveSuccess ? (
              <span style={{ color: 'var(--cordo-yellow)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <CheckCircle2 size={14} /> Brouillon enregistré
              </span>
            ) : (
              <span style={{ opacity: 0.7 }}>Brouillon à jour</span>
            )}
          </div>

          <Link
            to={publicUrl}
            target="_blank"
            className="btn btn-outline btn-sm"
            style={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.4)' }}
            title="Aperçu public"
          >
            <ExternalLink size={14} />
            <span>Aperçu</span>
          </Link>

          <button
            type="button"
            onClick={() => {
              if (currentDataRef.current) {
                handlePublish(currentDataRef.current);
              }
            }}
            className="btn btn-gold btn-sm"
            disabled={isSaving}
          >
            <UploadCloud size={16} />
            <span>Publier la Page</span>
          </button>
        </div>
      </div>

      {/* Puck Editor Container with Controlled Viewport Width & Zero Horizontal Overflow */}
      <div
        className="puck-canvas-outer"
        style={{
          flex: 1,
          overflowX: 'hidden',
          overflowY: 'auto',
          display: 'flex',
          justifyContent: 'center',
          backgroundColor: '#e5e7eb',
          width: '100%',
        }}
      >
        <div
          className="puck-canvas-viewport-frame"
          style={{
            width: activeViewport === 'auto' ? '100%' : `${activeViewport}px`,
            maxWidth: '100%',
            height: '100%',
            transition: 'width 0.25s ease',
            boxShadow: activeViewport === 'auto' ? 'none' : '0 10px 30px rgba(0,0,0,0.3)',
            backgroundColor: 'white',
            overflowX: 'hidden',
            boxSizing: 'border-box',
          }}
        >
          <Puck
            key={`puck-${page.id}-${historyIndex}`}
            config={puckConfig}
            data={editorData}
            viewports={puckViewports}
            onPublish={handlePublish}
            onChange={handlePuckChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminEditor;
