import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createServiceRoleClient from "@/lib/supabase/server"
import crypto from "crypto"

// Optional email sender (SendGrid) - only used when env vars are set.
let sendgrid: typeof import('@sendgrid/mail') | null = null
try {
  // require lazily so the package is optional until installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  sendgrid = require('@sendgrid/mail')
} catch {
  sendgrid = null
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, expires_in_days } = body || {}

    if (!email) return NextResponse.json({ error: "email required" }, { status: 400 })

    const supabase = createServiceRoleClient()

    // generate a secure token
    const token = crypto.randomBytes(24).toString("hex")
    let expires_at = null
    if (typeof expires_in_days === "number" && expires_in_days > 0) {
      const d = new Date()
      d.setDate(d.getDate() + expires_in_days)
      expires_at = d.toISOString()
    }

    const { data, error } = await supabase
      .from("employer_invites")
      .insert({ email, token, expires_at })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Build invite link
    const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'
    const link = `${APP_BASE_URL}/accept-invite?token=${token}`

    // If SendGrid is installed and env vars are present, send the invite email.
    // Otherwise, in development mode we log the invite link so developers can
    // test the flow without an email provider.
    try {
      const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
      const SENDER_EMAIL = process.env.SENDER_EMAIL
      if (sendgrid && SENDGRID_API_KEY && SENDER_EMAIL) {
        sendgrid.setApiKey(SENDGRID_API_KEY)
        const msg = {
          to: email,
          from: SENDER_EMAIL,
          subject: 'You\'re invited to join RemoteHire',
          text: `You were invited to join RemoteHire. Accept the invite: ${link}`,
          html: `<p>You were invited to join RemoteHire.</p><p><a href="${link}">Accept invite</a></p>`,
        }
        // send and don't block the main result; log failures
        await sendgrid.send(msg)
      } else {
        if (process.env.NODE_ENV === 'development' || !process.env.SENDGRID_API_KEY) {
          console.log('[dev] Invite link:', link)
        }
      }
    } catch (mailErr) {
      // Log but don't fail the whole request
      console.error('Failed to send invite email', String(mailErr))
    }

    // Return the created invite (including token so caller can email it)
    return NextResponse.json({ invite: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
