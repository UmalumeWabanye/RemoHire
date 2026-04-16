import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
  const { id } = body || {}
  const { email: rawEmail, full_name, onboarding_complete } = body || {}
  let email = rawEmail
  if (typeof email === 'string') email = email.trim().toLowerCase()
    // Require either email or id (id is the auth.users id). If the client is
    // authenticated we accept `id` and upsert by id so onboarding can proceed
    // without re-supplying the email address.
    if (!email && !id) {
      return NextResponse.json({ error: 'missing email or id' }, { status: 400 })
    }

    const svc = createServiceRoleClient()
  // upsert a profile. prefer onConflict by id when provided, otherwise upsert by email
    const payload: Record<string, unknown> = { email, full_name }
    // NOTE: LinkedIn is stored on developer_profiles.linkedin_url. We no
    // longer write a `linkedin` column on profiles to avoid schema mismatch.
    // The create-profile endpoint will accept `linkedin` and persist it into
    // developer_profiles below when provided.
    if (typeof onboarding_complete === 'boolean') payload.onboarding_complete = onboarding_complete
  if (id) payload.id = id

  const onConflict = id ? 'id' : 'email'
  const { data, error } = await svc.from('profiles').upsert(payload, { onConflict })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If client provided developer fields (headline, skills), attempt to upsert
    // developer_profiles using the profile id returned by the upsert. We do this
    // server-side so the client doesn't need an access token to persist dev data
    // immediately after onboarding. Failure to persist dev data should not
    // block the primary profile creation — we'll log and return a warning.
    let devResult: Record<string, unknown> | null = null
    try {
      const profile = Array.isArray(data) ? data[0] : data
      const profileId = (profile && (profile as Record<string, unknown>)['id']) || id || null
  const { headline, skills, linkedin } = body || {}
      if (profileId && (typeof headline === 'string' || Array.isArray(skills))) {
        const devPayload: Record<string, unknown> = { user_id: profileId }
        if (typeof headline === 'string') devPayload.headline = headline
        if (Array.isArray(skills)) {
          const clean = skills
            .filter((s: unknown) => typeof s === 'string')
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0)
          const dedup = Array.from(new Set(clean)).slice(0, 30)
          devPayload.skills = dedup
        }
        if (typeof linkedin === 'string' && linkedin.trim().length) {
          const ln = linkedin.trim()
          const ok = /^(https?:\/\/(www\.)?linkedin\.com\/.+)/i.test(ln)
          if (ok) devPayload.linkedin_url = ln
        }
        const { data: ddata, error: derr } = await svc.from('developer_profiles').upsert([devPayload], { onConflict: 'user_id' })
        if (derr) {
          console.error('failed to upsert developer_profiles', derr.message)
          devResult = { error: derr.message }
        } else {
          devResult = { data: ddata }
        }
      }
    } catch (devErr) {
      console.error('developer_profiles upsert failed', String(devErr))
      devResult = { error: String(devErr) }
    }

    return NextResponse.json({ data, devResult })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
