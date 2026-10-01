'use node'

import { v } from 'convex/values'
import nodemailer from 'nodemailer'
import { internalAction } from './_generated/server'
import { internal } from './_generated/api'
import { TIMEZONE, getAppointmentType } from './bookingConfig'

// Variables d'environnement à définir côté Convex (npx convex env set NOM "valeur") :
//   GMAIL_USER, GMAIL_APP_PASSWORD  → compte d'envoi (les mêmes que pour le formulaire de contact)
//   SITE_URL                        → URL publique du site (liens dans les emails)
//   OWNER_EMAIL                     → (optionnel) adresse qui reçoit les notifications, par défaut GMAIL_USER

type Attachment = { filename: string; content: string; contentType: string }

async function send(to: string, subject: string, html: string, attachments?: Attachment[]) {
  const user = process.env.GMAIL_USER
  const pass = (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, '')
  if (!user || !pass) {
    console.warn(`[emails] GMAIL_USER / GMAIL_APP_PASSWORD non définis — email "${subject}" non envoyé`)
    return
  }
  const transporter = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } })
  await transporter.sendMail({ from: `"Ambre" <${user}>`, to, subject, html, attachments })
}

const siteUrl = () => (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const ownerEmail = () => process.env.OWNER_EMAIL ?? process.env.GMAIL_USER

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function layout(title: string, body: string): string {
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px;color:#333">
      <h2 style="color:#C77DA2;margin-top:0">${title}</h2>
      ${body}
      <p style="color:#999;font-size:12px;margin-top:24px">Ambre — Community manager &amp; graphiste freelance</p>
    </div>`
}

function button(href: string, label: string): string {
  return `<p style="margin:24px 0"><a href="${href}" style="background:#E8A0BF;color:#0A0A0A;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600">${label}</a></p>`
}

function formatDateTime(ms: number): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIMEZONE,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(ms))
}

function recap(serviceName: string, start: number, duration: number): string {
  return `
    <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e0e0e0;border-radius:8px">
      <tr><td style="padding:10px 16px;color:#666;width:120px">Rendez-vous</td><td style="padding:10px 16px;font-weight:600">${escapeHtml(serviceName)}</td></tr>
      <tr><td style="padding:10px 16px;color:#666">Date</td><td style="padding:10px 16px;font-weight:600">${formatDateTime(start)} (heure de Paris)</td></tr>
      <tr><td style="padding:10px 16px;color:#666">Durée</td><td style="padding:10px 16px">${duration} min</td></tr>
    </table>`
}

// Fichier .ics pour ajouter le rendez-vous à son agenda
function icsFile(id: string, summary: string, start: number, end: number): Attachment {
  const stamp = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const content = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ambre//Rendez-vous//FR',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${id}@ambre`,
    `DTSTAMP:${stamp(Date.now())}`,
    `DTSTART:${stamp(start)}`,
    `DTEND:${stamp(end)}`,
    `SUMMARY:${summary}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
  return { filename: 'rendez-vous.ics', content, contentType: 'text/calendar; charset=utf-8' }
}

export const welcome = internalAction({
  args: { userId: v.id('users') },
  handler: async (ctx, args): Promise<void> => {
    const user = await ctx.runQuery(internal.users.getById, { userId: args.userId })
    if (!user) return
    await send(
      user.email,
      'Bienvenue — ton espace client est prêt',
      layout(
        `Bienvenue ${escapeHtml(user.name)} !`,
        `<p>Ton espace client est créé. Tu peux y prendre rendez-vous et retrouver l'historique de tes rendez-vous et de tes achats.</p>
         ${button(`${siteUrl()}/rendez-vous`, 'Prendre rendez-vous')}`
      )
    )
  },
})

export const bookingConfirmation = internalAction({
  args: { appointmentId: v.id('appointments') },
  handler: async (ctx, args): Promise<void> => {
    const data = await ctx.runQuery(internal.appointments.getForEmail, args)
    if (!data) return
    const { appointment, user } = data
    const type = getAppointmentType(appointment.serviceKey)
    const serviceName = type?.name ?? 'Rendez-vous'
    const duration = Math.round((appointment.end - appointment.start) / 60_000)
    const table = recap(serviceName, appointment.start, duration)

    // TODO: Préciser les modalités du rendez-vous (lien visio, téléphone…)
    await send(
      user.email,
      `Rendez-vous confirmé — ${formatDateTime(appointment.start)}`,
      layout(
        'Ton rendez-vous est confirmé ✓',
        `<p>Bonjour ${escapeHtml(user.name)},</p>
         <p>C'est noté ! Voici le récapitulatif :</p>
         ${table}
         <p>Ambre te recontactera avant le rendez-vous avec les modalités (visio ou téléphone). Le fichier joint te permet de l'ajouter à ton agenda.</p>
         <p>Un empêchement ? Tu peux annuler depuis ton espace client jusqu'à 24h avant.</p>
         ${button(`${siteUrl()}/compte`, 'Voir mon espace client')}`
      ),
      [icsFile(appointment._id, `${serviceName} avec Ambre`, appointment.start, appointment.end)]
    )

    const owner = ownerEmail()
    if (owner) {
      await send(
        owner,
        `[Nouveau RDV] ${user.name} — ${formatDateTime(appointment.start)}`,
        layout(
          'Nouveau rendez-vous',
          `${table}
           <p><strong>Client :</strong> ${escapeHtml(user.name)} — <a href="mailto:${escapeHtml(user.email)}">${escapeHtml(user.email)}</a>${user.phone ? ` — ${escapeHtml(user.phone)}` : ''}</p>
           ${appointment.message ? `<p style="white-space:pre-wrap;background:#fff;padding:16px;border-radius:8px;border:1px solid #e0e0e0">${escapeHtml(appointment.message)}</p>` : ''}
           ${button(`${siteUrl()}/admin/crm`, 'Ouvrir le CRM')}`
        ),
        [icsFile(appointment._id, `${serviceName} — ${user.name}`, appointment.start, appointment.end)]
      )
    }
  },
})

export const bookingCancelled = internalAction({
  args: { appointmentId: v.id('appointments'), byAdmin: v.boolean() },
  handler: async (ctx, args): Promise<void> => {
    const data = await ctx.runQuery(internal.appointments.getForEmail, {
      appointmentId: args.appointmentId,
    })
    if (!data) return
    const { appointment, user } = data
    const serviceName = getAppointmentType(appointment.serviceKey)?.name ?? 'Rendez-vous'
    const duration = Math.round((appointment.end - appointment.start) / 60_000)
    const table = recap(serviceName, appointment.start, duration)

    await send(
      user.email,
      `Rendez-vous annulé — ${formatDateTime(appointment.start)}`,
      layout(
        'Ton rendez-vous a été annulé',
        `<p>Bonjour ${escapeHtml(user.name)},</p>
         <p>${args.byAdmin ? 'Ambre a dû annuler le rendez-vous suivant :' : 'Ton rendez-vous suivant est bien annulé :'}</p>
         ${table}
         ${button(`${siteUrl()}/rendez-vous`, 'Choisir un autre créneau')}`
      )
    )

    const owner = ownerEmail()
    if (owner && !args.byAdmin) {
      await send(
        owner,
        `[RDV annulé] ${user.name} — ${formatDateTime(appointment.start)}`,
        layout('Rendez-vous annulé par le client', `${table}<p><strong>Client :</strong> ${escapeHtml(user.name)} — ${escapeHtml(user.email)}</p>`)
      )
    }
  },
})

export const bookingReminder = internalAction({
  args: { appointmentId: v.id('appointments') },
  handler: async (ctx, args): Promise<void> => {
    const data = await ctx.runQuery(internal.appointments.getForEmail, args)
    // Le rappel est planifié à la réservation : on vérifie que le RDV n'a pas été annulé entre-temps
    if (!data || data.appointment.status !== 'confirmed') return
    const { appointment, user } = data
    const serviceName = getAppointmentType(appointment.serviceKey)?.name ?? 'Rendez-vous'
    const duration = Math.round((appointment.end - appointment.start) / 60_000)

    await send(
      user.email,
      `Rappel — rendez-vous demain avec Ambre`,
      layout(
        'À demain !',
        `<p>Bonjour ${escapeHtml(user.name)},</p>
         <p>Petit rappel de ton rendez-vous :</p>
         ${recap(serviceName, appointment.start, duration)}
         ${button(`${siteUrl()}/compte`, 'Voir mon espace client')}`
      )
    )
  },
})

// Alerte sécurité : l'espace admin a été bloqué après plusieurs échecs de connexion
export const securityAlert = internalAction({
  args: { failures: v.number() },
  handler: async (_ctx, args): Promise<void> => {
    const owner = ownerEmail()
    if (!owner) return
    await send(
      owner,
      '[Sécurité] Connexion admin bloquée',
      layout(
        'Tentatives de connexion suspectes',
        `<p>${args.failures} mots de passe incorrects ont été saisis sur l'espace admin en moins de 15 minutes. La connexion admin est bloquée pendant 15 minutes.</p>
         <p>Si ce n'était pas toi, change le mot de passe admin : <code>npx convex env set ADMIN_PASSWORD "…"</code></p>`
      )
    )
  },
})

export const passwordReset = internalAction({
  args: { userId: v.id('users'), token: v.string() },
  handler: async (ctx, args): Promise<void> => {
    const user = await ctx.runQuery(internal.users.getById, { userId: args.userId })
    if (!user) return
    await send(
      user.email,
      'Réinitialisation de ton mot de passe',
      layout(
        'Mot de passe oublié ?',
        `<p>Bonjour ${escapeHtml(user.name)},</p>
         <p>Clique sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien est valable 1 heure.</p>
         ${button(`${siteUrl()}/compte/reinitialiser?token=${args.token}`, 'Choisir un nouveau mot de passe')}
         <p style="color:#999;font-size:13px">Si tu n'es pas à l'origine de cette demande, ignore simplement cet email.</p>`
      )
    )
  },
})
