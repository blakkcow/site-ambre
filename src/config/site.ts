// ============================================================
// CONFIGURATION CENTRALE DU SITE — AMBRE
// ============================================================
// Modifie les valeurs ci-dessous pour personnaliser le site.
// Tous les liens, contacts et textes modifiables sont ici.
// ============================================================

export const siteConfig = {
  // --- Identité ---
  name: 'Ambre',
  title: 'Ambre — Community Manager & Graphiste Freelance',
  description:
    'Community manager et graphiste freelance. Gestion de réseaux sociaux, création de visuels et identité visuelle pour marques et créateurs.',

  // --- Contact ---
  // TODO: Remplacer les placeholders par les vrais liens
  contact: {
    email: 'blakkcow@gmail.com',
    instagram: 'https://instagram.com/PLACEHOLDER_INSTAGRAM', // TODO: Remplacer par le vrai lien Instagram
    whatsapp: 'https://wa.me/PLACEHOLDER_NUMERO', // TODO: Remplacer par le vrai numéro WhatsApp (format: 33612345678)
    calendly: '#', // TODO: Remplacer par le lien de réservation d'appel (Calendly ou autre)
  },

  // --- Formulaire de contact ---
  // Web3Forms : créer un compte gratuit sur https://web3forms.com
  // et remplacer la clé ci-dessous par votre Access Key
  web3formsAccessKey: 'YOUR_WEB3FORMS_ACCESS_KEY', // TODO: Remplacer par votre clé Web3Forms

  // --- Réseaux sociaux (footer & page contact) ---
  socials: [
    {
      name: 'Instagram',
      url: 'https://instagram.com/PLACEHOLDER_INSTAGRAM', // TODO: Remplacer
      icon: 'instagram',
    },
    {
      name: 'TikTok',
      url: 'https://tiktok.com/@PLACEHOLDER_TIKTOK', // TODO: Remplacer
      icon: 'tiktok',
    },
  ],

  // --- Navigation ---
  navigation: [
    { name: 'Accueil', href: '/' },
    { name: 'À propos', href: '/a-propos' },
    { name: 'Services', href: '/services' },
    { name: 'Portfolio', href: '/portfolio' },
    { name: 'Rendez-vous', href: '/rendez-vous' },
    { name: 'Contact', href: '/contact' },
  ],
}

// ============================================================
// TÉMOIGNAGES — PLACEHOLDERS
// ============================================================
// TODO: Remplacer ces faux avis par de vrais témoignages clients
// ============================================================
export const testimonials = [
  {
    name: 'Sophie L.',
    role: 'Créatrice de contenu',
    text: 'Grâce à Ambre, mon compte Instagram est beaucoup plus professionnel et j\'ai gagné en visibilité. Je recommande à 100% !',
    avatar: null, // TODO: Ajouter le chemin vers la photo du client
  },
  {
    name: 'Julien M.',
    role: 'Entrepreneur',
    text: 'Les visuels sont incroyables et correspondent parfaitement à mon univers. Un travail de qualité !',
    avatar: null, // TODO: Ajouter le chemin vers la photo du client
  },
  {
    name: 'Léa D.',
    role: 'Streameuse Twitch',
    text: 'Mes overlays et emotes sont exactement ce que je voulais. Ambre a su capturer mon univers parfaitement.',
    avatar: null, // TODO: Ajouter le chemin vers la photo du client
  },
]
