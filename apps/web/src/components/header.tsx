"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type UserLike = { email?: string | null } | null

export default function Header(): React.ReactElement {
  const pathname = usePathname()
  const [user, setUser] = useState<UserLike>(null)

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        // supabase client provides getSession() both on real client and on the build-safe stub
        const res = await supabase.auth.getSession()
        if (!mounted) return
        setUser(res?.data?.session?.user ?? null)
      } catch {
        // ignore errors from stub
        setUser(null)
      }
    }

    check()

    const unsub = typeof supabase.auth.onAuthStateChange === "function"
      ? supabase.auth.onAuthStateChange((_, session) => {
          if (!mounted) return
          setUser(session?.user ?? null)
        })
      : null

    return () => {
      mounted = false
      try {
        unsub?.data?.subscription?.unsubscribe?.()
      } catch {
        // noop for stub
      }
    }
  }, [])

  async function handleSignOut() {
    try {
      if (typeof supabase.auth.signOut === "function") {
        await supabase.auth.signOut()
      }
      setUser(null)
    } catch (e) {
      console.error("Sign out failed", e)
    }
  }

  return (
    <header className="w-full border-b bg-white/60 px-6 py-3 dark:bg-black/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-lg">
            RemoHire
          </Link>

          <nav className="flex gap-4 text-sm text-zinc-700">
            <Link href="/jobs" className={pathname === "/jobs" ? "font-semibold" : ""}>Jobs</Link>
            <Link href="/dashboard" className={pathname === "/dashboard" ? "font-semibold" : ""}>Dashboard</Link>
            <Link href="/candidate/profile" className={pathname === "/candidate/profile" ? "font-semibold" : ""}>Profile</Link>
            <Link href="/platforms/network" className={pathname?.startsWith("/platforms/network") ? "font-semibold" : ""}>Network</Link>
            <Link href="/platforms/gigs" className={pathname?.startsWith("/platforms/gigs") ? "font-semibold" : ""}>Gigs</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user?.email ? (
            <>
              <div className="text-sm text-zinc-700 dark:text-zinc-300">{user.email}</div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
