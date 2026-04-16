import { createClient } from "@supabase/supabase-js"

// Server-only helpers. Keep these minimal: we provide a service-role client
// factory (for invite redemption and other privileged operations).

export function createServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL in server environment")
  }

  return createClient(url, serviceKey)
}

export default createServiceRoleClient
