# Ambre — Site Portfolio

Site vitrine professionnel pour Ambre, community manager et graphiste freelance.

## Stack technique

| Technologie | Rôle | Pourquoi |
|---|---|---|
| **Next.js 14** (App Router) | Framework React | SSG (génération statique), SEO natif, routing automatique, déploiement gratuit sur Vercel |
| **TypeScript** | Typage | Fiabilité du code, autocomplétion |
| **Tailwind CSS 3** | Styling | Utility-first, responsive mobile-first, palette personnalisable, pas de CSS custom lourd |
| **Framer Motion** | Animations | Animations déclaratives au scroll, transitions fluides, léger et performant |
| **Web3Forms** | Formulaire contact | Gratuit, sans backend, envoi d'emails direct, simple à configurer |
| **Google Fonts** | Typographie | Playfair Display (headings élégants) + Inter (body lisible et moderne) |
| **Vercel** | Hébergement | Gratuit, domaine custom, CI/CD automatique depuis GitHub |

## Lancer en local

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev

# 3. Ouvrir http://localhost:3000
```

## Déployer sur un nom de domaine

### Option 1 : Vercel (recommandé — gratuit)

1. Crée un compte sur [vercel.com](https://vercel.com)
2. Pousse le projet sur GitHub
3. Sur Vercel : "New Project" → importe le repo GitHub
4. Vercel détecte automatiquement Next.js → clique "Deploy"
5. Pour le domaine custom :
   - Dashboard → Settings → Domains → ajoute ton domaine
   - Chez ton registrar DNS, ajoute un enregistrement CNAME vers `cname.vercel-dns.com`
   - Vercel gère automatiquement le certificat SSL

### Option 2 : Export statique (tout hébergeur)

```bash
npm run build
# Les fichiers statiques sont générés dans le dossier `out/`
# Upload ce dossier sur n'importe quel hébergeur (Netlify, OVH, etc.)
```

## Modifier les contenus

### Contacts et liens sociaux
Tout est centralisé dans **`src/config/site.ts`** :
- Email, Instagram, WhatsApp, Calendly
- Réseaux sociaux du footer
- Clé Web3Forms pour le formulaire

### Couleurs
Modifie la palette dans **`tailwind.config.ts`** → `theme.extend.colors`

### Textes des pages
Chaque page est un fichier dans `src/app/` :
- `page.tsx` → Accueil
- `a-propos/page.tsx` → À propos
- `services/page.tsx` → Services
- `portfolio/page.tsx` → Portfolio
- `contact/page.tsx` → Contact

### Témoignages
Modifie le tableau `testimonials` dans **`src/config/site.ts`**

## Remplacer les placeholders

### Images du portfolio
Dans `src/app/portfolio/page.tsx` :
1. Ajoute tes images dans le dossier `public/portfolio/`
2. Remplace les blocs placeholder dans le tableau `portfolioItems` par des composants `<Image>` de Next.js

### Logo
Dans `src/components/Header.tsx` et `src/components/Footer.tsx` :
- Recherche le commentaire `TODO: Remplacer par un vrai logo`
- Remplace le texte "AMBRE" par un composant `<Image src="/logo.png" />`

### Témoignages
Dans `src/config/site.ts` :
- Remplace les noms, rôles et textes dans le tableau `testimonials`
- Ajoute les chemins des photos dans le champ `avatar`

### Formulaire de contact
1. Va sur [web3forms.com](https://web3forms.com)
2. Entre l'adresse email destinataire (blakkcow@gmail.com)
3. Copie la clé d'accès (Access Key)
4. Colle-la dans `src/config/site.ts` → `web3formsAccessKey`

## Structure du projet

```
src/
├── app/                    # Pages (App Router)
│   ├── layout.tsx          # Layout global (Header + Footer)
│   ├── page.tsx            # Page Accueil
│   ├── a-propos/page.tsx   # Page À propos
│   ├── services/page.tsx   # Page Services + FAQ
│   ├── portfolio/page.tsx  # Page Portfolio
│   ├── contact/page.tsx    # Page Contact
│   └── globals.css         # Styles globaux + Tailwind
├── components/             # Composants réutilisables
│   ├── Header.tsx          # Navigation + burger mobile
│   ├── Footer.tsx          # Pied de page
│   ├── AnimatedSection.tsx # Wrapper d'animation au scroll
│   └── TestimonialCard.tsx # Carte témoignage
└── config/
    └── site.ts             # Configuration centralisée
```
