'use client'

import { useState, FormEvent } from 'react'
import { motion } from 'framer-motion'
import AnimatedSection from '@/components/AnimatedSection'
import { siteConfig } from '@/config/site'

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    const form = e.currentTarget
    const formData = new FormData(form)

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        form.reset()
      } else {
        setError('Une erreur est survenue. Veuillez réessayer.')
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* ======== HERO ======== */}
      <section className="section-padding pt-24 md:pt-32 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose font-medium text-sm uppercase tracking-wide mb-4"
          >
            Contact
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-1 mb-6"
          >
            Parlons de ton <span className="text-gradient">projet</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg"
          >
            Tu veux développer ton compte ou améliorer ton image ? Contacte-moi pour
            qu&apos;on en discute.
          </motion.p>
        </div>
      </section>

      {/* ======== CONTENU ======== */}
      <section className="section-padding pt-8">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Formulaire */}
            <AnimatedSection className="lg:col-span-3">
              <div className="card">
                {isSuccess ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </div>
                    <h3 className="heading-3 mb-2">Message envoyé !</h3>
                    <p className="text-text-secondary">
                      Merci pour ton message. Je te réponds dans les plus brefs délais.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="btn-secondary mt-6"
                    >
                      Envoyer un autre message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Clé Web3Forms — TODO: Remplacer par votre clé */}
                    <input type="hidden" name="access_key" value={siteConfig.web3formsAccessKey} />
                    <input type="hidden" name="subject" value="Nouveau message depuis le site Ambre" />
                    <input type="hidden" name="from_name" value="Site Ambre" />

                    <div>
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        Nom <span className="text-rose">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-xl text-white
                          placeholder:text-text-muted focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/50 transition-colors"
                        placeholder="Ton nom"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        Email <span className="text-rose">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-xl text-white
                          placeholder:text-text-muted focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/50 transition-colors"
                        placeholder="ton@email.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="need" className="block text-sm font-medium mb-2">
                        Ton besoin <span className="text-rose">*</span>
                      </label>
                      <select
                        id="need"
                        name="need"
                        required
                        className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-xl text-white
                          focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/50 transition-colors"
                      >
                        <option value="">Sélectionne une option</option>
                        <option value="community-management">Community Management</option>
                        <option value="graphisme-twitch">Graphisme — Pack Twitch</option>
                        <option value="graphisme-entreprise">Graphisme — Entreprise</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="budget" className="block text-sm font-medium mb-2">
                        Budget <span className="text-text-muted">(optionnel)</span>
                      </label>
                      <input
                        type="text"
                        id="budget"
                        name="budget"
                        className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-xl text-white
                          placeholder:text-text-muted focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/50 transition-colors"
                        placeholder="Ton budget approximatif"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-2">
                        Message <span className="text-rose">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        className="w-full px-4 py-3 bg-bg-primary border border-border-subtle rounded-xl text-white
                          placeholder:text-text-muted focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/50 transition-colors resize-none"
                        placeholder="Parle-moi de ton projet..."
                      />
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Envoi en cours...' : 'Envoyer mon message'}
                    </button>
                  </form>
                )}
              </div>
            </AnimatedSection>

            {/* Infos contact */}
            <AnimatedSection delay={0.2} className="lg:col-span-2">
              <div className="space-y-6">
                <div className="card hover:border-rose/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-rose" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Email</h3>
                      <a
                        href={`mailto:${siteConfig.contact.email}`}
                        className="text-text-secondary text-sm hover:text-rose transition-colors"
                      >
                        {siteConfig.contact.email}
                      </a>
                    </div>
                  </div>
                </div>

                {/* TODO: Remplacer par le vrai lien Instagram */}
                <div className="card hover:border-rose/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-rose" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Instagram</h3>
                      <a
                        href={siteConfig.contact.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary text-sm hover:text-rose transition-colors"
                      >
                        [ Ajouter le @pseudo Instagram ]
                      </a>
                    </div>
                  </div>
                </div>

                {/* TODO: Remplacer par le vrai numéro WhatsApp */}
                <div className="card hover:border-rose/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose/10 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-rose" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">WhatsApp</h3>
                      <a
                        href={siteConfig.contact.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-text-secondary text-sm hover:text-rose transition-colors"
                      >
                        [ Ajouter le numéro WhatsApp ]
                      </a>
                    </div>
                  </div>
                </div>

                {/* Info réponse */}
                <div className="card bg-rose/5 border-rose/10">
                  <p className="text-sm text-text-secondary leading-relaxed">
                    <span className="text-rose font-medium">Délai de réponse :</span>{' '}
                    Je réponds généralement sous 24-48h. Pour les demandes urgentes,
                    contacte-moi directement sur WhatsApp.
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
