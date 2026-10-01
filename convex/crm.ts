import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { requireAdmin } from './helpers'

// Liste des clients avec un résumé de leur activité
export const clients = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    const now = Date.now()
    const users = await ctx.db.query('users').order('desc').collect()
    return await Promise.all(
      users.map(async (user) => {
        const appointments = await ctx.db
          .query('appointments')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .collect()
        const orders = await ctx.db
          .query('orders')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .collect()
        const confirmed = appointments.filter((a) => a.status === 'confirmed')
        const upcoming = confirmed.filter((a) => a.start > now).sort((a, b) => a.start - b.start)
        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone ?? '',
          createdAt: user.createdAt,
          appointmentCount: confirmed.length,
          nextAppointment: upcoming[0]?.start ?? null,
          totalPaid: orders.filter((o) => o.status === 'paid').reduce((sum, o) => sum + o.amount, 0),
          totalPending: orders.filter((o) => o.status === 'pending').reduce((sum, o) => sum + o.amount, 0),
        }
      })
    )
  },
})

// Fiche complète d'un client
export const clientDetail = query({
  args: { token: v.string(), userId: v.id('users') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    const user = await ctx.db.get(args.userId)
    if (!user) return null
    const appointments = await ctx.db
      .query('appointments')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? '',
      adminNotes: user.adminNotes ?? '',
      createdAt: user.createdAt,
      appointments: appointments.sort((a, b) => b.start - a.start),
      orders: orders.sort((a, b) => b.date - a.date),
    }
  },
})

export const setNotes = mutation({
  args: { token: v.string(), userId: v.id('users'), notes: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    await ctx.db.patch(args.userId, { adminNotes: args.notes.slice(0, 5000) || undefined })
  },
})
