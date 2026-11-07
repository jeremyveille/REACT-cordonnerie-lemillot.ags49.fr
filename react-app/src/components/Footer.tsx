import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone, MapPin, Mail, Lock, ExternalLink, Share2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/a-angers';

  const anchorLinks = [
    { label: 'Accueil', anchor: '#accueil' },
    { label: 'Mes Services', anchor: '#services' },
    { label: 'Contact', anchor: '#contact' },
    { label: 'Mes Horaires', anchor: '#horaires' },
    { label: 'Me Situer', anchor: '#localisation' },
    { label: 'Mon Atelier', anchor: '#atelier' },
  ];

  const handleAnchorClick = (anchor: string, e: React.MouseEvent) => {
    if (isHomePage) {
      e.preventDefault();
      const targetId = anchor.replace(/^#/, '');
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', anchor);
      }
    }
  };

  return (
    <footer className={`public-footer ${isHomePage ? 'public-footer-home' : ''}`}>
      <div className="container">
        {/* 4 Contractual Columns: Plan du site, Navigation, Copyright ©, Partage */}
        <div className="grid grid-cols-4 gap-6 footer-columns-grid" style={{ marginBottom: isHomePage ? 0 : '2.5rem' }}>
          {/* Column 1: Plan du site */}
          <div className="footer-col">
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--cordo-gold)', marginBottom: '1rem' }}>
              Plan du site
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: 2.1 }}>
              {anchorLinks.map((link) => (
                <li key={link.anchor}>
                  <a
                    href={isHomePage ? link.anchor : `/${link.anchor}`}
                    onClick={(e) => handleAnchorClick(link.anchor, e)}
                    style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}
                    className="footer-link"
                  >
                    • {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: Navigation & Glossaires */}
          <div className="footer-col">
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--cordo-gold)', marginBottom: '1rem' }}>
              Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', lineHeight: 2.1 }}>
              <li>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                  • Page Vitrine
                </Link>
              </li>
              <li>
                <Link to="/lexique-des-cuirs" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                  • Lexique des cuirs (37 termes)
                </Link>
              </li>
              <li>
                <Link to="/lexique-semelles-exterieurs" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                  • Lexique semelles extérieures
                </Link>
              </li>
              <li>
                <Link to="/lexique-chaussures" style={{ color: 'white', textDecoration: 'none', opacity: 0.9 }}>
                  • Lexique chaussures & anatomie
                </Link>
              </li>
              <li style={{ marginTop: '0.5rem' }}>
                <Link
                  to="/admin/login"
                  style={{
                    color: 'var(--cordo-gold)',
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <Lock size={12} />
                  <span>Accès Administration</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Copyright © */}
          <div className="footer-col">
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--cordo-gold)', marginBottom: '1rem' }}>
              Copyright ©
            </h4>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.6, opacity: 0.9, margin: 0 }}>
              <strong>Copyright © 2023 tous droits protégés.</strong>
            </p>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.6, opacity: 0.85, marginTop: '0.5rem' }}>
              <strong>Cordonnerie "Le Millot"</strong>
              <br />
              Artisan Cordonnier : <em>Jean-Christophe ASIEN</em>
              <br />
              Depuis plus de 21 ans d'expérience artisanale.
            </p>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', opacity: 0.85 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={13} style={{ color: 'var(--cordo-gold)' }} />
                <span>55 Boulevard Jacques Millot, 49000 Angers</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem' }}>
                <Phone size={13} style={{ color: 'var(--cordo-gold)' }} />
                <a href="tel:0241470629" style={{ color: 'white' }}>
                  02 41 47 06 29 / 02 41 87 23 83
                </a>
              </div>
            </div>
          </div>

          {/* Column 4: Partage & Crédits */}
          <div className="footer-col">
            <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--cordo-gold)', marginBottom: '1rem' }}>
              Partage
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: 1.5, opacity: 0.85, margin: 0 }}>
              Retrouvez et partagez l'actualité de votre artisan cordonnier d'Angers :
            </p>

            {/* Social Share Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem', margin: '0.85rem 0' }}>
              <a
                href="https://www.facebook.com/jeanchristophe.asien"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#3B5998',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.75rem',
                }}
              >
                Facebook
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm"
                style={{
                  backgroundColor: '#00ACED',
                  color: 'white',
                  textDecoration: 'none',
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.75rem',
                }}
              >
                Twitter
              </a>
            </div>

            {/* Partenaire & Développeur Crédits */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '0.75rem', fontSize: '0.8rem' }}>
              <div style={{ opacity: 0.85, marginBottom: '0.25rem' }}>
                <strong>Partenaire :</strong> Galerie marchande Intermarché Madeleine
              </div>
              <div style={{ opacity: 0.85 }}>
                <strong>Développement Web :</strong>{' '}
                <a
                  href="mailto:contact@kraftweb.fr"
                  style={{ color: 'var(--cordo-gold)', textDecoration: 'underline' }}
                >
                  KraftWeb (contact@kraftweb.fr)
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div
          style={{
            borderTop: '1px solid rgba(255, 255, 255, 0.12)',
            paddingTop: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.8rem',
            opacity: 0.8,
          }}
        >
          <div>
            © {new Date().getFullYear()} Cordonnerie Le Millot — Tous droits protégés. Angers (49).
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span>Quartier Madeleine</span>
            <span>Reproduction de clés • Cordonnerie traditionnelle</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
