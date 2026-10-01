import { ConvexError, v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { getUserByToken, requireAdmin } from './helpers'

const orderStatus = v.union(v.literal('pending'), v.literal('paid'))

// Historique d'achats du client connecté
export const myOrders = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.token)
    if (!user) return []
    const orders = await ctx.db
      .query('orders')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    return orders.sort((a, b) => b.date - a.date)
  },
})

// ── Admin : les achats sont saisis par Ambre (pas de paiement en ligne) ──

export const add = mutation({
  args: {
    token: v.string(),
    userId: v.id('users'),
    label: v.string(),
    amount: v.number(),
    status: orderStatus,
    date: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    const label = args.label.trim()
    if (!label) throw new ConvexError('Indique un libellé.')
    if (!Number.isFinite(args.amount) || args.amount < 0) throw new ConvexError('Montant invalide.')
    if (!(await ctx.db.get(args.userId))) throw new ConvexError('Client introuvable.')
    return await ctx.db.insert('orders', {
      userId: args.userId,
      label,
      amount: args.amount,
      status: args.status,
      date: args.date,
    })
  },
})

export const setStatus = mutation({
  args: { token: v.string(), id: v.id('orders'), status: orderStatus },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    await ctx.db.patch(args.id, { status: args.status })
  },
})

export const remove = mutation({
  args: { token: v.string(), id: v.id('orders') },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.token)
    await ctx.db.delete(args.id)
  },
})
