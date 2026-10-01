'use client'

import { useState, useEffect, useRef } from 'react'
import { useMutation, useQuery } from 'convex/react'
import { api } from '../../../convex/_generated/api'
import { Id } from '../../../convex/_generated/dataModel'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

const CATEGORIES = ['Posts Instagram', 'Stories', 'Emotes Twitch', 'Overlays', 'Flyers']

export default function AdminPage() {
  const router = useRouter()
  const [token, setToken] = useState<string>('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Posts Instagram')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [error, setError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const generateUploadUrl = useMutation(api.portfolioItems.generateUploadUrl)
  const addItem = useMutation(api.portfolioItems.add)
  const removeItem = useMutation(api.portfolioItems.remove)

  const isAuthenticated = useQuery(
    api.admin.verifySession,
    token ? { token } : 'skip'
  )
  const portfolioItems = useQuery(api.portfolioItems.list)

  // Lecture du token depuis localStorage au montage
  useEffect(() => {
    const stored = localStorage.getItem('admin_token')
    if (!stored) {
      router.push('/admin/login')
      return
    }
    setToken(stored)
  }, [router])

  // Redirection si session invalide
  useEffect(() => {
    if (isAuthenticated === false) {
      localStorage.removeItem('admin_token')
      router.push('/admin/login')
    }
  }, [isAuthenticated, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))
    setUploadSuccess(false)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !token) return
    setUploading(true)
    setError('')
    try {
      // Étape 1 : obtenir l'URL signée d'upload depuis Convex Storage
      const uploadUrl = await generateUploadUrl({ token })

      // Étape 2 : uploader le fichier directement vers Convex Storage
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': selectedFile.type },
        body: selectedFile,
      })
      if (!response.ok) throw new Error("Échec de l'upload vers Convex Storage")
      const { storageId } = await response.json() as { storageId: Id<'_storage'> }

      // Étape 3 : enregistrer l'item en base de données Convex
      await addItem({ title, category, imageStorageId: storageId, token })

      // Reset formulaire
      setTitle('')
      setCategory('Posts Instagram')
      setSelectedFile(null)
      setPreview(null)
      setUploadSuccess(true)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'upload")
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: Id<'portfolioItems'>) => {
    try {
      await removeItem({ id, token })
      setDeleteConfirm(null)
    } catch {
      setError('Erreur lors de la suppression')
    }
  }

  if (!token || isAuthenticated === undefined) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-rose/30 border-t-rose rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Header admin ── */}
      <header className="sticky top-0 z-50 bg-bg-card/80 backdrop-blur-md border-b border-border-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-rose text-xs font-medium uppercase tracking-widest">Tableau de bord</p>
            <h1 className="text-white font-heading text-xl">Espace Admin — Ambre</h1>
          </div>
          <div className="flex items-center gap-4">
            <a href="/admin/crm"
              className="text-text-secondary hover:text-rose text-sm transition-colors">
              CRM — Clients &amp; RDV
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">

        {/* ── Section upload ── */}
        <section>
          <h2 className="text-white font-heading text-2xl mb-6">
            Ajouter une <span className="text-gradient">photo</span>
          </h2>

          <div className="bg-bg-card border border-border-subtle rounded-2xl p-6">
            <form onSubmit={handleUpload} className="grid md:grid-cols-2 gap-6">
              {/* Colonne gauche : formulaire */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Titre de la création <span className="text-rose">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex : Post Instagram — Marque X"
                    required
                    className="w-full px-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl
                      text-white placeholder-text-muted
                      focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/20 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Catégorie <span className="text-rose">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl
                      text-white focus:outline-none focus:border-rose/50 focus:ring-1 focus:ring-rose/20
                      transition-colors appearance-none cursor-pointer"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Fichier image <span className="text-rose">*</span>
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="w-full px-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl
                      text-text-secondary file:mr-4 file:py-1 file:px-3 file:rounded-lg
                      file:border-0 file:bg-rose/10 file:text-rose file:text-sm file:font-medium
                      hover:file:bg-rose/20 file:cursor-pointer transition-colors"
                  />
                  <p className="text-text-muted text-xs mt-1">PNG, JPG, WebP — max 10 Mo</p>
                </div>

                {error && (
                  <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                    {error}
                  </p>
                )}

                {uploadSuccess && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg px-4 py-3"
                  >
                    ✓ Photo ajoutée avec succès au portfolio !
                  </motion.p>
                )}

                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !title}
                  className="w-full py-3 bg-rose text-bg-primary font-semibold rounded-xl
                    hover:bg-rose-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Upload en cours...' : 'Ajouter au portfolio'}
                </button>
              </div>

              {/* Colonne droite : prévisualisation */}
              <div className="flex items-center justify-center">
                {preview ? (
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-border-subtle">
                    <Image src={preview} alt="Prévisualisation" fill className="object-cover" />
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-square rounded-xl border-2 border-dashed border-border-subtle
                      flex flex-col items-center justify-center gap-3 cursor-pointer
                      hover:border-rose/40 hover:bg-rose/5 transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full bg-rose/10 flex items-center justify-center group-hover:bg-rose/20 transition-colors">
                      <svg className="w-6 h-6 text-rose/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="text-text-muted text-sm">Cliquer pour sélectionner une image</p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </section>

        {/* ── Section galerie admin ── */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-white font-heading text-2xl">
              Portfolio <span className="text-text-muted text-lg font-body font-normal">
                ({portfolioItems?.length ?? 0} photo{(portfolioItems?.length ?? 0) !== 1 ? 's' : ''})
              </span>
            </h2>
          </div>

          {portfolioItems === undefined ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-bg-card border border-border-subtle animate-pulse" />
              ))}
            </div>
          ) : portfolioItems.length === 0 ? (
            <div className="bg-bg-card border border-border-subtle rounded-2xl p-12 text-center">
              <p className="text-text-secondary">Aucune photo pour le moment.</p>
              <p className="text-text-muted text-sm mt-1">Utilisez le formulaire ci-dessus pour ajouter vos premières créations.</p>
            </div>
          ) : (
            <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {portfolioItems.map((item: any) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="group relative"
                  >
                    <div className="aspect-square rounded-xl overflow-hidden border border-border-subtle">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>

                    {/* Overlay au hover */}
                    <div className="absolute inset-0 rounded-xl bg-bg-primary/70 opacity-0 group-hover:opacity-100
                      transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
                      <p className="text-white text-xs font-medium text-center leading-tight">{item.title}</p>
                      <span className="text-rose text-[10px] bg-rose/10 px-2 py-0.5 rounded-full">{item.category}</span>

                      {deleteConfirm === item._id ? (
                        <div className="flex gap-2 mt-1">
                          <button
                            onClick={() => handleDelete(item._id as Id<'portfolioItems'>)}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded-lg font-medium hover:bg-red-400 transition-colors"
                          >
                            Confirmer
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-bg-secondary text-text-secondary text-xs rounded-lg hover:text-white transition-colors"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(item._id)}
                          className="mt-1 px-3 py-1 border border-red-500/50 text-red-400 text-xs rounded-lg
                            hover:bg-red-500/10 transition-colors"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </section>
      </div>
    </div>
  )
}
