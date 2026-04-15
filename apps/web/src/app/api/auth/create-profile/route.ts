import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
  const { id } = body || {}
  const { email: rawEmail, full_name, linkedin, onboarding_complete } = body || {}
  let email = rawEmail
  if (typeof email === 'string') email = email.trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'missing email' }, { status: 400 })
    }

    const svc = createServiceRoleClient()
  // upsert a profile. prefer onConflict by id when provided, otherwise upsert by email
    const payload: Record<string, unknown> = { email, full_name }
    // validate linkedin URL if provided (basic validation)
    if (typeof linkedin === 'string' && linkedin.trim().length) {
      const ln = linkedin.trim()
      const ok = /^(https?:\/\/(www\.)?linkedin\.com\/.+)/i.test(ln)
      if (!ok) return NextResponse.json({ error: 'invalid linkedin url' }, { status: 400 })
      payload.linkedin = ln
    }
    if (typeof onboarding_complete === 'boolean') payload.onboarding_complete = onboarding_complete
  if (id) payload.id = id

  const onConflict = id ? 'id' : 'email'
  const { data, error } = await svc.from('profiles').upsert(payload, { onConflict })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
