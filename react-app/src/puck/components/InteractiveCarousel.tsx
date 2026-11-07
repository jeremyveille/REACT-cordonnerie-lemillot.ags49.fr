import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface CarouselSlide {
  url: string;
  alt?: string;
  title?: string;
  description?: string;
  link?: string;
}

export interface InteractiveCarouselProps {
  id?: string;
  slides: CarouselSlide[];
  autoplay?: boolean;
  interval?: number;
  showDots?: boolean;
  showArrows?: boolean;
  variant?: 'default' | 'service';
}

export const InteractiveCarousel: React.FC<InteractiveCarouselProps> = ({
  slides = [],
  autoplay = true,
  interval = 4000,
  showDots = true,
  showArrows = true,
  variant = 'default',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const prevSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  // Autoplay effect
  useEffect(() => {
    if (!autoplay || isPaused || slides.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, interval);
    return () => clearInterval(timer);
  }, [autoplay, isPaused, interval, slides.length, nextSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 40) {
      nextSlide();
    } else if (diff < -40) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    }
  };

  if (slides.length === 0) {
    return null;
  }

  const isService = variant === 'service';

  return (
    <div
      className={`puck-carousel-wrapper ${isService ? 'carousel-variant-service' : 'carousel-variant-default'}`}
      tabIndex={0}
      role="region"
      aria-label={isService ? 'Galerie service' : 'Carrousel interactif'}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        borderRadius: isService ? '0' : '12px',
        backgroundColor: isService ? 'transparent' : '#000',
        outline: 'none',
      }}
    >
      {/* Slides Container */}
      <div
        className="carousel-track"
        style={{
          display: 'flex',
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
          width: '100%',
        }}
      >
        {slides.map((slide, idx) => (
          <div
            key={idx}
            className="carousel-slide-item"
            style={{
              minWidth: '100%',
              flexShrink: 0,
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isService ? '0 2px' : 0,
              boxSizing: 'border-box',
            }}
          >
            <img
              src={slide.url}
              alt={slide.alt || slide.title || `Diapositive ${idx + 1}`}
              style={{
                width: '100%',
                height: isService ? '165px' : '360px',
                objectFit: 'cover',
                display: 'block',
                borderRadius: isService ? '12px' : 0,
                border: isService ? '5px solid #C7804A' : 'none',
                boxShadow: isService ? '4px 4px 0px 0px #715839' : 'none',
              }}
            />
            {!isService && (slide.title || slide.description) && (
              <div
                className="carousel-caption-overlay"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: '1.5rem',
                  background: 'linear-gradient(to top, rgba(0, 0, 0, 0.85), transparent)',
                  color: 'white',
                }}
              >
                {slide.title && (
                  <h4 style={{ fontFamily: 'var(--font-title)', color: 'white', margin: '0 0 0.4rem' }}>
                    {slide.title}
                  </h4>
                )}
                {slide.description && (
                  <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.9 }}>
                    {slide.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {showArrows && slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            aria-label="Image précédente"
            className="carousel-nav-arrow carousel-arrow-left"
            style={{
              position: 'absolute',
              top: isService ? '82px' : '50%',
              left: isService ? '8px' : '12px',
              transform: 'translateY(-50%)',
              width: isService ? '32px' : '40px',
              height: isService ? '32px' : '40px',
              backgroundColor: isService ? 'rgba(255, 255, 255, 0.92)' : 'rgba(113, 88, 57, 0.85)',
              border: isService ? '1.5px solid #C7804A' : '2px solid white',
              borderRadius: '50%',
              color: isService ? '#715839' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              padding: 0,
            }}
          >
            <ChevronLeft size={isService ? 20 : 24} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            aria-label="Image suivante"
            className="carousel-nav-arrow carousel-arrow-right"
            style={{
              position: 'absolute',
              top: isService ? '82px' : '50%',
              right: isService ? '8px' : '12px',
              transform: 'translateY(-50%)',
              width: isService ? '32px' : '40px',
              height: isService ? '32px' : '40px',
              backgroundColor: isService ? 'rgba(255, 255, 255, 0.92)' : 'rgba(113, 88, 57, 0.85)',
              border: isService ? '1.5px solid #C7804A' : '2px solid white',
              borderRadius: '50%',
              color: isService ? '#715839' : 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 10,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              padding: 0,
            }}
          >
            <ChevronRight size={isService ? 20 : 24} />
          </button>
        </>
      )}

      {/* Navigation Dots */}
      {showDots && slides.length > 1 && (
        <div
          className="carousel-dots-container"
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px',
            marginTop: isService ? '6px' : 0,
            position: isService ? 'relative' : 'absolute',
            bottom: isService ? 'auto' : '12px',
            left: isService ? 'auto' : 0,
            right: isService ? 'auto' : 0,
            zIndex: 10,
          }}
        >
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Aller à la diapositive ${idx + 1}`}
              style={{
                width: idx === currentIndex ? (isService ? '18px' : '24px') : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor:
                  idx === currentIndex
                    ? isService
                      ? '#715839'
                      : 'var(--cordo-yellow)'
                    : isService
                    ? '#C7804A'
                    : 'rgba(255, 255, 255, 0.6)',
                opacity: idx === currentIndex ? 1 : 0.5,
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                padding: 0,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InteractiveCarousel;
