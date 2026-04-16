import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

// This endpoint requires a Supabase access token in the Authorization header
// (Bearer <access_token>). We validate the token using a service-role client
// and use the authenticated user's id as the target user_id for the upsert.
export async function POST(request: Request) {
  try {
    const auth = request.headers.get('authorization') || ''
    const match = auth.match(/^Bearer\s+(.*)$/i)
    if (!match) return NextResponse.json({ error: 'missing authorization bearer token' }, { status: 401 })
    const token = match[1]

    const svc = createServiceRoleClient()
    // validate token and get user
    const { data: userData, error: userErr } = await svc.auth.getUser(token)
    if (userErr || !userData?.user?.id) {
      return NextResponse.json({ error: 'invalid auth token' }, { status: 401 })
    }

    const body = await request.json()
    const { headline, linkedin_url, skills } = body || {}

    const payload: Record<string, unknown> = { user_id: userData.user.id }
    if (typeof headline === 'string') payload.headline = headline
    if (typeof linkedin_url === 'string') payload.linkedin_url = linkedin_url

    // sanitize skills: array of strings, trim, dedupe, limit to 30 entries
    if (Array.isArray(skills)) {
      const clean = skills
        .filter((s: unknown) => typeof s === 'string')
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0)
      const dedup = Array.from(new Set(clean)).slice(0, 30)
      payload.skills = dedup
    }

    const { data, error } = await svc.from('developer_profiles').upsert(payload, { onConflict: 'user_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
