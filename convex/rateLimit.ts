import { v } from 'convex/values'
import { internalMutation, internalQuery, MutationCtx, QueryCtx } from './_generated/server'
import { internal } from './_generated/api'

// Limitation des tentatives de connexion (anti force brute) :
// 5 échecs en 15 min sur une même clé → blocage de 15 min.
// Clés : "user:<email>" pour les clients, "admin" pour l'espace admin.
export const MAX_FAILURES = 5
const WINDOW_MS = 15 * 60 * 1000
const LOCK_MS = 15 * 60 * 1000

type Ctx = QueryCtx | MutationCtx

async function getAttempt(ctx: Ctx, key: string) {
  return await ctx.db
    .query('loginAttempts')
    .withIndex('by_key', (q) => q.eq('key', key))
    .unique()
}

// Minutes de blocage restantes, ou null si la clé n'est pas bloquée
export async function lockedMinutes(ctx: Ctx, key: string): Promise<number | null> {
  const attempt = await getAttempt(ctx, key)
  if (!attempt?.lockedUntil || attempt.lockedUntil <= Date.now()) return null
  return Math.ceil((attempt.lockedUntil - Date.now()) / 60_000)
}

// Enregistre un échec ; retourne true si la clé vient d'être bloquée
export async function recordFailure(ctx: MutationCtx, key: string): Promise<boolean> {
  const now = Date.now()
  const attempt = await getAttempt(ctx, key)
  const fresh = !attempt || now - attempt.windowStart > WINDOW_MS
  const failures = fresh ? 1 : attempt.failures + 1
  const locked = failures >= MAX_FAILURES
  const data = {
    failures: locked ? 0 : failures,
    windowStart: fresh ? now : attempt.windowStart,
    lockedUntil: locked ? now + LOCK_MS : attempt?.lockedUntil,
  }
  if (attempt) await ctx.db.patch(attempt._id, data)
  else await ctx.db.insert('loginAttempts', { key, ...data })
  if (locked) {
    console.warn(`[sécurité] ${key} bloqué ${LOCK_MS / 60_000} min après ${MAX_FAILURES} échecs de connexion`)
    // Alerte à Ambre : seule la clé admin est sensible (prise de contrôle du CRM)
    if (key === 'admin') {
      await ctx.scheduler.runAfter(0, internal.emails.securityAlert, { failures: MAX_FAILURES })
    }
  }
  return locked
}

export async function clearFailures(ctx: MutationCtx, key: string) {
  const attempt = await getAttempt(ctx, key)
  if (attempt) await ctx.db.delete(attempt._id)
}

// ── Versions appelables depuis une action (convex/auth.ts) ──

export const status = internalQuery({
  args: { key: v.string() },
  handler: async (ctx, args) => await lockedMinutes(ctx, args.key),
})

export const fail = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, args) => await recordFailure(ctx, args.key),
})

export const clear = internalMutation({
  args: { key: v.string() },
  handler: async (ctx, args) => await clearFailures(ctx, args.key),
})
