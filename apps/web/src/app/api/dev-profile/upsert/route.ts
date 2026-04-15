import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
  const { user_id, headline, linkedin_url, skills } = body || {}
    if (!user_id) return NextResponse.json({ error: 'missing user_id' }, { status: 400 })

    const svc = createServiceRoleClient()
    const payload: Record<string, unknown> = { user_id }
  if (typeof headline === 'string') payload.headline = headline
  if (typeof linkedin_url === 'string') payload.linkedin_url = linkedin_url
  if (Array.isArray(skills)) payload.skills = skills

    const { data, error } = await svc.from('developer_profiles').upsert(payload, { onConflict: 'user_id' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
