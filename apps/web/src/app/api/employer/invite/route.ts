import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import createServiceRoleClient from "@/lib/supabase/server"
import crypto from "crypto"

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

    // Return the created invite (including token so caller can email it)
    return NextResponse.json({ invite: data })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
