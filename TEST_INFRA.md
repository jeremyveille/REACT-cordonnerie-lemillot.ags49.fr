# Architecture et Spécifications de la Suite de Tests E2E — Cordonnerie Le Millot
**Projet** : Migration WordPress Cordonnerie Le Millot vers React + Puck + Firebase  
**Référence Exigences** : `ORIGINAL_REQUEST.md`, `PROJECT.md`  
**Auteur** : E2E Test Writer (E2E Testing Track)  
**Version** : 1.0.0  
**Date** : 31 Octobre 2026  

---

## 1. Méthodologie Globale de Test à 4 Paliers (4-Tier Testing Methodology)

La suite de tests E2E opaque-box ("boîte opaque") vérifie le respect strict et inconditionnel des exigences fonctionnelles, des contrats d'interface et des critères d'acceptation du projet, indépendamment des détails d'implémentation internes. Chaque cas de test découle directement d'une source d'autorité identifiée.

```
+-----------------------------------------------------------------------------------+
|                            TIER 4 : SCÉNARIOS RÉELS                               |
|        Workload Testing & Parcours Utilisateurs Complets (>= 10 scénarios)         |
+-----------------------------------------------------------------------------------+
|                         TIER 3 : COMBINAISONS CROISÉES                            |
|             Pairwise Combinatorial Testing Inter-Features (>= 20 tests)           |
+-----------------------------------------------------------------------------------+
|                        TIER 2 : LIMITES ET CAS CRITIQUES                          |
|             Boundary Value Analysis (BVA) & Corner Cases (>= 100 tests)           |
+-----------------------------------------------------------------------------------+
|                        TIER 1 : COUVERTURE FONCTIONNELLE                          |
|         Category-Partition Method sur les 20 Fonctionnalités (>= 100 tests)        |
+-----------------------------------------------------------------------------------+
```

### Palier 1 : Couverture Fonctionnelle Nominale (Category-Partition Method)
- **Objectif** : Vérifier le comportement nominal (chemin heureux / happy path) de chaque fonctionnalité du catalogue.
- **Principe** : Décomposition de chaque fonctionnalité en catégories de paramètres et partitions d'équivalence représentatives.
- **Volume** : Au minimum 5 tests indépendants par fonctionnalité × 20 fonctionnalités = **>= 100 tests**.

### Palier 2 : Analyse des Valeurs Limites et Cas d'Angle (Boundary Value Analysis - BVA)
- **Objectif** : Vérifier la robustesse aux bornes, la gestion des erreurs et la résilience face aux entrées dégradées ou extrêmes.
- **Principe** : Sélection des entrées aux frontières ($min - 1$, $min$, $nominal$, $max$, $max + 1$), caractères spéciaux français (accents, cédilles, apostrophes typographiques), rupture réseau, données corrompues, absence d'images.
- **Volume** : Au minimum 5 tests limites par fonctionnalité × 20 fonctionnalités = **>= 100 tests**.

### Palier 3 : Combinaisons Croisées et Interactivités (Pairwise Combinatorial Testing)
- **Objectif** : Détecter les défauts émergeant de l'interaction simultanée entre deux ou plusieurs sous-systèmes.
- **Principe** : Couverture systématique des paires d'états (ex: Glisser-déposer Puck + Inspecteur latéral + Sélecteur Responsive + Sauvegarde de brouillon + Rechargement navigateur).
- **Volume** : **>= 20 tests d'interaction croisée**.

### Palier 4 : Scénarios Métier et Charges Utilisateurs (Real-World Workload Scenarios)
- **Objectif** : Valider l'expérience globale sous forme de parcours de bout en bout réalistes simulant tant l'artisan administrateur que le client en visite.
- **Principe** : Exécution de séquences multi-étapes avec validation d'invariants métier à chaque étape.
- **Volume** : **>= 10 scénarios complets**.

---

## 2. Sources d'Autorité des Sorties Attendues (Authoritative Expected Output Sources)

Pour chaque test, la sortie attendue est dérivée rigoureusement et sans approximation de l'une des sources oracles suivantes :

1. **Dump SQL officiel de référence (`ags491473278_2mvaqx.sql`)** :
   - Table `wp_posts` (IDs 83, 888, 1022, 1046, 36 templates Elementor).
   - Métadonnées `_elementor_data` et postmeta Kit 73 (Design System).
   - Horaires d'ouverture réels du cordonnier (Lundi au Samedi 9h00-19h00, Dimanche Fermé).
   - Coordonnées : Intermarché 55 bd Jacques Millot, Angers. Téléphone : 02 41 87 23 83.
2. **Wireframes et Maquettes de référence (`SITE/`)** :
   - 13 dossiers thématiques documentant l'arborescence, les textes des 12 prestations et les 88 captures d'écran.
3. **Cahier des charges (`ORIGINAL_REQUEST.md`)** :
   - Exigences R1 (Audit & extraction sans altération), R2 (React/Vite/Firebase), R3 (Puck en français, 14 widgets), R4 (Persistance brouillon/publié, multi-écrans sans overflow).
4. **Spécification d'Architecture (`PROJECT.md`)** :
   - Contrats d'interface `PageRecord`, `IPageStorageService`, structure JSON Puck, 20 fonctionnalités définies.

---

## 3. Matrice de Partitionnement et Décomposition des 20 Fonctionnalités

### Fonctionnalité 1 : SQL & Media Extraction
- **Description** : Extraction automatisée des 4 pages, menus et médias depuis le dump SQL et `wp-content/uploads/` sans altération du site d'origine.
- **Source d'autorité** : `ags491473278_2mvaqx.sql`, `SITE/`, `wp-content/uploads/`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.1.1* : Présence des 4 pages clés (ID 83 Accueil, 888 Lexique cuirs, 1022 Lexique semelles, 1046 Lexique chaussures).
  - *T1.1.2* : Présence et intégrité des 6 items de menu de navigation (ancres #accueil, #services, #contact, etc.).
  - *T1.1.3* : Présence de l'inventaire des 112 médias originaux conservant leur arborescence `YYYY/MM/`.
  - *T1.1.4* : Conservation stricte de l'intégrité du fichier SQL d'origine (lecture seule, horodatage et checksum préservés).
  - *T1.1.5* : Extraction des options globales du site (nom du blog, horaires, téléphone, adresse Madeleine).
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.1.1* : Révisions orphelines dans `wp_postmeta` (exclusion des posts orphelins non publiés).
  - *T2.1.2* : Encodage et déséchappement des chaînes WordPress avec guillemets simples/doubles et apostrophes françaises.
  - *T2.1.3* : Absence de médias corrompus ou de chemins absolus Windows/Linux dans les métadonnées extraites.
  - *T2.1.4* : Traitement des pièces jointes sans fichier physique (gestion propre sans plantage).
  - *T2.1.5* : Résistance à un dump SQL fragmenté ou de très grande taille (> 140 Mo).

### Fonctionnalité 2 : Elementor Data Decoupling
- **Description** : Décodage de `_elementor_data` pour générer le catalogue initial JSON des pages et des 31 templates de modales.
- **Source d'autorité** : `PROJECT.md § Interface Contracts`, `elementor_parsed_active.json`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.2.1* : Décodage valide du JSON imbriqué d'`_elementor_data` pour la page d'accueil (19 sections).
  - *T1.2.2* : Extraction complète des 12 fiches de services avec leurs textes descriptifs.
  - *T1.2.3* : Extraction des templates de modales de tarifs pour les 12 services.
  - *T1.2.4* : Présence des listes d'attributs de service (délais, prix de départ, puces).
  - *T1.2.5* : Conformité du schéma `serviceModals.json` au contrat d'interface.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.2.1* : Gestion des blocs HTML bruts et balises de mise en forme imbriquées (`<span>`, `<br>`, `<strong>`).
  - *T2.2.2* : Gestion des templates Elementor sans données de contenu (`_elementor_data` vide).
  - *T2.2.3* : Support des sections sans colonnes secondaires ou à 1 seule colonne.
  - *T2.2.4* : Filtrage des contrôles internes Elementor non transposables dans React (ex: `_element_id`, animations JS tierces).
  - *T2.2.5* : Normalisation des URLs relatives d'images vers `/uploads/`.

### Fonctionnalité 3 : React & Vite Foundation
- **Description** : Initialisation de l'application React TypeScript avec Vite, Vanilla CSS pur (User Override : interdiction stricte de Tailwind, 100% Pure CSS) et structure modulaire.
- **Source d'autorité** : `PROJECT.md § Code Layout`, `vite.config.ts`, `package.json`, [User Override 2026-10-31].
- **Partitions Tier 1 (Happy Path)** :
  - *T1.3.1* : Configuration Vite avec support React et TypeScript sans erreur de transpilation.
  - *T1.3.2* : Présence des dépendances fondamentales (`react`, `react-dom`, `react-router-dom`, `lucide-react`).
  - *T1.3.3* : Respect strict du standard Pure CSS : aucune dépendance `tailwindcss` dans `package.json`, styles rédigés en CSS natif pur (`src/index.css` ou modules CSS).
  - *T1.3.4* : Résolution correcte des alias de chemins TypeScript (`@/*` ou imports relatifs).
  - *T1.3.5* : Production d'un bundle de build de production dans `dist/` sans avertissements bloquants.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.3.1* : Tolérance aux imports de composants asynchrones (React.lazy et Suspense).
  - *T2.3.2* : Exécution correcte en environnement sans DOM complet (SSR / tests Node / JSDOM).
  - *T2.3.3* : Gestion des variables d'environnement manquantes (`VITE_FIREBASE_*`).
  - *T2.3.4* : Strict Mode de React activé sans double-déclenchement destructeur d'effets de bord.
  - *T2.3.5* : Gestion des routes publiques non trouvées (page 404 soignée).

### Fonctionnalité 4 : Firebase Integration & Hybrid Storage
- **Description** : Configuration Firebase Auth, Firestore et implémentation de `StorageAdapter` (Firestore + LocalStorage).
- **Source d'autorité** : `PROJECT.md § Interface Contracts (IPageStorageService)`, `ORIGINAL_REQUEST.md § R2`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.4.1* : Initialisation du SDK Firebase avec configuration de secours (mock/démo en l'absence de clé distante).
  - *T1.4.2* : Mécanisme d'authentification administrateur (`admin@cordonnerie-lemillot.fr`).
  - *T1.4.3* : Implémentation complète de l'interface `IPageStorageService` (`getPages`, `getPageById`, `getPageBySlug`, `saveDraft`, `publishPage`, `createPage`, `deletePage`).
  - *T1.4.4* : Stockage et récupération locale sans échec via `LocalStoragePageStorage`.
  - *T1.4.5* : Basculement automatique transparent en mode hybride si Firebase est hors-ligne.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.4.1* : Échec d'authentification avec identifiants erronés (message d'erreur explicite en français).
  - *T2.4.2* : Gestion du quota `localStorage` saturé avec gestion gracieuse d'exception.
  - *T2.4.3* : Données corrompues dans `localStorage` (récupération automatique depuis la graine `initialPages.json`).
  - *T2.4.4* : Tentative d'accès à une page inexistante par ID ou slug (retourne `null` sans crash).
  - *T2.4.5* : Requêtes concurrentes d'écriture sur `saveDraft` (debounce temporel).

### Fonctionnalité 5 : Design System & Branding
- **Description** : Intégration des polices Audiowide/Roboto, palette de couleurs (Chocolat `#715839`, Caramel `#C7804A`, Jaune `#E5E000`, etc.) et ombres 3D rétro.
- **Source d'autorité** : Kit Elementor ID 73, `PROJECT.md § Architecture`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.5.1* : Définition des variables de couleurs de la marque en CSS natif pur (`:root { --cordo-chocolate: #715839; --cordo-caramel: #C7804A; --cordo-gold: #D8960C; --cordo-yellow: #E5E000; --cordo-green: #1B6C30; --cordo-red: #FA2D2D; }`).
  - *T1.5.2* : Intégration de la police `Audiowide` pour les titres principaux et boutons d'en-tête.
  - *T1.5.3* : Intégration de la police `Roboto` pour le corps de texte et les paragraphes informatifs.
  - *T1.5.4* : Implémentation des ombres portées rétro brutalistes en CSS pur (`box-shadow: 7px 7px 0px 0px #715839`).
  - *T1.5.5* : Cohérence visuelle des boutons d'action (coins arrondis 12px, bordures marquées).
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.5.1* : Rendu textuel de secours si les polices Google Fonts externes ne sont pas encore chargées.
  - *T2.5.2* : Contraste de couleur conforme aux recommandations WCAG AA sur fonds chocolat et caramel.
  - *T2.5.3* : Comportement des ombres 3D sur écrans tactiles mobiles (sans débordement de boîte).
  - *T2.5.4* : Gestion des thèmes ou préférences utilisateur `prefers-reduced-motion`.
  - *T2.5.5* : Gestion des badges de statut avec couleurs sémantiques (vert ouvert, rouge fermé).

### Fonctionnalité 6 : Puck Editor Visual Builder
- **Description** : Intégration de `@measured/puck` avec retour visuel immédiat au glisser-déposer et drop zones imbriquées.
- **Source d'autorité** : `@measured/puck`, `ORIGINAL_REQUEST.md § R3`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.6.1* : Instanciation de l'éditeur Puck avec configuration typée valide.
  - *T1.6.2* : Disponibilité des zones de dépôt (DropZones) pour l'insertion de composants.
  - *T1.6.3* : Retour visuel immédiat lors du glisser d'un widget (état drag-over actif).
  - *T1.6.4* : Réorganisation de l'ordre des composants par glisser-déposer sans perte de propriétés.
  - *T1.6.5* : Suppression d'un bloc sélectionné dans l'arbre de composants Puck.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.6.1* : Glisser-déposer dans un conteneur vide (affichage du placeholder d'invitation au dépôt).
  - *T2.6.2* : Tentative d'insertion d'un widget à une profondeur d'imbrication excessive.
  - *T2.6.3* : Déplacement d'un composant hors de la zone éditable (annulation propre).
  - *T2.6.4* : Édition sur périphérique tactile (support des événements touch).
  - *T2.6.5* : Sauvegarde d'un document Puck avec 0 composant (`content: []`).

### Fonctionnalité 7 : Configurable Widgets Library (14 Widgets)
- **Description** : 14 widgets interactifs sans code (Section, GridColumns, Heading, RichText, SingleImage, ImageGallery, Carousel, Accordion, Tabs, CallToAction, ContactForm, OpeningHours, GoogleMapEmbed, HtmlBlock).
- **Source d'autorité** : `PROJECT.md § Feature Inventory (7)`, Explorer 3 Architecture Report.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.7.1* : Définition et rendu correct des widgets de structure (`Section`, `GridColumns`).
  - *T1.7.2* : Définition et rendu des widgets typographiques (`Heading`, `RichText`).
  - *T1.7.3* : Définition et rendu des widgets médias (`SingleImage`, `ImageGallery`, `Carousel`).
  - *T1.7.4* : Définition et rendu des widgets interactifs (`Accordion`, `Tabs`, `CallToAction`).
  - *T1.7.5* : Définition et rendu des widgets métier (`OpeningHours`, `GoogleMapEmbed`, `ContactForm`, `HtmlBlock`).
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.7.1* : Widget Accordéon sans aucun élément défini (tableau vide : affichage neutre).
  - *T2.7.2* : Widget Image avec URL manquante ou cassée (affichage du fallback gracieux).
  - *T2.7.3* : Widget Google Maps avec adresse ou coordonnées personnalisées.
  - *T2.7.4* : Sécurisation du widget `HtmlBlock` (désinfection des balises script malveillantes).
  - *T2.7.5* : Widget Horaires avec configuration exceptionnelle (jour férié ou horaires spéciaux).

### Fonctionnalité 8 : Sidebar Live Property Inspector
- **Description** : Panneau latéral d'édition ergonomique avec mise à jour en temps réel sans blocage ni rechargement.
- **Source d'autorité** : `ORIGINAL_REQUEST.md § R3`, `PROJECT.md § Feature 8`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.8.1* : Ouverture automatique des inspecteurs de propriétés lors de la sélection d'un bloc.
  - *T1.8.2* : Traduction intégrale en français des libellés de champs de configuration.
  - *T1.8.3* : Mise à jour instantanée du composant lors de la frappe d'un texte dans le panneau latéral.
  - *T1.8.4* : Sélecteur de niveaux de titre (H1, H2, H3, H4) modifiant immédiatement le DOM rendu.
  - *T1.8.5* : Contrôles spécifiques pour les tableaux d'éléments (ajout et suppression d'éléments de carrousel ou d'accordéon).
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.8.1* : Saisie de textes très longs (> 2 000 caractères) sans troncature ni dépassement d'interface.
  - *T2.8.2* : Caractères accentués, guillemets et émoticônes dans les champs de l'inspecteur.
  - *T2.8.3* : Fermeture du panneau latéral sans désynchronisation de l'état du document.
  - *T2.8.4* : Basculement rapide de sélection entre deux composants de types différents.
  - *T2.8.5* : Valeurs numériques invalides ou curseurs de réglages aux bornes minimale et maximale.

### Fonctionnalité 9 : Responsive Preview Selector
- **Description** : Sélecteur de prévisualisation multi-écrans en temps réel (Mobile 375px, Tablette 768px, Desktop 1200px, Grand écran 1440px).
- **Source d'autorité** : `PROJECT.md § Feature 9`, `ORIGINAL_REQUEST.md § Acceptance Criteria`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.9.1* : Présence des 4 boutons de bascule de prévisualisation responsive.
  - *T1.9.2* : Application immédiate de la largeur 375px pour la simulation smartphone.
  - *T1.9.3* : Application immédiate de la largeur 768px pour la simulation tablette.
  - *T1.9.4* : Application immédiate de la largeur 1200px pour la simulation ordinateur portable / desktop.
  - *T1.9.5* : Application immédiate de la largeur 1440px pour grand écran.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.9.1* : Conservation du zoom et du centrage lors du changement de mode d'affichage.
  - *T2.9.2* : Absence de débordement horizontal (`overflow-x: hidden`) à l'intérieur du conteneur responsive à 375px.
  - *T2.9.3* : Fonctionnalité des composants interactifs (accordéons, onglets) maintenue en mode preview.
  - *T2.9.4* : Redimensionnement fluide lors du passage du mode paysage au mode portrait.
  - *T2.9.5* : Retour au mode plein écran sans latence d'affichage.

### Fonctionnalité 10 : History Management
- **Description** : Gestion complète de l'historique dans l'éditeur (Annuler / Rétablir, Ctrl+Z / Ctrl+Y).
- **Source d'autorité** : `ORIGINAL_REQUEST.md § R3`, `PROJECT.md § Feature 10`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.10.1* : Présence des boutons Annuler et Rétablir dans l'en-tête de l'éditeur.
  - *T1.10.2* : Annulation d'une modification de texte via le bouton Annuler.
  - *T1.10.3* : Rétablissement d'une modification annulée via le bouton Rétablir.
  - *T1.10.4* : Annulation de l'ajout d'un bloc de composant.
  - *T1.10.5* : Raccourcis clavier `Ctrl+Z` (Undo) et `Ctrl+Y` / `Ctrl+Shift+Z` (Redo) fonctionnels.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.10.1* : Bouton Annuler désactivé à l'état initial (historique vide).
  - *T2.10.2* : Bouton Rétablir désactivé tant qu'aucune annulation n'a eu lieu.
  - *T2.10.3* : Écrasement de la branche de rétablissement si une nouvelle modification survient après annulation.
  - *T2.10.4* : Gestion d'un historique profond (> 50 opérations successives sans fuite mémoire).
  - *T2.10.5* : Conservation de l'historique après sauvegarde automatique de brouillon.

### Fonctionnalité 11 : French Admin Dashboard
- **Description** : Interface d'administration moderne entièrement en français, adaptée à tous les écrans, avec gestionnaire de pages (créer, modifier, dupliquer, supprimer).
- **Source d'autorité** : `ORIGINAL_REQUEST.md § R3`, `PROJECT.md § Feature 11`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.11.1* : Liste des pages existantes affichée avec leur titre, slug, statut et date de mise à jour.
  - *T1.11.2* : Bouton de création d'une nouvelle page ouvrant le formulaire en français.
  - *T1.11.3* : Création d'une page avec titre et slug valide redirigeant vers l'éditeur.
  - *T1.11.4* : Duplication d'une page existante avec génération d'un slug unique suffixé.
  - *T1.11.5* : Suppression d'une page avec confirmation préalable.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.11.1* : Tentative de création avec un slug contenant des espaces ou caractères interdits (slugification automatique).
  - *T2.11.2* : Tentative de création avec un slug déjà existant (rejet avec message explicite).
  - *T2.11.3* : Titre de page vide (blocage de soumission avec indication visuelle).
  - *T2.11.4* : Protection contre la suppression de la page d'accueil principale racine (`/`).
  - *T2.11.5* : Ergonomie du tableau de bord sur écran mobile (375px : tableau adapté ou cartes).

### Fonctionnalité 12 : State Persistence & Versioning
- **Description** : Séparation stricte entre `draftData` et `publishedData`, sauvegarde automatique debouncée, persistance après rechargement du navigateur.
- **Source d'autorité** : `PROJECT.md § State & Persistence`, `ORIGINAL_REQUEST.md § R4`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.12.1* : Sauvegarde automatique des modifications dans `draftData` sans affecter `publishedData`.
  - *T1.12.2* : Persistance intégrale de `draftData` après rafraîchissement complet du navigateur (`F5`).
  - *T1.12.3* : Action explicite "Publier" synchronisant `publishedData` avec le dernier état de `draftData`.
  - *T1.12.4* : Statut de la page basculant de "Brouillon" à "Publié" lors de la publication.
  - *T1.12.5* : Statut de la page basculant à "Modifié" lorsqu'un brouillon plus récent que la version publiée existe.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.12.1* : Visiteur anonyme ne voyant que `publishedData` sur l'URL publique, même si un brouillon existe.
  - *T2.12.2* : Fermeture abrupte de l'onglet pendant l'édition et reprise ultérieure sans perte.
  - *T2.12.3* : Publication avec `draftData` volumineux comprenant de nombreux composants et images.
  - *T2.12.4* : Horodatage précis `updatedAt` et `publishedAt` au format ISO 8601.
  - *T2.12.5* : Restauration d'une version précédente en cas de publication indésirable.

### Fonctionnalité 13 : Public One-Page Navigation
- **Description** : Menu d'ancrage fluide (#accueil, #services, #contact, #horaires, #localisation, #atelier) et header responsive avec menu mobile.
- **Source d'autorité** : Menu WordPress `menu-LeMillot` (Term 2), `ORIGINAL_REQUEST.md § R4`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.13.1* : Présence des 6 ancres de navigation dans l'en-tête du site public.
  - *T1.13.2* : Défilement fluide vers la section `#services` lors du clic sur le lien correspondant.
  - *T1.13.3* : Défilement vers `#horaires`, `#localisation` et `#atelier`.
  - *T1.13.4* : En-tête fixe (sticky) restant accessible lors du défilement de la page.
  - *T1.13.5* : Ouverture et fermeture du menu burger sur terminal mobile.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.13.1* : Clic sur une ancre depuis une page satellite (ex: `/lexique-des-cuirs` -> redirection vers `/#services`).
  - *T2.13.2* : Clic extérieur pour refermer le tiroir mobile de navigation.
  - *T2.13.3* : Décalage de l'en-tête (scroll-margin-top) évitant que le titre de section soit masqué sous le header.
  - *T2.13.4* : Navigation au clavier (accessibilité tabulation et focus visible).
  - *T2.13.5* : Comportement de l'ancre racine `#accueil` réinitialisant le défilement en haut de page.

### Fonctionnalité 14 : 12 Interactive Services & Dual Modals
- **Description** : Catalogue des 12 prestations artisanales avec carrousels et 2 fenêtres modales par service (Galerie & Descriptif avec devis/tarifs).
- **Source d'autorité** : `PROJECT.md § Feature 14`, Explorer 1 Report § 5 (Section 10).
- **Partitions Tier 1 (Happy Path)** :
  - *T1.14.1* : Présence des 12 fiches de prestations sur la page d'accueil.
  - *T1.14.2* : Clic sur le bouton d'icône métier ouvrant la modale de descriptif du service sélectionné.
  - *T1.14.3* : Clic sur le bouton liste ouvrant la modale de grille tarifaire du service sélectionné.
  - *T1.14.4* : Affichage du carrousel de réalisations illustrant chaque prestation.
  - *T1.14.5* : Fermeture de la modale active par clic sur la croix ou appui sur la touche `Échap`.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.14.1* : Clic en dehors de la boîte de modale (backdrop) déclenchant la fermeture.
  - *T2.14.2* : Verrouillage du défilement d'arrière-plan (`body overflow: hidden`) lors de l'ouverture d'une modale.
  - *T2.14.3* : Affichage responsive sans débordement de la modale tarifaire sur petit écran (375px).
  - *T2.14.4* : Navigation rapide entre plusieurs modales de services sans superposition résiduelle.
  - *T2.14.5* : Respect des tarifs et délais extraits du dump WordPress pour chaque prestation.

### Fonctionnalité 15 : 3 Technical Lexicon Pages
- **Description** : Pages autonomes `/lexique-des-cuirs` (34-37 accordéons), `/lexique-semelles-exterieurs` (2 accordéons), `/lexique-chaussures` (45-48 accordéons et schéma anatomique).
- **Source d'autorité** : Pages WP IDs 888, 1022, 1046, `PROJECT.md § Architecture`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.15.1* : Accessibilité de l'URL `/lexique-des-cuirs` avec chargement des accordéons de cuirs.
  - *T1.15.2* : Accessibilité de `/lexique-semelles-exterieurs` avec comparaison semelles cuir vs semelles gomme.
  - *T1.15.3* : Accessibilité de `/lexique-chaussures` avec schéma anatomique et termes de la chaussure.
  - *T1.15.4* : Dépliage et repliage individuel des accordéons encyclopédiques.
  - *T1.15.5* : Présence du pied de page uniforme (4 colonnes) sur les 3 pages de lexique.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.15.1* : Dépliage simultané ou exclusif des accordéons sans blocage d'interface.
  - *T2.15.2* : Recherche textuelle native du navigateur (`Ctrl+F`) trouvant les termes dans les volets.
  - *T2.15.3* : Rendu responsive lisible du schéma anatomique sur smartphone sans débordement.
  - *T2.15.4* : Préservation des termes techniques complexes et orthographe spécialisée (Cordovan, Blake, Trépointe).
  - *T2.15.5* : Lien de retour vers l'accueil depuis l'en-tête ou le fil d'Ariane.

### Fonctionnalité 16 : Dynamic Interactive Public Components
- **Description** : Accordéons dépliables, carrousels tactiles/cliquables, onglets commutables, horaires dynamiques avec statut Ouvert/Fermé, visionneuse lightbox photo atelier.
- **Source d'autorité** : `ORIGINAL_REQUEST.md § R4`, `PROJECT.md § Feature 16`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.16.1* : Défilement automatique et manuel du carrousel d'accueil avec indicateurs de points.
  - *T1.16.2* : Commutation immédiate des onglets avec affichage du contenu dédié sans rechargement.
  - *T1.16.3* : Calcul dynamique du statut "Actuellement Ouvert" ou "Actuellement Fermé" selon le jour et l'heure.
  - *T1.16.4* : Mise en évidence en rouge du Dimanche Fermé dans le tableau des horaires.
  - *T1.16.5* : Clic sur une photo de la galerie de l'atelier ouvrant la visionneuse lightbox plein écran.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.16.1* : Navigation tactile par balayage (swipe gauche/droite) sur le carrousel mobile.
  - *T2.16.2* : Passage minuit / changement de jour sans incohérence d'affichage du statut d'ouverture.
  - *T2.16.3* : Visionneuse lightbox avec touches fléchées clavier (précédent / suivant).
  - *T2.16.4* : Formulaire de contact public avec validation syntaxique de l'adresse email.
  - *T2.16.5* : Soumission du formulaire affichant le retour de succès sans quitter la page.

### Fonctionnalité 17 : Multi-device Layout & Zero Overflow
- **Description** : Affichage fluide strictly responsive sur smartphone, tablette, desktop et grand écran, sans débordement horizontal (`overflow-x: hidden`).
- **Source d'autorité** : `ORIGINAL_REQUEST.md § R4 & Acceptance Criteria`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.17.1* : Rendu impeccable à 375px (iPhone standard) avec $scrollWidth \le clientWidth$.
  - *T1.17.2* : Rendu impeccable à 768px (iPad portrait) sans débordement de grille.
  - *T1.17.3* : Rendu impeccable à 1200px (Laptop / Desktop) avec conteneurs centrés.
  - *T1.17.4* : Rendu impeccable à 1440px (Grand écran) sans étirement excessif des images.
  - *T1.17.5* : Présence de la règle globale anti-débordement `overflow-x: hidden` sur les conteneurs racines.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.17.1* : Écran ultra-étroit à 320px (anciens smartphones) sans rupture de texte ni chevauchement.
  - *T2.17.2* : Tableaux de tarifs larges avec défilement horizontal interne contrôlé sans impacter la page entière.
  - *T2.17.3* : Grandes images et logos redimensionnés avec `max-w-full h-auto`.
  - *T2.17.4* : Écran 4K (2560px) : centrage préservé avec `max-w-screen-xl mx-auto`.
  - *T2.17.5* : Changement d'orientation portrait/paysage sur tablette sans glissement horizontal.

### Fonctionnalité 18 : Docker & Firebase Deployment Config
- **Description** : Fichiers Dockerfile multi-stage, nginx.conf, et compatibilité build avec `firebase.json`.
- **Source d'autorité** : `PROJECT.md § Architecture & Code Layout`, `firebase.json`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.18.1* : Présence d'un `Dockerfile` multi-stage valide (Node build + Nginx Alpine).
  - *T1.18.2* : Présence du fichier `nginx.conf` avec règle de réécriture SPA (`try_files $uri $uri/ /index.html`).
  - *T1.18.3* : Présence du `firebase.json` configuré pour Firebase Hosting avec réécriture d'URL.
  - *T1.18.4* : Commande de build `npm run build` produisant des artéfacts valides dans `dist/`.
  - *T1.18.5* : Vérification du healthcheck HTTP de conteneur (`HEALTHCHECK`).
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.18.1* : Gestion des en-têtes de sécurité HTTP dans `nginx.conf` (`X-Frame-Options`, `X-Content-Type-Options`).
  - *T2.18.2* : Compression gzip/brotli activée pour les ressources textuelles et bundles JS.
  - *T2.18.3* : Mise en cache longue durée des artéfacts statiques hachés (`Cache-Control: max-age=31536000`).
  - *T2.18.4* : Construction Docker avec variable d'environnement `NODE_ENV=production`.
  - *T2.18.5* : Taille minimale de l'image Docker finale (utilisation d'Alpine Linux).

### Fonctionnalité 19 : E2E Test Suite (Tiers 1-4)
- **Description** : Suite de tests opaque-box automatisée couvrant toutes les fonctionnalités selon la méthodologie à 4 tiers avec exécution autonome et reporting clair.
- **Source d'autorité** : `PROJECT.md § Feature 19`, `TEST_INFRA.md`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.19.1* : Exécutable autonome sans configuration complexe (`node tests/e2e/runner.mjs`).
  - *T1.19.2* : Sortie console explicite avec comptage des tests passés, échoués et ignorés.
  - *T1.19.3* : Code de sortie système 0 en cas de succès de la suite.
  - *T1.19.4* : Génération d'un rapport de résultats structuré JSON (`test-results.json`).
  - *T1.19.5* : Support de filtres d'exécution par palier ou par mot-clé de fonctionnalité.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.19.1* : Isolation stricte de chaque test (aucun état partagé destructeur entre tests).
  - *T2.19.2* : Échouement propre et informatif avec message d'assertion détaillé en cas de non-respect de contrat.
  - *T2.19.3* : Gestion des timeouts asynchrones sur les opérations simulées.
  - *T2.19.4* : Compatibilité de la suite sous Windows (PowerShell/cmd) et Linux/macOS.
  - *T2.19.5* : Total de tests respectant les quotas minimaux (Tier 1 >= 100, Tier 2 >= 100, Tier 3 >= 20, Tier 4 >= 10).

### Fonctionnalité 20 : Adversarial Coverage Hardening (Tier 5)
- **Description** : Préparation et compatibilité de la suite pour les tests de robustesse contradictoires, injection d'entrées hostiles et audits de couverture extrêmes (M5).
- **Source d'autorité** : `PROJECT.md § Feature 20`.
- **Partitions Tier 1 (Happy Path)** :
  - *T1.20.1* : Résistance à l'injection de balises HTML hostiles (`<script>`, `<iframe src="javascript:...">`).
  - *T1.20.2* : Résistance à l'injection SQL / NoSQL dans les paramètres d'interrogation.
  - *T1.20.3* : Résistance aux charges utiles JSON malformées ou récursives.
  - *T1.20.4* : Résistance aux identifiants invalides ou altérés dans l'adaptateur de stockage.
  - *T1.20.5* : Audit d'invariants : impossibilité d'effacer les pages maîtresses sans validation explicite.
- **Partitions Tier 2 (Boundary & Corner Cases)** :
  - *T2.20.1* : Attaques d'échappement d'attributs HTML dans les titres et descriptions de widgets.
  - *T2.20.2* : Déni de service par taille de payload excessive (> 10 Mo de chaîne JSON).
  - *T2.20.3* : Injection de dates d'horaires corrompues ou de jours inexistants.
  - *T2.20.4* : Attaque de traversée de chemin dans les références d'uploads de médias (`../../etc/passwd`).
  - *T2.20.5* : Vérification de la non-altération du dump SQL et des fichiers maîtres sous contrainte hostile.

---

## 4. Matrice Tier 3 : Combinaisons Croisées (Pairwise Interactions)

Les 20 interactions croisées vérifient la cohérence entre sous-systèmes interdépendants :

| # | Combinaison | Composants Impliqués | Description de l'Interaction |
|---|---|---|---|
| P1 | Puck Editor ↔ Sidebar Inspector | F6, F8 | Ajout d'un widget Accordéon, sélection dans l'arbre, modification en direct du titre dans l'inspecteur, vérification de la réactivité instantanée du canvas. |
| P2 | Puck Editor ↔ Responsive Preview | F6, F9 | Bascule en mode Mobile (375px), glisser-déposer d'un widget Carrousel, vérification du recalcul automatique de la largeur et de l'adaptation tactile. |
| P3 | Sidebar Inspector ↔ History Management | F8, F10 | Modification d'une couleur et d'un texte de titre via l'inspecteur, déclenchement de `Ctrl+Z`, vérification du retour strict à l'état antérieur dans l'inspecteur et dans le rendu. |
| P4 | Puck Editor ↔ State Persistence (Draft) | F6, F12 | Insertion de plusieurs blocs dans Puck, attente de l'auto-sauvegarde debouncée, simulation de rechargement complet de page, vérification de la présence intégrale du brouillon. |
| P5 | State Persistence ↔ Public Rendering | F12, F13 | Enregistrement d'un brouillon non publié, interrogation de la route publique `/`, vérification stricte que le public ne voit que l'ancienne version publiée. |
| P6 | Publish Action ↔ Public Rendering | F12, F14 | Déclenchement de l'action `publishPage`, consultation immédiate de l'URL publique, vérification de la visibilité des nouveaux blocs pour les visiteurs anonymes. |
| P7 | StorageAdapter Hybrid Fallback ↔ Offline | F4, F12 | Coupure simulée du réseau Firebase, tentative de sauvegarde de brouillon, bascule automatique sur `localStorage` avec notification démo/hors-ligne. |
| P8 | Admin Dashboard ↔ Visual Editor Routing | F11, F6 | Clic sur le bouton "Éditer" de la page Accueil depuis le tableau de bord, navigation vers `/admin/edit/83`, initialisation de l'éditeur avec les données de la page. |
| P9 | Admin Dashboard ↔ Page Creation | F11, F4 | Création d'une nouvelle page "Clés & Badges" (slug auto `cles-et-badges`), persistance dans le `StorageAdapter`, vérification de son apparition dans le tableau de bord. |
| P10 | Admin Dashboard ↔ Page Duplication | F11, F12 | Duplication d'une page existante, vérification de l'attribution d'un identifiant et d'un slug unique, vérification que la page dupliquée démarre à l'état brouillon. |
| P11 | Services Catalog ↔ Dual Modal System | F14, F16 | Clic sur la carte prestation "Reproduction de Clés", ouverture de la modale descriptive, fermeture, clic sur le bouton grille tarifaire, ouverture de la modale tarifs. |
| P12 | Dual Modal System ↔ Multi-Device Viewport | F14, F17 | Ouverture d'une modale tarifaire à 375px, vérification de l'adaptation des images de tarifs sans débordement horizontal ni coupure de texte. |
| P13 | Lexicon Page ↔ Responsive Accordions | F15, F17 | Navigation sur `/lexique-des-cuirs` à 375px, déploiement successif de 5 accordéons techniques, vérification de la fluidité et de l'absence de scroll horizontal. |
| P14 | Business Hours ↔ Real-Time Status Badge | F7, F16 | Modification de l'horloge système simulée (Dimanche 14h), vérification de l'apparition du badge rouge "Fermé", bascule sur Mardi 10h, vérification du badge vert "Ouvert". |
| P15 | Workshop Gallery ↔ Lightbox Overlay | F7, F16 | Clic sur une photo de l'établi dans la section atelier, ouverture de la modale lightbox plein écran, touche flèche droite, passage à la photo suivante, fermeture sur Échap. |
| P16 | Navigation Header ↔ Anchor Scrolling | F13, F17 | Clic sur le menu "mon atelier" sur mobile, fermeture automatique du drawer burger, défilement vers `#atelier` avec décalage de marge d'en-tête respecté. |
| P17 | Contact Form ↔ Storage / Validation | F7, F4 | Saisie d'une demande de devis sur le site public, validation regex email, soumission réussie, enregistrement du message dans le stockage local/Firestore. |
| P18 | Docker Container ↔ Nginx SPA Routing | F18, F13 | Requête HTTP directe sur `/lexique-chaussures`, vérification de la réponse Nginx 200 via réécriture vers `/index.html` (pas de 404 Nginx). |
| P19 | Extracted Data ↔ Initial Page Seeding | F1, F2, F4 | Démarrage à blanc avec cache vidé, vérification que le `StorageAdapter` charge automatiquement les 4 pages et 12 modales depuis `initialPages.json`. |
| P20 | Design System ↔ Puck Component Theme | F5, F7 | Application des règles CSS pures (variables `--cordo-*`, ombres 3D `box-shadow: 7px 7px 0px 0px #715839` et typographies Audiowide/Roboto) sans aucune classe Tailwind sur les composants Puck générés. |

---

## 5. Matrice Tier 4 : Scénarios Métier Réels (Workload Scenarios)

| # | Scénario | Acteur | Déroulement & Invariants Validés |
|---|---|---|---|
| S1 | **Parcours Découverte Client Complet** | Visiteur Web | 1. Arrivée sur `/` (Page d'accueil).<br>2. Consultation de l'en-tête et vérification du statut d'ouverture en direct.<br>3. Défilement vers la section `#services`.<br>4. Examen des prestations de cordonnerie traditionnelle.<br>5. Ouverture de la modale descriptive "Chaussures" puis de la grille tarifaire.<br>6. Consultation des horaires détaillés et de la carte d'accès Madeleine.<br>7. Invariant : Zéro rupture visuelle, affichage instantané, fermeture des modales propre. |
| S2 | **Consultation Mobile & Appel d'Urgence** | Client sur Smartphone (375px) | 1. Chargement de la page sur mobile.<br>2. Ouverture du menu burger, clic sur "mes horaires", défilement fluide vers `#horaires`.<br>3. Vérification de l'ouverture du samedi (9h-19h en continu).<br>4. Clic sur le numéro d'appel direct `tel:0241872383`.<br>5. Invariant : Aucun débordement horizontal ($scrollWidth \le clientWidth$), cible tactile d'au moins 44px. |
| S3 | **Recherche Encyclopédique & Glossaire des Cuirs** | Passionné de Souliers | 1. Clic sur le lien de bas de page "Lexique des cuirs" vers `/lexique-des-cuirs`.<br>2. Lecture de l'introduction sur le tannage.<br>3. Dépliage de l'accordéon "Cordovan" puis "Cuir tannage végétal".<br>4. Consultation des conseils d'entretien et propriétés mécaniques.<br>5. Navigation vers `/lexique-chaussures` pour observer le schéma anatomique.<br>6. Invariant : Intégrité des 34 et 45 définitions techniques sans coupure textuelle. |
| S4 | **Création d'une Nouvelle Prestation par l'Artisan** | Artisan Administrateur | 1. Connexion sécurisée sur `/admin/login` avec identifiants cordonnier.<br>2. Redirection vers le tableau de bord d'administration en français.<br>3. Clic sur "Créer une nouvelle page" : titre "Rénovation Baskets & Sneakers".<br>4. Génération automatique du slug `renovation-baskets-et-sneakers`.<br>5. Insertion dans Puck d'une bannière, d'un bloc de texte, d'une galerie avant/après et d'un tableau tarifaire.<br>6. Publication de la page.<br>7. Invariant : La nouvelle page est accessible publiquement sur son URL dédiée. |
| S5 | **Mise à Jour Tarifaire & Historique Annuler/Rétablir** | Artisan Administrateur | 1. Accès à l'éditeur Puck sur la page d'accueil.<br>2. Sélection du widget de tarification des talons aiguilles.<br>3. Modification du tarif de 14 € à 16 € dans l'inspecteur latéral.<br>4. Réflexion : action sur le bouton "Annuler" (`Ctrl+Z`), retour immédiat à 14 €.<br>5. Confirmation : action sur "Rétablir" (`Ctrl+Y`), retour à 16 €.<br>6. Clic sur "Publier la page".<br>7. Invariant : Le nouveau tarif est enregistré et persistant après rechargement. |
| S6 | **Gestion de Congés Exceptionnels & Horaires Spéciaux** | Artisan Administrateur | 1. Accès au tableau de bord d'administration.<br>2. Modification des horaires d'ouverture hebdomadaires pour indiquer une fermeture exceptionnelle.<br>3. Enregistrement en brouillon puis prévisualisation en mode tablette (768px).<br>4. Constat visuel satisfaisant, publication en ligne.<br>5. Consultation immédiate sur le site public : le badge indique l'état mis à jour.<br>6. Invariant : Les couleurs sémantiques (vert/rouge) reflètent l'état programmé. |
| S7 | **Demande de Devis Client & Suivi Artisan** | Visiteur & Artisan | 1. Le client navigue jusqu'à la section `#contact`.<br>2. Remplissage du formulaire : Nom, Email, Téléphone, Message ("Ress semelage cousu Goodyear").<br>3. Envoi du formulaire avec accusé de réception visuel immédiat.<br>4. L'artisan se connecte sur `/admin` et consulte le compteur de messages.<br>5. Invariant : Message stocké fidèlement avec horodatage et données de contact. |
| S8 | **Réorganisation Structurelle d'Accueil par Glisser-Déposer** | Artisan Administrateur | 1. Ouverture de l'éditeur Puck sur la page d'accueil (19 sections).<br>2. Déplacement de la section "Atelier photo" avant la section "Pass sanitaire".<br>3. Bascule responsive en vue Mobile (375px) pour vérifier la fluidité.<br>4. Sauvegarde automatique en brouillon.<br>5. Rechargement du navigateur (`F5`).<br>6. Invariant : Le brouillon conserve l'ordre réorganisé sans altérer la version publique en ligne. |
| S9 | **Résilience en Mode Hors-Ligne / Déconnexion Réseau** | Utilisateur Nomade | 1. Connexion initiale et chargement du site.<br>2. Simulation d'une rupture complète de connectivité Internet.<br>3. Navigation entre les sections ancrées et consultation des lexiques déjà mis en cache.<br>4. Tentative de modification dans l'administration : notification d'enregistrement local de secours.<br>5. Invariant : Aucune page blanche, aucun blocage JS fatal, persistance locale assurée. |
| S10 | **Audit d'Intégrité Multi-Résolutions & Non-Régression** | Auditeur Qualité | 1. Chargement systématique des 4 pages principales aux 4 résolutions canoniques (375px, 768px, 1200px, 1440px).<br>2. Vérification systématique du calcul `document.body.scrollWidth <= window.innerWidth`.<br>3. Vérification de la présence des 112 images sans lien brisé (status HTTP 200).<br>4. Vérification de l'intégrité du fichier SQL d'origine (lecture seule absolue).<br>5. Invariant : Zéro débordement, 100% des médias accessibles, intégrité totale de la base. |

---

## 6. Architecture du Test Runner Opaque-Box & Commandes d'Exécution

Le moteur d'exécution de tests est hébergé sous `tests/e2e/runner.mjs`. Conçu en Node.js moderne (ESM), il garantit une autonomie totale, une indépendance absolue vis-à-vis des outils tiers et une exécution ultra-rapide.

### Commandes d'Exécution

```bash
# Exécution complète de tous les paliers (Tiers 1, 2, 3, 4)
node tests/e2e/runner.mjs

# Exécution ciblée par Palier
node tests/e2e/runner.mjs --tier=1
node tests/e2e/runner.mjs --tier=2
node tests/e2e/runner.mjs --tier=3
node tests/e2e/runner.mjs --tier=4

# Exécution ciblée par Fonctionnalité (ex: F14 Services & Modales)
node tests/e2e/runner.mjs --feature=14

# Génération du rapport de résultats JSON pour audit et CI/CD
node tests/e2e/runner.mjs --json
```

### Format du Rapport de Sortie (`test-results.json`)
```json
{
  "timestamp": "2026-10-31T17:00:00.000Z",
  "summary": {
    "total": 230,
    "passed": 230,
    "failed": 0,
    "skipped": 0,
    "durationMs": 1420
  },
  "tiers": {
    "tier1": { "name": "Feature Coverage", "total": 100, "passed": 100, "failed": 0 },
    "tier2": { "name": "Boundary & Corner Cases", "total": 100, "passed": 100, "failed": 0 },
    "tier3": { "name": "Pairwise Combinations", "total": 20, "passed": 20, "failed": 0 },
    "tier4": { "name": "Workload Scenarios", "total": 10, "passed": 10, "failed": 0 }
  },
  "tests": [ ... ]
}
```

---
*Fin du document TEST_INFRA.md — Approuvé pour la suite de tests E2E.*
