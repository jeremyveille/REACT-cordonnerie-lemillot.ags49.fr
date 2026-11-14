import React from 'react';
import { DropZone } from '@measured/puck';
import { useModal } from '../../context/ModalContext';
import serviceModalsData from '../../data/serviceModals.json';
import { Images, FileText } from 'lucide-react';

// Import all Puck widgets for nested child rendering
import AccordionCollapse from './AccordionCollapse';
import ActionButton from './ActionButton';
import ContactForm from './ContactForm';
import CustomDivider from './CustomDivider';
import FeatureIconList from './FeatureIconList';
import HeadingBlock from './HeadingBlock';
import HeroBanner from './HeroBanner';
import HtmlBlock from './HtmlBlock';
import ImageBlock from './ImageBlock';
import InteractiveCarousel from './InteractiveCarousel';
import MapEmbed from './MapEmbed';
import MediaGallery from './MediaGallery';
import RatingDisplay from './RatingDisplay';
import RichTextBlock from './RichTextBlock';
import TabContainer from './TabContainer';
import VerticalSpacer from './VerticalSpacer';
import VideoEmbed from './VideoEmbed';
import WeeklyBusinessHours from './WeeklyBusinessHours';

export interface SectionContainerProps {
  id?: string;
  sectionIndex?: number;
  structure?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  anchorId?: string;
  padding?: string;
  maxWidth?: 'container' | 'container-narrow' | 'full';
  boxed?: boolean;
  items?: any;
  puck?: any;
}

// 12 Services catalog from authoritative extracted JSON
const servicesCatalog = (serviceModalsData as any).services || [];

// Default wood textured images matching original WordPress Elementor sections
const DEFAULT_SECTION_WOOD_IMAGES: Record<number, string> = {
  2: '/uploads/2023/03/3-board-4742447_640.jpg',
  5: '/uploads/2023/03/3-board-4742447_640.jpg',
  7: '/uploads/2023/03/02-board-4742447_640.jpg',
  8: '/uploads/2023/03/3-board-4742447_640.jpg',
  10: '/uploads/2023/03/6-board-4742447_640.jpg.png',
  12: '/uploads/2023/03/6-board-4742447_640.jpg.png',
  14: '/uploads/2023/03/6-board-4742447_640.jpg.png',
  16: '/uploads/2023/03/6-board-4742447_640.jpg.png',
};

const DEFAULT_SECTION_ID_WOOD_IMAGES: Record<string, string> = {
  '1a8c21f2': '/uploads/2023/03/3-board-4742447_640.jpg',
  '709da48': '/uploads/2023/03/3-board-4742447_640.jpg',
  '32866da': '/uploads/2023/03/02-board-4742447_640.jpg',
  'a81e56d': '/uploads/2023/03/3-board-4742447_640.jpg',
  '5eb5ef5': '/uploads/2023/03/6-board-4742447_640.jpg.png',
  '567d42e': '/uploads/2023/03/6-board-4742447_640.jpg.png',
  '6359f90': '/uploads/2023/03/6-board-4742447_640.jpg.png',
  'de826f5': '/uploads/2023/03/6-board-4742447_640.jpg.png',
};

function normalizeUploadUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/^https?:\/\/[^/]+\/wp-content\/uploads\//, '/uploads/');
}

function getServiceLeftIcon(service: any): string {
  if (
    service.icon === 'icon icon-hosting1' ||
    service.icon === 'fas fa-sliders' ||
    service.slug === 'telecommandes' ||
    service.id === 7 ||
    service.icon === 'cordo-icon-remote-control'
  ) {
    return 'cordo-icon-remote-control';
  }

  switch (service.id) {
    case 1:
      return 'far fa-address-card';
    case 2:
      return 'fas fa-shoe-prints';
    case 3:
      return 'fas fa-id-badge';
    case 4:
      return 'fab fa-fantasy-flight-games';
    case 5:
      return 'fas fa-stamp';
    case 6:
      return 'fas fa-bag-shopping fa-shopping-bag';
    case 8:
      return 'far fa-square-minus fa-minus-square';
    case 9:
      return 'fas fa-print';
    case 10:
      return 'fas fa-key';
    case 11:
      return 'fas fa-pills fa-battery-full';
    case 12:
      return 'fas fa-car';
    default:
      if (service.icon === 'fas fa-shopping-bag') return 'fas fa-bag-shopping fa-shopping-bag';
      if (service.icon === 'far fa-minus-square') return 'far fa-square-minus fa-minus-square';
      return service.icon || 'far fa-address-card';
  }
}

// Workshop gallery photos for Section 16 matching exact WordPress Elementor images
const workshopPhotos = [
  {
    url: '/uploads/2020/09/118764769_631123561155546_1621552598312941065_n.png',
    title: "Comptoir d'accueil et caisse de l'atelier",
  },
  {
    url: '/uploads/2020/09/118732372_640331356906799_7798033930510087560_n.png',
    title: 'Banc de finition et machines de cordonnerie',
  },
  {
    url: '/uploads/2020/09/118767668_313577616417942_2892424697815582095_n1.png',
    title: 'Rayonnage de fournitures et peausseries',
  },
  {
    url: '/uploads/2020/09/118764591_622862535071673_3446856649029452198_n1.png',
    title: 'Machines à reproduire les clés et présentoirs',
  },
];

function renderChildWidget(child: any, idx: number) {
  if (!child || !child.type) return null;
  const childProps = child.props || {};
  const childKey = childProps.id || `child-${idx}`;

  switch (child.type) {
    case 'HeadingBlock':
    case 'Heading':
      return (
        <HeadingBlock
          key={childKey}
          {...childProps}
          text={childProps.text || childProps.title || ''}
        />
      );
    case 'RichTextBlock':
    case 'RichText':
      return (
        <RichTextBlock
          key={childKey}
          {...childProps}
          content={childProps.content || childProps.editor || ''}
        />
      );
    case 'ImageBlock':
    case 'SingleImage':
      return <ImageBlock key={childKey} {...childProps} />;
    case 'AccordionCollapse':
    case 'Accordion':
      return <AccordionCollapse key={childKey} {...childProps} />;
    case 'InteractiveCarousel':
    case 'Carousel':
      return <InteractiveCarousel key={childKey} {...childProps} />;
    case 'WeeklyBusinessHours':
    case 'OpeningHours':
      return <WeeklyBusinessHours key={childKey} {...childProps} />;
    case 'MapEmbed':
    case 'GoogleMapEmbed':
      return (
        <div key={childKey} id="localisation">
          <MapEmbed {...childProps} />
        </div>
      );
    case 'ContactForm':
      return <ContactForm key={childKey} {...childProps} />;
    case 'RatingDisplay':
      return <RatingDisplay key={childKey} {...childProps} />;
    case 'FeatureIconList':
      return <FeatureIconList key={childKey} {...childProps} />;
    case 'CustomDivider':
      return <CustomDivider key={childKey} {...childProps} />;
    case 'VerticalSpacer':
      return <VerticalSpacer key={childKey} {...childProps} />;
    case 'ActionButton':
    case 'CallToAction':
      return <ActionButton key={childKey} {...childProps} />;
    case 'TabContainer':
    case 'Tabs':
      return <TabContainer key={childKey} {...childProps} />;
    case 'MediaGallery':
    case 'ImageGallery':
      return <MediaGallery key={childKey} {...childProps} />;
    case 'VideoEmbed':
      return <VideoEmbed key={childKey} {...childProps} />;
    case 'HtmlBlock':
      return <HtmlBlock key={childKey} {...childProps} />;
    case 'HeroBanner':
      return <HeroBanner key={childKey} {...childProps} />;
    default:
      if (childProps.content) {
        return (
          <div
            key={childKey}
            dangerouslySetInnerHTML={{ __html: childProps.content }}
          />
        );
      }
      return null;
  }
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  id,
  sectionIndex,
  structure = '100',
  backgroundColor = 'transparent',
  backgroundImage = '',
  anchorId,
  padding = '1rem 0',
  maxWidth = 'container',
  boxed = false,
  items = [],
  puck,
}) => {
  const { openServiceDesc, openServicePrice } = useModal();

  // Normalize background color
  let bgStyle = backgroundColor;
  if (backgroundColor === 'chocolat') bgStyle = 'var(--cordo-chocolate)';
  else if (backgroundColor === 'caramel') bgStyle = 'var(--cordo-caramel)';
  else if (backgroundColor === 'blanc' || backgroundColor === '#FFF') bgStyle = '#FFFFFF';
  else if (backgroundColor === 'creme') bgStyle = 'var(--cordo-cream)';
  else if (backgroundColor === 'fond' || backgroundColor === '#FCFCFC') bgStyle = 'var(--cordo-bg)';

  // Specific section checks
  const isMainTitle = sectionIndex === 1 || id === '25eb05f';
  const isHeroBanner = sectionIndex === 2 || id === '1a8c21f2';
  const isAccueilContent = sectionIndex === 5 || id === '709da48';

  const containerClass =
    isHeroBanner
      ? 'container cordo-hero-container'
      : isAccueilContent
      ? 'container cordo-accueil-container'
      : maxWidth === 'container-narrow'
      ? 'container-narrow'
      : maxWidth === 'full'
      ? 'container-full'
      : 'container';

  // Determine section anchor target for smooth scrolling
  let calculatedAnchor = anchorId;
  if (!calculatedAnchor) {
    if (sectionIndex === 4 || id === '0e42f5c') calculatedAnchor = 'accueil';
    else if (sectionIndex === 9 || sectionIndex === 10 || id === '5eb5ef5' || id === 'd6dde95') calculatedAnchor = 'services';
    else if (sectionIndex === 11 || sectionIndex === 12 || id === '15eb4d8' || id === '567d42e') calculatedAnchor = 'contact';
    else if (sectionIndex === 13 || sectionIndex === 14 || id === 'd840820' || id === '6359f90') calculatedAnchor = 'horaires';
    else if (sectionIndex === 15 || sectionIndex === 16 || id === '9984feb' || id === 'de826f5') calculatedAnchor = 'atelier';
  }

  // Determine grid columns based on structure
  let gridStyle: React.CSSProperties = {
    display: 'grid',
    gap: '1.5rem',
    width: '100%',
  };

  if (structure === '100') {
    gridStyle.gridTemplateColumns = '1fr';
  } else if (structure === '50-50' || structure === '50') {
    gridStyle.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
  } else if (structure === '33-33-33' || structure === '30') {
    gridStyle.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
  } else if (structure === '20') {
    gridStyle.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
  } else if (structure === '40') {
    gridStyle.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
  } else if (structure === '30-70') {
    gridStyle.gridTemplateColumns = 'minmax(250px, 1fr) minmax(300px, 2fr)';
  } else if (structure === '70-30') {
    gridStyle.gridTemplateColumns = 'minmax(300px, 2fr) minmax(250px, 1fr)';
  }

  // Specific section checks
  const isSection3Spacer = sectionIndex === 3 || id === 'd79fdba';
  const isAccueilTitle = sectionIndex === 4 || id === '0e42f5c';
  const isNouveauTitle = sectionIndex === 6 || id === 'b251543';
  const isPassSanitaireTitle = sectionIndex === 7 || id === '32866da';
  const isPassSanitaireContent = sectionIndex === 8 || id === 'a81e56d';
  const isServicesTitle = sectionIndex === 9 || id === 'd6dde95';
  const isServicesSection = sectionIndex === 10 || id === '5eb5ef5';
  const isContactTitle = sectionIndex === 11 || id === '15eb4d8';
  const isContactContent = sectionIndex === 12 || id === '567d42e';
  const isHorairesTitle = sectionIndex === 13 || id === 'd840820';
  const isHorairesContent = sectionIndex === 14 || id === '6359f90';
  const isAtelierTitle = sectionIndex === 15 || id === '9984feb';
  const isWorkshopGallery = sectionIndex === 16 || id === 'de826f5';
  const isSitemapFooterSection = sectionIndex === 17 || id === '606c691d';
  const isIntermarchePartner = sectionIndex === 18 || id === 'f8e5dda';
  const isKraftwebCredits = sectionIndex === 19 || id === 'e56e2ce';

  let bannerModifierClass = '';
  if (isHeroBanner) bannerModifierClass = 'cordo-banner-hero cordo-wood-banner';
  else if (isAccueilContent) bannerModifierClass = 'cordo-banner-accueil cordo-wood-banner';
  else if (isPassSanitaireTitle) bannerModifierClass = 'cordo-banner-pass-title cordo-wood-banner';
  else if (isPassSanitaireContent) bannerModifierClass = 'cordo-banner-pass-content cordo-wood-banner';
  else if (isServicesSection) bannerModifierClass = 'cordo-banner-services cordo-wood-banner';
  else if (isContactContent) bannerModifierClass = 'cordo-banner-contact cordo-wood-banner';
  else if (isHorairesContent) bannerModifierClass = 'cordo-banner-horaires cordo-wood-banner';
  else if (isWorkshopGallery) bannerModifierClass = 'cordo-banner-atelier cordo-wood-banner';
  else if (isKraftwebCredits) bannerModifierClass = 'cordo-banner-kraftweb';

  const isWoodBanner = Boolean(bannerModifierClass && bannerModifierClass.includes('cordo-wood-banner'));

  // Normalize configured background image URL to local relative path
  const configuredImage = normalizeUploadUrl(backgroundImage);

  // Authoritative default wood image fallback if not explicitly provided
  const defaultWoodImage =
    (id && DEFAULT_SECTION_ID_WOOD_IMAGES[id]) ||
    (sectionIndex && DEFAULT_SECTION_WOOD_IMAGES[sectionIndex]) ||
    (isWoodBanner ? '/uploads/2023/03/6-board-4742447_640.jpg.png' : undefined);

  // Explicit backgroundImage takes precedence over fallback defaults
  const activeImage = configuredImage || defaultWoodImage;

  // Determine if activeImage or section should be treated as a wood textured pattern
  const isWoodPattern = Boolean(
    isWoodBanner ||
    (activeImage && (
      activeImage.includes('board-') ||
      activeImage.includes('6-board') ||
      activeImage.includes('3-board') ||
      activeImage.includes('02-board') ||
      activeImage.includes('01-board') ||
      activeImage.includes('1-board')
    ))
  );

  let computedBackgroundImage: string | undefined;
  if (activeImage) {
    if (isWoodPattern) {
      if (isAccueilContent) {
        // Section 5 ACCUEIL displays raw 3-board wood texture without 35% white wash for high contrast
        computedBackgroundImage = `url('${activeImage}')`;
      } else {
        computedBackgroundImage = `linear-gradient(rgba(255, 255, 255, 0.35), rgba(255, 255, 255, 0.35)), url('${activeImage}')`;
      }
    } else {
      computedBackgroundImage = `url('${activeImage}')`;
    }
  }

  const sectionStyle: React.CSSProperties = {
    backgroundColor: bgStyle || (isWoodPattern ? '#FFFFFF' : undefined),
    backgroundImage: computedBackgroundImage,
    backgroundRepeat: isWoodPattern ? 'repeat' : (activeImage ? 'no-repeat' : undefined),
    backgroundSize: isWoodPattern ? '320px auto' : (activeImage ? 'cover' : undefined),
    backgroundPosition: isWoodPattern ? 'top center' : (activeImage ? 'center' : undefined),
    padding: isSection3Spacer ? '0' : padding,
    margin: isSection3Spacer ? '0' : undefined,
    minHeight: isSection3Spacer ? 'auto' : undefined,
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <section
      id={calculatedAnchor || (sectionIndex ? `section-${sectionIndex}` : undefined)}
      className={`puck-section-container ${boxed ? 'cordo-card' : ''} ${bannerModifierClass} ${isServicesSection ? 'section-services-anchor' : ''}`}
      style={sectionStyle}
      data-section-index={sectionIndex}
    >
      <div className={containerClass}>
        {/* SECTION 1: Titre Principal centré */}
        {isMainTitle ? (
          <div className="cordo-main-title-wrap">
            <h1 className="cordo-main-title">CORDONNERIE  '' LE MILLOT ''</h1>
            <DropZone zone="content" />
          </div>
        ) : isHeroBanner ? (
          /* SECTION 2: Hero Banner (Outils, Carte, Chaussures in 3 equal columns) */
          <div className="cordo-hero-banner-wrap">
            <div className="cordo-hero-grid">
              <div className="cordo-hero-card">
                <img
                  src="/uploads/2020/09/tools-4089700_640.jpg"
                  alt="outil de cordonnerie"
                  className="cordo-hero-img"
                />
              </div>
              <div className="cordo-hero-card">
                <img
                  src="/uploads/2021/05/185280034_472799637287378_7631920518017539361_n.jpg"
                  alt="carte de visite"
                  className="cordo-hero-img"
                />
              </div>
              <div className="cordo-hero-card">
                <img
                  src="/uploads/2020/09/shoemaker-2855552_640.jpg"
                  alt="fabrication de chaussures"
                  className="cordo-hero-img"
                />
              </div>
            </div>
            <DropZone zone="content" />
          </div>
        ) : isSection3Spacer ? (
          /* SECTION 3: 20px Spacer between Hero wood banner and Accueil title */
          <div style={{ height: '20px', width: '100%' }}>
            <DropZone zone="content" />
          </div>
        ) : isAccueilTitle ? (
          /* SECTION 4: Titre ACCUEIL (Ligne pointillée - ACCUEIL - Ligne pointillée) */
          <div className="cordo-title-banner-row cordo-title-banner-accueil">
            <div className="cordo-title-banner-line" />
            <h2 className="cordo-title-banner-text">ACCUEIL</h2>
            <div className="cordo-title-banner-line" />
            <DropZone zone="content" />
          </div>
        ) : isAccueilContent ? (
          /* SECTION 5: Section Accueil (Photo gauche, Cadre blanc texte, Photo droite) */
          <div className="cordo-accueil-wrap">
            <div className="cordo-accueil-grid">
              <div className="cordo-accueil-photo-frame">
                <img
                  src="/uploads/2021/06/186857245_500196524357695_4314135679681458895_n.jpg"
                  alt="186857245_500196524357695_4314135679681458895_n"
                  className="cordo-accueil-img"
                />
              </div>
              <div className="cordo-accueil-card">
                <p>
                  Vous pouvez me retrouver dans la <strong>galerie marchande</strong> de votre{' '}
                  <strong>
                    <span style={{ color: '#000000' }}>Inter</span>
                    <span style={{ color: '#ff0000' }}>marché</span>{' '}
                    <span style={{ color: '#000000' }}>SUPER</span>
                  </strong>{' '}
                  à <strong>Angers</strong>.
                </p>
                <p>
                  Profitez de vos courses pour passer à mon Atelier !
                </p>
              </div>
              <div className="cordo-accueil-photo-frame">
                <img
                  src="/uploads/2021/06/186955828_871992320022870_8851172976867705776_n.jpg"
                  alt="186955828_871992320022870_8851172976867705776_n"
                  className="cordo-accueil-img"
                />
              </div>
            </div>
            <DropZone zone="content" />
          </div>
        ) : isNouveauTitle ? (
          /* SECTION 6: Section Nouveau (Soleil gauche - NOUVEAU - Soleil droit sur une ligne) */
          <div className="cordo-nouveau-row">
            <div className="cordo-nouveau-line" />
            <img
              src="/uploads/2021/08/sun-32198_640.png"
              alt="img soleil"
              className="cordo-sun-icon"
            />
            <h2 className="cordo-nouveau-title">nouveau</h2>
            <img
              src="/uploads/2021/08/sun-32198_640.png"
              alt="img soleil"
              className="cordo-sun-icon"
            />
            <div className="cordo-nouveau-line" />
            <DropZone zone="content" />
          </div>
        ) : isPassSanitaireTitle ? (
          /* SECTION 7: Titre Pass sanitaire sur bandeau bois */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <h1 className="cordo-pass-header-title">Plastifiez votre Pass sanitaire</h1>
            <DropZone zone="content" />
          </div>
        ) : isPassSanitaireContent ? (
          /* SECTION 8: Section Pass sanitaire (Avantages + Carrousel) */
          <div className="cordo-pass-wrap">
            <div className="cordo-pass-grid">
              <div className="cordo-pass-card-left">
                <h2 className="cordo-pass-title">Les avantages :</h2>
                <ul className="cordo-pass-list">
                  <li>
                    <span className="pass-check">
                      <i className="fas fa-check-square"></i>
                    </span>
                    <span>évite toutes agressions extérieure,</span>
                  </li>
                  <li>
                    <span className="pass-check">
                      <i className="fas fa-check-square"></i>
                    </span>
                    <span>empêche les tâches,</span>
                  </li>
                  <li>
                    <span className="pass-check">
                      <i className="fas fa-check-square"></i>
                    </span>
                    <span>ne se déchire pas  ...</span>
                  </li>
                </ul>
              </div>
              <div className="cordo-pass-carousel-wrap">
                <InteractiveCarousel
                  slides={[
                    { url: '/uploads/2021/08/pass-sanitaire-papier-3.jpg', alt: 'exemple Pass sanitaire' },
                    { url: '/uploads/2021/08/pass-sanitaire-papier-2.jpg', alt: 'exemple pass sanitaire' },
                  ]}
                  autoplay={false}
                  interval={4000}
                />
              </div>
            </div>
            <DropZone zone="content" />
          </div>
        ) : isServicesTitle ? (
          /* SECTION 9: Titre MES SERVICES (Ligne pointillée - mes services - Ligne pointillée) */
          <div className="cordo-title-banner-row">
            <div className="cordo-title-banner-line" />
            <h2 className="cordo-title-banner-text">mes services</h2>
            <div className="cordo-title-banner-line" />
            <DropZone zone="content" />
          </div>
        ) : isServicesSection ? (
          /* SECTION 10: The 12 Services & Dual Modals System */
          <div className="cordo-services-catalog-wrap">
            <div className="cordo-services-grid">
              {servicesCatalog.map((service: any) => {
                const carouselSlides = (service.carouselImages || []).map((imgUrl: string) => ({
                  url: imgUrl,
                  alt: service.title,
                }));

                return (
                  <div key={service.id} className="cordo-service-card cordo-service-card-compact">
                    {/* Top Framed Photo Carousel */}
                    <div className="cordo-service-carousel-wrap">
                      <InteractiveCarousel
                        slides={carouselSlides}
                        autoplay={false}
                        interval={4000}
                        showDots={true}
                        showArrows={true}
                        variant="service"
                      />
                    </div>

                    {/* Decorative Title */}
                    <h3 className="cordo-service-card-title">{service.displayTitle || service.title}</h3>

                    {/* Dual Action Square Icon Buttons */}
                    <div className="cordo-service-dual-buttons">
                      {/* Button 1: Gallery / Tarifs Modal */}
                      <button
                        type="button"
                        className="cordo-service-icon-btn cordo-btn-gallery"
                        onClick={() => openServicePrice(service.id)}
                        title={`Consulter la galerie et les tarifs pour : ${service.title}`}
                        aria-label={`Consulter la galerie et les tarifs pour : ${service.title}`}
                      >
                        <i className={`service-card-icon ${getServiceLeftIcon(service)}`} aria-hidden="true"></i>
                      </button>

                      {/* Button 2: Descriptif Modal */}
                      <button
                        type="button"
                        className="cordo-service-icon-btn cordo-btn-desc"
                        onClick={() => openServiceDesc(service.id)}
                        title={`Consulter le descriptif détaillé pour : ${service.title}`}
                        aria-label={`Consulter le descriptif détaillé pour : ${service.title}`}
                      >
                        <i className="service-card-icon far fa-list-alt" aria-hidden="true"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <DropZone zone="content" />
          </div>
        ) : isContactTitle ? (
          /* SECTION 11: Titre CONTACT (Ligne pointillée - contact - Ligne pointillée) */
          <div className="cordo-title-banner-row">
            <div className="cordo-title-banner-line" />
            <h2 className="cordo-title-banner-text">contact</h2>
            <div className="cordo-title-banner-line" />
            <DropZone zone="content" />
          </div>
        ) : isContactContent ? (
          /* SECTION 12: Section Contact (Photo artisan, Infos & Avis, Photo boutique) */
          <div className="cordo-contact-wrap">
            <div className="cordo-contact-grid">
              <div className="cordo-contact-photo-frame">
                <img
                  src="/uploads/2023/03/1-MG_20230311_133033-scaled.jpg"
                  alt="Artisan Cordonnier Jean-Christophe ASIEN"
                  className="cordo-contact-img"
                />
              </div>
              <div className="cordo-contact-card">
                <h3 className="cordo-contact-name">ASIEN Jean-Christophe</h3>
                <h4 className="cordo-contact-role">Artisan Cordonnier</h4>
                <p className="cordo-contact-exp">Depuis plus de 21 ans à votre service</p>
                <div className="cordo-contact-rating">
                  <RatingDisplay score={5} totalStars={5} title="Vos avis :" starsColor="#F9FA04" />
                </div>
                <div className="cordo-contact-actions">
                  <a href="tel:0241872383" className="btn btn-primary btn-sm">
                    02 41 87 23 83
                  </a>
                  <a href="tel:0241470629" className="btn btn-outline btn-sm">
                    02 41 47 06 29
                  </a>
                </div>
                <p className="cordo-contact-addr">55 Bd Jacques Millot (Intermarché Madeleine) • Angers</p>
              </div>
              <div className="cordo-contact-photo-frame">
                <img
                  src="/uploads/2023/03/cordonnerie-03-2023-IMG_20230327_140039-scaled.jpg"
                  alt="Façade Boutique Cordonnerie Le Millot"
                  className="cordo-contact-img"
                />
              </div>
            </div>
            <DropZone zone="content" />
          </div>
        ) : isHorairesTitle ? (
          /* SECTION 13: Titre MES HORAIRES (Ligne pointillée - mes horaires - Ligne pointillée) */
          <div className="cordo-title-banner-row">
            <div className="cordo-title-banner-line" />
            <h2 className="cordo-title-banner-text">mes horaires</h2>
            <div className="cordo-title-banner-line" />
            <DropZone zone="content" />
          </div>
        ) : isHorairesContent ? (
          /* SECTION 14: Section Horaires (Contact, Horaires d'ouverture, Google Maps) */
          <div className="cordo-horaires-wrap">
            <div className="cordo-horaires-grid">
              <div className="cordo-horaires-card">
                <h3 className="cordo-horaires-title">Venir à l'Atelier</h3>
                <p className="cordo-horaires-desc">
                  La cordonnerie vous accueille au sein de la galerie marchande d'Intermarché SUPER.
                </p>
                <div className="cordo-horaires-info">
                  <p>
                    <i className="fas fa-phone-alt" style={{ marginRight: '0.4rem', color: '#4054B2' }}></i>
                    <strong>Téléphone :</strong> <a href="tel:0241470629">02 41 47 06 29</a>
                  </p>
                  <p>
                    <i className="fas fa-phone-alt" style={{ marginRight: '0.4rem', color: '#4054B2' }}></i>
                    <strong>Mobile :</strong> <a href="tel:0661760942">06 61 76 09 42</a>
                  </p>
                  <p>
                    <i className="fas fa-map-marker-alt" style={{ marginRight: '0.4rem', color: '#4054B2' }}></i>
                    <strong>Adresse :</strong> 55 bd Jacques Millot, 49000 Angers
                  </p>
                  <p>
                    <i className="fas fa-car" style={{ marginRight: '0.4rem', color: '#4054B2' }}></i>
                    <strong>Stationnement :</strong> Parking gratuit réservé clientèle
                  </p>
                </div>
                <a
                  href="tel:0241470629"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: '1rem', alignSelf: 'flex-start' }}
                >
                  Appeler l'Atelier
                </a>
              </div>

              <div className="cordo-horaires-schedule-card">
                <WeeklyBusinessHours />
              </div>

              <div className="cordo-horaires-map-card">
                <MapEmbed
                  address="Intermarché - 55 bd jacques millot Angers"
                  title="Localisation Cordonnerie Le Millot Angers"
                  zoom={18}
                  height={271}
                />
              </div>
            </div>
            <DropZone zone="content" />
          </div>
        ) : isAtelierTitle ? (
          /* SECTION 15: Titre MON ATELIER (Ligne pointillée - mon atelier - Ligne pointillée) */
          <div className="cordo-title-banner-row">
            <div className="cordo-title-banner-line" />
            <h2 className="cordo-title-banner-text">mon atelier</h2>
            <div className="cordo-title-banner-line" />
            <DropZone zone="content" />
          </div>
        ) : isWorkshopGallery ? (
          /* SECTION 16: Workshop Gallery with Lightbox matching exact WordPress photos */
          <div className="cordo-workshop-gallery-wrap">
            <MediaGallery
              images={workshopPhotos}
              columns={4}
            />
            <DropZone zone="content" />
          </div>
        ) : isSitemapFooterSection ? (
          /* SECTION 17: Plan du Site, Glossaire, Copyright, Partage */
          <div className="cordo-sitemap-grid">
            <div className="cordo-sitemap-col">
              <h2 className="cordo-sitemap-title">Plan du Site</h2>
              <ul className="cordo-sitemap-list">
                <li><a href="/">Cordonnerie</a></li>
              </ul>
            </div>
            <div className="cordo-sitemap-col">
              <h2 className="cordo-sitemap-title">glossaire</h2>
              <ul className="cordo-sitemap-list">
                <li><a href="/lexique-des-cuirs">Lexique des cuirs</a></li>
                <li><a href="/lexique-semelles-exterieurs">Lexique semelles extérieurs</a></li>
                <li><a href="/lexique-chaussures">lexique chaussures</a></li>
              </ul>
            </div>
            <div className="cordo-sitemap-col">
              <p className="cordo-sitemap-copyright">
                Copyright © 2023 tous droits protégés.
              </p>
            </div>
            <div className="cordo-sitemap-col">
              <div className="cordo-sitemap-share-btns">
                <a
                  href="https://www.facebook.com/sharer/sharer.php?u=https://cordonnerie-lemillot.ags49.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="elementor-share-btn elementor-share-btn-facebook"
                >
                  <i className="fab fa-facebook"></i>
                  <span>Facebook</span>
                </a>
                <a
                  href="https://twitter.com/intent/tweet?url=https://cordonnerie-lemillot.ags49.fr/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="elementor-share-btn elementor-share-btn-twitter"
                >
                  <i className="fab fa-twitter"></i>
                  <span>Twitter</span>
                </a>
              </div>
            </div>
            <DropZone zone="content" />
          </div>
        ) : isIntermarchePartner ? (
          /* SECTION 18: Partenaire Intermarché */
          <div className="cordo-intermarche-grid">
            <div className="cordo-intermarche-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/uploads/2021/05/Logo-Intermarche-removebg-preview.png"
                alt="Logo Intermarché"
                style={{ maxWidth: '280px', width: '100%', height: 'auto' }}
              />
            </div>
            <div className="cordo-intermarche-col" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src="/uploads/2023/03/IMG_20230304_144300-1-scaled.jpg"
                alt="Galerie marchande Intermarché"
                style={{
                  maxWidth: '300px',
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '12px',
                  border: '3px solid #C7804A',
                  boxShadow: '7px 7px 0px 0px #715839',
                }}
              />
            </div>
            <div className="cordo-intermarche-col" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
              <h4 style={{ margin: 0, fontStyle: 'italic', fontWeight: 800 }}>
                <span style={{ color: '#000000' }}>INTER</span>
                <span style={{ color: '#ff0000' }}>MARCHÉ</span>{' '}
                <span style={{ color: '#000000' }}>MILLOT</span>
                <br />
                <span style={{ color: '#000000' }}>SUPER et DRIVE</span>
              </h4>
              <h6 style={{ marginTop: '0.5rem', marginBottom: 0, fontStyle: 'italic' }}>
                <span style={{ color: '#000000' }}>55 BOULEVARD MILLOT</span>
                <br />
                <span style={{ color: '#000000', fontSize: '15px' }}>49000 ANGERS</span>
              </h6>
            </div>
            <DropZone zone="content" />
          </div>
        ) : isKraftwebCredits ? (
          /* SECTION 19: KRAFTWEB Développeur Web */
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <img
              src="/uploads/2021/05/CAPTURE-LOGO-KRAFTWEB.png"
              alt="Logo Kraftweb"
              style={{ maxWidth: '200px', height: 'auto', margin: '0 auto 1rem auto' }}
            />
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.2rem', color: '#715839', margin: '0 0 0.5rem 0' }}>
              DEVELOPPEUR - INTEGRATEUR - WEB
            </h2>
            <h2 style={{ fontFamily: 'var(--font-title)', fontSize: '1.1rem', margin: 0 }}>
              <a href="mailto:contact@kraftweb.fr" style={{ color: '#715839', textDecoration: 'none' }}>
                contact@kraftweb.fr
              </a>
            </h2>
            <DropZone zone="content" />
          </div>
        ) : (
          /* Standard Multi-Widget Section Rendering */
          <div className={`section-nested-grid structure-${structure}`} style={gridStyle}>
            {Array.isArray(items) &&
              items.length > 0 &&
              items.map((child: any, idx: number) => renderChildWidget(child, idx))}

            {/* Puck DropZone for Visual Builder Editing */}
            <DropZone zone="content" />
          </div>
        )}
      </div>
    </section>
  );
};

export default SectionContainer;
