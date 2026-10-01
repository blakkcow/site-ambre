'use node'

import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { ConvexError, v } from 'convex/values'
import { action } from './_generated/server'
import { internal } from './_generated/api'

// Le hachage des mots de passe (scrypt) tourne dans le runtime Node de Convex

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, 64)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function checkPassword(password: string) {
  if (password.length < 8) {
    throw new ConvexError('Le mot de passe doit contenir au moins 8 caractères.')
  }
  if (password.length > 200) throw new ConvexError('Mot de passe trop long.')
}

export const register = action({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ token: string }> => {
    const email = args.email.trim().toLowerCase()
    const name = args.name.trim()
    if (!name || name.length > 100) throw new ConvexError('Indique ton nom.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      throw new ConvexError('Adresse email invalide.')
    }
    checkPassword(args.password)
    return await ctx.runMutation(internal.users.createWithSession, {
      name,
      email,
      phone: args.phone?.trim().slice(0, 30) || undefined,
      passwordHash: hashPassword(args.password),
    })
  },
})

export const login = action({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<{ token: string }> => {
    const email = args.email.trim().toLowerCase()
    // La clé ne dépend pas de l'existence du compte : pas d'énumération possible
    const key = `user:${email}`
    const lock = await ctx.runQuery(internal.rateLimit.status, { key })
    if (lock) throw new ConvexError(`Trop de tentatives. Réessaie dans ${lock} min.`)

    const user = await ctx.runQuery(internal.users.getByEmail, { email })
    if (!user || !verifyPassword(args.password, user.passwordHash)) {
      const locked = await ctx.runMutation(internal.rateLimit.fail, { key })
      throw new ConvexError(
        locked ? 'Trop de tentatives. Réessaie dans 15 min.' : 'Email ou mot de passe incorrect.'
      )
    }
    await ctx.runMutation(internal.rateLimit.clear, { key })
    return await ctx.runMutation(internal.users.createSession, { userId: user._id })
  },
})

export const resetPassword = action({
  args: { token: v.string(), password: v.string() },
  handler: async (ctx, args): Promise<null> => {
    checkPassword(args.password)
    await ctx.runMutation(internal.users.applyPasswordReset, {
      token: args.token,
      passwordHash: hashPassword(args.password),
    })
    return null
  },
})
