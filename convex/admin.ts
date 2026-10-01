import { v } from 'convex/values'
import { mutation, query } from './_generated/server'
import { generateToken } from './helpers'
import { clearFailures, lockedMinutes, recordFailure } from './rateLimit'

// Comparaison à temps constant : la durée ne dépend pas du nombre de caractères corrects
function safeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  }
  return diff === 0
}

// Connexion admin — mot de passe défini via : npx convex env set ADMIN_PASSWORD "votremdp"
// Retourne une erreur au lieu de la lever : une exception annulerait l'enregistrement
// de l'échec (les mutations Convex sont transactionnelles).
export const login = mutation({
  args: { password: v.string() },
  handler: async (ctx, args): Promise<{ token: string } | { error: string }> => {
    const lock = await lockedMinutes(ctx, 'admin')
    if (lock) return { error: `Trop de tentatives. Réessaie dans ${lock} min.` }

    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword || !safeEqual(args.password, adminPassword)) {
      const locked = await recordFailure(ctx, 'admin')
      return { error: locked ? 'Trop de tentatives. Réessaie dans 15 min.' : 'Mot de passe incorrect. Veuillez réessayer.' }
    }
    await clearFailures(ctx, 'admin')
    const token = generateToken()
    await ctx.db.insert('adminSessions', {
      token,
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24h
    })
    return { token }
  },
})

export const verifySession = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    if (!args.token) return false
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()
    return !!session && session.expiresAt > Date.now()
  },
})

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query('adminSessions')
      .withIndex('by_token', (q) => q.eq('token', args.token))
      .unique()
    if (session) await ctx.db.delete(session._id)
  },
})
