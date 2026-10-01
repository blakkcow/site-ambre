'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useMutation, useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { api } from '../../../convex/_generated/api'
import {
  MAX_DAYS_AHEAD,
  appointmentTypes,
  getAppointmentType,
  weekdayOf,
  weeklyHours,
} from '../../../convex/bookingConfig'
import AnimatedSection from '@/components/AnimatedSection'
import { useClientSession } from '@/lib/useClientSession'
import { errorMessage, formatDate, formatTime } from '@/lib/format'

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

function toDateString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export default function RendezVousPage() {
  const { token, user, loading } = useClientSession()
  const book = useMutation(api.appointments.book)

  const [serviceKey, setServiceKey] = useState(appointmentTypes[0].key)
  // Initialisé au montage : la page est pré-rendue, la date du jour doit venir du navigateur
  const [today, setToday] = useState<Date | null>(null)
  const [month, setMonth] = useState<Date | null>(null)
  const [date, setDate] = useState<string | null>(null)
  const [slot, setSlot] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [booked, setBooked] = useState<number | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const now = new Date()
    setToday(now)
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1))
  }, [])

  const slots = useQuery(api.appointments.availableSlots, date ? { date, serviceKey } : 'skip')
  const blockedDates = useQuery(api.appointments.blockedDates)
  const type = getAppointmentType(serviceKey)

  // Si l'admin bloque le jour déjà sélectionné, on le désélectionne
  useEffect(() => {
    if (date && blockedDates?.includes(date)) {
      setDate(null)
      setSlot(null)
    }
  }, [date, blockedDates])

  const handleBook = async () => {
    if (!token || slot === null) return
    setSending(true)
    setError('')
    try {
      await book({ token, serviceKey, start: slot, message: message || undefined })
      setBooked(slot)
    } catch (err) {
      setError(errorMessage(err))
      setSlot(null)
    } finally {
      setSending(false)
    }
  }

  // ── Calendrier du mois affiché ──
  const todayString = today ? toDateString(today) : ''
  const maxDate = today ? new Date(today.getTime() + MAX_DAYS_AHEAD * 24 * 60 * 60 * 1000) : null
  const maxString = maxDate ? toDateString(maxDate) : ''
  const days: (string | null)[] = []
  if (month) {
    const leading = (month.getDay() + 6) % 7 // la semaine commence le lundi
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
    for (let i = 0; i < leading; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(toDateString(new Date(month.getFullYear(), month.getMonth(), d)))
    }
  }
  const canGoBack = !!month && !!today && month > new Date(today.getFullYear(), today.getMonth(), 1)
  const canGoForward =
    !!month && !!maxDate && month < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
  const changeMonth = (delta: number) => {
    if (month) setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1))
  }

  return (
    <>
      {/* ======== HERO ======== */}
      <section className="section-padding pt-24 md:pt-32 pb-8 md:pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="container-custom relative z-10 text-center max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-rose font-medium text-sm uppercase tracking-wide mb-4"
          >
            Rendez-vous
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="heading-1 mb-6"
          >
            Réserve ton <span className="text-gradient">créneau</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary text-lg leading-relaxed"
          >
            Choisis le type de rendez-vous, le jour et l&apos;heure. Tu reçois une confirmation par email.
          </motion.p>
        </div>
      </section>

      <section className="section-padding pt-0 md:pt-0">
        <div className="container-custom max-w-4xl mx-auto">
          {booked !== null ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card text-center py-12"
            >
              <div className="text-5xl mb-4">📅</div>
              <p className="text-xl font-semibold text-white mb-2">Rendez-vous confirmé !</p>
              <p className="text-text-secondary mb-1">
                {type?.name} — <span className="text-white capitalize">{formatDate(booked)}</span> à{' '}
                <span className="text-white">{formatTime(booked)}</span>
              </p>
              <p className="text-text-muted text-sm mb-8">
                Un email de confirmation vient de t&apos;être envoyé.
              </p>
              <Link href="/compte" className="btn-primary">Voir mes rendez-vous</Link>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* ── Étape 1 : type de rendez-vous ── */}
              <AnimatedSection>
                <div className="card">
                  <h2 className="font-heading text-xl font-semibold mb-5">
                    <span className="text-rose">1.</span> Type de rendez-vous
                  </h2>
                  <div className="grid md:grid-cols-3 gap-3">
                    {appointmentTypes.map((t) => (
                      <button
                        key={t.key}
                        onClick={() => {
                          setServiceKey(t.key)
                          setSlot(null)
                        }}
                        className={`text-left p-4 rounded-xl border transition-colors ${
                          serviceKey === t.key
                            ? 'border-rose bg-rose/10'
                            : 'border-border-subtle hover:border-rose/40'
                        }`}
                      >
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-rose text-xs mt-1">{t.duration} min</p>
                        <p className="text-text-secondary text-sm mt-2 leading-relaxed">{t.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </AnimatedSection>

              {/* ── Étape 2 : date et heure ── */}
              <AnimatedSection delay={0.1}>
                <div className="card">
                  <h2 className="font-heading text-xl font-semibold mb-5">
                    <span className="text-rose">2.</span> Date et heure
                  </h2>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Calendrier */}
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => changeMonth(-1)}
                          disabled={!canGoBack}
                          aria-label="Mois précédent"
                          className="w-9 h-9 rounded-lg border border-border-subtle text-text-secondary hover:border-rose/40 hover:text-rose transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          ←
                        </button>
                        <p className="font-medium capitalize">
                          {month?.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </p>
                        <button
                          onClick={() => changeMonth(1)}
                          disabled={!canGoForward}
                          aria-label="Mois suivant"
                          className="w-9 h-9 rounded-lg border border-border-subtle text-text-secondary hover:border-rose/40 hover:text-rose transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        >
                          →
                        </button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center">
                        {WEEKDAYS.map((d) => (
                          <p key={d} className="text-text-muted text-xs py-2">{d}</p>
                        ))}
                        {days.map((day, i) => {
                          if (!day) return <span key={`empty-${i}`} />
                          const disabled =
                            day < todayString ||
                            day > maxString ||
                            (weeklyHours[weekdayOf(day)] ?? []).length === 0 ||
                            !!blockedDates?.includes(day)
                          return (
                            <button
                              key={day}
                              disabled={disabled}
                              onClick={() => {
                                setDate(day)
                                setSlot(null)
                                setError('')
                              }}
                              className={`aspect-square rounded-lg text-sm transition-colors ${
                                date === day
                                  ? 'bg-rose text-bg-primary font-semibold'
                                  : disabled
                                    ? 'text-text-muted/40 cursor-not-allowed'
                                    : 'text-white hover:bg-rose/10'
                              }`}
                            >
                              {Number(day.slice(8))}
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Créneaux */}
                    <div>
                      {!date ? (
                        <p className="text-text-muted text-sm">
                          Sélectionne un jour pour voir les créneaux disponibles.
                        </p>
                      ) : slots === undefined ? (
                        <div className="grid grid-cols-3 gap-2">
                          {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="h-11 rounded-lg bg-bg-secondary animate-pulse" />
                          ))}
                        </div>
                      ) : slots.length === 0 ? (
                        <p className="text-text-secondary text-sm">
                          Aucun créneau disponible ce jour-là. Essaie une autre date.
                        </p>
                      ) : (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            {slots.map((s) => (
                              <button
                                key={s}
                                onClick={() => setSlot(s)}
                                className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                                  slot === s
                                    ? 'bg-rose border-rose text-bg-primary'
                                    : 'border-border-subtle text-white hover:border-rose/40'
                                }`}
                              >
                                {formatTime(s)}
                              </button>
                            ))}
                          </div>
                          <p className="text-text-muted text-xs mt-3">Horaires en heure de Paris</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </AnimatedSection>

              {/* ── Étape 3 : confirmation ── */}
              <AnimatedSection delay={0.2}>
                <div className="card">
                  <h2 className="font-heading text-xl font-semibold mb-5">
                    <span className="text-rose">3.</span> Confirmation
                  </h2>

                  {slot !== null && (
                    <div className="bg-bg-secondary rounded-xl p-4 mb-5">
                      <p className="text-sm text-text-secondary">
                        <span className="text-rose font-medium">{type?.name}</span> —{' '}
                        <span className="text-white capitalize">{formatDate(slot)}</span> à{' '}
                        <span className="text-white">{formatTime(slot)}</span> ({type?.duration} min)
                      </p>
                    </div>
                  )}

                  {error && (
                    <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3 mb-5">
                      {error}
                    </p>
                  )}

                  {loading ? (
                    <div className="h-12 rounded-full bg-bg-secondary animate-pulse" />
                  ) : !user ? (
                    <div className="text-center">
                      <p className="text-text-secondary text-sm mb-5">
                        Connecte-toi ou crée un compte pour confirmer ton rendez-vous.
                      </p>
                      <Link href="/compte/connexion?next=/rendez-vous" className="btn-primary">
                        Se connecter / Créer un compte
                      </Link>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="message" className="label">
                        Un mot sur ton projet (optionnel)
                      </label>
                      <textarea
                        id="message"
                        rows={3}
                        maxLength={1000}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Ton activité, tes objectifs, tes questions..."
                        className="input resize-none mb-5"
                      />
                      <button
                        onClick={handleBook}
                        disabled={slot === null || sending}
                        className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {sending
                          ? 'Réservation en cours...'
                          : slot === null
                            ? 'Choisis un créneau'
                            : 'Confirmer le rendez-vous →'}
                      </button>
                    </>
                  )}
                </div>
              </AnimatedSection>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
