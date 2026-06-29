import { v } from 'convex/values'
import { mutation, query, MutationCtx } from './_generated/server'

async function requireAuth(ctx: MutationCtx, token: string) {
  const session = await ctx.db
    .query('adminSessions')
    .withIndex('by_token', (q) => q.eq('token', token))
    .unique()
  if (!session || session.expiresAt < Date.now()) {
    throw new Error('Non autorisé — session expirée ou invalide')
  }
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('portfolioItems').collect()
  },
})

// Génère une URL signée pour uploader un fichier directement dans Convex Storage
export const generateUploadUrl = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token)
    return await ctx.storage.generateUploadUrl()
  },
})

// Enregistre un item portfolio après upload du fichier
export const add = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    imageStorageId: v.id('_storage'),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token)
    const imageUrl = await ctx.storage.getUrl(args.imageStorageId)
    if (!imageUrl) throw new Error('Image introuvable dans le stockage Convex')
    const existing = await ctx.db.query('portfolioItems').collect()
    return await ctx.db.insert('portfolioItems', {
      title: args.title,
      category: args.category,
      imageStorageId: args.imageStorageId,
      imageUrl,
      order: existing.length,
    })
  },
})

export const remove = mutation({
  args: { id: v.id('portfolioItems'), token: v.string() },
  handler: async (ctx, args) => {
    await requireAuth(ctx, args.token)
    const item = await ctx.db.get(args.id)
    if (item) {
      await ctx.storage.delete(item.imageStorageId)
      await ctx.db.delete(args.id)
    }
  },
})
