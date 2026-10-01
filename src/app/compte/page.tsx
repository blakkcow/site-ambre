'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Doc, Id } from '../../../convex/_generated/dataModel'
import { CANCEL_LIMIT_HOURS, HOUR_MS, getAppointmentType } from '../../../convex/bookingConfig'
import { useClientSession } from '@/lib/useClientSession'
import { errorMessage, formatDate, formatEuro, formatShortDate, formatTime } from '@/lib/format'

function StatusBadge({ appointment, now }: { appointment: Doc<'appointments'>; now: number }) {
  const [label, style] =
    appointment.status === 'cancelled'
      ? ['Annulé', 'bg-red-400/10 text-red-400']
      : appointment.end < now
        ? ['Terminé', 'bg-white/5 text-text-secondary']
        : ['Confirmé', 'bg-green-400/10 text-green-400']
  return <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>{label}</span>
}

export default function ComptePage() {
  const router = useRouter()
  const { token, user, loading, logout } = useClientSession()
  const args = token && user ? { token } : 'skip'
  const appointments = useQuery(api.appointments.myAppointments, args)
  const orders = useQuery(api.orders.myOrders, args)
  const cancel = useMutation(api.appointments.cancel)
  const updateProfile = useMutation(api.users.updateProfile)

  const [cancelConfirm, setCancelConfirm] = useState<Id<'appointments'> | null>(null)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState({ name: '', phone: '' })
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/compte/connexion')
  }, [loading, user, router])

  useEffect(() => {
    if (user) setProfile({ name: user.name, phone: user.phone })
  }, [user])

  if (loading || !user || !token) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
      </div>
    )
  }

  const now = Date.now()
  const upcoming = (appointments ?? [])
    .filter((a) => a.status === 'confirmed' && a.end >= now)
    .sort((a, b) => a.start - b.start)
  const past = (appointments ?? []).filter((a) => a.status === 'cancelled' || a.end < now)

  const handleCancel = async (id: Id<'appointments'>) => {
    setError('')
    try {
      await cancel({ token, id })
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setCancelConfirm(null)
    }
  }

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await updateProfile({ token, ...profile })
      setProfileSaved(true)
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  return (
    <section className="section-padding pt-24 md:pt-28">
      <div className="container-custom max-w-4xl mx-auto space-y-10">
        {/* ── En-tête ── */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-rose font-medium text-sm uppercase tracking-wide mb-2">Espace client</p>
            <h1 className="heading-2">
              Bonjour <span className="text-gradient">{user.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/rendez-vous" className="btn-primary px-6 py-2.5 text-sm">
              Prendre rendez-vous
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 border border-border-subtle rounded-full text-text-secondary hover:border-rose/40 hover:text-rose text-sm transition-all"
            >
              Déconnexion
            </button>
          </div>
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {/* ── Rendez-vous à venir ── */}
        <div>
          <h2 className="font-heading text-2xl font-semibold mb-4">Rendez-vous à venir</h2>
          {appointments === undefined ? (
            <div className="h-24 rounded-2xl bg-bg-card border border-border-subtle animate-pulse" />
          ) : upcoming.length === 0 ? (
            <div className="card text-center">
              <p className="text-text-secondary mb-1">Aucun rendez-vous prévu.</p>
              <Link href="/rendez-vous" className="text-rose text-sm underline underline-offset-2">
                Réserver un créneau
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => {
                const cancellable = a.start - now >= CANCEL_LIMIT_HOURS * HOUR_MS
                return (
                  <div key={a._id} className="card border-rose/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {getAppointmentType(a.serviceKey)?.name ?? 'Rendez-vous'}
                      </p>
                      <p className="text-text-secondary text-sm mt-1">
                        <span className="capitalize">{formatDate(a.start)}</span> · {formatTime(a.start)} –{' '}
                        {formatTime(a.end)}
                      </p>
                    </div>
                    {cancelConfirm === a._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCancel(a._id)}
                          className="px-4 py-2 bg-red-500 text-white text-sm rounded-lg font-medium hover:bg-red-400 transition-colors"
                        >
                          Confirmer l&apos;annulation
                        </button>
                        <button
                          onClick={() => setCancelConfirm(null)}
                          className="px-4 py-2 bg-bg-secondary text-text-secondary text-sm rounded-lg hover:text-white transition-colors"
                        >
                          Garder
                        </button>
                      </div>
                    ) : cancellable ? (
                      <button
                        onClick={() => setCancelConfirm(a._id)}
                        className="px-4 py-2 border border-red-500/50 text-red-400 text-sm rounded-lg hover:bg-red-500/10 transition-colors"
                      >
                        Annuler
                      </button>
                    ) : (
                      <p className="text-text-muted text-xs max-w-[200px] sm:text-right">
                        Moins de {CANCEL_LIMIT_HOURS}h avant : contacte Ambre pour modifier.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Historique des rendez-vous ── */}
        {past.length > 0 && (
          <div>
            <h2 className="font-heading text-2xl font-semibold mb-4">Historique des rendez-vous</h2>
            <div className="card p-0 md:p-0 divide-y divide-border-subtle">
              {past.map((a) => (
                <div key={a._id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-white text-sm font-medium">
                      {getAppointmentType(a.serviceKey)?.name ?? 'Rendez-vous'}
                    </p>
                    <p className="text-text-muted text-xs mt-0.5">
                      {formatShortDate(a.start)} · {formatTime(a.start)}
                    </p>
                  </div>
                  <StatusBadge appointment={a} now={now} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Historique des achats ── */}
        <div>
          <h2 className="font-heading text-2xl font-semibold mb-4">Mes achats</h2>
          {orders === undefined ? (
            <div className="h-24 rounded-2xl bg-bg-card border border-border-subtle animate-pulse" />
          ) : orders.length === 0 ? (
            <div className="card text-center">
              <p className="text-text-secondary">Aucun achat pour le moment.</p>
            </div>
          ) : (
            <div className="card p-0 md:p-0 divide-y divide-border-subtle">
              {orders.map((o) => (
                <div key={o._id} className="flex items-center justify-between gap-4 px-5 py-4">
                  <div>
                    <p className="text-white text-sm font-medium">{o.label}</p>
                    <p className="text-text-muted text-xs mt-0.5">{formatShortDate(o.date)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-white font-semibold">{formatEuro(o.amount)}</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        o.status === 'paid' ? 'bg-green-400/10 text-green-400' : 'bg-rose/10 text-rose'
                      }`}
                    >
                      {o.status === 'paid' ? 'Payé' : 'En attente'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Profil ── */}
        <div>
          <h2 className="font-heading text-2xl font-semibold mb-4">Mes informations</h2>
          <form onSubmit={handleProfile} className="card space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className="label">Nom / Prénom</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={profile.name}
                  onChange={(e) => {
                    setProfile({ ...profile, name: e.target.value })
                    setProfileSaved(false)
                  }}
                  className="input"
                />
              </div>
              <div>
                <label htmlFor="phone" className="label">Téléphone</label>
                <input
                  id="phone"
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => {
                    setProfile({ ...profile, phone: e.target.value })
                    setProfileSaved(false)
                  }}
                  placeholder="06 12 34 56 78"
                  className="input"
                />
              </div>
            </div>
            <p className="text-text-muted text-sm">Email : {user.email}</p>
            <div className="flex items-center gap-4">
              <button type="submit" className="btn-secondary px-6 py-2.5 text-sm">
                Enregistrer
              </button>
              {profileSaved && <p className="text-green-400 text-sm">✓ Enregistré</p>}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
