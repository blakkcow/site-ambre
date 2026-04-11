'use client'

import { motion } from 'framer-motion'

interface TestimonialCardProps {
  name: string
  role: string
  text: string
  index: number
}

// TODO: Remplacer ces témoignages placeholders par de vrais avis clients
export default function TestimonialCard({ name, role, text, index }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="card hover:border-rose/30 transition-colors duration-300 glow"
    >
      {/* Icône guillemets */}
      <svg
        className="w-8 h-8 text-rose/40 mb-4"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
      <p className="text-text-secondary leading-relaxed mb-6">{text}</p>
      <div className="flex items-center gap-3">
        {/* TODO: Ajouter une vraie photo du client */}
        <div className="w-10 h-10 rounded-full bg-rose/20 flex items-center justify-center text-rose font-semibold text-sm">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-sm">{name}</p>
          <p className="text-text-muted text-xs">{role}</p>
        </div>
      </div>
    </motion.div>
  )
}
