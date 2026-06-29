'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/AnimatedSection'
import { siteConfig } from '@/config/site'

type FormState = 'idle' | 'sending' | 'success' | 'error'
type ErrorState = string | null

export default function Contact() {
  const [formState, setFormState] = useState<FormState>('idle')
  const [errorMsg, setErrorMsg] = useState<ErrorState>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    type: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState('sending')
    setErrorMsg(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setFormState('success')
      } else {
        setErrorMsg(data.error || 'Une erreur s\'est produite.')
        setFormState('error')
      }
    } catch {
      setErrorMsg('Impossible de joindre le serveur. Réessaie plus tard.')
      setFormState('error')
    }
  }

  return (
    <>
      {/* ======== HERO ======== */}
      <section className="section-padding pt-24 md:pt-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose font-medium text-sm uppercase tracking-wide mb-4"
          >
            On se parle ?
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-1 mb-6"
          >
            Travaillons <span className="text-gradient">ensemble</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg leading-relaxed"
          >
            Un projet, une question, une idée ? Écris-moi et je te répondrai dans les 24h.
          </motion.p>
        </div>
      </section>

      {/* ======== FORMULAIRE + INFOS ======== */}
      <section className="section-padding">
        <div className="container-custom max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* ── Formulaire ── */}
            <AnimatedSection>
              <div className="card">
                <h2 className="heading-2 mb-8">Envoie un message</h2>

                {formState === 'success' ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10"
                  >
                    <div className="text-5xl mb-4">✉️</div>
                    <p className="text-xl font-semibold text-white mb-2">Message envoyé !</p>
                    <p className="text-text-secondary">
                      Merci ! Je te répondrai dans les 24h.
                    </p>
                    <button
                      onClick={() => {
                        setFormState('idle')
                        setFormData({ name: '', email: '', subject: '', type: '', message: '' })
                      }}
                      className="mt-6 text-rose text-sm underline underline-offset-2"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot anti-spam (invisible) */}
                    <input type="checkbox" name="botcheck" className="hidden" />

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Nom / Prénom *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Sophie Dupont"
                          className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-rose/50 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="sophie@mail.com"
                          className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-rose/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Type de besoin *
                      </label>
                      <select
                        name="type"
                        required
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3 text-white focus:outline-none focus:border-rose/50 transition-colors"
                      >
                        <option value="" disabled>Sélectionne une option</option>
                        <option value="Pack CM Complet">Pack CM Complet — 800€/mois</option>
                        <option value="Pack Twitch">Pack Twitch — Sur devis</option>
                        <option value="Pack Entreprise">Pack Entreprise — Sur devis</option>
                        <option value="Autre">Autre / Question</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Sujet
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Mon projet Instagram..."
                        className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-rose/50 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">
                        Message *
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Parle-moi de ton projet, tes objectifs, ta cible..."
                        className="w-full bg-bg-secondary border border-border-subtle rounded-xl px-4 py-3 text-white placeholder-text-muted focus:outline-none focus:border-rose/50 transition-colors resize-none"
                      />
                    </div>

                    {formState === 'error' && (
                      <p className="text-red-400 text-sm">
                        {errorMsg || 'Une erreur s\'est produite. Réessaie ou contacte-moi directement par email.'}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={formState === 'sending'}
                      className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {formState === 'sending' ? 'Envoi en cours...' : 'Envoyer le message →'}
                    </button>

                    <p className="text-text-muted text-xs text-center">
                      Réponse sous 24h · Aucun spam
                    </p>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* ── Infos de contact ── */}
            <AnimatedSection delay={0.1}>
              <div className="space-y-6">
                <h2 className="heading-2">Contact direct</h2>
                <p className="text-text-secondary leading-relaxed">
                  Tu préfères passer par les réseaux ? Pas de souci, je suis dispo sur tous les canaux.
                </p>

                {/* Email */}
                <a
                  href={`mailto:${siteConfig.contact.email}`}
                  className="flex items-center gap-4 card hover:border-rose/30 transition-colors group"
                >
                  <div className="w-12 h-12 bg-rose/10 rounded-xl flex items-center justify-center text-rose text-xl flex-shrink-0 group-hover:bg-rose/20 transition-colors">
                    ✉
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Email</p>
                    <p className="text-white font-medium">{siteConfig.contact.email}</p>
                  </div>
                </a>

                {/* Instagram */}
                <a
                  href={siteConfig.contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 card hover:border-rose/30 transition-colors group"
                >
                  <div className="w-12 h-12 bg-rose/10 rounded-xl flex items-center justify-center text-rose text-xl flex-shrink-0 group-hover:bg-rose/20 transition-colors">
                    📸
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Instagram</p>
                    <p className="text-white font-medium">@ambre_cm</p>
                  </div>
                </a>

                {/* WhatsApp */}
                <a
                  href={siteConfig.contact.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 card hover:border-rose/30 transition-colors group"
                >
                  <div className="w-12 h-12 bg-rose/10 rounded-xl flex items-center justify-center text-rose text-xl flex-shrink-0 group-hover:bg-rose/20 transition-colors">
                    💬
                  </div>
                  <div>
                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">WhatsApp</p>
                    <p className="text-white font-medium">Message direct</p>
                  </div>
                </a>

                {/* Calendly */}
                {siteConfig.contact.calendly !== '#' && (
                  <a
                    href={siteConfig.contact.calendly}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 card hover:border-rose/30 transition-colors group"
                  >
                    <div className="w-12 h-12 bg-rose/10 rounded-xl flex items-center justify-center text-rose text-xl flex-shrink-0 group-hover:bg-rose/20 transition-colors">
                      📅
                    </div>
                    <div>
                      <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Appel découverte</p>
                      <p className="text-white font-medium">Réserver un créneau</p>
                    </div>
                  </a>
                )}

                {/* Note délai de réponse */}
                <div className="bg-bg-secondary rounded-xl p-5 border border-border-subtle">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    <span className="text-rose font-medium">⏱ Délai de réponse :</span>{' '}
                    Je réponds généralement dans les <strong className="text-white">24h</strong> en semaine.
                    Pour les urgences, WhatsApp est le plus rapide.
                  </p>
                </div>
              </div>
            </AnimatedSection>

          </div>
        </div>
      </section>
    </>
  )
}
