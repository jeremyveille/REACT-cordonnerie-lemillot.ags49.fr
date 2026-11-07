import React, { useState, useEffect } from 'react';
import { X, ZoomIn } from 'lucide-react';

export interface ImageBlockProps {
  id?: string;
  src: string;
  alt?: string;
  caption?: string;
  borderRadius?: string;
  retroShadow?: boolean;
  lightbox?: boolean;
  aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1';
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export const ImageBlock: React.FC<ImageBlockProps> = ({
  src,
  alt = 'Atelier Cordonnerie Le Millot',
  caption,
  borderRadius = '12px',
  retroShadow = true,
  lightbox = true,
  aspectRatio = 'auto',
  width = '100%',
  align = 'center',
}) => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsLightboxOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  const ratioStyle =
    aspectRatio === '16/9'
      ? '16 / 9'
      : aspectRatio === '4/3'
      ? '4 / 3'
      : aspectRatio === '1/1'
      ? '1 / 1'
      : undefined;

  const shadowStyle = retroShadow ? 'var(--cordo-shadow)' : undefined;

  return (
    <figure
      className="puck-image-block"
      style={{
        margin: '1.5rem 0',
        textAlign: align,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        className="image-wrapper"
        style={{
          display: 'inline-block',
          position: 'relative',
          maxWidth: width,
          cursor: lightbox ? 'pointer' : 'default',
        }}
        onClick={() => lightbox && setIsLightboxOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          style={{
            maxWidth: '100%',
            height: ratioStyle ? 'auto' : undefined,
            aspectRatio: ratioStyle,
            objectFit: ratioStyle ? 'cover' : undefined,
            borderRadius: borderRadius,
            boxShadow: shadowStyle,
            border: '2px solid var(--cordo-chocolate)',
            display: 'block',
            transition: 'transform var(--transition-fast)',
          }}
        />
        {lightbox && (
          <span
            className="lightbox-hint-badge"
            style={{
              position: 'absolute',
              bottom: '10px',
              right: '10px',
              backgroundColor: 'rgba(113, 88, 57, 0.85)',
              color: 'white',
              borderRadius: '9999px',
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}
          >
            <ZoomIn size={12} />
            <span>Agrandir</span>
          </span>
        )}
      </div>

      {caption && (
        <figcaption
          style={{
            marginTop: '0.75rem',
            fontSize: '0.85rem',
            color: 'var(--cordo-muted)',
            fontStyle: 'italic',
          }}
        >
          {caption}
        </figcaption>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="puck-lightbox-overlay"
          onClick={() => setIsLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="lightbox-content-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Fermer la vue agrandie"
            >
              <X size={24} />
            </button>
            <img src={src} alt={alt} className="lightbox-image" />
            {caption && <div className="lightbox-caption">{caption}</div>}
          </div>
        </div>
      )}
    </figure>
  );
};

export default ImageBlock;
