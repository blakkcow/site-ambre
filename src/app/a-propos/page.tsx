'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/AnimatedSection'

const missions = [
  { icon: '📈', text: 'Gagner en visibilité' },
  { icon: '🎯', text: 'Attirer des clients qualifiés' },
  { icon: '✨', text: 'Avoir une image professionnelle' },
]

const pourquoiMoi = [
  {
    title: 'Approche stratégique',
    desc: 'Pas juste esthétique — chaque décision est pensée pour tes objectifs business.',
  },
  {
    title: 'Tendances réseaux',
    desc: "Une veille constante pour que ton contenu soit toujours dans l'air du temps.",
  },
  {
    title: 'Double compétence',
    desc: 'CM + graphisme — un seul interlocuteur pour toute ta communication digitale.',
  },
  {
    title: 'Accompagnement personnalisé',
    desc: 'Chaque projet est unique, chaque stratégie est sur-mesure.',
  },
]

const specialites = [
  'Instagram / TikTok / Facebook',
  'Créateurs de contenu',
  'Beauté / Personal branding',
  'Twitch / Univers gaming',
]

export default function APropos() {
  return (
    <>
      {/* ======== HERO ======== */}
      <section className="section-padding pt-24 md:pt-32 relative overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-rose font-medium text-sm uppercase tracking-wide mb-4"
              >
                À propos
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="heading-1 mb-6"
              >
                Hello, moi c&apos;est{' '}
                <span className="text-gradient">Ambre</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-text-secondary text-lg leading-relaxed"
              >
                Community manager et créatrice de contenu. Je me suis spécialisée dans
                la gestion de réseaux sociaux et la création de visuels pour aider les
                marques et créateurs à développer leur présence en ligne.
              </motion.p>
            </div>

            {/* TODO: Remplacer par une vraie photo d'Ambre */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="relative rounded-3xl overflow-hidden border border-border-subtle glow aspect-[4/5]">
                <Image
                  src="/images/creative-desk.jpg"
                  alt="Espace créatif"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-xs text-text-muted bg-bg-primary/60 backdrop-blur-sm px-3 py-1.5 rounded-full inline-block">
                    [ Photo d&apos;Ambre à ajouter ]
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======== MISSION ======== */}
      <section className="section-padding bg-bg-secondary">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-12">
            <p className="text-rose font-medium text-sm uppercase tracking-wide mb-3">
              Ma mission
            </p>
            <h2 className="heading-2">Aider les entrepreneurs à</h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-3 gap-6">
            {missions.map((m, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="card text-center hover:border-rose/30 transition-colors">
                  <span className="text-4xl mb-4 block">{m.icon}</span>
                  <p className="font-semibold text-lg">{m.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======== POURQUOI MOI ======== */}
      <section className="section-padding">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-12">
            <p className="text-rose font-medium text-sm uppercase tracking-wide mb-3">
              Mes atouts
            </p>
            <h2 className="heading-2">Pourquoi travailler avec moi</h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 gap-6">
            {pourquoiMoi.map((item, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="card h-full hover:border-rose/30 transition-colors group">
                  <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center mb-4 group-hover:bg-rose/20 transition-colors">
                    <span className="text-rose font-bold">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-text-secondary leading-relaxed">{item.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======== SPÉCIALITÉS ======== */}
      <section className="section-padding bg-bg-secondary">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-12">
            <p className="text-rose font-medium text-sm uppercase tracking-wide mb-3">
              Domaines d&apos;expertise
            </p>
            <h2 className="heading-2">Mes spécialités</h2>
          </AnimatedSection>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialites.map((s, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <div className="card text-center hover:border-rose/30 transition-colors py-8">
                  <p className="font-semibold">{s}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA ======== */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/branding.jpg"
            alt="Branding et identité visuelle"
            fill
            className="object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-bg-primary/80" />
        </div>
        <div className="container-custom text-center max-w-2xl mx-auto relative z-10">
          <AnimatedSection>
            <h2 className="heading-2 mb-4">
              Envie de <span className="text-gradient">collaborer</span> ?
            </h2>
            <p className="text-text-secondary mb-8">
              Discutons de ton projet et trouvons comment booster ta présence en ligne.
            </p>
            <Link href="/contact" className="btn-primary">
              Me contacter
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
