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
})
