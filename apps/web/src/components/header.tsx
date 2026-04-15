"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

type UserLike = { email?: string | null } | null

function Avatar({ email }: { email?: string | null }) {
  const initials = (email || "?")
    .split("@")[0]
    .split(/[._-]/)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("")

  return (
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-sky-500 to-indigo-600 text-white text-sm font-semibold shadow">{initials}</div>
  )
}

export default function Header(): React.ReactElement {
  const pathname = usePathname()
  const [user, setUser] = useState<UserLike>(null)

  useEffect(() => {
    let mounted = true

    async function check() {
      try {
        const res = await supabase.auth.getSession()
        if (!mounted) return
        setUser(res?.data?.session?.user ?? null)
      } catch {
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
      try { unsub?.data?.subscription?.unsubscribe?.() } catch {}
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
    <header className="sticky top-0 z-30 backdrop-blur bg-white/60 dark:bg-black/60 border-b">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-linear-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold">RH</div>
            <div className="flex flex-col leading-none">
              <span className="font-semibold text-slate-900 dark:text-slate-100">RemoHire</span>
              <span className="text-xs text-muted-foreground">Find remote talent</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            <Link href="/jobs" className={`px-3 py-1 rounded-full text-sm ${pathname === "/jobs" ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100"}`}>Jobs</Link>
            <Link href="/platforms/network" className={`px-3 py-1 rounded-full text-sm ${pathname?.startsWith("/platforms/network") ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100"}`}>Network</Link>
            <Link href="/platforms/gigs" className={`px-3 py-1 rounded-full text-sm ${pathname?.startsWith("/platforms/gigs") ? "bg-sky-50 text-sky-700" : "text-slate-700 hover:bg-slate-100"}`}>Gigs</Link>
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <div className="hidden md:block flex-1">
            <div className="max-w-md">
              <input placeholder="Search jobs, skills, companies" className="w-full rounded-full border px-4 py-2 text-sm shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-sky-300" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user?.email ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <div className="text-sm text-slate-700 dark:text-slate-200">{user.email}</div>
                </div>
                <Avatar email={user.email} />
                <Button variant="ghost" size="sm" onClick={handleSignOut}>Sign out</Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Get started</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
