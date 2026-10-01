'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAction, useMutation } from 'convex/react'
import { motion } from 'framer-motion'
import { api } from '../../../../convex/_generated/api'
import { useClientSession } from '@/lib/useClientSession'
import { errorMessage } from '@/lib/format'

type Mode = 'login' | 'register' | 'forgot'

// Page de retour après connexion (?next=/rendez-vous) — uniquement des chemins internes
function nextPath(): string {
  const next = new URLSearchParams(window.location.search).get('next')
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/compte'
}

export default function ConnexionPage() {
  const router = useRouter()
  const { user, loading, saveToken } = useClientSession()
  const login = useAction(api.auth.login)
  const register = useAction(api.auth.register)
  const requestPasswordReset = useMutation(api.users.requestPasswordReset)

  const [mode, setMode] = useState<Mode>('login')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  // Déjà connecté → espace client
  useEffect(() => {
    if (!loading && user) router.replace(nextPath())
  }, [loading, user, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const switchMode = (newMode: Mode) => {
    setMode(newMode)
    setError('')
    setResetSent(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      if (mode === 'forgot') {
        await requestPasswordReset({ email: form.email })
        setResetSent(true)
      } else {
        const { token } =
          mode === 'login'
            ? await login({ email: form.email, password: form.password })
            : await register({
                name: form.name,
                email: form.email,
                phone: form.phone || undefined,
                password: form.password,
              })
        saveToken(token)
      }
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const titles: Record<Mode, string> = {
    login: 'Connexion',
    register: 'Créer un compte',
    forgot: 'Mot de passe oublié',
  }

  return (
    <section className="section-padding pt-24 md:pt-32 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-auto"
      >
        <div className="card">
          <div className="text-center mb-8">
            <p className="text-rose text-sm font-medium uppercase tracking-widest mb-2">
              Espace client
            </p>
            <h1 className="font-heading text-3xl text-white mb-2">{titles[mode]}</h1>
            <p className="text-text-secondary text-sm">
              {mode === 'forgot'
                ? 'Indique ton email, tu recevras un lien pour choisir un nouveau mot de passe.'
                : 'Prends rendez-vous et retrouve ton historique en un clin d\'œil.'}
            </p>
          </div>

          {mode !== 'forgot' && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-bg-secondary rounded-xl mb-6">
              {(['login', 'register'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => switchMode(m)}
                  className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                    mode === m ? 'bg-rose text-bg-primary' : 'text-text-secondary hover:text-white'
                  }`}
                >
                  {m === 'login' ? 'Se connecter' : 'Créer un compte'}
                </button>
              ))}
            </div>
          )}

          {resetSent ? (
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
              Si un compte existe avec cet email, un lien de réinitialisation vient d&apos;être envoyé.
              Pense à vérifier tes spams.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {mode === 'register' && (
                <div>
                  <label htmlFor="name" className="label">Nom / Prénom *</label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Sophie Dupont"
                    className="input"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="label">Email *</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="sophie@mail.com"
                  className="input"
                />
              </div>

              {mode === 'register' && (
                <div>
                  <label htmlFor="phone" className="label">Téléphone</label>
                  <input
                    id="phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="06 12 34 56 78"
                    className="input"
                  />
                </div>
              )}

              {mode !== 'forgot' && (
                <div>
                  <label htmlFor="password" className="label">Mot de passe *</label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    required
                    minLength={mode === 'register' ? 8 : undefined}
                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input"
                  />
                  {mode === 'register' && (
                    <p className="text-text-muted text-xs mt-1">8 caractères minimum</p>
                  )}
                </div>
              )}

              {error && (
                <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending}
                className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sending
                  ? 'Un instant...'
                  : mode === 'login'
                    ? 'Se connecter'
                    : mode === 'register'
                      ? 'Créer mon compte'
                      : 'Recevoir le lien'}
              </button>

              {mode === 'register' && (
                <p className="text-text-muted text-xs text-center">
                  Tes informations servent uniquement à gérer tes rendez-vous et ton suivi client.
                </p>
              )}
            </form>
          )}

          <p className="text-center text-text-muted text-xs mt-6">
            {mode === 'login' ? (
              <button onClick={() => switchMode('forgot')} className="hover:text-rose transition-colors">
                Mot de passe oublié ?
              </button>
            ) : mode === 'forgot' ? (
              <button onClick={() => switchMode('login')} className="hover:text-rose transition-colors">
                ← Retour à la connexion
              </button>
            ) : (
              <Link href="/" className="hover:text-rose transition-colors">← Retour au site</Link>
            )}
          </p>
        </div>
      </motion.div>
    </section>
  )
}
