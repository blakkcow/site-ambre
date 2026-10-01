import { ConvexError } from 'convex/values'
import { TIMEZONE } from '../../convex/bookingConfig'

// Tous les horaires sont affichés en heure de Paris, quel que soit le fuseau du visiteur

export function formatDate(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(ms))
}

export function formatShortDate(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIMEZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(ms))
}

export function formatTime(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms))
}

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount)
}

// Les erreurs "métier" du backend sont des ConvexError avec un message lisible
export function errorMessage(err: unknown, fallback = 'Une erreur est survenue. Réessaie.'): string {
  return err instanceof ConvexError && typeof err.data === 'string' ? err.data : fallback
}
