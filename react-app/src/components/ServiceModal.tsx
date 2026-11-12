import React, { useEffect, useRef, useState } from 'react';
import { X, CheckSquare, Clock, FileText, Image as ImageIcon, Phone } from 'lucide-react';
import { useModal } from '../context/ModalContext';

export const ServiceModal: React.FC = () => {
  const { activeModal, closeModal, openModal } = useModal();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  // Focus trap and Escape key listener
  useEffect(() => {
    if (activeModal?.isOpen) {
      setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          closeModal();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    } else {
      setZoomedImage(null);
    }
  }, [activeModal?.isOpen, closeModal]);

  if (!activeModal || !activeModal.isOpen) {
    return null;
  }

  const { service, type } = activeModal;
  const isDesc = type === 'desc';
  const isPriceOrGallery = type === 'price' || type === 'gallery';

  const modalDesc = service?.modalDescription;
  const modalTarifs = service?.modalTarifs;

  // Determine images for gallery/pricing grid
  const priceImages =
    modalTarifs?.priceGridImages && modalTarifs.priceGridImages.length > 0
      ? modalTarifs.priceGridImages
      : modalTarifs?.priceGridImagesMobile && modalTarifs.priceGridImagesMobile.length > 0
      ? modalTarifs.priceGridImagesMobile
      : (service?.carouselImages || []).map((imgUrl) => ({
          url: imgUrl,
          localPath: imgUrl,
          caption: service.title,
          alt: service.title,
        }));

  return (
    <div
      className="cordo-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          closeModal();
        }
      }}
      role="presentation"
    >
      <div
        className="cordo-modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="service-modal-title"
        ref={dialogRef}
      >
        {/* Modal Top Bar */}
        <div className="cordo-modal-header">
          <div className="cordo-modal-title-wrap">
            {service?.icon && <span className={`service-icon ${service.icon}`} />}
            <h2 id="service-modal-title" className="cordo-modal-title">
              {service?.title || activeModal.title}
            </h2>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            className="cordo-modal-close-btn"
            onClick={closeModal}
            aria-label="Fermer la modale"
          >
            <X size={22} />
          </button>
        </div>

        {/* Dual Tab Switcher: Descriptif vs Galerie & Tarifs */}
        <div className="cordo-modal-tabs">
          <button
            type="button"
            className={`cordo-modal-tab ${isDesc ? 'active' : ''}`}
            onClick={() => openModal({ type: 'desc', service, title: modalDesc?.title })}
          >
            <FileText size={16} />
            <span>Descriptif & Délais</span>
          </button>
          <button
            type="button"
            className={`cordo-modal-tab ${isPriceOrGallery ? 'active' : ''}`}
            onClick={() =>
              openModal({
                type: 'price',
                service,
                title: modalTarifs?.title || `Tarifs & Finitions : ${service.title}`,
              })
            }
          >
            <ImageIcon size={16} />
            <span>Galerie & Tarifs</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="cordo-modal-body">
          {isDesc && (
            <div className="cordo-modal-desc-view">
              {/* HTML Description Content */}
              {modalDesc?.content ? (
                <div
                  className="cordo-modal-html-content"
                  dangerouslySetInnerHTML={{ __html: modalDesc.content }}
                />
              ) : service?.shortDescription ? (
                <p style={{ fontSize: '1.05rem', lineHeight: 1.7 }}>{service.shortDescription}</p>
              ) : null}

              {/* Delay notice badge */}
              {modalDesc?.estimatedDelay && (
                <div className="cordo-modal-delay-badge">
                  <Clock size={18} style={{ color: 'var(--cordo-gold)', flexShrink: 0 }} />
                  <div>
                    <strong>Délais indicatifs : </strong>
                    <span>{modalDesc.estimatedDelay}</span>
                  </div>
                </div>
              )}

              {/* Advantages List */}
              {modalDesc?.advantages && modalDesc.advantages.length > 0 && (
                <div className="cordo-modal-advantages-section">
                  <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--cordo-chocolate)', marginBottom: '0.75rem' }}>
                    Les atouts de l'atelier :
                  </h4>
                  <ul className="cordo-modal-checklist">
                    {modalDesc.advantages.map((adv, idx) => (
                      <li key={idx} className="cordo-modal-check-item">
                        <CheckSquare size={18} className="check-icon" />
                        <span>{adv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General Features list fallback */}
              {(!modalDesc?.advantages || modalDesc.advantages.length === 0) &&
                service?.features &&
                service.features.length > 0 && (
                  <div className="cordo-modal-advantages-section">
                    <h4 style={{ fontFamily: 'var(--font-title)', color: 'var(--cordo-chocolate)', marginBottom: '0.75rem' }}>
                      Prestations & Engagements :
                    </h4>
                    <ul className="cordo-modal-checklist">
                      {service.features.map((feat, idx) => (
                        <li key={idx} className="cordo-modal-check-item">
                          <CheckSquare size={18} className="check-icon" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* Quote Notice */}
              {modalDesc?.quoteNotice && (
                <div className="cordo-modal-quote-notice">
                  <span>💡 {modalDesc.quoteNotice}</span>
                </div>
              )}

              {/* Direct call to action to visit or switch to pricing */}
              <div className="cordo-modal-actions-footer">
                <button
                  type="button"
                  className="btn btn-gold btn-sm"
                  onClick={() =>
                    openModal({
                      type: 'price',
                      service,
                      title: modalTarifs?.title || `Tarifs & Finitions : ${service.title}`,
                    })
                  }
                >
                  <ImageIcon size={15} />
                  <span>Consulter la galerie & finitions</span>
                </button>
                <a href="tel:0241470629" className="btn btn-primary btn-sm">
                  <Phone size={15} />
                  <span>02 41 47 06 29</span>
                </a>
              </div>
            </div>
          )}

          {isPriceOrGallery && (
            <div className="cordo-modal-gallery-view">
              <p className="cordo-gallery-intro">
                Découvrez les échantillons, déclinaisons et finitions réalisées en magasin par votre artisan cordonnier.
              </p>

              {/* Responsive Price/Sample Grid */}
              <div className="cordo-modal-grid">
                {priceImages.map((img, idx) => {
                  const displayImg = img.localPath || img.url;
                  const title = img.caption || img.alt || `${service.title} - Échantillon ${idx + 1}`;

                  return (
                    <div
                      key={idx}
                      className="cordo-gallery-card"
                      onClick={() => setZoomedImage(displayImg)}
                      title="Cliquer pour agrandir la photo"
                    >
                      <div className="cordo-gallery-img-container">
                        <img
                          src={displayImg}
                          alt={title}
                          className="cordo-gallery-img"
                          loading="lazy"
                        />
                      </div>
                      {title && <div className="cordo-gallery-caption">{title}</div>}
                    </div>
                  );
                })}
              </div>

              {/* Zoom Lightbox Preview within modal */}
              {zoomedImage && (
                <div
                  className="cordo-zoom-lightbox"
                  onClick={() => setZoomedImage(null)}
                  role="dialog"
                  aria-label="Image agrandie"
                >
                  <div className="cordo-zoom-content" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="cordo-zoom-close"
                      onClick={() => setZoomedImage(null)}
                      aria-label="Fermer le zoom"
                    >
                      <X size={20} />
                    </button>
                    <img src={zoomedImage} alt="Agrandissement" className="cordo-zoomed-img" />
                  </div>
                </div>
              )}

              {/* Price Grid Bottom Note */}
              <div className="cordo-modal-quote-notice" style={{ marginTop: '1.5rem' }}>
                <span>
                  📍 Tarifs sur mesure établis directement en boutique selon modèle, matière et usure. Devis gratuit
                  immédiat au comptoir.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceModal;
