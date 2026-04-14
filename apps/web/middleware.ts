import { NextResponse } from "next/server"

// Minimal middleware scaffold. We keep this light — it can be expanded to
// refresh Supabase sessions on the edge using a server client.

export function middleware() {
  // Example: attach a header for downstream logging or future session work.
  const res = NextResponse.next()
  res.headers.set("x-remohire-middleware", "1")
  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
