import { v } from 'convex/values'
import { mutation, query } from './_generated/server'

function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

// Connexion admin — mot de passe défini via : npx convex env set ADMIN_PASSWORD "votremdp"
export const login = mutation({
  args: { password: v.string() },
  handler: async (ctx, args) => {
    const adminPassword = process.env.ADMIN_PASSWORD
    if (!adminPassword || args.password !== adminPassword) {
      throw new Error('Mot de passe incorrect')
    }
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
