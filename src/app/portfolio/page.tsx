'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import AnimatedSection from '@/components/AnimatedSection'

// TODO: Remplacer ces placeholders par les vraies créations d'Ambre
const categories = ['Tous', 'Posts Instagram', 'Stories', 'Emotes Twitch', 'Overlays', 'Flyers']

const portfolioItems = [
  // Posts Instagram
  { id: 1, category: 'Posts Instagram', title: 'Post Instagram #1', color: 'from-rose/20 to-rose-dark/20' },
  { id: 2, category: 'Posts Instagram', title: 'Post Instagram #2', color: 'from-rose/20 to-purple-500/20' },
  { id: 3, category: 'Posts Instagram', title: 'Post Instagram #3', color: 'from-rose/20 to-pink-500/20' },
  // Stories
  { id: 4, category: 'Stories', title: 'Story #1', color: 'from-purple-500/20 to-rose/20' },
  { id: 5, category: 'Stories', title: 'Story #2', color: 'from-indigo-500/20 to-rose/20' },
  // Emotes Twitch
  { id: 6, category: 'Emotes Twitch', title: 'Emote #1', color: 'from-violet-500/20 to-rose/20' },
  { id: 7, category: 'Emotes Twitch', title: 'Emote #2', color: 'from-fuchsia-500/20 to-rose/20' },
  { id: 8, category: 'Emotes Twitch', title: 'Emote #3', color: 'from-rose/20 to-violet-500/20' },
  // Overlays
  { id: 9, category: 'Overlays', title: 'Overlay #1', color: 'from-rose-dark/20 to-purple-500/20' },
  { id: 10, category: 'Overlays', title: 'Overlay #2', color: 'from-pink-500/20 to-rose/20' },
  // Flyers
  { id: 11, category: 'Flyers', title: 'Flyer #1', color: 'from-rose/20 to-amber-500/20' },
  { id: 12, category: 'Flyers', title: 'Flyer #2', color: 'from-rose/20 to-orange-500/20' },
]

export default function Portfolio() {
  const [activeCategory, setActiveCategory] = useState('Tous')

  const filtered =
    activeCategory === 'Tous'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category === activeCategory)

  return (
    <>
      {/* ======== HERO ======== */}
      <section className="section-padding pt-24 md:pt-32 relative overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose font-medium text-sm uppercase tracking-wide mb-4"
          >
            Portfolio
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-1 mb-6"
          >
            Mes <span className="text-gradient">créations</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg"
          >
            Découvre une sélection de mes réalisations en community management et en
            graphisme.
          </motion.p>
        </div>
      </section>

      {/* ======== FILTRES ======== */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="container-custom">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-rose text-bg-primary'
                    : 'bg-bg-card border border-border-subtle text-text-secondary hover:border-rose/30 hover:text-rose'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ======== GRILLE ======== */}
      {/* TODO: Remplacer tous les placeholders ci-dessous par les vraies images du portfolio */}
      <section className="section-padding pt-4">
        <div className="container-custom">
          {/* Badge placeholder visible */}
          <div className="text-center mb-8">
            <span className="inline-block px-4 py-2 bg-rose/10 border border-rose/20 rounded-full text-rose text-sm">
              [ Images placeholder — À remplacer par les vraies créations ]
            </span>
          </div>

          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence mode="popLayout">
              {filtered.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="group cursor-pointer"
                >
                  {/* TODO: Remplacer ce placeholder par une vraie image */}
                  <div
                    className={`aspect-square rounded-2xl bg-gradient-to-br ${item.color} border border-border-subtle
                      flex flex-col items-center justify-center p-4 text-center
                      group-hover:border-rose/40 group-hover:scale-[1.02] transition-all duration-300`}
                  >
                    <div className="w-12 h-12 rounded-full bg-rose/10 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-rose/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5a1.5 1.5 0 001.5-1.5V5.25a1.5 1.5 0 00-1.5-1.5H3.75a1.5 1.5 0 00-1.5 1.5v14.25a1.5 1.5 0 001.5 1.5z" />
                      </svg>
                    </div>
                    <p className="text-text-secondary text-xs font-medium">{item.title}</p>
                    <p className="text-text-muted text-[10px] mt-1">[ Insérer image ]</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
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
              Un projet en tête ?
            </h2>
            <p className="text-text-secondary mb-8">
              Discutons de tes besoins et créons quelque chose d&apos;unique ensemble.
            </p>
            <a href="/contact" className="btn-primary">
              Me contacter
            </a>
          </AnimatedSection>
        </div>
      </section>
    </>
  )
}
