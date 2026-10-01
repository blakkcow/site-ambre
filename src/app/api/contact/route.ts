import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

// Les champs saisis par le visiteur sont insérés dans un email HTML : on les échappe
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const field = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = field(body.name, 100)
    const email = field(body.email, 200)
    const subject = field(body.subject, 200)
    const type = field(body.type, 100)
    const message = field(body.message, 5000)

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, ''),
      },
    })

    const e = {
      name: escapeHtml(name),
      email: escapeHtml(email),
      subject: escapeHtml(subject),
      type: escapeHtml(type),
      message: escapeHtml(message),
    }

    await transporter.sendMail({
      from: `"Site Ambre CM" <${process.env.GMAIL_USER}>`,
      to: 'blakkcow@gmail.com',
      replyTo: email,
      // Pas de retour à la ligne dans l'objet (injection d'en-têtes)
      subject: `[Contact Site] ${subject || type || 'Nouveau message'} — ${name}`.replace(/[\r\n]+/g, ' '),
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px">
          <h2 style="color:#E8A0BF;margin-top:0">Nouveau message depuis le site</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;width:140px">Nom</td><td style="padding:8px 0;font-weight:600">${e.name}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${e.email}" style="color:#E8A0BF">${e.email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666">Type de besoin</td><td style="padding:8px 0">${e.type || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Sujet</td><td style="padding:8px 0">${e.subject || '—'}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0"/>
          <h3 style="color:#333;margin-bottom:8px">Message</h3>
          <p style="white-space:pre-wrap;background:#fff;padding:16px;border-radius:8px;border:1px solid #e0e0e0;color:#333">${e.message}</p>
          <p style="color:#999;font-size:12px;margin-top:24px">Réponds directement à cet email pour contacter ${e.name}.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact API]', err)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi.' }, { status: 500 })
  }
}
