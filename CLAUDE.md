# CLAUDE.md — Projet Site Ambre

## Architecture

Site vitrine Next.js 14 (App Router) avec export statique. Pas de backend — le formulaire passe par Web3Forms (service tiers gratuit).

### Structure

```
src/
├── config/site.ts       → Configuration centralisée (contacts, témoignages, navigation)
├── components/          → Composants partagés (Header, Footer, AnimatedSection, TestimonialCard)
└── app/                 → Pages (chaque dossier = une route)
    ├── page.tsx         → Accueil
    ├── a-propos/        → À propos
    ├── services/        → Services + témoignages + FAQ
    ├── portfolio/       → Portfolio avec filtre par catégorie
    └── contact/         → Formulaire + infos contact
```

### Décisions techniques

| Décision | Justification |
|---|---|
| `output: 'export'` dans next.config.js | Génération statique pure — déployable partout (Vercel, Netlify, OVH, GitHub Pages) |
| Tailwind CSS | Utility-first, responsive mobile-first natif, palette personnalisable dans tailwind.config.ts |
| Framer Motion | Animations au scroll performantes via `whileInView`, `AnimatePresence` pour les transitions |
| Web3Forms | Formulaire sans backend, gratuit, envoi d'email direct — évite un serveur pour une simple soumission |
| Playfair Display + Inter | Playfair = headings élégants/féminins sans être chargé, Inter = body moderne très lisible |
| Fichier config/site.ts centralisé | Un seul fichier pour modifier contacts, réseaux sociaux, clé API, témoignages |
| `'use client'` sur les pages animées | Framer Motion nécessite le client-side rendering |

### Conventions

- **Composants** : PascalCase, un fichier par composant dans `src/components/`
- **Pages** : App Router, `page.tsx` dans chaque dossier de route
- **Styles** : Tailwind utility classes, classes custom dans `globals.css` (`@layer components`)
- **Placeholders** : Marqués avec `// TODO:` dans le code ET texte visible dans l'UI `[ ... ]`
- **Config** : Toute valeur modifiable dans `src/config/site.ts`

### Palette de couleurs

- Fond principal : `#0A0A0A` (bg-primary)
- Fond secondaire : `#141414` (bg-secondary)
- Fond carte : `#1A1A1A` (bg-card)
- Texte : `#FFFFFF` / `#A3A3A3` / `#737373`
- Rose accent : `#E8A0BF` (principal) / `#F0C4D8` (light) / `#C77DA2` (dark)
- Bordure : `#262626` (border-subtle)

## TODO restants

- [ ] Remplacer `web3formsAccessKey` par une vraie clé (créer un compte sur web3forms.com)
- [ ] Remplacer les liens Instagram/WhatsApp/Calendly dans `src/config/site.ts`
- [ ] Remplacer les témoignages placeholders dans `src/config/site.ts`
- [ ] Ajouter les vraies images du portfolio dans `public/portfolio/` et mettre à jour `src/app/portfolio/page.tsx`
- [ ] Ajouter un vrai logo (remplacer le texte "AMBRE" dans Header.tsx et Footer.tsx)
- [ ] Définir le tarif du pack graphisme entreprise
- [ ] Ajouter des métadonnées Open Graph (og:image) pour le partage sur les réseaux sociaux
- [ ] Configurer Google Analytics ou équivalent si nécessaire
