// ============================================================
// CONFIGURATION DU PLANNING DE RENDEZ-VOUS
// ============================================================
// Partagé entre le backend Convex (validation) et le site (affichage).
// TODO: Adapter les types de rendez-vous et les horaires à ceux d'Ambre
// ============================================================

export const TIMEZONE = 'Europe/Paris'

export const appointmentTypes = [
  {
    key: 'decouverte',
    name: 'Appel découverte',
    duration: 30, // minutes
    description: 'Un premier échange gratuit pour parler de ton projet et de tes objectifs.',
  },
  {
    key: 'cm',
    name: 'Point Community Management',
    duration: 45,
    description: 'Stratégie, calendrier éditorial, bilan des performances.',
  },
  {
    key: 'graphisme',
    name: 'Brief graphisme',
    duration: 45,
    description: 'Pack Twitch ou Entreprise : on définit ensemble ton univers visuel.',
  },
]

// Horaires d'ouverture par jour de la semaine (0 = dimanche … 6 = samedi), heure de Paris
export const weeklyHours: Record<number, [string, string][]> = {
  0: [],
  1: [['09:00', '12:00'], ['14:00', '18:00']],
  2: [['09:00', '12:00'], ['14:00', '18:00']],
  3: [['09:00', '12:00'], ['14:00', '18:00']],
  4: [['09:00', '12:00'], ['14:00', '18:00']],
  5: [['09:00', '12:00'], ['14:00', '17:00']],
  6: [],
}

export const SLOT_STEP_MINUTES = 30 // un créneau proposé toutes les 30 min
export const MIN_NOTICE_HOURS = 24 // délai minimum avant un rendez-vous
export const MAX_DAYS_AHEAD = 60 // réservation possible jusqu'à 60 jours à l'avance
export const CANCEL_LIMIT_HOURS = 24 // annulation en ligne possible jusqu'à 24h avant
export const MAX_UPCOMING_PER_CLIENT = 3 // limite de rendez-vous à venir par client

export const HOUR_MS = 60 * 60 * 1000
export const DAY_MS = 24 * HOUR_MS

export function getAppointmentType(key: string) {
  return appointmentTypes.find((t) => t.key === key)
}

// ── Fuseau horaire : conversions heure de Paris ↔ UTC (gère l'heure d'été) ──

function parisParts(utcMs: number) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
    second: get('second'),
  }
}

function parisOffsetMs(utcMs: number): number {
  const p = parisParts(utcMs)
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second)
  return asUtc - Math.floor(utcMs / 1000) * 1000
}

// "2026-10-05" + "14:30" (heure de Paris) → timestamp UTC
export function parisToUtc(date: string, time: string): number {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const guess = Date.UTC(y, m - 1, d, hh, mm)
  return guess - parisOffsetMs(guess - parisOffsetMs(guess))
}

// timestamp UTC → "YYYY-MM-DD" (jour à Paris)
export function parisDateString(utcMs: number): string {
  const p = parisParts(utcMs)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`
}

export function isValidDateString(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
  const [y, m, d] = date.split('-').map(Number)
  const parsed = new Date(Date.UTC(y, m - 1, d))
  return parsed.getUTCFullYear() === y && parsed.getUTCMonth() === m - 1 && parsed.getUTCDate() === d
}

export function weekdayOf(date: string): number {
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

// Tous les créneaux théoriques d'une journée pour une durée donnée (sans tenir compte des réservations)
export function slotsForDate(date: string, durationMinutes: number): { start: number; end: number }[] {
  const slots: { start: number; end: number }[] = []
  for (const [open, close] of weeklyHours[weekdayOf(date)] ?? []) {
    const closeMs = parisToUtc(date, close)
    for (
      let start = parisToUtc(date, open);
      start + durationMinutes * 60_000 <= closeMs;
      start += SLOT_STEP_MINUTES * 60_000
    ) {
      slots.push({ start, end: start + durationMinutes * 60_000 })
    }
  }
  return slots
}
