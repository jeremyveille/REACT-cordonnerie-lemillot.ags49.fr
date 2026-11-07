import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { Render } from '@measured/puck';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ModalProvider from '../components/ModalProvider';
import { storageAdapter } from '../firebase/storageAdapter';
import { puckConfig } from '../puck/config';
import type { PageRecord } from '../types/page';

export const PublicPage: React.FC = () => {
  const { slug } = useParams<{ slug?: string }>();
  const location = useLocation();
  const [page, setPage] = useState<PageRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Normalize slug based on path or params
  let currentSlug = slug || '/';
  const path = location.pathname.replace(/^\/+|\/+$/g, '');
  if (path === '' || path === 'a-angers') {
    currentSlug = '/';
  } else if (
    path === 'lexique-des-cuirs' ||
    path === 'lexique-semelles-exterieurs' ||
    path === 'lexique-chaussures'
  ) {
    currentSlug = path;
  }

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    storageAdapter
      .getPageBySlug(currentSlug)
      .then((foundPage) => {
        if (isMounted) {
          setPage(foundPage);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching page by slug:', err);
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  // Handle hash scrolling on page load or hash change
  useEffect(() => {
    if (!loading && location.hash) {
      const targetId = location.hash.replace(/^#/, '');
      const timer = setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [loading, location.hash]);

  return (
    <ModalProvider>
      <div className="flex flex-col public-page-wrapper" style={{ minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
        <Header />

        <main style={{ flex: '1 0 auto', width: '100%', overflowX: 'hidden' }}>
          {loading ? (
            <div
              className="container"
              style={{ padding: '6rem 1rem', textAlign: 'center' }}
            >
              <div
                style={{
                  fontFamily: 'var(--font-title)',
                  color: 'var(--cordo-caramel)',
                  fontSize: '1.25rem',
                }}
              >
                Chargement de la Cordonnerie Le Millot...
              </div>
            </div>
          ) : page && page.publishedData ? (
            <div className="public-rendered-content">
              {/* Strictly render publishedData for public visitors */}
              <Render config={puckConfig} data={page.publishedData} />
            </div>
          ) : (
            <div
              className="container"
              style={{ padding: '5rem 1rem', textAlign: 'center' }}
            >
              <div className="cordo-card" style={{ maxWidth: '600px', margin: '0 auto', padding: '3rem 2rem' }}>
                <h1 style={{ color: 'var(--cordo-chocolate)' }}>Page Non Trouvée</h1>
                <p style={{ color: 'var(--cordo-muted)', marginBottom: '2rem' }}>
                  La page demandée (<code>/{currentSlug}</code>) n’existe pas ou n’a pas encore été publiée par l’artisan.
                </p>
                <Link to="/" className="btn btn-primary">
                  Retour à l’Accueil
                </Link>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </ModalProvider>
  );
};

export default PublicPage;
