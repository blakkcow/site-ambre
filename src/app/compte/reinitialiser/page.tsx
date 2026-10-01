'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAction } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { errorMessage } from '@/lib/format'

export default function ReinitialiserPage() {
  const resetPassword = useAction(api.auth.resetPassword)
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [sending, setSending] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  // Le token arrive par le lien reçu par email (?token=...)
  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') ?? '')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError('')
    try {
      await resetPassword({ token, password })
      setDone(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="section-padding pt-24 md:pt-32">
      <div className="card w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <p className="text-rose text-sm font-medium uppercase tracking-widest mb-2">
            Espace client
          </p>
          <h1 className="font-heading text-3xl text-white">Nouveau mot de passe</h1>
        </div>

        {done ? (
          <div className="text-center space-y-6">
            <p className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3">
              ✓ Ton mot de passe a été modifié.
            </p>
            <Link href="/compte/connexion" className="btn-primary">Se connecter</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="label">Nouveau mot de passe *</label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
              <p className="text-text-muted text-xs mt-1">8 caractères minimum</p>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={sending || !token}
              className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {sending ? 'Un instant...' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
