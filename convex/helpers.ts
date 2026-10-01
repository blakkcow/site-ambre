import { ConvexError } from 'convex/values'
import { MutationCtx, QueryCtx } from './_generated/server'

type Ctx = QueryCtx | MutationCtx

export function generateToken(): string {
  const bytes = new Uint8Array(32)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function requireAdmin(ctx: Ctx, token: string) {
  const session = await ctx.db
    .query('adminSessions')
    .withIndex('by_token', (q) => q.eq('token', token))
    .unique()
  if (!session || session.expiresAt < Date.now()) {
    throw new ConvexError('Non autorisé — session expirée ou invalide')
  }
}

// Retourne le client connecté, ou null si le token est absent / expiré
export async function getUserByToken(ctx: Ctx, token: string) {
  if (!token) return null
  const session = await ctx.db
    .query('userSessions')
    .withIndex('by_token', (q) => q.eq('token', token))
    .unique()
  if (!session || session.expiresAt < Date.now()) return null
  return await ctx.db.get(session.userId)
}

export async function requireUser(ctx: Ctx, token: string) {
  const user = await getUserByToken(ctx, token)
  if (!user) throw new ConvexError('Session expirée. Reconnecte-toi.')
  return user
}
