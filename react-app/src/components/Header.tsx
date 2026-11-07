import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone, MapPin, Clock, Menu, X, Shield, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface NavAnchorItem {
  id: number;
  label: string;
  anchor: string;
  order: number;
}

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Evaluate real-time opening status for Angers workshop:
  // Lundi au Samedi: 9h00 - 19h00
  // Dimanche: Fermé
  const now = new Date();
  const day = now.getDay(); // 0 is Sunday
  const hour = now.getHours();
  const isOpenNow = day >= 1 && day <= 6 && hour >= 9 && hour < 19;

  const isHomePage = location.pathname === '/' || location.pathname === '/a-angers';

  // 6 contractual navigation anchors in authoritative order (1 to 6)
  const navAnchorItems: NavAnchorItem[] = [
    { id: 78, label: 'Accueil', anchor: '#accueil', order: 1 },
    { id: 79, label: 'Mes Services', anchor: '#services', order: 2 },
    { id: 80, label: 'Contact', anchor: '#contact', order: 3 },
    { id: 81, label: 'Mes Horaires', anchor: '#horaires', order: 4 },
    { id: 82, label: 'Me Situer', anchor: '#localisation', order: 5 },
    { id: 353, label: 'Mon Atelier', anchor: '#atelier', order: 6 },
  ];

  const lexiconLinks = [
    { label: 'Lexique Cuirs', path: '/lexique-des-cuirs' },
    { label: 'Lexique Semelles', path: '/lexique-semelles-exterieurs' },
    { label: 'Lexique Chaussures', path: '/lexique-chaussures' },
  ];

  const handleAnchorClick = (anchor: string, e: React.MouseEvent) => {
    setMobileMenuOpen(false);

    if (isHomePage) {
      e.preventDefault();
      const targetId = anchor.replace(/^#/, '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', anchor);
      } else {
        window.location.hash = anchor;
      }
    } else {
      // From lexicon or external page, navigate to /#anchor
      e.preventDefault();
      navigate(`/${anchor}`);
    }
  };

  return (
    <header
      className={`public-header ${isHomePage ? 'public-header-home' : ''}`}
      style={{ position: 'sticky', top: 0, zIndex: 1000, width: '100%' }}
    >
      {/* Top Bar with Live Hours Status & Telephones */}
      <div className="public-top-bar">
        <div className="container flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 flex-wrap">
            <a
              href="tel:0241872383"
              className="flex items-center gap-1 top-bar-link"
              title="Appeler la cordonnerie Le Millot"
            >
              <Phone size={14} />
              <span>02 41 87 23 83</span>
            </a>
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              <span>55 Bd Jacques Millot, Angers</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Clock size={14} />
              {isOpenNow ? (
                <span className="hours-badge-open">Ouvert Actuellement</span>
              ) : (
                <span className="hours-badge-closed">Fermé</span>
              )}
            </span>
            <Link
              to={isAuthenticated ? '/admin' : '/admin/login'}
              className="flex items-center gap-1 top-bar-admin"
              style={{ fontSize: '0.8rem', fontWeight: 600 }}
              title="Espace Artisan"
            >
              <Shield size={13} />
              <span>{isAuthenticated ? 'Tableau de bord' : 'Connexion'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className="container"
        style={{
          padding: '0.75rem 1.25rem',
          backgroundColor: '#FFFFFF',
          borderBottom: '2px solid var(--cordo-chocolate)',
        }}
      >
        <div className="flex items-center justify-between">
          {/* Brand Identity / Logo */}
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={(e) => {
              if (isHomePage) {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
                window.history.pushState(null, '', '/#accueil');
              }
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                backgroundColor: 'var(--cordo-chocolate)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-title)',
                fontSize: '1.3rem',
                borderRadius: '8px',
                boxShadow: '3px 3px 0px 0px var(--cordo-gold)',
                border: '2px solid var(--cordo-gold)',
                flexShrink: 0,
              }}
            >
              LM
            </div>
            <div>
              <div
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '1.15rem',
                  color: 'var(--cordo-chocolate)',
                  lineHeight: 1.1,
                  letterSpacing: '0.03em',
                }}
              >
                CORDONNERIE LE MILLOT
              </div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--cordo-caramel)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Artisan Cordonnier Bottier & Clés • Angers
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
            }}
            className="desktop-nav"
          >
            {navAnchorItems.map((item) => {
              const targetUrl = isHomePage ? item.anchor : `/${item.anchor}`;
              return (
                <a
                  key={item.anchor}
                  href={targetUrl}
                  onClick={(e) => handleAnchorClick(item.anchor, e)}
                  style={{
                    fontFamily: 'var(--font-title)',
                    fontSize: '0.85rem',
                    color: 'var(--cordo-chocolate)',
                    textDecoration: 'none',
                    padding: '0.35rem 0',
                    transition: 'color var(--transition-fast)',
                  }}
                  className="nav-anchor-link"
                >
                  {item.label}
                </a>
              );
            })}

            {/* Glossaires Dropdown / Links in Desktop Nav */}
            <div className="nav-lexicon-group" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to="/lexique-des-cuirs"
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '0.8rem',
                  color: location.pathname === '/lexique-des-cuirs' ? 'var(--cordo-gold)' : 'var(--cordo-caramel)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}
              >
                <BookOpen size={13} />
                <span>Lexique</span>
              </Link>
            </div>

            <a href="tel:0241872383" className="btn btn-primary btn-sm" style={{ flexShrink: 0 }}>
              02 41 87 23 83
            </a>
          </nav>

          {/* Mobile Hamburger Toggle Button */}
          <button
            type="button"
            className="mobile-nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--cordo-chocolate)',
              padding: '0.5rem',
            }}
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (Responsive slide-down pure CSS) */}
      {mobileMenuOpen && (
        <div
          className="mobile-nav-drawer"
          style={{
            backgroundColor: 'var(--cordo-cream)',
            borderBottom: '3px solid var(--cordo-chocolate)',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--cordo-muted)', textTransform: 'uppercase' }}>
            Sections du site
          </div>
          {navAnchorItems.map((item) => {
            const targetUrl = isHomePage ? item.anchor : `/${item.anchor}`;
            return (
              <a
                key={item.anchor}
                href={targetUrl}
                onClick={(e) => handleAnchorClick(item.anchor, e)}
                style={{
                  fontFamily: 'var(--font-title)',
                  fontSize: '1rem',
                  color: 'var(--cordo-chocolate)',
                  textDecoration: 'none',
                  padding: '0.4rem 0',
                  borderBottom: '1px solid rgba(113, 88, 57, 0.15)',
                }}
              >
                {item.label}
              </a>
            );
          })}

          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--cordo-muted)',
              textTransform: 'uppercase',
              marginTop: '0.5rem',
            }}
          >
            Pages Lexiques Techniques
          </div>
          {lexiconLinks.map((lex) => (
            <Link
              key={lex.path}
              to={lex.path}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                fontSize: '0.9rem',
                color: location.pathname === lex.path ? 'var(--cordo-gold)' : 'var(--cordo-chocolate)',
                fontWeight: 600,
                textDecoration: 'none',
                padding: '0.3rem 0',
              }}
            >
              • {lex.label}
            </Link>
          ))}

          <a
            href="tel:0241872383"
            className="btn btn-primary btn-sm"
            onClick={() => setMobileMenuOpen(false)}
            style={{ marginTop: '0.75rem', textAlign: 'center' }}
          >
            Nous appeler (02 41 87 23 83)
          </a>
        </div>
      )}
    </header>
  );
};

export default Header;
