# Portfolio — Kevin Renou

Portfolio de **développeur front-end React**, conçu et codé de zéro : une seule page, sept « pièces », trois projets.

> 🚧 **En cours de développement.** Le lien vers le site en ligne sera ajouté ici dès son déploiement.

## Le concept

Le site se lit comme une feuille de papier. L'accueil et le contact sont sur papier kraft, « À propos » et « Compétences » sur un papier blanc bleuté, et les trois projets sont les seules pièces colorées : la couleur de la page suit la pièce que l'on regarde. On arrive sur un menu typographique géant ; un clic fait défiler jusqu'à la pièce visée.

Chaque projet présenté donne accès au site en ligne, au code source, au contexte, aux problèmes rencontrés et à ce que j'en ai appris.

## Stack technique

| Rôle                    | Outil                                                                                   |
| ----------------------- | --------------------------------------------------------------------------------------- |
| Outillage et build      | [Vite 8](https://vite.dev) (bundler Rolldown)                                           |
| Interface               | [React 19](https://react.dev), JavaScript ES2022+                                       |
| Styles                  | [Dart Sass](https://sass-lang.com) (modules `@use`), méthodologie BEM                   |
| Animations              | [Motion](https://motion.dev) chargé à la demande, CSS natif                             |
| Tests                   | [Vitest](https://vitest.dev), [Testing Library](https://testing-library.com), happy-dom |
| Qualité                 | ESLint, Prettier                                                                        |
| Gestionnaire de paquets | [pnpm](https://pnpm.io)                                                                 |

## Choix techniques

- **Vite + React plutôt qu'un framework** : une page unique et statique, sans routage ni serveur — le cas où la documentation de React recommande de partir de Vite.
- **Composants réutilisables** : un composant ne connaît rien du site ; tout passe par ses props et par le design system. Les sections assemblent composants et données.
- **Contenu dans des fichiers JSON** : ajouter un projet ne demande aucune ligne de code.
- **Le natif d'abord** : la modale est un `<dialog>` natif (gestion du focus, touche Échap, fond) — aucune bibliothèque de modale.
- **Sass moderne** : modules `@use` / `@forward` uniquement (`@import` est déprécié) ; un design system en trois niveaux — outils sans sortie CSS, styles globaux, et styles de chaque composant rangés avec lui.
- **Mobile-first** : les styles de base sont ceux du mobile ; deux points de rupture (640 px, 1024 px) ajoutent des colonnes.

## Accessibilité et sobriété

- **Accessibilité — objectif WCAG 2.1 AA** (équivalent RGAA 4) : HTML sémantique, navigation complète au clavier, focus visible, contrastes vérifiés pièce par pièce, `prefers-reduced-motion` respecté (animations coupées, défilement instantané).
- **Green code** : site statique, JavaScript limité et chargé à la demande, animations sur `transform` et `opacity`, polices auto-hébergées, images WebP optimisées, aucun traqueur.
- Les mesures Lighthouse et EcoIndex seront publiées ici à la livraison.

## Démarrer

Prérequis : Node.js 20.19+ ou 22.12+, et pnpm.

```bash
git clone https://github.com/KevinPTEK/portfolio.git
cd portfolio
pnpm install
pnpm dev
```

| Script          | Rôle                                   |
| --------------- | -------------------------------------- |
| `pnpm dev`      | serveur de développement               |
| `pnpm build`    | version de production dans `dist/`     |
| `pnpm preview`  | sert la version de production en local |
| `pnpm lint`     | analyse du code avec ESLint            |
| `pnpm test`     | tests, relancés à chaque sauvegarde    |
| `pnpm test:run` | tests en un seul passage               |

## Structure

```
src/
  components/   composants d'interface réutilisables (un dossier = .jsx + .scss + .test.jsx)
  sections/     les pièces du site, qui assemblent composants et données
  animations/   tout ce qui bouge, réutilisable
  hooks/        hooks React partagés
  data/         le contenu : projects.json, skills.json
  styles/       design system Sass (abstracts : outils · base : styles globaux)
  assets/       polices et images
```

Règle de dépendance : `sections/` importe `components/`, `animations/` et `data/` — jamais l'inverse. C'est ce qui garde les composants réutilisables.

## Démarche

Le site a été conçu avant d'être codé : charte graphique, maquette interactive, puis spécification technique (stack, composants, accessibilité, budget de performance). Les tests ciblent les composants réutilisables et y cherchent les éléments comme le ferait un utilisateur, par leur rôle et leur nom accessible : un test qui passe est aussi un contrôle d'accessibilité.

## Avancement

- [x] Initialisation : Vite, React, Sass, Motion, Vitest
- [ ] Design system Sass et métadonnées SEO
- [ ] Composants d'interface, testés
- [ ] Sections et données : site complet, responsive et accessible
- [ ] Animations
- [ ] Contenus définitifs et images optimisées
- [ ] Mesures (Lighthouse, EcoIndex, clavier, VoiceOver) et déploiement

---

Projet 12 du parcours **Intégrateur web** d'OpenClassrooms · [Kevin Renou sur GitHub](https://github.com/KevinPTEK)
