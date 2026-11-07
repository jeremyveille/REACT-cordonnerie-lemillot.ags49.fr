import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';

export interface GalleryItem {
  url: string;
  alt?: string;
  caption?: string;
  title?: string;
}

export interface MediaGalleryProps {
  id?: string;
  title?: string;
  columns?: 2 | 3 | 4;
  images: GalleryItem[];
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  title,
  columns = 3,
  images = [],
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePrev = useCallback(() => {
    if (selectedIndex === null || images.length === 0) return;
    setSelectedIndex((selectedIndex - 1 + images.length) % images.length);
  }, [selectedIndex, images.length]);

  const handleNext = useCallback(() => {
    if (selectedIndex === null || images.length === 0) return;
    setSelectedIndex((selectedIndex + 1) % images.length);
  }, [selectedIndex, images.length]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedIndex(null);
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrev, handleNext]);

  const gridClass =
    columns === 2
      ? 'gallery-grid-2'
      : columns === 4
      ? 'gallery-grid-4'
      : 'gallery-grid-3';

  return (
    <div className="puck-media-gallery" style={{ margin: '2rem 0', width: '100%' }}>
      {title && (
        <h3
          style={{
            fontFamily: 'var(--font-title)',
            color: 'var(--cordo-chocolate)',
            textAlign: 'center',
            marginBottom: '1.5rem',
          }}
        >
          {title}
        </h3>
      )}

      <div className={`puck-gallery-grid ${gridClass}`}>
        {images.map((item, idx) => (
          <div
            key={idx}
            className="gallery-item-card"
            onClick={() => setSelectedIndex(idx)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setSelectedIndex(idx)}
            aria-label={`Agrandir la photo ${idx + 1}`}
          >
            <div className="gallery-thumbnail-wrapper">
              <img
                src={item.url}
                alt={item.alt || item.title || `Galerie photo ${idx + 1}`}
                loading="lazy"
                className="gallery-thumbnail"
              />
              <div className="gallery-overlay-hint">
                <ZoomIn size={20} color="white" />
              </div>
            </div>
            {(item.title || item.caption) && (
              <div className="gallery-item-info">
                {item.title && <div className="gallery-item-title">{item.title}</div>}
                {item.caption && <div className="gallery-item-caption">{item.caption}</div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {selectedIndex !== null && images[selectedIndex] && (
        <div
          className="puck-lightbox-overlay"
          onClick={() => setSelectedIndex(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="gallery-lightbox-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setSelectedIndex(null)}
              aria-label="Fermer"
            >
              <X size={24} />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="gallery-nav-btn gallery-prev-btn"
                  onClick={handlePrev}
                  aria-label="Photo précédente"
                >
                  <ChevronLeft size={30} />
                </button>
                <button
                  type="button"
                  className="gallery-nav-btn gallery-next-btn"
                  onClick={handleNext}
                  aria-label="Photo suivante"
                >
                  <ChevronRight size={30} />
                </button>
              </>
            )}

            <div className="gallery-lightbox-content">
              <img
                src={images[selectedIndex].url}
                alt={images[selectedIndex].alt || ''}
                className="lightbox-image"
              />
              <div className="gallery-lightbox-footer">
                <span className="gallery-counter">
                  {selectedIndex + 1} / {images.length}
                </span>
                {(images[selectedIndex].title || images[selectedIndex].caption) && (
                  <span className="gallery-current-caption">
                    {images[selectedIndex].title || images[selectedIndex].caption}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaGallery;
