'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '@/components/AnimatedSection'
import TestimonialCard from '@/components/TestimonialCard'
import { testimonials } from '@/config/site'

const cmFeatures = [
  'Analyse concurrentielle approfondie',
  'Création d\'un calendrier éditorial stratégique',
  'Création de visuels (posts + stories)',
  'Production de photos et vidéos adaptées aux réseaux',
  'Rédaction de légendes optimisées + hashtags',
  'Planification des publications',
  'Modération (messages + commentaires)',
  'Analyse des performances',
  'Ajustements stratégiques mensuels',
]

const cmResults = [
  'Présence professionnelle',
  'Audience engagée',
  'Plus de visibilité',
  'Plus de clients',
]

const twitchFeatures = [
  'Emotes personnalisées',
  'Overlays stream',
  'Écrans (Starting / BRB / Ending)',
  'Panels Twitch',
]

const entrepriseFeatures = [
  'Flyers',
  'Affiches',
  'Visuels réseaux sociaux',
  'Supports de communication',
]

const faqs = [
  {
    q: 'Combien de temps avant de voir des résultats ?',
    a: 'Les premiers résultats peuvent apparaître en quelques semaines, mais une vraie croissance se construit sur plusieurs mois.',
  },
  {
    q: 'Est-ce que je dois fournir du contenu ?',
    a: 'Pas forcément. Je peux t\'accompagner dans la création ou gérer entièrement.',
  },
  {
    q: 'Y a-t-il un engagement ?',
    a: 'Oui, un engagement minimum est recommandé pour obtenir des résultats durables.',
  },
]

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <AnimatedSection delay={index * 0.1}>
      <div className="border border-border-subtle rounded-xl overflow-hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-bg-card/50 transition-colors"
        >
          <span className="font-semibold pr-4">{q}</span>
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-rose text-2xl flex-shrink-0"
          >
            +
          </motion.span>
        </button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <p className="px-5 md:px-6 pb-5 md:pb-6 text-text-secondary leading-relaxed">
                {a}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedSection>
  )
}

export default function Services() {
  return (
    <>
      {/* ======== HERO ======== */}
      <section className="section-padding pt-24 md:pt-32 relative overflow-hidden">
        <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose font-medium text-sm uppercase tracking-wide mb-4"
          >
            Mes offres
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-1 mb-6"
          >
            Des services adaptés à{' '}
            <span className="text-gradient">tes besoins</span>
          </motion.h1>
        </div>
      </section>

      {/* ======== Image transition ======== */}
      <section className="px-4 sm:px-6 lg:px-8 pb-0">
        <div className="container-custom">
          <AnimatedSection>
            <div className="relative rounded-2xl overflow-hidden h-40 md:h-56 border border-border-subtle">
              <Image
                src="/images/social-media.jpg"
                alt="Stratégie digitale"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-bg-primary/70 via-bg-primary/30 to-bg-primary/70" />
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ======== PACK CM ======== */}
      <section className="section-padding bg-bg-secondary" id="cm">
        <div className="container-custom">
          <AnimatedSection>
            <div className="card border-rose/20 glow max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                <div>
                  <p className="text-rose font-medium text-sm uppercase tracking-wide mb-2">
                    Community Management
                  </p>
                  <h2 className="heading-2">Pack CM Complet</h2>
                </div>
                <div className="text-left md:text-right">
                  <p className="text-3xl md:text-4xl font-heading font-bold text-gradient">800€</p>
                  <p className="text-text-muted text-sm">/ mois</p>
                </div>
              </div>

              <p className="text-text-secondary leading-relaxed mb-8">
                Une gestion complète de ton compte pour te permettre de te concentrer
                sur ton business pendant que je développe ta visibilité.
              </p>

              <h3 className="font-semibold text-lg mb-4">Ce qui est inclus :</h3>
              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {cmFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                    <span className="text-rose mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <h3 className="font-semibold text-lg mb-4">Résultats attendus :</h3>
              <div className="flex flex-wrap gap-3 mb-8">
                {cmResults.map((r, i) => (
                  <span key={i} className="px-4 py-2 bg-rose/10 text-rose text-sm rounded-full font-medium">
                    {r}
                  </span>
                ))}
              </div>

              <Link href="/contact" className="btn-primary">
                Je veux développer mon compte
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ======== PACK TWITCH ======== */}
      <section className="section-padding" id="twitch">
        <div className="container-custom">
          <AnimatedSection>
            <div className="card max-w-4xl mx-auto hover:border-rose/30 transition-colors">
              <p className="text-rose font-medium text-sm uppercase tracking-wide mb-2">
                Graphisme — Offre Créateurs / Twitch
              </p>
              <h2 className="heading-2 mb-4">
                Crée une identité visuelle forte pour ton univers
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                Des visuels personnalisés pour te démarquer et professionnaliser ton
                image sur Twitch et les réseaux.
              </p>

              <h3 className="font-semibold text-lg mb-4">Ce qui est inclus :</h3>
              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {twitchFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                    <span className="text-rose mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-bg-secondary rounded-xl p-4 mb-8">
                <p className="text-sm text-text-secondary">
                  <span className="text-rose font-medium">Résultat :</span>{' '}
                  Une identité visuelle cohérente et reconnaissable
                </p>
              </div>

              <Link href="/contact" className="btn-primary">
                Commander mon pack Twitch
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ======== PACK ENTREPRISE ======== */}
      <section className="section-padding bg-bg-secondary" id="entreprise">
        <div className="container-custom">
          <AnimatedSection>
            <div className="card max-w-4xl mx-auto hover:border-rose/30 transition-colors">
              <p className="text-rose font-medium text-sm uppercase tracking-wide mb-2">
                Graphisme — Offre Entreprise
              </p>
              <h2 className="heading-2 mb-4">
                Des supports visuels professionnels pour ton business
              </h2>
              <p className="text-text-secondary leading-relaxed mb-8">
                Je crée des visuels adaptés à ton activité pour renforcer ton image de marque.
              </p>

              <h3 className="font-semibold text-lg mb-4">Ce qui est inclus :</h3>
              <ul className="grid sm:grid-cols-2 gap-3 mb-8">
                {entrepriseFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-text-secondary text-sm">
                    <span className="text-rose mt-0.5">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <div className="bg-bg-primary rounded-xl p-4 mb-8">
                <p className="text-sm text-text-secondary">
                  <span className="text-rose font-medium">Résultat :</span>{' '}
                  Une image professionnelle et impactante
                </p>
              </div>

              {/* TODO: Ajouter le tarif quand il sera défini */}
              <p className="text-text-muted text-sm mb-6">
                Tarif sur devis — chaque projet est unique.
              </p>

              <Link href="/contact" className="btn-primary">
                Demander un devis
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* ======== TÉMOIGNAGES ======== */}
      {/* TODO: Remplacer ces faux témoignages par de vrais avis clients */}
      <section className="section-padding">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-12">
            <p className="text-rose font-medium text-sm uppercase tracking-wide mb-3">
              Témoignages
            </p>
            <h2 className="heading-2">Ils m&apos;ont fait confiance</h2>
            <p className="text-text-muted text-sm mt-2">
              [ Placeholder — Avis à remplacer par de vrais témoignages ]
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard
                key={i}
                name={t.name}
                role={t.role}
                text={t.text}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ======== FAQ ======== */}
      <section className="section-padding bg-bg-secondary">
        <div className="container-custom max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <p className="text-rose font-medium text-sm uppercase tracking-wide mb-3">
              FAQ
            </p>
            <h2 className="heading-2">Questions fréquentes</h2>
          </AnimatedSection>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
