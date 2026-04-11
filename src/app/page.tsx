'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/AnimatedSection'
import TestimonialCard from '@/components/TestimonialCard'
import { siteConfig, testimonials } from '@/config/site'

const problems = [
  "Tu n'as pas de stratégie claire",
  'Tes visuels ne reflètent pas ton niveau',
  'Tu manques de temps pour gérer ton contenu',
  "Tu n'attires pas les bons clients",
]

const solutions = [
  'Structurer une stratégie efficace',
  'Créer du contenu qui attire et convertit',
  'Gagner du temps',
  'Professionnaliser ton image',
]

export default function Home() {
  return (
    <>
      {/* ======== HERO ======== */}
      <section className="section-padding pt-24 md:pt-32 lg:pt-40 relative overflow-hidden">
        {/* Glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="container-custom relative z-10 text-center max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-rose font-medium text-sm md:text-base mb-6 tracking-wide uppercase"
          >
            Community Manager & Graphiste Freelance
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="heading-1 mb-6"
          >
            Développe ta visibilité et attire plus de clients grâce à une{' '}
            <span className="text-gradient">stratégie social media</span> et des{' '}
            <span className="text-gradient">visuels impactants</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-text-secondary text-lg md:text-xl leading-relaxed mb-10 max-w-3xl mx-auto"
          >
            Je t&apos;accompagne dans la gestion complète de tes réseaux sociaux et la
            création de ton identité visuelle pour transformer ton compte en véritable
            outil de conversion.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href={siteConfig.contact.calendly} className="btn-primary">
              Réserver un appel
            </Link>
            <Link href="/contact" className="btn-secondary">
              Me contacter
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ======== SECTION PROBLÈME ======== */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Problème */}
            <AnimatedSection>
              <div className="card border-red-500/20">
                <p className="text-rose-dark font-medium text-sm uppercase tracking-wide mb-4">
                  Le constat
                </p>
                <h2 className="heading-3 mb-6">Tu postes régulièrement mais...</h2>
                <ul className="space-y-4">
                  {problems.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1, duration: 0.4 }}
                      className="flex items-start gap-3 text-text-secondary"
                    >
                      <span className="text-red-400 mt-0.5 text-lg">✕</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-border-subtle">
                  <p className="text-text-muted text-sm">
                    → Résultat : <span className="text-red-400 font-medium">ton compte stagne</span>
                  </p>
                </div>
              </div>
            </AnimatedSection>

            {/* Solution */}
            <AnimatedSection delay={0.2}>
              <div className="card border-rose/20 glow">
                <p className="text-rose font-medium text-sm uppercase tracking-wide mb-4">
                  La solution
                </p>
                <h2 className="heading-3 mb-6">Je t&apos;aide à...</h2>
                <ul className="space-y-4">
                  {solutions.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 + 0.2, duration: 0.4 }}
                      className="flex items-start gap-3 text-text-secondary"
                    >
                      <span className="text-rose mt-0.5 text-lg">✓</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </ul>
                <div className="mt-6 pt-4 border-t border-border-subtle">
                  <p className="text-text-muted text-sm">
                    → Pour{' '}
                    <span className="text-rose font-medium">
                      transformer ton compte en un vrai levier de croissance
                    </span>
                  </p>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* ======== APERÇU SERVICES ======== */}
      <section className="section-padding bg-bg-secondary">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-12">
            <p className="text-rose font-medium text-sm uppercase tracking-wide mb-3">
              Ce que je propose
            </p>
            <h2 className="heading-2">Mes services</h2>
          </AnimatedSection>

          {/* Image décorative */}
          <AnimatedSection className="mb-12">
            <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 border border-border-subtle">
              <Image
                src="/images/workspace.jpg"
                alt="Espace de travail créatif"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-bg-secondary/80 via-bg-secondary/40 to-transparent" />
              <div className="absolute inset-0 flex items-center px-8 md:px-12">
                <p className="font-heading text-xl md:text-2xl font-semibold max-w-sm">
                  Des solutions pensées pour <span className="text-gradient">ton succès</span>
                </p>
              </div>
            </div>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-8">
            {/* CM */}
            <AnimatedSection>
              <div className="card h-full hover:border-rose/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-rose/10 flex items-center justify-center mb-6 group-hover:bg-rose/20 transition-colors">
                  <svg className="w-7 h-7 text-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-3">Community Management</h3>
                <p className="text-text-secondary leading-relaxed mb-6">
                  Gestion complète de ton compte pour développer ta visibilité et ton engagement.
                </p>
                <Link href="/services" className="text-rose font-medium text-sm hover:text-rose-light transition-colors inline-flex items-center gap-2">
                  Voir les offres
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>

            {/* Graphisme */}
            <AnimatedSection delay={0.15}>
              <div className="card h-full hover:border-rose/30 transition-all duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-rose/10 flex items-center justify-center mb-6 group-hover:bg-rose/20 transition-colors">
                  <svg className="w-7 h-7 text-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                  </svg>
                </div>
                <h3 className="heading-3 mb-3">Graphisme</h3>
                <p className="text-text-secondary leading-relaxed mb-6">
                  Création de visuels impactants pour ton image de marque ou ton activité.
                </p>
                <Link href="/services" className="text-rose font-medium text-sm hover:text-rose-light transition-colors inline-flex items-center gap-2">
                  Voir les offres
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
              </div>
            </AnimatedSection>
          </div>
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
            <h2 className="heading-2">Ce que disent mes clients</h2>
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

      {/* ======== CTA FINAL ======== */}
      <section className="section-padding bg-bg-secondary relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container-custom relative z-10 text-center max-w-2xl mx-auto">
          <AnimatedSection>
            <h2 className="heading-2 mb-4">
              Prêt(e) à faire passer ton compte au{' '}
              <span className="text-gradient">niveau supérieur</span> ?
            </h2>
            <p className="text-text-secondary mb-8">
              Discutons de ton projet et trouvons la meilleure stratégie pour toi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={siteConfig.contact.calendly} className="btn-primary">
                Réserver un appel
              </Link>
              <Link href="/contact" className="btn-secondary">
                Me contacter
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
