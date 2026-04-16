import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createServiceRoleClient from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, email } = body || {}

    if (!token) {
      return NextResponse.json({ error: "token required" }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Find the invite by token and ensure it's not redeemed and not expired
    const now = new Date().toISOString()
    const { data: invites, error: invitesErr } = await supabase
      .from("employer_invites")
      .select("id, email, invited_by, redeemed_at, expires_at")
      .eq("token", token)
      .is("redeemed_at", null)
      .limit(1)

    if (invitesErr) {
      return NextResponse.json({ error: invitesErr.message }, { status: 500 })
    }


    if (!invites || invites.length === 0) {
      return NextResponse.json({ error: "no invite found" }, { status: 404 })
    }

    const invite = invites[0]

    // If the invite has an expiry, ensure it's still valid
    if (invite.expires_at && invite.expires_at <= now) {
      return NextResponse.json({ error: "invite expired" }, { status: 410 })
    }

    // Lookup profile to match the user's profile by email
    const targetEmail = email || invite.email
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", targetEmail)
      .limit(1)

    const profile = profiles && profiles[0]

    if (!profile) {
      return NextResponse.json({ error: "no profile found for this email; please sign in first" }, { status: 404 })
    }

    // Update profile.role to 'employer' and mark invite redeemed
    const { error: updErr } = await supabase
      .from("profiles")
      .update({ role: 'employer' })
      .eq('id', profile.id)

    if (updErr) {
      return NextResponse.json({ error: updErr.message }, { status: 500 })
    }

    const { error: redErr } = await supabase
      .from("employer_invites")
      .update({ redeemed_at: new Date().toISOString() })
      .eq("id", invite.id)

    if (redErr) {
      return NextResponse.json({ error: redErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
