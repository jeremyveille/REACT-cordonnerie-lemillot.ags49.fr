import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, KeyRound, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleFillDemo = () => {
    setEmail('admin@cordonnerie-lemillot.fr');
    setPassword('demo123456');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/admin');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(
        err.message || 'Identifiants invalides. Vérifiez votre adresse email et mot de passe.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F5EFEB',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              color: 'var(--cordo-chocolate)',
              fontWeight: 600,
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}
          >
            <ArrowLeft size={16} />
            Retourner au site public
          </Link>

          <div
            style={{
              width: '60px',
              height: '60px',
              backgroundColor: 'var(--cordo-chocolate)',
              color: 'white',
              margin: '0 auto 1rem',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '4px 4px 0px 0px var(--cordo-gold)',
              border: '2px solid var(--cordo-gold)',
            }}
          >
            <Shield size={32} />
          </div>

          <h1 style={{ fontSize: '1.8rem', color: 'var(--cordo-chocolate)' }}>
            Espace Artisan
          </h1>
          <p style={{ color: 'var(--cordo-muted)', fontSize: '0.95rem' }}>
            Administration Cordonnerie Le Millot • Puck Editor
          </p>
        </div>

        <div className="cordo-card">
          {error && (
            <div
              style={{
                backgroundColor: '#FFEBEE',
                border: '1px solid #FFCDD2',
                color: '#C62828',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                fontSize: '0.85rem',
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Adresse Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                required
                placeholder="artisan@cordonnerie-lemillot.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={isSubmitting}
            >
              <KeyRound size={18} />
              <span>{isSubmitting ? 'Connexion en cours...' : 'Se Connecter'}</span>
            </button>
          </form>

          {/* Demo Credentials Box */}
          <div
            style={{
              marginTop: '1.5rem',
              paddingTop: '1.25rem',
              borderTop: '2px dashed var(--cordo-border)',
              backgroundColor: 'var(--cordo-cream)',
              margin: '1.5rem -1.5rem -1.5rem',
              padding: '1.25rem 1.5rem',
              borderBottomLeftRadius: 'var(--radius-md)',
              borderBottomRightRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--cordo-chocolate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Mode Démo / Hors-Ligne
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              >
                <CheckCircle2 size={12} />
                <span>Remplir auto</span>
              </button>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--cordo-dark)', lineHeight: 1.5 }}>
              Email : <code>admin@cordonnerie-lemillot.fr</code><br />
              Mot de passe : <code>demo123456</code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
