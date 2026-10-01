'use client'

import { useCallback, useEffect, useState } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

const STORAGE_KEY = 'client_token'
const SESSION_EVENT = 'client-session-change'

// Session du client connecté (token stocké dans localStorage, comme pour l'admin)
export function useClientSession() {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const logoutMutation = useMutation(api.users.logout)

  // Le hook est utilisé à plusieurs endroits (Header, pages) : un événement garde
  // tout le monde synchronisé à la connexion / déconnexion, y compris entre onglets
  useEffect(() => {
    const sync = () => setToken(localStorage.getItem(STORAGE_KEY))
    sync()
    setReady(true)
    window.addEventListener(SESSION_EVENT, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(SESSION_EVENT, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const user = useQuery(api.users.me, token ? { token } : 'skip')

  const saveToken = useCallback((newToken: string) => {
    localStorage.setItem(STORAGE_KEY, newToken)
    window.dispatchEvent(new Event(SESSION_EVENT))
  }, [])

  const logout = useCallback(async () => {
    if (token) await logoutMutation({ token }).catch(() => {})
    localStorage.removeItem(STORAGE_KEY)
    window.dispatchEvent(new Event(SESSION_EVENT))
  }, [token, logoutMutation])

  return {
    token,
    user: token ? user ?? null : null,
    loading: !ready || (token !== null && user === undefined),
    saveToken,
    logout,
  }
}
