# Project: Migration WordPress Cordonnerie Le Millot vers React + Puck + Firebase

## Architecture
- **Framework & Build**: React 18/19, TypeScript, Vite, Pure CSS (CSS standard, variables CSS custom properties, responsive media queries, CSS modules), Lucide React icons. AUCUN Tailwind CSS (consigne prioritaire utilisateur).
- **Visual Builder Engine**: Puck Editor (`@measured/puck`) configuré avec 14 custom widgets stylisés en CSS pur, regroupés en 6 catégories en français (`Mise en page`, `Textes & Titres`, `Médias`, `Éléments Interactifs`, `Cordonnerie & Contact`, `Avancé`).
- **State & Persistence**: Dual JSON structure (`draftData` and `publishedData`), `StorageAdapter` pattern providing hybrid persistence (Firebase Firestore + debounced `localStorage` fallback with instant seed recovery).
- **Authentication & Security**: Firebase Authentication for Admin access (`/admin`), protected routes, demo authentication fallback for offline/development environments.
- **Routing & Public Rendering**: React Router v6.
  - `/` (ou `/a-angers`): Page d'accueil Landing Page (19 sections, 12 fiches de services avec 2 modales pop-up par service, carrousels, accordéons, horaires d'ouverture, Google Maps, galerie atelier, crédits).
  - `/lexique-des-cuirs`: 37 accordéons techniques sur les cuirs.
  - `/lexique-semelles-exterieurs`: 2 accordéons semelles extérieures (cuir vs gomme).
  - `/lexique-chaussures`: 48 accordéons sur les éléments de la chaussure avec schéma anatomique.
  - `/admin`: Tableau de bord en français (gestionnaire de pages, création, édition visuelle, publication).
  - `/admin/edit/:pageId`: Éditeur visuel Puck interactif avec prévisualisation multi-appareils (375px, 768px, 1200px, 1440px), inspecteur de propriétés en direct et historique (annuler/rétablir).
- **Design System & Assets**:
  - Polices: `Audiowide` (titres et boutons), `Roboto` (textes et descriptions).
  - Couleurs: Variables CSS (`--cordo-chocolate: #715839`, `--cordo-caramel: #C7804A`, `--cordo-gold: #D8960C`, `--cordo-yellow: #E5E000`, `--cordo-green: #1B6C30`, `--cordo-red: #FA2D2D`, `--cordo-dark: #3d424a`, `--cordo-bg: #FCFCFC`).
  - Ombres 3D: `box-shadow: 7px 7px 0px 0px var(--cordo-chocolate)`.
  - Médias: 112 images originales copiées depuis `wp-content/uploads/` vers `react-app/public/uploads/` pour une autonomie totale.
- **Containerisation**: `Dockerfile` multi-stage (Node build + Nginx Alpine) prêt pour déploiement Docker et compatible Firebase Hosting via `firebase.json`.

---

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | SQL & Media Extraction | Extraction automatisée des 4 pages, menus et 112 médias depuis SQL et `wp-content/` sans altérer l'original | M1 | R1, Survey |
| 2 | Elementor Data Decoupling | Décodage de `_elementor_data` pour générer le catalogue initial JSON des pages et des 31 templates de modales | M1 | R1, Survey |
| 3 | React & Vite Foundation | Initialisation de l'application React TypeScript avec Vite, CSS pur (variables CSS) et structure modulaire sans Tailwind | M2 | R2, User Override |
| 4 | Firebase Integration & Hybrid Storage | Configuration Firebase Auth, Firestore et implémentation de `StorageAdapter` (Firestore + LocalStorage) | M2 | R2, Survey |
| 5 | Design System & Branding | Intégration des polices Audiowide/Roboto, palette de couleurs (Chocolat, Caramel, Or) et ombres 3D | M2 | R1, Survey |
| 6 | Puck Editor Visual Builder | Intégration de `@measured/puck` avec retour visuel immédiat au glisser-déposer et drop zones | M3 | R2, R3, Survey |
| 7 | Configurable Widgets Library | 14 widgets interactifs sans code (titres, paragraphes, images/galeries, boutons/liens, accordéons, onglets, carrousels, vidéos, formulaires, business hours, Google Maps, HTML sécurisé) | M3 | R3, Survey |
| 8 | Sidebar Live Property Inspector | Panneau latéral d'édition ergonomique avec mise à jour en temps réel sans blocage ni rechargement | M3 | R3, Survey |
| 9 | Responsive Preview Selector | Sélecteur de prévisualisation multi-écrans en temps réel (Mobile 375px, Tablette 768px, Desktop 1200px, Grand écran 1440px) | M3 | R3, Survey |
| 10 | History Management | Gestion complète de l'historique dans l'éditeur (Annuler / Rétablir, Ctrl+Z / Ctrl+Y) | M3 | R3, Survey |
| 11 | French Admin Dashboard | Interface d'administration moderne entièrement en français, adaptée à tous les écrans, avec gestionnaire de pages (créer, modifier, dupliquer, supprimer) | M3 | R3, Survey |
| 12 | State Persistence & Versioning | Séparation stricte entre `draftData` et `publishedData`, sauvegarde automatique debouncée, persistance après rechargement du navigateur | M4 | R4, Survey |
| 13 | Public One-Page Navigation | Menu d'ancrage fluide (#accueil, #services, #contact, #horaires, #localisation, #atelier) et header responsive | M4 | R4, Survey |
| 14 | 12 Interactive Services & Dual Modals | Catalogue des 12 prestations avec carrousels de cartes et 2 fenêtres modales par service (Galerie & Descriptif avec devis) | M4 | R4, Survey |
| 15 | 3 Technical Lexicon Pages | Pages autonomes `/lexique-des-cuirs` (37 accordéons), `/lexique-semelles-exterieurs` (2 accordéons), `/lexique-chaussures` (48 accordéons et schéma) | M4 | R4, Survey |
| 16 | Dynamic Interactive Public Components | Accordéons dépliables, carrousels tactiles/cliquables, onglets commutables, horaires dynamiques avec statut Ouvert/Fermé, visionneuse lightbox photo atelier | M4 | R4, Survey |
| 17 | Multi-device Layout & Zero Overflow | Affichage fluide strictly responsive sur smartphone, tablette, desktop et grand écran, sans débordement horizontal (`overflow-x: hidden`) | M4 | R4, Survey |
| 18 | Docker & Firebase Deployment Config | Fichiers Dockerfile multi-stage, nginx.conf, et compatibilité build avec `firebase.json` | M4 | R2, Survey |
| 19 | E2E Test Suite (Tiers 1-4) | Suite de tests opaque-box automatisée couvrant toutes les fonctionnalités selon la méthodologie à 4 tiers | M5 | Acceptance Criteria |
| 20 | Adversarial Coverage Hardening (Tier 5) | Tests de robustesse contradictoires, cas limites extrêmes, audit de couverture sans faille | M5 | Acceptance Criteria |

---

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | `extract_assets_data` | Extraction SQL & Médias: conversion des données Elementor et options en JSON prêt à l'emploi, copie des 112 médias dans le dossier public | none | DONE |
| M2 | `react_firebase_foundation` | Socle React + Vite + TypeScript, configuration CSS Pur (variables CSS & Design System Kit 73), Firebase Auth & StorageAdapter hybride | none | DONE |
| M3 | `puck_editor_admin` | Dashboard d'administration en français, intégration Puck Editor, 14 widgets interactifs, inspecteur latéral, sélecteur responsive et historique | M1, M2 | DONE |
| M4 | `public_site_fidelity` | Moteur de rendu public, routing React Router, 19 sections de la homepage, 12 fiches de services avec 2 modales pop-up par service, 3 glossaires, persistance brouillon/publié, responsive multi-écrans sans overflow | M1, M2, M3 | DONE |
| M5 | `e2e_pass_hardening` | Phase 1: Validation 100% de la suite de tests E2E (Tiers 1-4). Phase 2: Durcissement contradictoire (Tier 5) | M4, E2E_TRACK | DONE |

---

## Interface Contracts

### 1. Données Extraites (M1 ↔ M2/M3/M4)
- Fichier: `react-app/src/data/initialPages.json` et `react-app/src/data/serviceModals.json`
- Schéma d'une page:
  ```ts
  interface PageRecord {
    id: string; // "83", "888", "1022", "1046"
    slug: string; // "/", "lexique-des-cuirs", etc.
    title: string;
    status: "published" | "draft";
    publishedData: PuckData;
    draftData: PuckData;
    updatedAt: string;
  }
  ```
- Médias: Disponibles sous `react-app/public/uploads/YYYY/MM/...` correspondant exactement aux chemins relatifs d'origine.

### 2. StorageAdapter (M2 ↔ M3/M4)
- Interface de stockage:
  ```ts
  interface IPageStorageService {
    getPages(): Promise<PageRecord[]>;
    getPageById(id: string): Promise<PageRecord | null>;
    getPageBySlug(slug: string): Promise<PageRecord | null>;
    saveDraft(id: string, data: PuckData): Promise<void>;
    publishPage(id: string, data?: PuckData): Promise<void>;
    createPage(title: string, slug: string): Promise<PageRecord>;
    deletePage(id: string): Promise<void>;
  }
  ```

### 3. Schéma Puck Editor (M3 ↔ M4)
- Bibliothèque de widgets enregistrée dans `react-app/src/puck/config.tsx` exportant la configuration Puck officielle `Config<Props>`.
- Rendu public: `<Render config={config} data={page.publishedData} />`.

---

## Code Layout
```
react-app/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── Dockerfile
├── nginx.conf
├── public/
│   ├── favicon.ico
│   └── uploads/                  # 112 images originales WordPress
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── firebase/
│   │   ├── config.ts
│   │   ├── auth.ts
│   │   └── storageAdapter.ts
│   ├── data/
│   │   ├── initialPages.json
│   │   ├── serviceModals.json
│   │   └── siteConfig.json
│   ├── context/
│   │   ├── AuthContext.tsx
│   │   └── ModalContext.tsx
│   ├── puck/
│   │   ├── config.tsx
│   │   └── components/          # 14 widgets Puck modulaires
│   ├── pages/
│   │   ├── PublicPage.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── AdminDashboard.tsx
│   │   └── AdminEditor.tsx
│   └── components/
│       ├── Header.tsx
│       ├── Footer.tsx
│       ├── ModalProvider.tsx
│       └── Navigation.tsx
└── tests/
    └── e2e/                     # Suite de tests E2E
```
