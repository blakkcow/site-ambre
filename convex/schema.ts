import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  portfolioItems: defineTable({
    title: v.string(),
    category: v.string(),
    imageStorageId: v.id('_storage'),
    imageUrl: v.string(),
    order: v.number(),
  }),
  adminSessions: defineTable({
    token: v.string(),
    expiresAt: v.number(),
  }).index('by_token', ['token']),

  // ── CRM : comptes clients ──
  users: defineTable({
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    passwordHash: v.string(), // format "sel:hash" (scrypt)
    adminNotes: v.optional(v.string()), // notes privées d'Ambre, jamais envoyées au client
    createdAt: v.number(),
  }).index('by_email', ['email']),
  userSessions: defineTable({
    userId: v.id('users'),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_user', ['userId']),
  passwordResets: defineTable({
    userId: v.id('users'),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index('by_token', ['token'])
    .index('by_user', ['userId']),
  // Anti force brute : échecs de connexion par clé ("user:<email>" ou "admin")
  loginAttempts: defineTable({
    key: v.string(),
    failures: v.number(),
    windowStart: v.number(),
    lockedUntil: v.optional(v.number()),
  }).index('by_key', ['key']),

  // ── CRM : rendez-vous ──
  appointments: defineTable({
    userId: v.id('users'),
    serviceKey: v.string(),
    start: v.number(), // timestamp UTC (ms)
    end: v.number(),
    status: v.union(v.literal('confirmed'), v.literal('cancelled')),
    message: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_start', ['start']),
  blockedDays: defineTable({
    date: v.string(), // "YYYY-MM-DD" (heure de Paris)
    reason: v.optional(v.string()),
  }).index('by_date', ['date']),

  // ── CRM : achats / prestations (saisis par Ambre depuis l'admin) ──
  orders: defineTable({
    userId: v.id('users'),
    label: v.string(),
    amount: v.number(), // en euros
    status: v.union(v.literal('pending'), v.literal('paid')),
    date: v.number(),
  }).index('by_user', ['userId']),
})
