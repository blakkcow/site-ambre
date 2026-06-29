import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, type, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Champs requis manquants.' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: (process.env.GMAIL_APP_PASSWORD ?? '').replace(/\s/g, ''),
      },
    })

    await transporter.sendMail({
      from: `"Site Ambre CM" <${process.env.GMAIL_USER}>`,
      to: 'blakkcow@gmail.com',
      replyTo: email,
      subject: `[Contact Site] ${subject || type || 'Nouveau message'} — ${name}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#f9f9f9;border-radius:12px">
          <h2 style="color:#E8A0BF;margin-top:0">Nouveau message depuis le site</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;width:140px">Nom</td><td style="padding:8px 0;font-weight:600">${name}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Email</td><td style="padding:8px 0"><a href="mailto:${email}" style="color:#E8A0BF">${email}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666">Type de besoin</td><td style="padding:8px 0">${type || '—'}</td></tr>
            <tr><td style="padding:8px 0;color:#666">Sujet</td><td style="padding:8px 0">${subject || '—'}</td></tr>
          </table>
          <hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0"/>
          <h3 style="color:#333;margin-bottom:8px">Message</h3>
          <p style="white-space:pre-wrap;background:#fff;padding:16px;border-radius:8px;border:1px solid #e0e0e0;color:#333">${message}</p>
          <p style="color:#999;font-size:12px;margin-top:24px">Réponds directement à cet email pour contacter ${name}.</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[contact API]', err)
    return NextResponse.json({ error: 'Erreur lors de l\'envoi.' }, { status: 500 })
  }
}
