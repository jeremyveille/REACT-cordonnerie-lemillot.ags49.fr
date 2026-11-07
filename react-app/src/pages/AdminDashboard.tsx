import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  PlusCircle,
  ExternalLink,
  Edit3,
  Trash2,
  Copy,
  Search,
  CheckCircle,
  LogOut,
  Globe,
  Layers,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storageAdapter } from '../firebase/storageAdapter';
import type { PageRecord } from '../types/page';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [pages, setPages] = useState<PageRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const loadPages = async () => {
    setLoading(true);
    try {
      const records = await storageAdapter.getPages();
      setPages(records);
    } catch (err) {
      console.error('Error loading pages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setNewTitle(title);
    // Auto-generate clean slug
    const generatedSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setNewSlug(generatedSlug);
  };

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (!newTitle.trim()) {
      setCreateError('Le titre de la page est obligatoire.');
      return;
    }

    try {
      const created = await storageAdapter.createPage(newTitle, newSlug || `page-${Date.now()}`);
      setShowCreateModal(false);
      setNewTitle('');
      setNewSlug('');
      await loadPages();
      // Navigate to the visual editor for this new page
      navigate(`/admin/edit/${created.id}`);
    } catch (err: any) {
      setCreateError(err.message || 'Impossible de créer la page.');
    }
  };

  const handleDuplicatePage = async (id: string, title: string) => {
    try {
      const duplicated = await storageAdapter.duplicatePage(id);
      await loadPages();
      alert(`La page "${title}" a été dupliquée avec succès : "${duplicated.title}".`);
    } catch (err: any) {
      console.error('Error duplicating page:', err);
      alert('Erreur lors de la duplication : ' + (err.message || 'Échec'));
    }
  };

  const handlePublishDirect = async (id: string, title: string) => {
    try {
      await storageAdapter.publishPage(id);
      await loadPages();
      alert(`La page "${title}" a été publiée avec succès sur le site public.`);
    } catch (err: any) {
      console.error('Error publishing page:', err);
      alert('Erreur lors de la publication : ' + (err.message || 'Échec'));
    }
  };

  const handleDeletePage = async (id: string, title: string) => {
    if (window.confirm(`Confirmez-vous la suppression de la page "${title}" ?`)) {
      try {
        await storageAdapter.deletePage(id);
        await loadPages();
      } catch (err) {
        console.error('Error deleting page:', err);
      }
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-shell">
      {/* Top Admin Navigation */}
      <header className="admin-nav">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '36px',
              height: '36px',
              backgroundColor: 'var(--cordo-gold)',
              color: 'var(--cordo-chocolate)',
              fontWeight: 900,
              fontFamily: 'var(--font-title)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
            }}
          >
            LM
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.05rem', lineHeight: 1.1 }}>
              Tableau de Bord Artisan
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.85 }}>
              Cordonnerie Le Millot • Angers
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div style={{ fontSize: '0.85rem' }}>
            <span style={{ opacity: 0.8 }}>Connecté : </span>
            <strong>{user?.displayName || user?.email || 'Artisan'}</strong>
            {user?.isDemo && (
              <span
                style={{
                  marginLeft: '0.5rem',
                  backgroundColor: 'var(--cordo-gold)',
                  color: 'white',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                }}
              >
                Mode Démo
              </span>
            )}
          </div>

          <Link
            to="/"
            target="_blank"
            className="btn btn-outline btn-sm"
            style={{ color: 'white', borderColor: 'rgba(255, 255, 255, 0.4)' }}
            title="Ouvrir le site public"
          >
            <Globe size={14} />
            <span>Site Public</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="btn btn-danger btn-sm"
            title="Se déconnecter"
          >
            <LogOut size={14} />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="admin-main container">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
          <div className="cordo-card">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--cordo-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Pages Totales
                </p>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', color: 'var(--cordo-chocolate)' }}>
                  {pages.length}
                </div>
              </div>
              <Layers size={32} style={{ color: 'var(--cordo-caramel)' }} />
            </div>
          </div>

          <div className="cordo-card">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--cordo-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Pages Publiées
                </p>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.75rem', color: 'var(--cordo-green)' }}>
                  {pages.filter((p) => p.status === 'published').length}
                </div>
              </div>
              <Globe size={32} style={{ color: 'var(--cordo-green)' }} />
            </div>
          </div>

          <div className="cordo-card">
            <div className="flex items-center justify-between">
              <div>
                <p style={{ color: 'var(--cordo-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  Éditeur Visuel
                </p>
                <div style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', color: 'var(--cordo-gold)' }}>
                  Puck v0.20
                </div>
              </div>
              <Sparkles size={32} style={{ color: 'var(--cordo-gold)' }} />
            </div>
          </div>
        </div>

        {/* Page Management Section */}
        <div className="cordo-card" style={{ padding: '2rem' }}>
          <div className="flex items-center justify-between flex-wrap gap-4" style={{ marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--cordo-chocolate)', marginBottom: '0.25rem' }}>
                Gestionnaire de Pages
              </h2>
              <p style={{ color: 'var(--cordo-muted)', fontSize: '0.9rem', margin: 0 }}>
                Créez, modifiez avec le constructeur visuel Puck et publiez les pages du site.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="btn btn-primary"
            >
              <PlusCircle size={18} />
              <span>Créer une Nouvelle Page</span>
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--cordo-muted)' }}>Chargement des pages...</p>
            </div>
          ) : pages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', backgroundColor: 'var(--cordo-cream)', borderRadius: 'var(--radius-md)' }}>
              <FileText size={48} style={{ color: 'var(--cordo-border)', margin: '0 auto 1rem' }} />
              <p>Aucune page trouvée.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Titre de la Page</th>
                    <th>URL (Slug)</th>
                    <th>Statut</th>
                    <th>Dernière Mise à Jour</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p) => {
                    const publicUrl = p.slug === '/' ? '/' : `/${p.slug.replace(/^\//, '')}`;
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.title}</strong>
                        </td>
                        <td>
                          <code style={{ backgroundColor: '#F0ECE1', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>
                            {p.slug}
                          </code>
                        </td>
                        <td>
                          {p.status === 'published' && (
                            <span className="badge badge-published">Publié</span>
                          )}
                          {p.status === 'draft' && (
                            <span className="badge badge-draft">Brouillon</span>
                          )}
                          {p.status === 'modified' && (
                            <span className="badge badge-modified">Modifications non publiées</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.85rem', color: 'var(--cordo-muted)' }}>
                          {new Date(p.updatedAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                            <Link
                              to={`/admin/edit/${p.id}`}
                              className="btn btn-primary btn-sm"
                              title="Éditer avec Puck"
                            >
                              <Edit3 size={14} />
                              <span>Éditer</span>
                            </Link>
                            {p.status !== 'published' && (
                              <button
                                type="button"
                                onClick={() => handlePublishDirect(p.id, p.title)}
                                className="btn btn-gold btn-sm"
                                style={{ padding: '0.35rem 0.6rem' }}
                                title="Publier directement"
                              >
                                <CheckCircle size={14} />
                                <span>Publier</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDuplicatePage(p.id, p.title)}
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.35rem 0.5rem' }}
                              title="Dupliquer cette page"
                            >
                              <Copy size={14} />
                            </button>
                            <Link
                              to={publicUrl}
                              target="_blank"
                              className="btn btn-outline btn-sm"
                              style={{ padding: '0.35rem 0.5rem' }}
                              title="Voir en direct"
                            >
                              <ExternalLink size={14} />
                            </Link>
                            {p.id !== '83' && (
                              <button
                                type="button"
                                onClick={() => handleDeletePage(p.id, p.title)}
                                className="btn btn-danger btn-sm"
                                style={{ padding: '0.35rem 0.5rem' }}
                                title="Supprimer"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Créer une Page */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 200,
          }}
        >
          <div className="cordo-card" style={{ width: '100%', maxWidth: '520px', padding: '2rem' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, color: 'var(--cordo-chocolate)' }}>
                Créer une Nouvelle Page
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cordo-muted)' }}
              >
                <X size={22} />
              </button>
            </div>

            {createError && (
              <div
                style={{
                  backgroundColor: '#FFEBEE',
                  color: '#C62828',
                  padding: '0.6rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                }}
              >
                {createError}
              </div>
            )}

            <form onSubmit={handleCreatePage}>
              <div className="form-group">
                <label className="form-label">Titre de la Page *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="ex: Nos Réparations de Souliers"
                  value={newTitle}
                  onChange={handleTitleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">URL / Slug de la Page</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="ex: nos-reparations-de-souliers"
                  value={newSlug}
                  onChange={(e) => setNewSlug(e.target.value)}
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--cordo-muted)' }}>
                  Sera accessible sur <code>/{newSlug || 'mon-slug'}</code>
                </span>
              </div>

              <div className="flex justify-end gap-3" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn btn-outline"
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary">
                  Créer et Ouvrir l'Éditeur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
