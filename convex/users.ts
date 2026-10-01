import { ConvexError, v } from 'convex/values'
import { internalMutation, internalQuery, mutation, query, MutationCtx } from './_generated/server'
import { internal } from './_generated/api'
import { Id } from './_generated/dataModel'
import { DAY_MS, HOUR_MS } from './bookingConfig'
import { generateToken, getUserByToken, requireUser } from './helpers'

const SESSION_DURATION = 30 * DAY_MS
const RESET_DURATION = HOUR_MS

async function insertSession(ctx: MutationCtx, userId: Id<'users'>) {
  const token = generateToken()
  await ctx.db.insert('userSessions', { userId, token, expiresAt: Date.now() + SESSION_DURATION })
  return { token }
}

// ── Fonctions internes (appelées par convex/auth.ts et convex/emails.ts) ──

export const getByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique()
  },
})

export const getById = internalQuery({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => await ctx.db.get(args.userId),
})

export const createWithSession = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email))
      .unique()
    if (existing) throw new ConvexError('Un compte existe déjà avec cet email.')
    const userId = await ctx.db.insert('users', { ...args, createdAt: Date.now() })
    await ctx.scheduler.runAfter(0, internal.emails.welcome, { userId })
    return await insertSession(ctx, userId)
  },
})

export const createSession = internalMutation({
  args: { userId: v.id('users') },
  handler: async (ctx, args) => await insertSession(ctx, args.userId),
})

export const applyPasswordReset = internalMutation({
  args: { token: v.string(), passwordHash: v.string() },
  handler: async (ctx, args) => {
    const reset = await ctx.db
      .query('passwordResets')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()
    if (!reset || reset.expiresAt < Date.now()) {
      throw new ConvexError('Ce lien est invalide ou a expiré. Refais une demande.')
    }
    await ctx.db.patch(reset.userId, { passwordHash: args.passwordHash })
    await ctx.db.delete(reset._id)
    // Déconnecte toutes les sessions existantes par sécurité
    const sessions = await ctx.db
      .query('userSessions')
      .withIndex('by_user', (q) => q.eq('userId', reset.userId))
      .collect()
    for (const session of sessions) await ctx.db.delete(session._id)
  },
})

// ── Fonctions publiques ──

export const me = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await getUserByToken(ctx, args.token)
    if (!user) return null
    return { _id: user._id, name: user.name, email: user.email, phone: user.phone ?? '' }
  },
})

export const updateProfile = mutation({
  args: { token: v.string(), name: v.string(), phone: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token)
    const name = args.name.trim()
    if (!name || name.length > 100) throw new ConvexError('Indique ton nom.')
    await ctx.db.patch(user._id, { name, phone: args.phone.trim().slice(0, 30) || undefined })
  },
})

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('userSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()
    if (session) await ctx.db.delete(session._id)
  },
})

// Répond toujours de la même façon, que le compte existe ou non (ne révèle pas les emails inscrits)
export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_email', (q) => q.eq('email', args.email.trim().toLowerCase()))
      .unique()
    if (!user) return
    // Au plus 3 liens valides à la fois : évite d'inonder la boîte mail du client
    const pending = await ctx.db
      .query('passwordResets')
      .withIndex('by_user', (q) => q.eq('userId', user._id))
      .collect()
    if (pending.filter((r) => r.expiresAt > Date.now()).length >= 3) return
    const token = generateToken()
    await ctx.db.insert('passwordResets', {
      userId: user._id,
      token,
      expiresAt: Date.now() + RESET_DURATION,
    })
    await ctx.scheduler.runAfter(0, internal.emails.passwordReset, { userId: user._id, token })
  },
})
