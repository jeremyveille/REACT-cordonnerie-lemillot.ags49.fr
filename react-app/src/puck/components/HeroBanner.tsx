import React from 'react';

export interface HeroBannerProps {
  id?: string;
  title: string;
  subtitle: string;
  badgeText?: string;
  primaryButtonText?: string;
  primaryButtonUrl?: string;
  imageUrl?: string;
  align?: 'left' | 'center';
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  title,
  subtitle,
  badgeText = 'Maison fondée en 2015',
  primaryButtonText = 'Découvrir nos prestations',
  primaryButtonUrl = '#services',
  imageUrl,
  align = 'center',
}) => {
  return (
    <section
      className="puck-hero-banner"
      style={{
        backgroundColor: 'var(--cordo-chocolate)',
        color: 'white',
        padding: '4.5rem 1.5rem',
        textAlign: align,
        borderBottom: '4px solid var(--cordo-gold)',
        backgroundImage: imageUrl ? `linear-gradient(rgba(113, 88, 57, 0.85), rgba(113, 88, 57, 0.85)), url(${imageUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div className="container-narrow">
        {badgeText && (
          <span
            className="hero-badge"
            style={{
              display: 'inline-block',
              backgroundColor: 'var(--cordo-gold)',
              color: 'white',
              padding: '0.35rem 0.85rem',
              fontSize: '0.8rem',
              fontWeight: 700,
              borderRadius: '9999px',
              marginBottom: '1.25rem',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
            }}
          >
            {badgeText}
          </span>
        )}
        <h1
          style={{
            color: 'white',
            fontFamily: 'var(--font-title)',
            fontSize: '2.5rem',
            marginBottom: '1.25rem',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            opacity: 0.95,
            marginBottom: '2.25rem',
            lineHeight: 1.6,
            maxWidth: '680px',
            marginLeft: align === 'center' ? 'auto' : undefined,
            marginRight: align === 'center' ? 'auto' : undefined,
          }}
        >
          {subtitle}
        </p>
        {primaryButtonText && (
          <a
            href={primaryButtonUrl || '#'}
            className="btn btn-gold btn-lg btn-retro-shadow"
            style={{ display: 'inline-flex' }}
          >
            {primaryButtonText}
          </a>
        )}
      </div>
    </section>
  );
};

export default HeroBanner;
