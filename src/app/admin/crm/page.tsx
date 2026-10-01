'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { useRouter } from 'next/navigation'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'
import { getAppointmentType } from '../../../../convex/bookingConfig'
import { errorMessage, formatDate, formatEuro, formatShortDate, formatTime } from '@/lib/format'

type Tab = 'appointments' | 'clients'

const todayInput = () => new Date().toISOString().slice(0, 10)

// ── Fiche client : infos, notes privées, rendez-vous, achats ──
function ClientDetail({
  token,
  userId,
  onBack,
}: {
  token: string
  userId: Id<'users'>
  onBack: () => void
}) {
  const client = useQuery(api.crm.clientDetail, { token, userId })
  const setNotes = useMutation(api.crm.setNotes)
  const addOrder = useMutation(api.orders.add)
  const setOrderStatus = useMutation(api.orders.setStatus)
  const removeOrder = useMutation(api.orders.remove)

  const [notes, setNotesValue] = useState<string | null>(null)
  const [notesSaved, setNotesSaved] = useState(false)
  const [order, setOrder] = useState({ label: '', amount: '', status: 'paid', date: todayInput() })
  const [error, setError] = useState('')

  if (client === undefined) {
    return <div className="h-40 rounded-2xl bg-bg-card border border-border-subtle animate-pulse" />
  }
  if (client === null) {
    return <p className="text-text-secondary">Client introuvable.</p>
  }

  const now = Date.now()

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await addOrder({
        token,
        userId,
        label: order.label,
        amount: Number(order.amount.replace(',', '.')),
        status: order.status === 'paid' ? 'paid' : 'pending',
        date: new Date(order.date).getTime(),
      })
      setOrder({ label: '', amount: '', status: 'paid', date: todayInput() })
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="text-text-secondary hover:text-rose text-sm transition-colors">
        ← Tous les clients
      </button>

      <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
        <h2 className="text-white font-heading text-2xl">{client.name}</h2>
        <p className="text-text-secondary text-sm mt-2">
          <a href={`mailto:${client.email}`} className="hover:text-rose transition-colors">{client.email}</a>
          {client.phone && <> · {client.phone}</>}
        </p>
        <p className="text-text-muted text-xs mt-1">Client depuis le {formatShortDate(client.createdAt)}</p>

        <label htmlFor="notes" className="label mt-6">Notes privées (invisibles pour le client)</label>
        <textarea
          id="notes"
          rows={4}
          value={notes ?? client.adminNotes}
          onChange={(e) => {
            setNotesValue(e.target.value)
            setNotesSaved(false)
          }}
          placeholder="Contexte, préférences, suivi..."
          className="input resize-none"
        />
        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={async () => {
              await setNotes({ token, userId, notes: notes ?? client.adminNotes })
              setNotesSaved(true)
            }}
            className="px-4 py-2 border border-border-subtle rounded-lg text-text-secondary hover:border-rose/40 hover:text-rose text-sm transition-all"
          >
            Enregistrer les notes
          </button>
          {notesSaved && <p className="text-green-400 text-sm">✓ Enregistré</p>}
        </div>
      </div>

      {/* Achats */}
      <div>
        <h3 className="text-white font-heading text-xl mb-4">Achats / prestations</h3>
        <form
          onSubmit={handleAddOrder}
          className="bg-bg-card border border-border-subtle rounded-2xl p-6 grid sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-4"
        >
          <input
            type="text"
            required
            value={order.label}
            onChange={(e) => setOrder({ ...order, label: e.target.value })}
            placeholder="Ex : Pack CM — octobre"
            className="input lg:col-span-2"
          />
          <input
            type="text"
            inputMode="decimal"
            required
            value={order.amount}
            onChange={(e) => setOrder({ ...order, amount: e.target.value })}
            placeholder="Montant €"
            className="input"
          />
          <input
            type="date"
            required
            value={order.date}
            onChange={(e) => setOrder({ ...order, date: e.target.value })}
            className="input"
          />
          <select
            value={order.status}
            onChange={(e) => setOrder({ ...order, status: e.target.value })}
            className="input"
          >
            <option value="paid">Payé</option>
            <option value="pending">En attente</option>
          </select>
          <button
            type="submit"
            className="py-3 bg-rose text-bg-primary font-semibold rounded-xl hover:bg-rose-light transition-colors sm:col-span-2 lg:col-span-5"
          >
            Ajouter l&apos;achat
          </button>
          {error && <p className="text-red-400 text-sm sm:col-span-2 lg:col-span-5">{error}</p>}
        </form>

        {client.orders.length === 0 ? (
          <p className="text-text-muted text-sm">Aucun achat enregistré.</p>
        ) : (
          <div className="bg-bg-card border border-border-subtle rounded-2xl divide-y divide-border-subtle">
            {client.orders.map((o) => (
              <div key={o._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="text-white text-sm font-medium">{o.label}</p>
                  <p className="text-text-muted text-xs mt-0.5">{formatShortDate(o.date)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-white font-semibold">{formatEuro(o.amount)}</p>
                  <button
                    onClick={() =>
                      setOrderStatus({ token, id: o._id, status: o.status === 'paid' ? 'pending' : 'paid' })
                    }
                    title="Cliquer pour changer le statut"
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      o.status === 'paid' ? 'bg-green-400/10 text-green-400' : 'bg-rose/10 text-rose'
                    }`}
                  >
                    {o.status === 'paid' ? 'Payé' : 'En attente'}
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Supprimer « ${o.label} » ?`)) removeOrder({ token, id: o._id })
                    }}
                    className="text-text-muted hover:text-red-400 text-xs transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rendez-vous */}
      <div>
        <h3 className="text-white font-heading text-xl mb-4">Rendez-vous</h3>
        {client.appointments.length === 0 ? (
          <p className="text-text-muted text-sm">Aucun rendez-vous.</p>
        ) : (
          <div className="bg-bg-card border border-border-subtle rounded-2xl divide-y divide-border-subtle">
            {client.appointments.map((a) => (
              <div key={a._id} className="px-5 py-4">
                <p className="text-white text-sm font-medium">
                  {getAppointmentType(a.serviceKey)?.name ?? 'Rendez-vous'} — {formatShortDate(a.start)} à{' '}
                  {formatTime(a.start)}
                  <span className="text-text-muted font-normal">
                    {' '}· {a.status === 'cancelled' ? 'Annulé' : a.end < now ? 'Terminé' : 'Confirmé'}
                  </span>
                </p>
                {a.message && <p className="text-text-secondary text-sm mt-1 whitespace-pre-wrap">{a.message}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AdminCrmPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [tab, setTab] = useState<Tab>('appointments')
  const [selectedClient, setSelectedClient] = useState<Id<'users'> | null>(null)
  const [blockDate, setBlockDate] = useState('')
  const [blockReason, setBlockReason] = useState('')
  const [error, setError] = useState('')

  const isAuthenticated = useQuery(api.admin.verifySession, token ? { token } : 'skip')
  const args = isAuthenticated ? { token } : 'skip'
  const appointments = useQuery(api.appointments.adminList, args)
  const blockedDays = useQuery(api.appointments.blockedDays, args)
  const clients = useQuery(api.crm.clients, args)
  const adminCancel = useMutation(api.appointments.adminCancel)
  const blockDay = useMutation(api.appointments.blockDay)
  const unblockDay = useMutation(api.appointments.unblockDay)

  // Lecture du token depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    if (!stored) {
      router.push('/admin/login')
      return
    }
    setToken(stored)
  }, [router])

  // Redirection si session invalide
  useEffect(() => {
    if (isAuthenticated === false) {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    }
  }, [isAuthenticated, router])

  if (!token || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
      </div>
    )
  }

  const now = Date.now()
  const upcoming = (appointments ?? [])
    .filter((a) => a.status === 'confirmed' && a.end >= now)
    .sort((a, b) => a.start - b.start)
  const past = (appointments ?? []).filter((a) => a.status === 'cancelled' || a.end < now)

  const handleBlock = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await blockDay({ token, date: blockDate, reason: blockReason || undefined })
      setBlockDate('')
      setBlockReason('')
    } catch (err) {
      setError(errorMessage(err))
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Header admin ── */}
      <header className="sticky top-0 z-50 bg-bg-card/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-rose text-xs font-medium uppercase tracking-widest">Tableau de bord</p>
            <h1 className="text-white font-heading text-xl">CRM — Clients &amp; rendez-vous</h1>
          </div>
          <a href="/admin" className="text-text-secondary hover:text-rose text-sm transition-colors">
            ← Portfolio
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
        {/* ── Chiffres clés ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['Clients', clients?.length ?? '—'],
            ['RDV à venir', appointments ? upcoming.length : '—'],
            ['Encaissé', clients ? formatEuro(clients.reduce((s, c) => s + c.totalPaid, 0)) : '—'],
            ['En attente', clients ? formatEuro(clients.reduce((s, c) => s + c.totalPending, 0)) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="bg-bg-card border border-border-subtle rounded-2xl p-5">
              <p className="text-text-muted text-xs uppercase tracking-wide">{label}</p>
              <p className="text-white font-heading text-2xl mt-1">{value}</p>
            </div>
          ))}
        </div>

        {/* ── Onglets ── */}
        <div className="flex gap-2">
          {([['appointments', 'Rendez-vous'], ['clients', 'Clients']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setTab(key)
                setSelectedClient(null)
              }}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-rose text-bg-primary'
                  : 'border border-border-subtle text-text-secondary hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error && (
          <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
            {error}
          </p>
        )}

        {tab === 'appointments' ? (
          <div className="space-y-10">
            {/* À venir */}
            <section>
              <h2 className="text-white font-heading text-2xl mb-4">À venir</h2>
              {appointments === undefined ? (
                <div className="h-24 rounded-2xl bg-bg-card border border-border-subtle animate-pulse" />
              ) : upcoming.length === 0 ? (
                <p className="text-text-muted text-sm">Aucun rendez-vous à venir.</p>
              ) : (
                <div className="space-y-3">
                  {upcoming.map((a) => (
                    <div
                      key={a._id}
                      className="bg-bg-card border border-border-subtle rounded-2xl p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                    >
                      <div>
                        <p className="text-white font-semibold">
                          <span className="capitalize">{formatDate(a.start)}</span> · {formatTime(a.start)} –{' '}
                          {formatTime(a.end)}
                        </p>
                        <p className="text-text-secondary text-sm mt-1">
                          {getAppointmentType(a.serviceKey)?.name ?? 'Rendez-vous'} —{' '}
                          <button
                            onClick={() => {
                              setTab('clients')
                              setSelectedClient(a.userId)
                            }}
                            className="text-rose hover:underline"
                          >
                            {a.clientName}
                          </button>{' '}
                          <span className="text-text-muted">({a.clientEmail})</span>
                        </p>
                        {a.message && (
                          <p className="text-text-muted text-sm mt-2 whitespace-pre-wrap">« {a.message} »</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (window.confirm(`Annuler le rendez-vous de ${a.clientName} ? Le client sera prévenu par email.`)) {
                            adminCancel({ token, id: a._id })
                          }
                        }}
                        className="px-4 py-2 border border-red-500/50 text-red-400 text-sm rounded-lg hover:bg-red-500/10 transition-colors flex-shrink-0"
                      >
                        Annuler
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Jours bloqués */}
            <section>
              <h2 className="text-white font-heading text-2xl mb-1">Jours bloqués</h2>
              <p className="text-text-muted text-sm mb-4">
                Congés, indisponibilités : aucun créneau n&apos;est proposé ces jours-là. Les rendez-vous déjà
                pris ne sont pas annulés automatiquement.
              </p>
              <form onSubmit={handleBlock} className="flex flex-col sm:flex-row gap-3 mb-4">
                <input
                  type="date"
                  required
                  min={todayInput()}
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                  className="input sm:w-48"
                />
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Motif (optionnel)"
                  className="input"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-rose text-bg-primary font-semibold rounded-xl hover:bg-rose-light transition-colors flex-shrink-0"
                >
                  Bloquer
                </button>
              </form>
              <div className="flex flex-wrap gap-2">
                {(blockedDays ?? []).map((d) => (
                  <span
                    key={d._id}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-bg-card border border-border-subtle rounded-full text-sm text-text-secondary"
                  >
                    {d.date.split('-').reverse().join('/')}
                    {d.reason && <span className="text-text-muted">— {d.reason}</span>}
                    <button
                      onClick={() => unblockDay({ token, id: d._id })}
                      aria-label="Débloquer"
                      className="text-text-muted hover:text-red-400 transition-colors"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </section>

            {/* Historique */}
            {past.length > 0 && (
              <section>
                <h2 className="text-white font-heading text-2xl mb-4">Historique</h2>
                <div className="bg-bg-card border border-border-subtle rounded-2xl divide-y divide-border-subtle">
                  {past.map((a) => (
                    <div key={a._id} className="flex items-center justify-between gap-4 px-5 py-3">
                      <p className="text-text-secondary text-sm">
                        {formatShortDate(a.start)} · {formatTime(a.start)} — {a.clientName} —{' '}
                        {getAppointmentType(a.serviceKey)?.name ?? 'Rendez-vous'}
                      </p>
                      <span className="text-text-muted text-xs">
                        {a.status === 'cancelled' ? 'Annulé' : 'Terminé'}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : selectedClient ? (
          <ClientDetail
            key={selectedClient}
            token={token}
            userId={selectedClient}
            onBack={() => setSelectedClient(null)}
          />
        ) : clients === undefined ? (
          <div className="h-40 rounded-2xl bg-bg-card border border-border-subtle animate-pulse" />
        ) : clients.length === 0 ? (
          <div className="bg-bg-card border border-border-subtle rounded-2xl p-12 text-center">
            <p className="text-text-secondary">Aucun client inscrit pour le moment.</p>
          </div>
        ) : (
          <div className="bg-bg-card border border-border-subtle rounded-2xl divide-y divide-border-subtle">
            {clients.map((c) => (
              <button
                key={c._id}
                onClick={() => setSelectedClient(c._id)}
                className="w-full text-left px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 hover:bg-bg-secondary/60 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{c.name}</p>
                  <p className="text-text-muted text-sm">{c.email}{c.phone && ` · ${c.phone}`}</p>
                </div>
                <div className="text-sm text-text-secondary sm:text-right">
                  <p>
                    {c.appointmentCount} RDV · {formatEuro(c.totalPaid)}
                    {c.totalPending > 0 && <span className="text-rose"> (+{formatEuro(c.totalPending)} en attente)</span>}
                  </p>
                  {c.nextAppointment && (
                    <p className="text-text-muted text-xs">
                      Prochain : {formatShortDate(c.nextAppointment)} à {formatTime(c.nextAppointment)}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
