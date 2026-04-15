import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, email, full_name } = body || {}
    if (!id || !email) {
      return NextResponse.json({ error: 'missing id or email' }, { status: 400 })
    }

    const svc = createServiceRoleClient()
    // insert a profile if it doesn't exist
    const { data, error } = await svc.from('profiles').upsert({ id, email, full_name }, { onConflict: 'id' })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
