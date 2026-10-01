import { ConvexError, v } from 'convex/values'
import { internalQuery, mutation, query, MutationCtx, QueryCtx } from './_generated/server'
import { internal } from './_generated/api'
import {
  CANCEL_LIMIT_HOURS,
  DAY_MS,
  HOUR_MS,
  MAX_DAYS_AHEAD,
  MAX_UPCOMING_PER_CLIENT,
  MIN_NOTICE_HOURS,
  getAppointmentType,
  isValidDateString,
  parisDateString,
  parisToUtc,
  slotsForDate,
} from './bookingConfig'
import { getUserByToken, requireAdmin, requireUser } from './helpers'

// Créneaux réellement libres pour un jour donné : horaires d'ouverture
// − jours bloqués − rendez-vous déjà pris − délai minimum de réservation
async function freeSlots(ctx: QueryCtx | MutationCtx, date: string, durationMinutes: number) {
  const now = Date.now()
  if (!isValidDateString(date)) return []
  const dayStart = parisToUtc(date, '00:00')
  if (dayStart > now + MAX_DAYS_AHEAD * DAY_MS) return []

  const blocked = await ctx.db
    .query('blockedDays')
    .withIndex('by_date', (q) => q.eq('date', date))
    .first()
  if (blocked) return []

  const sameDay = await ctx.db
    .query('appointments')
    .withIndex('by_start', (q) => q.gte('start', dayStart - DAY_MS).lt('start', dayStart + 2 * DAY_MS))
    .collect()
  const taken = sameDay.filter((a) => a.status === 'confirmed')

  return slotsForDate(date, durationMinutes).filter(
    (slot) =>
      slot.start >= now + MIN_NOTICE_HOURS * HOUR_MS &&
      !taken.some((a) => a.start < slot.end && a.end > slot.start)
  )
}

// ── Côté client ──

export const availableSlots = query({
  args: { date: v.string(), serviceKey: v.string() },
  handler: async (ctx, args) => {
    const type = getAppointmentType(args.serviceKey)
    if (!type) return []
    return (await freeSlots(ctx, args.date, type.duration)).map((s) => s.start)
  },
})

export const book = mutation({
  args: {
    token: v.string(),
    serviceKey: v.string(),
    start: v.number(),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    const type = getAppointmentType(args.serviceKey)
    if (!type) throw new ConvexError('Type de rendez-vous inconnu.')
    if (!Number.isSafeInteger(args.start) || args.start < 0) throw new ConvexError('Créneau invalide.')

    const now = Date.now()
    const mine = await ctx.db
      .query('appointments')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    const upcoming = mine.filter((a) => a.status === 'confirmed' && a.start > now)
    if (upcoming.length >= MAX_UPCOMING_PER_CLIENT) {
      throw new ConvexError(
        `Tu as déjà ${MAX_UPCOMING_PER_CLIENT} rendez-vous à venir. Annule-en un ou contacte Ambre directement.`
      )
    }

    // Une mutation Convex est transactionnelle : deux clients ne peuvent pas prendre le même créneau
    const slots = await freeSlots(ctx, parisDateString(args.start), type.duration)
    const slot = slots.find((s) => s.start === args.start)
    if (!slot) throw new ConvexError('Ce créneau n\'est plus disponible. Choisis-en un autre.')

    const appointmentId = await ctx.db.insert('appointments', {
      userId: user._id,
      serviceKey: type.key,
      start: slot.start,
      end: slot.end,
      status: 'confirmed',
      message: args.message?.trim().slice(0, 1000) || undefined,
      createdAt: now,
    })

    await ctx.scheduler.runAfter(0, internal.emails.bookingConfirmation, { appointmentId })
    // Rappel la veille (inutile si le rendez-vous vient d'être pris pour le lendemain)
    const reminderAt = slot.start - 24 * HOUR_MS
    if (reminderAt > now + 2 * HOUR_MS) {
      await ctx.scheduler.runAt(reminderAt, internal.emails.bookingReminder, { appointmentId })
    }
    return appointmentId
  },
})

export const myAppointments = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.token)
    if (!user) return []
    const appointments = await ctx.db
      .query('appointments')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    return appointments.sort((a, b) => b.start - a.start)
  },
})

export const cancel = mutation({
  args: { token: v.string(), id: v.id('appointments') },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    const appointment = await ctx.db.get(args.id)
    if (!appointment || appointment.userId !== user._id) {
      throw new ConvexError('Rendez-vous introuvable.')
    }
    if (appointment.status !== 'confirmed') return
    if (appointment.start - Date.now() < CANCEL_LIMIT_HOURS * HOUR_MS) {
      throw new ConvexError(
        `L'annulation en ligne n'est plus possible à moins de ${CANCEL_LIMIT_HOURS}h du rendez-vous. Contacte Ambre directement.`
      )
    }
    await ctx.db.patch(args.id, { status: 'cancelled' })
    await ctx.scheduler.runAfter(0, internal.emails.bookingCancelled, {
      appointmentId: args.id,
      byAdmin: false,
    })
  },
})

// ── Côté admin ──

export const adminList = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    const appointments = await ctx.db
      .query('appointments')
      .withIndex('by_start')
      .order('desc')
      .take(300)
    return await Promise.all(
      appointments.map(async (a) => {
        const user = await ctx.db.get(a.userId)
        return { ...a, clientName: user?.name ?? 'Compte supprimé', clientEmail: user?.email ?? '' }
      })
    )
  },
})

export const adminCancel = mutation({
  args: { token: v.string(), id: v.id('appointments') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    const appointment = await ctx.db.get(args.id)
    if (!appointment || appointment.status !== 'confirmed') return
    await ctx.db.patch(args.id, { status: 'cancelled' })
    await ctx.scheduler.runAfter(0, internal.emails.bookingCancelled, {
      appointmentId: args.id,
      byAdmin: true,
    })
  },
})

// Version publique pour griser les jours dans le calendrier client : dates seules, sans le motif
export const blockedDates = query({
  args: {},
  handler: async (ctx) => {
    const today = parisDateString(Date.now())
    const days = await ctx.db
      .query('blockedDays')
      .withIndex('by_date', (q) => q.gte('date', today))
      .collect()
    return days.map((d) => d.date)
  },
})

export const blockedDays = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    const today = parisDateString(Date.now())
    return await ctx.db
      .query('blockedDays')
      .withIndex('by_date', (q) => q.gte('date', today))
      .collect()
  },
})

// Bloque une journée (congés, indisponibilité). N'annule pas les rendez-vous déjà pris ce jour-là.
export const blockDay = mutation({
  args: { token: v.string(), date: v.string(), reason: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    if (!isValidDateString(args.date)) throw new ConvexError('Date invalide.')
    const existing = await ctx.db
      .query('blockedDays')
      .withIndex('by_date', (q) => q.eq('date', args.date))
      .first()
    if (!existing) {
      await ctx.db.insert('blockedDays', { date: args.date, reason: args.reason?.trim() || undefined })
    }
  },
})

export const unblockDay = mutation({
  args: { token: v.string(), id: v.id('blockedDays') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    await ctx.db.delete(args.id)
  },
})

// ── Interne (emails) ──

export const getForEmail = internalQuery({
  args: { appointmentId: v.id('appointments') },
  handler: async (ctx, args) => {
    const appointment = await ctx.db.get(args.appointmentId)
    if (!appointment) return null
    const user = await ctx.db.get(appointment.userId)
    if (!user) return null
    return { appointment, user: { name: user.name, email: user.email, phone: user.phone } }
  },
})
