"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function DashboardPage(): React.ReactElement {
  const router = useRouter()
  const [user, setUser] = useState<{ email?: string | null } | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionInfo, setSessionInfo] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      try {
        const res = await supabase.auth.getSession()
        if (!mounted) return
        const u = res?.data?.session?.user ?? null
        setUser(u)
        setLoading(false)
        if (!u) {
          router.push("/supabase-test")
        }
      } catch {
        if (!mounted) return
        setLoading(false)
        router.push("/supabase-test")
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [router])

  async function showSession() {
    try {
      const res = await supabase.auth.getSession()
      setSessionInfo(JSON.stringify(res, null, 2))
    } catch (e) {
      setSessionInfo(String(e))
    }
  }

  if (loading) {
    return <div className="p-8">Checking authentication...</div>
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-4 text-sm text-zinc-600">Welcome back{user?.email ? `, ${user.email}` : ""} — this is your product workspace.</p>

      <section className="mt-6 rounded border px-4 py-3">
        <h2 className="font-medium">Next steps</h2>
        <ol className="mt-2 list-decimal pl-6 text-sm text-zinc-700">
          <li>Define the initial product data model (candidates, jobs, applications).</li>
          <li>Create Supabase schema migrations and seed data.</li>
          <li>Implement CRUD pages and APIs for the core entities.</li>
        </ol>
        <div className="mt-4 border-t pt-3">
          <button className="rounded bg-gray-100 px-3 py-1 text-sm" onClick={showSession}>Show session</button>
          {sessionInfo && <pre className="mt-2 max-h-64 overflow-auto text-xs bg-black/5 p-2 rounded">{sessionInfo}</pre>}
        </div>
      </section>
    </main>
  )
}
