import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import serviceModalsData from '../data/serviceModals.json';

export type ModalType = 'desc' | 'price' | 'gallery';

export interface ServicePriceImage {
  url: string;
  localPath?: string;
  caption?: string;
  alt?: string;
}

export interface ServiceModalData {
  id?: number | string;
  slug?: string;
  title: string;
  icon?: string;
  column?: number;
  shortDescription?: string;
  features?: string[];
  carouselImages?: string[];
  modalDescription?: {
    templateId?: string;
    title?: string;
    content?: string;
    advantages?: string[];
    quoteNotice?: string;
    estimatedDelay?: string;
  };
  modalTarifs?: {
    templateIdDesktop?: string;
    templateIdMobile?: string;
    title?: string;
    priceGridImages?: ServicePriceImage[];
    priceGridImagesMobile?: ServicePriceImage[];
  };
}

export interface ActiveModalState {
  isOpen: boolean;
  type: ModalType;
  service: ServiceModalData;
  templateId?: string;
  title?: string;
}

export interface ModalContextType {
  activeModal: ActiveModalState | null;
  isOpen: boolean;
  openModal: (params: { type: ModalType; service?: ServiceModalData; templateId?: string; title?: string }) => void;
  openServiceDesc: (serviceIdOrSlug: number | string) => void;
  openServicePrice: (serviceIdOrSlug: number | string) => void;
  openByTemplateId: (templateId: string) => void;
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | undefined>(undefined);

const servicesList: ServiceModalData[] = (serviceModalsData as any).services || [];

export const ModalContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<ActiveModalState | null>(null);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const openModal = useCallback(
    ({
      type,
      service,
      templateId,
      title,
    }: {
      type: ModalType;
      service?: ServiceModalData;
      templateId?: string;
      title?: string;
    }) => {
      // If service is missing but templateId is provided, find matching service
      let resolvedService = service;
      if (!resolvedService && templateId) {
        for (const s of servicesList) {
          if (
            s.modalDescription?.templateId === String(templateId) ||
            s.modalTarifs?.templateIdDesktop === String(templateId) ||
            s.modalTarifs?.templateIdMobile === String(templateId)
          ) {
            resolvedService = s;
            break;
          }
        }
      }

      if (!resolvedService) {
        // Fallback default service
        resolvedService = servicesList[0] || {
          title: title || 'Prestation Cordonnerie Le Millot',
        };
      }

      const modalTitle =
        title ||
        (type === 'desc'
          ? resolvedService.modalDescription?.title || resolvedService.title
          : resolvedService.modalTarifs?.title || `Tarifs et finitions : ${resolvedService.title}`);

      setActiveModal({
        isOpen: true,
        type,
        service: resolvedService,
        templateId:
          templateId ||
          (type === 'desc'
            ? resolvedService.modalDescription?.templateId
            : resolvedService.modalTarifs?.templateIdDesktop),
        title: modalTitle,
      });
    },
    []
  );

  const openServiceDesc = useCallback(
    (serviceIdOrSlug: number | string) => {
      const service = servicesList.find(
        (s) => String(s.id) === String(serviceIdOrSlug) || s.slug === String(serviceIdOrSlug)
      );
      if (service) {
        openModal({ type: 'desc', service });
      }
    },
    [openModal]
  );

  const openServicePrice = useCallback(
    (serviceIdOrSlug: number | string) => {
      const service = servicesList.find(
        (s) => String(s.id) === String(serviceIdOrSlug) || s.slug === String(serviceIdOrSlug)
      );
      if (service) {
        openModal({ type: 'price', service });
      }
    },
    [openModal]
  );

  const openByTemplateId = useCallback(
    (templateId: string) => {
      for (const s of servicesList) {
        if (s.modalDescription?.templateId === String(templateId)) {
          openModal({ type: 'desc', service: s, templateId: String(templateId) });
          return;
        }
        if (
          s.modalTarifs?.templateIdDesktop === String(templateId) ||
          s.modalTarifs?.templateIdMobile === String(templateId)
        ) {
          openModal({ type: 'price', service: s, templateId: String(templateId) });
          return;
        }
      }
      // If templateId is in raw templates
      openModal({ type: 'desc', templateId: String(templateId) });
    },
    [openModal]
  );

  // Global listener for 'cordo:openModal' custom events
  useEffect(() => {
    const handleCustomOpen = (e: Event) => {
      const customEvent = e as CustomEvent;
      const templateId = customEvent.detail?.templateId;
      const serviceId = customEvent.detail?.serviceId;
      const type = customEvent.detail?.type;

      if (serviceId && type) {
        if (type === 'price' || type === 'gallery') {
          openServicePrice(serviceId);
        } else {
          openServiceDesc(serviceId);
        }
      } else if (templateId) {
        openByTemplateId(templateId);
      }
    };

    window.addEventListener('cordo:openModal', handleCustomOpen);
    return () => {
      window.removeEventListener('cordo:openModal', handleCustomOpen);
    };
  }, [openServiceDesc, openServicePrice, openByTemplateId]);

  // Handle Escape key and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModal?.isOpen) {
        closeModal();
      }
    };

    if (activeModal?.isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeModal?.isOpen, closeModal]);

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        isOpen: !!activeModal?.isOpen,
        openModal,
        openServiceDesc,
        openServicePrice,
        openByTemplateId,
        closeModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    return {
      activeModal: null,
      isOpen: false,
      openModal: () => {},
      openServiceDesc: () => {},
      openServicePrice: () => {},
      openByTemplateId: () => {},
      closeModal: () => {},
    };
  }
  return context;
};

export default ModalContext;
