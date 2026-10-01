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

### Backend Convex + CRM

Le site n'est plus un export statique : il s'appuie sur Convex (base de données, fonctions, planificateur) et une route API Next (`/api/contact`, Nodemailer/Gmail).

```
convex/
├── schema.ts          → Tables : portfolioItems, adminSessions, users, userSessions,
│                        passwordResets, appointments, blockedDays, orders
├── bookingConfig.ts   → Types de RDV, horaires d'ouverture, délais (partagé backend + site)
├── helpers.ts         → requireAdmin / requireUser / generateToken
├── auth.ts            → ('use node') inscription, connexion, reset mot de passe (hash scrypt)
├── users.ts           → Sessions client, profil, demande de reset
├── appointments.ts    → Créneaux libres, réservation, annulation, jours bloqués
├── orders.ts          → Achats (saisis par l'admin, pas de paiement en ligne)
├── crm.ts             → Vues admin : liste clients, fiche client, notes privées
└── emails.ts          → ('use node') emails Nodemailer : bienvenue, confirmation (+ .ics),
                         annulation, rappel J-1, reset mot de passe
src/
├── lib/useClientSession.ts → Session client (token dans localStorage `client_token`)
├── lib/format.ts           → Formatage dates/€ (heure de Paris) + errorMessage
└── app/
    ├── rendez-vous/         → Prise de rendez-vous (calendrier + créneaux)
    ├── compte/              → Espace client (RDV, achats, profil)
    ├── compte/connexion/    → Connexion / inscription / mot de passe oublié
    ├── compte/reinitialiser/→ Nouveau mot de passe (lien reçu par email)
    └── admin/crm/           → CRM admin (RDV, jours bloqués, clients, achats)
```

- **Erreurs métier** : côté Convex, lancer `ConvexError('message lisible')` ; côté site, afficher via `errorMessage(err)`. Un `Error` classique est masqué en production.
- **Auth** : même principe que l'admin (token de session en base + localStorage). Les fonctions client prennent `token` en argument.
- **Fuseau** : tout est stocké en UTC et affiché en heure de Paris.
- **Sécurité** : en-têtes HTTP (CSP, X-Frame-Options, HSTS…) dans `next.config.js` — ajouter toute nouvelle origine externe à la CSP. Anti force brute dans `convex/rateLimit.ts` (5 échecs / 15 min, clés `user:<email>` et `admin`, alerte email si l'admin est bloqué). Tout texte saisi par un visiteur inséré dans un email HTML doit passer par `escapeHtml`.
- **CI** : `.github/workflows/ci.yml` (typage site + Convex, `npm audit`). Next.js 14 a des failles connues corrigées uniquement en v16 : migration à planifier.
- **Variables d'environnement Convex** (`npx convex env set NOM "valeur"`) : `ADMIN_PASSWORD`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `SITE_URL`, `OWNER_EMAIL` (optionnel).

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
- [ ] CRM : définir `GMAIL_USER`, `GMAIL_APP_PASSWORD` et `SITE_URL` côté Convex (sans ça, aucun email ne part)
- [ ] CRM : adapter les types de rendez-vous et les horaires dans `convex/bookingConfig.ts`
- [ ] CRM : préciser les modalités du rendez-vous (visio / téléphone) dans `convex/emails.ts`
- [ ] Configurer Google Analytics ou équivalent si nécessaire
