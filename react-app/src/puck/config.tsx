import React from 'react';
import type { Config } from '@measured/puck';

// Modular Component Imports
import { SectionContainer, type SectionContainerProps } from './components/SectionContainer';
import { VerticalSpacer, type VerticalSpacerProps } from './components/VerticalSpacer';
import { CustomDivider, type CustomDividerProps } from './components/CustomDivider';
import { HeadingBlock, type HeadingBlockProps } from './components/HeadingBlock';
import { RichTextBlock, type RichTextBlockProps } from './components/RichTextBlock';
import { ImageBlock, type ImageBlockProps } from './components/ImageBlock';
import { MediaGallery, type MediaGalleryProps } from './components/MediaGallery';
import { VideoEmbed, type VideoEmbedProps } from './components/VideoEmbed';
import { ActionButton, type ActionButtonProps } from './components/ActionButton';
import { AccordionCollapse, type AccordionCollapseProps } from './components/AccordionCollapse';
import { TabContainer, type TabContainerProps } from './components/TabContainer';
import { InteractiveCarousel, type InteractiveCarouselProps } from './components/InteractiveCarousel';
import { WeeklyBusinessHours, type WeeklyBusinessHoursProps, DEFAULT_SCHEDULE } from './components/WeeklyBusinessHours';
import { MapEmbed, type MapEmbedProps } from './components/MapEmbed';
import { ContactForm, type ContactFormProps } from './components/ContactForm';
import { HtmlBlock, type HtmlBlockProps } from './components/HtmlBlock';
import { RatingDisplay, type RatingDisplayProps } from './components/RatingDisplay';
import { FeatureIconList, type FeatureIconListProps } from './components/FeatureIconList';
import { HeroBanner, type HeroBannerProps } from './components/HeroBanner';

export type ComponentProps = {
  // Category 1: Mise en page
  SectionContainer: SectionContainerProps;
  VerticalSpacer: VerticalSpacerProps;
  CustomDivider: CustomDividerProps;
  Section: {
    title?: string;
    backgroundColor?: string;
    paddingY?: 'small' | 'medium' | 'large';
    boxed?: boolean;
    maxWidth?: 'container' | 'container-narrow' | 'full';
  };
  GridColumns: {
    columns?: 1 | 2 | 3 | 4;
    gap?: 'small' | 'medium' | 'large';
  };

  // Category 2: Textes & Titres
  HeadingBlock: HeadingBlockProps;
  RichTextBlock: RichTextBlockProps;
  Heading: {
    text: string;
    level?: 'h1' | 'h2' | 'h3' | 'h4';
    subtitle?: string;
    align?: 'left' | 'center' | 'right';
    color?: string;
  };
  RichText: {
    content: string;
    fontSize?: 'small' | 'base' | 'lead' | 'large';
  };

  // Category 3: Médias
  ImageBlock: ImageBlockProps;
  MediaGallery: MediaGalleryProps;
  VideoEmbed: VideoEmbedProps;
  SingleImage: {
    url: string;
    alt?: string;
    caption?: string;
    aspectRatio?: 'auto' | '16/9' | '4/3' | '1/1';
    rounded?: boolean;
    shadow?: boolean;
  };
  ImageGallery: {
    title?: string;
    columns?: 2 | 3 | 4;
    images?: Array<{ url: string; alt?: string; title?: string }>;
  };
  HeroBanner: HeroBannerProps;

  // Category 4: Éléments Interactifs
  ActionButton: ActionButtonProps;
  AccordionCollapse: AccordionCollapseProps;
  TabContainer: TabContainerProps;
  InteractiveCarousel: InteractiveCarouselProps;
  Accordion: {
    title?: string;
    allowMultiple?: boolean;
    items?: Array<{ header?: string; title?: string; content: string; icon?: string }>;
  };
  Tabs: {
    tabs?: Array<{ id: string; label: string; icon?: string; content?: string; badge?: string }>;
  };
  Carousel: {
    slides?: Array<{ url: string; alt?: string; title?: string; description?: string; link?: string }>;
    autoPlay?: boolean;
    interval?: number;
    showDots?: boolean;
    showArrows?: boolean;
  };
  CallToAction: {
    title?: string;
    subtitle?: string;
    buttonText: string;
    buttonUrl: string;
    style?: 'primary' | 'secondary' | 'gold' | 'chocolate' | 'outline';
  };

  // Category 5: Cordonnerie & Contact
  WeeklyBusinessHours: WeeklyBusinessHoursProps;
  MapEmbed: MapEmbedProps;
  ContactForm: ContactFormProps;
  OpeningHours: {
    title?: string;
    highlightCurrentDay?: boolean;
  };
  GoogleMapEmbed: {
    title?: string;
    address?: string;
    zoom?: number;
    height?: number;
  };

  // Category 6: Avancé
  HtmlBlock: HtmlBlockProps;
  RatingDisplay: RatingDisplayProps;
  FeatureIconList: FeatureIconListProps;
};

export const puckViewports = [
  { width: 375, height: 'auto' as const, label: '📱 Mobile (375px)' },
  { width: 768, height: 'auto' as const, label: '📟 Tablette (768px)' },
  { width: 1200, height: 'auto' as const, label: '💻 Ordinateur (1200px)' },
  { width: 1440, height: 'auto' as const, label: '🖥️ Grand Écran (1440px)' },
];

export const puckConfig: Config<ComponentProps> = {
  categories: {
    layout: {
      title: '📐 Mise en page',
      components: ['SectionContainer', 'VerticalSpacer', 'CustomDivider', 'Section', 'GridColumns'],
    },
    typography: {
      title: '✍️ Textes & Titres',
      components: ['HeadingBlock', 'RichTextBlock', 'Heading', 'RichText'],
    },
    media: {
      title: '🖼️ Médias',
      components: ['ImageBlock', 'MediaGallery', 'VideoEmbed', 'SingleImage', 'ImageGallery', 'HeroBanner'],
    },
    interactive: {
      title: '⚡ Éléments Interactifs',
      components: ['ActionButton', 'AccordionCollapse', 'TabContainer', 'InteractiveCarousel', 'Accordion', 'Tabs', 'Carousel', 'CallToAction'],
    },
    artisan: {
      title: '👞 Cordonnerie & Contact',
      components: ['WeeklyBusinessHours', 'MapEmbed', 'ContactForm', 'OpeningHours', 'GoogleMapEmbed'],
    },
    advanced: {
      title: '🧩 Avancé',
      components: ['HtmlBlock', 'RatingDisplay', 'FeatureIconList'],
    },
  },
  components: {
    // ----------------------------------------------------
    // Category 1: Mise en page
    // ----------------------------------------------------
    SectionContainer: {
      label: 'Conteneur de Section',
      fields: {
        structure: {
          type: 'select',
          label: 'Structure des colonnes',
          options: [
            { label: 'Pleine largeur (1 colonne 100%)', value: '100' },
            { label: '2 colonnes égales (50% / 50%)', value: '50-50' },
            { label: '3 colonnes égales (33% / 33% / 33%)', value: '33-33-33' },
            { label: '2 colonnes asymétriques (30% / 70%)', value: '30-70' },
            { label: '2 colonnes asymétriques (70% / 30%)', value: '70-30' },
          ],
        },
        backgroundColor: {
          type: 'text',
          label: 'Couleur de fond (ex: #FFFFFF, chocolat, caramel, transparent)',
        },
        backgroundImage: { type: 'text', label: 'Image de fond (URL)' },
        padding: { type: 'text', label: 'Espacement intérieur (padding)' },
        maxWidth: {
          type: 'select',
          label: 'Largeur maximale',
          options: [
            { label: 'Standard (1200px)', value: 'container' },
            { label: 'Étroit (860px)', value: 'container-narrow' },
            { label: 'Pleine page (100%)', value: 'full' },
          ],
        },
        anchorId: { type: 'text', label: 'Identifiant d’ancrage HTML (ex: #services)' },
      },
      defaultProps: {
        structure: '100',
        backgroundColor: 'transparent',
        padding: '2.5rem',
        maxWidth: 'container',
      },
      render: (props) => <SectionContainer {...props} />,
    },

    VerticalSpacer: {
      label: 'Espacement Vertical',
      fields: {
        heightDesktop: { type: 'number', label: 'Hauteur sur Ordinateur (px)' },
        heightMobile: { type: 'number', label: 'Hauteur sur Smartphone (px)' },
      },
      defaultProps: {
        heightDesktop: 30,
        heightMobile: 20,
      },
      render: (props) => <VerticalSpacer {...props} />,
    },

    CustomDivider: {
      label: 'Séparateur Décoratif',
      fields: {
        text: { type: 'text', label: 'Texte central optionnel' },
        color: { type: 'text', label: 'Couleur de la ligne' },
        style: {
          type: 'select',
          label: 'Style de trait',
          options: [
            { label: 'Ligne pleine (solid)', value: 'solid' },
            { label: 'Tirets (dashed)', value: 'dashed' },
            { label: 'Pointillés (dotted)', value: 'dotted' },
            { label: 'Double ligne (double)', value: 'double' },
          ],
        },
        thickness: { type: 'number', label: 'Épaisseur (px)' },
        width: { type: 'text', label: 'Largeur (ex: 80%, 100%)' },
      },
      defaultProps: {
        text: '',
        color: 'var(--cordo-gold)',
        style: 'solid',
        thickness: 2,
        width: '100%',
        showDiamond: true,
      },
      render: (props) => <CustomDivider {...props} />,
    },

    Section: {
      label: 'Section Simple',
      fields: {
        title: { type: 'text', label: 'Titre interne' },
        backgroundColor: {
          type: 'select',
          label: 'Couleur de fond',
          options: [
            { label: 'Blanc', value: 'white' },
            { label: 'Crème', value: 'cream' },
            { label: 'Chocolat', value: 'chocolate' },
            { label: 'Transparent', value: 'transparent' },
          ],
        },
        paddingY: {
          type: 'select',
          label: 'Espacement vertical',
          options: [
            { label: 'Normal (3rem)', value: 'medium' },
            { label: 'Compact (1.5rem)', value: 'small' },
            { label: 'Large (5rem)', value: 'large' },
          ],
        },
      },
      defaultProps: {
        title: 'Section',
        backgroundColor: 'transparent',
        paddingY: 'medium',
      },
      render: ({ backgroundColor, paddingY }) => {
        let pad = '2.5rem 0';
        if (paddingY === 'small') pad = '1.25rem 0';
        if (paddingY === 'large') pad = '4.5rem 0';
        return (
          <SectionContainer
            backgroundColor={backgroundColor || 'transparent'}
            padding={pad}
            structure="100"
          />
        );
      },
    },

    GridColumns: {
      label: 'Colonnes en Grille',
      fields: {
        columns: {
          type: 'select',
          label: 'Nombre de colonnes',
          options: [
            { label: '1 colonne', value: 1 },
            { label: '2 colonnes', value: 2 },
            { label: '3 colonnes', value: 3 },
            { label: '4 colonnes', value: 4 },
          ],
        },
        gap: {
          type: 'select',
          label: 'Espacement entre colonnes',
          options: [
            { label: 'Petit', value: 'small' },
            { label: 'Moyen', value: 'medium' },
            { label: 'Grand', value: 'large' },
          ],
        },
      },
      defaultProps: {
        columns: 2,
        gap: 'medium',
      },
      render: ({ columns }) => {
        const structure = columns === 3 ? '33-33-33' : '50-50';
        return <SectionContainer structure={structure} />;
      },
    },

    // ----------------------------------------------------
    // Category 2: Textes & Titres
    // ----------------------------------------------------
    HeadingBlock: {
      label: 'Titre Stylisé',
      fields: {
        text: { type: 'text', label: 'Titre' },
        level: {
          type: 'select',
          label: 'Niveau hiérarchique',
          options: [
            { label: 'Titre H1', value: 'h1' },
            { label: 'Titre H2', value: 'h2' },
            { label: 'Titre H3', value: 'h3' },
            { label: 'Titre H4', value: 'h4' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Alignement',
          options: [
            { label: 'Gauche', value: 'left' },
            { label: 'Centré', value: 'center' },
            { label: 'Droite', value: 'right' },
          ],
        },
        color: { type: 'text', label: 'Couleur du texte' },
        fontFamily: {
          type: 'select',
          label: 'Police de caractères',
          options: [
            { label: 'Audiowide (Titres artisanaux)', value: 'Audiowide' },
            { label: 'Roboto (Moderne sans-serif)', value: 'Roboto' },
            { label: 'Roboto Slab (Sérif robuste)', value: 'Roboto Slab' },
          ],
        },
        subtitle: { type: 'textarea', label: 'Sous-titre descriptif' },
      },
      defaultProps: {
        text: 'Cordonnerie Le Millot',
        level: 'h2',
        align: 'center',
        color: 'var(--cordo-chocolate)',
        fontFamily: 'Audiowide',
      },
      render: (props) => <HeadingBlock {...props} />,
    },

    RichTextBlock: {
      label: 'Bloc Texte Enrichi',
      fields: {
        content: { type: 'textarea', label: 'Contenu (HTML ou texte libre)' },
        textColor: { type: 'text', label: 'Couleur du texte' },
        fontSize: {
          type: 'select',
          label: 'Taille du texte',
          options: [
            { label: 'Normal', value: 'base' },
            { label: 'Chapeau / Lead', value: 'lead' },
            { label: 'Compact', value: 'small' },
            { label: 'Grand', value: 'large' },
          ],
        },
        align: {
          type: 'select',
          label: 'Alignement',
          options: [
            { label: 'Gauche', value: 'left' },
            { label: 'Centré', value: 'center' },
            { label: 'Droite', value: 'right' },
            { label: 'Justifié', value: 'justify' },
          ],
        },
      },
      defaultProps: {
        content: 'Texte de présentation de vos prestations et du savoir-faire artisanal.',
        fontSize: 'base',
        align: 'left',
      },
      render: (props) => <RichTextBlock {...props} />,
    },

    Heading: {
      label: 'Titre',
      fields: {
        text: { type: 'text', label: 'Titre' },
        level: {
          type: 'select',
          label: 'Niveau',
          options: [
            { label: 'H1', value: 'h1' },
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
            { label: 'H4', value: 'h4' },
          ],
        },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        align: {
          type: 'radio',
          label: 'Alignement',
          options: [
            { label: 'Gauche', value: 'left' },
            { label: 'Centré', value: 'center' },
            { label: 'Droite', value: 'right' },
          ],
        },
      },
      defaultProps: {
        text: 'Nos Prestations Artisanales',
        level: 'h2',
        align: 'center',
      },
      render: (props) => <HeadingBlock {...props} />,
    },

    RichText: {
      label: 'Texte',
      fields: {
        content: { type: 'textarea', label: 'Contenu' },
      },
      defaultProps: {
        content: 'Description détaillée à modifier dans le panneau latéral.',
      },
      render: (props) => <RichTextBlock {...props} />,
    },

    // ----------------------------------------------------
    // Category 3: Médias
    // ----------------------------------------------------
    ImageBlock: {
      label: 'Image Simple & Lightbox',
      fields: {
        src: { type: 'text', label: 'URL de l’image (/uploads/...)' },
        alt: { type: 'text', label: 'Texte alternatif (accessibilité)' },
        caption: { type: 'text', label: 'Légende sous l’image' },
        borderRadius: { type: 'text', label: 'Arrondi des coins (ex: 12px)' },
        aspectRatio: {
          type: 'select',
          label: 'Format / Ratio',
          options: [
            { label: 'Automatique (original)', value: 'auto' },
            { label: '16:9 Panoramique', value: '16/9' },
            { label: '4:3 Classique', value: '4/3' },
            { label: '1:1 Carré', value: '1/1' },
          ],
        },
      },
      defaultProps: {
        src: '/uploads/2020/09/tools-4089700_640.jpg',
        alt: 'Outils traditionnels du cordonnier bottier',
        caption: '',
        borderRadius: '12px',
        retroShadow: true,
        lightbox: true,
        aspectRatio: 'auto',
      },
      render: (props) => <ImageBlock {...props} />,
    },

    SingleImage: {
      label: 'Image',
      fields: {
        url: { type: 'text', label: 'URL de l’image' },
        alt: { type: 'text', label: 'Texte alternatif' },
        caption: { type: 'text', label: 'Légende' },
      },
      defaultProps: {
        url: '/uploads/2020/09/tools-4089700_640.jpg',
        alt: 'Outil de cordonnier',
      },
      render: ({ url, alt, caption, aspectRatio }) => (
        <ImageBlock src={url} alt={alt} caption={caption} aspectRatio={aspectRatio} />
      ),
    },

    MediaGallery: {
      label: 'Galerie Photos Interactive',
      fields: {
        title: { type: 'text', label: 'Titre de la galerie' },
        columns: {
          type: 'select',
          label: 'Nombre de colonnes',
          options: [
            { label: '2 colonnes', value: 2 },
            { label: '3 colonnes', value: 3 },
            { label: '4 colonnes', value: 4 },
          ],
        },
        images: {
          type: 'array',
          label: 'Images de la galerie',
          arrayFields: {
            url: { type: 'text', label: 'URL de l’image' },
            alt: { type: 'text', label: 'Description' },
            title: { type: 'text', label: 'Titre au survol' },
            caption: { type: 'text', label: 'Légende' },
          },
        },
      },
      defaultProps: {
        title: 'Photos de notre Atelier',
        columns: 3,
        images: [
          { url: '/uploads/2020/09/tools-4089700_640.jpg', title: 'Outils d’époque' },
          { url: '/uploads/2020/09/shoemaker-2855552_640.jpg', title: 'Réparation semelles' },
          { url: '/uploads/2021/05/185280034_472799637287378_7631920518017539361_n.jpg', title: 'Atelier Angers' },
        ],
      },
      render: (props) => <MediaGallery {...props} />,
    },

    ImageGallery: {
      label: 'Galerie',
      fields: {
        title: { type: 'text', label: 'Titre' },
        columns: {
          type: 'select',
          label: 'Colonnes',
          options: [
            { label: '2 colonnes', value: 2 },
            { label: '3 colonnes', value: 3 },
            { label: '4 colonnes', value: 4 },
          ],
        },
      },
      defaultProps: {
        title: 'Galerie Photos',
        columns: 3,
        images: [
          { url: '/uploads/2020/09/tools-4089700_640.jpg', alt: 'Atelier' },
          { url: '/uploads/2020/09/shoemaker-2855552_640.jpg', alt: 'Chaussures' },
        ],
      },
      render: (props) => <MediaGallery {...props} images={props.images || []} />,
    },

    VideoEmbed: {
      label: 'Vidéo Intégrée (YouTube / MP4)',
      fields: {
        url: { type: 'text', label: 'URL YouTube, Vimeo ou fichier .mp4' },
        title: { type: 'text', label: 'Titre de la vidéo' },
        aspectRatio: {
          type: 'select',
          label: 'Format',
          options: [
            { label: '16:9 Panoramique', value: '16/9' },
            { label: '4:3 Standard', value: '4/3' },
          ],
        },
      },
      defaultProps: {
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        title: 'Reportage au cœur de l’Atelier Le Millot',
        aspectRatio: '16/9',
      },
      render: (props) => <VideoEmbed {...props} />,
    },

    HeroBanner: {
      label: 'Bannière Héro',
      fields: {
        title: { type: 'text', label: 'Titre principal' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        badgeText: { type: 'text', label: 'Badge supérieur' },
        primaryButtonText: { type: 'text', label: 'Texte du bouton' },
        primaryButtonUrl: { type: 'text', label: 'Lien du bouton' },
        imageUrl: { type: 'text', label: 'Image d’arrière-plan (optionnelle)' },
      },
      defaultProps: {
        title: 'Cordonnerie Le Millot',
        subtitle: 'Artisan Cordonnier Bottier à Angers • Galerie Intermarché Madeleine',
        badgeText: 'Maison fondée en 2015',
        primaryButtonText: 'Découvrir nos services',
        primaryButtonUrl: '#services',
      },
      render: (props) => <HeroBanner {...props} />,
    },

    // ----------------------------------------------------
    // Category 4: Éléments Interactifs
    // ----------------------------------------------------
    ActionButton: {
      label: 'Bouton d’Action & Lien',
      fields: {
        label: { type: 'text', label: 'Texte du bouton' },
        url: { type: 'text', label: 'Lien URL ou ancre (#services)' },
        variant: {
          type: 'select',
          label: 'Style / Couleur',
          options: [
            { label: 'Or Artisanal (Gold)', value: 'gold' },
            { label: 'Chocolat (Primary)', value: 'chocolate' },
            { label: 'Caramel (Secondary)', value: 'secondary' },
            { label: 'Contour (Outline)', value: 'outline' },
          ],
        },
        size: {
          type: 'select',
          label: 'Taille',
          options: [
            { label: 'Normal', value: 'md' },
            { label: 'Compact', value: 'sm' },
            { label: 'Grand', value: 'lg' },
          ],
        },
        align: {
          type: 'radio',
          label: 'Alignement',
          options: [
            { label: 'Gauche', value: 'left' },
            { label: 'Centré', value: 'center' },
            { label: 'Droite', value: 'right' },
          ],
        },
      },
      defaultProps: {
        label: 'Prendre Contact',
        url: '#contact',
        variant: 'gold',
        size: 'md',
        align: 'center',
        retroShadow: true,
      },
      render: (props) => <ActionButton {...props} />,
    },

    CallToAction: {
      label: 'Appel à l’Action',
      fields: {
        title: { type: 'text', label: 'Titre' },
        subtitle: { type: 'textarea', label: 'Sous-titre' },
        buttonText: { type: 'text', label: 'Texte du bouton' },
        buttonUrl: { type: 'text', label: 'Lien du bouton' },
      },
      defaultProps: {
        title: 'Confiez vos souliers à un artisan expérimenté',
        subtitle: 'Devis gratuit et conseils sur-mesure à l’atelier.',
        buttonText: 'Nous Contacter',
        buttonUrl: '#contact',
      },
      render: ({ buttonText, buttonUrl, style }) => (
        <ActionButton label={buttonText} url={buttonUrl} variant={style as any || 'gold'} />
      ),
    },

    AccordionCollapse: {
      label: 'Accordéon Dépliable',
      fields: {
        title: { type: 'text', label: 'Titre du groupe d’accordéons' },
        allowMultipleOpen: {
          type: 'radio',
          label: 'Permettre plusieurs volets ouverts',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non (un seul à la fois)', value: false },
          ],
        },
        items: {
          type: 'array',
          label: 'Volets de l’accordéon',
          arrayFields: {
            title: { type: 'text', label: 'Titre du volet' },
            content: { type: 'textarea', label: 'Contenu (texte ou HTML)' },
            icon: { type: 'text', label: 'Classe d’icône optionnelle' },
          },
        },
      },
      defaultProps: {
        title: 'Questions Fréquentes & Tarifs',
        allowMultipleOpen: false,
        items: [
          {
            title: 'Quels sont les délais habituels pour ressemeler des souliers ?',
            content: 'La plupart des réparations courantes sont effectuées en 24h à 48h.',
          },
          {
            title: 'Reproduisez-vous les clés de haute sécurité protégées ?',
            content: 'Oui, nous réalisons la reproduction sur présentation de la carte de propriété.',
          },
        ],
      },
      render: (props) => <AccordionCollapse {...props} />,
    },

    Accordion: {
      label: 'Accordéon',
      fields: {
        title: { type: 'text', label: 'Titre' },
        items: {
          type: 'array',
          label: 'Éléments',
          arrayFields: {
            header: { type: 'text', label: 'Titre du volet' },
            content: { type: 'textarea', label: 'Contenu' },
          },
        },
      },
      defaultProps: {
        title: 'Lexique et Conseils',
        items: [
          { header: 'Cuir pleine fleur', content: 'Partie la plus noble et résistante de la peau.' },
        ],
      },
      render: ({ title, items, allowMultiple }) => (
        <AccordionCollapse
          title={title}
          allowMultipleOpen={allowMultiple}
          items={(items || []).map((i) => ({ title: i.header || i.title || '', content: i.content, icon: i.icon }))}
        />
      ),
    },

    TabContainer: {
      label: 'Onglets Commutables',
      fields: {
        variant: {
          type: 'select',
          label: 'Style des onglets',
          options: [
            { label: 'Boîte fermée (Boxed)', value: 'boxed' },
            { label: 'Pilules (Pills)', value: 'pills' },
            { label: 'Souligné (Underline)', value: 'underline' },
          ],
        },
        tabs: {
          type: 'array',
          label: 'Liste des onglets',
          arrayFields: {
            id: { type: 'text', label: 'Identifiant unique' },
            label: { type: 'text', label: 'Libellé de l’onglet' },
            badge: { type: 'text', label: 'Badge optionnel' },
            content: { type: 'textarea', label: 'Contenu de l’onglet' },
          },
        },
      },
      defaultProps: {
        variant: 'boxed',
        tabs: [
          { id: 'chaussures', label: 'Cordonnerie', content: 'Ressemelage cuir et gomme, patins, talons, coutures Goodyear et Blake.' },
          { id: 'cles', label: 'Clés & Badges', content: 'Double de clé minute, clés sécurisées, badges d’accès d’immeuble.' },
          { id: 'tampons', label: 'Tampons & Gravure', content: 'Tampons professionnels Trodat, gravure plaques de boîtes aux lettres.' },
        ],
      },
      render: (props) => <TabContainer {...props} />,
    },

    Tabs: {
      label: 'Onglets',
      fields: {
        tabs: {
          type: 'array',
          label: 'Onglets',
          arrayFields: {
            id: { type: 'text', label: 'ID' },
            label: { type: 'text', label: 'Titre' },
            content: { type: 'textarea', label: 'Contenu' },
          },
        },
      },
      defaultProps: {
        tabs: [
          { id: 'tab1', label: 'Prestations', content: 'Détails des prestations' },
          { id: 'tab2', label: 'Tarifs', content: 'Consultez notre grille tarifaire' },
        ],
      },
      render: (props) => <TabContainer tabs={props.tabs || []} />,
    },

    InteractiveCarousel: {
      label: 'Carrousel d’Images Tactile',
      fields: {
        autoplay: {
          type: 'radio',
          label: 'Défilement automatique',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        interval: { type: 'number', label: 'Intervalle de rotation (millisecondes)' },
        showDots: {
          type: 'radio',
          label: 'Afficher les puces',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        showArrows: {
          type: 'radio',
          label: 'Afficher les flèches',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
        slides: {
          type: 'array',
          label: 'Diapositives',
          arrayFields: {
            url: { type: 'text', label: 'URL de l’image' },
            alt: { type: 'text', label: 'Texte alternatif' },
            title: { type: 'text', label: 'Titre sur la diapositive' },
            description: { type: 'text', label: 'Description' },
          },
        },
      },
      defaultProps: {
        autoplay: true,
        interval: 4000,
        showDots: true,
        showArrows: true,
        slides: [
          {
            url: '/uploads/2021/08/pass-sanitaire-papier-3.jpg',
            title: 'Plastification et Protection de Documents',
            description: 'Préservation durable contre l’usure et l’humidité.',
          },
          {
            url: '/uploads/2021/08/pass-sanitaire-papier-2.jpg',
            title: 'Savoir-Faire Artisanal',
            description: 'Matériaux de première qualité pour tous vos travaux.',
          },
        ],
      },
      render: (props) => <InteractiveCarousel {...props} />,
    },

    Carousel: {
      label: 'Carrousel',
      fields: {
        autoPlay: {
          type: 'radio',
          label: 'AutoPlay',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
      },
      defaultProps: {
        autoPlay: true,
        slides: [
          { url: '/uploads/2021/08/pass-sanitaire-papier-3.jpg', title: 'Atelier Le Millot' },
        ],
      },
      render: (props) => (
        <InteractiveCarousel
          slides={props.slides || []}
          autoplay={props.autoPlay}
          interval={props.interval}
        />
      ),
    },

    // ----------------------------------------------------
    // Category 5: Cordonnerie & Contact
    // ----------------------------------------------------
    WeeklyBusinessHours: {
      label: 'Horaires d’Ouverture Hebdomadaires',
      fields: {
        title: { type: 'text', label: 'Titre du tableau des horaires' },
        highlightCurrentDay: {
          type: 'radio',
          label: 'Mettre en valeur le jour actuel',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
      },
      defaultProps: {
        title: "Horaires d'ouverture",
        schedule: DEFAULT_SCHEDULE,
        highlightCurrentDay: true,
      },
      render: (props) => <WeeklyBusinessHours {...props} />,
    },

    OpeningHours: {
      label: 'Horaires',
      fields: {
        title: { type: 'text', label: 'Titre' },
      },
      defaultProps: {
        title: "Horaires d'ouverture",
        highlightCurrentDay: true,
      },
      render: (props) => <WeeklyBusinessHours {...props} />,
    },

    MapEmbed: {
      label: 'Carte Google Maps & Itinéraire',
      fields: {
        title: { type: 'text', label: 'Nom du lieu' },
        address: { type: 'text', label: 'Adresse physique' },
        zoom: { type: 'number', label: 'Niveau de zoom (1-20)' },
        height: { type: 'number', label: 'Hauteur en pixels' },
      },
      defaultProps: {
        title: 'Cordonnerie Le Millot - Intermarché Madeleine',
        address: 'Intermarché - 55 bd Jacques Millot, 49000 Angers',
        zoom: 16,
        height: 320,
      },
      render: (props) => <MapEmbed {...props} />,
    },

    GoogleMapEmbed: {
      label: 'Carte',
      fields: {
        address: { type: 'text', label: 'Adresse' },
      },
      defaultProps: {
        address: '55 Boulevard Jacques Millot, 49000 Angers',
      },
      render: (props) => <MapEmbed {...props} />,
    },

    ContactForm: {
      label: 'Formulaire de Contact & Devis',
      fields: {
        title: { type: 'text', label: 'Titre du formulaire' },
        subtitle: { type: 'textarea', label: 'Texte d’introduction' },
        submitLabel: { type: 'text', label: 'Texte du bouton d’envoi' },
        showPhoneField: {
          type: 'radio',
          label: 'Afficher le champ Téléphone',
          options: [
            { label: 'Oui', value: true },
            { label: 'Non', value: false },
          ],
        },
      },
      defaultProps: {
        title: 'Contactez votre Artisan Cordonnier',
        subtitle: 'Une question, un devis gratuit ou un renseignement sur nos prestations ? Remplissez ce formulaire et Jean-Christophe vous répondra dans les plus brefs délais.',
        submitLabel: 'Envoyer ma Demande',
        showPhoneField: true,
      },
      render: (props) => <ContactForm {...props} />,
    },

    // ----------------------------------------------------
    // Category 6: Avancé
    // ----------------------------------------------------
    HtmlBlock: {
      label: 'Code HTML Sécurisé',
      fields: {
        html: { type: 'textarea', label: 'Code HTML' },
      },
      defaultProps: {
        html: '<div style="padding: 1rem; background: #f5f5f5; border-radius: 8px; text-align: center;">Bloc HTML Personnalisé</div>',
      },
      render: (props) => <HtmlBlock {...props} />,
    },

    RatingDisplay: {
      label: 'Note et Avis Clients',
      fields: {
        title: { type: 'text', label: 'Titre' },
        score: { type: 'number', label: 'Note moyenne (sur 5)' },
        totalStars: { type: 'number', label: 'Nombre total d’étoiles' },
        reviewCount: { type: 'number', label: 'Nombre total d’avis' },
        comment: { type: 'textarea', label: 'Témoignage client mis en avant' },
      },
      defaultProps: {
        title: 'Vos avis :',
        score: 5,
        totalStars: 5,
        reviewCount: 42,
        comment: 'Travail d’artisan remarquable, accueil chaleureux et tarifs très honnêtes.',
      },
      render: (props) => <RatingDisplay {...props} />,
    },

    FeatureIconList: {
      label: 'Liste à Puces & Avantages',
      fields: {
        title: { type: 'text', label: 'Titre de la liste' },
        items: {
          type: 'array',
          label: 'Éléments',
          arrayFields: {
            text: { type: 'text', label: 'Texte de l’avantage' },
            link: { type: 'text', label: 'Lien éventuel' },
          },
        },
      },
      defaultProps: {
        title: 'Les Engagements Le Millot',
        items: [
          { text: 'Savoir-faire artisanal traditionnel' },
          { text: 'Matériaux nobles et cuirs rigoureusement sélectionnés' },
          { text: 'Devis clair, transparent et sans engagement' },
        ],
      },
      render: (props) => <FeatureIconList {...props} />,
    },
  },
};

export default puckConfig;
