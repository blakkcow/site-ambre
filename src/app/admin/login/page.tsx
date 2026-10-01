'use client'

import { useState } from 'react'
import { useMutation } from 'convex/react'
import { api } from '../../../../convex/_generated/api'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useMutation(api.admin.login)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const result = await login({ password })
      if ('error' in result) {
        setError(result.error)
        return
      }
      localStorage.setItem('admin_token', result.token)
      router.push('/admin')
    } catch {
      setError('Mot de passe incorrect. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center px-4">
      {/* Glow décoratif */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-rose/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-8">
          {/* En-tête */}
          <div className="text-center mb-8">
            <p className="text-rose text-sm font-medium uppercase tracking-widest mb-2">
              Espace sécurisé
            </p>
            <h1 className="font-heading text-3xl text-white mb-2">
              Connexion Admin
            </h1>
            <p className="text-text-secondary text-sm">
              Accès réservé à la gestion du portfolio d&apos;Ambre
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-2">
                Mot de passe administrateur
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full px-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl
                  text-white placeholder-text-muted
                  focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/20
                  transition-colors duration-200"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-3 bg-rose text-bg-primary font-semibold rounded-xl
                hover:bg-rose-light transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <p className="text-center text-text-muted text-xs mt-6">
            <a href="/" className="hover:text-rose transition-colors">← Retour au site</a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
