"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import createBrowserClient from "@/lib/supabase/browser"

type Job = {
  id: string
  title: string
  status: string
  visibility: string
  created_at: string | null
}

export default function EmployerJobsPage(): React.ReactElement {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function load() {
      try {
        const client = createBrowserClient()
        const { data } = await client
          .from("jobs")
          .select("id, title, status, visibility, created_at")
          .order("created_at", { ascending: false })
        if (!mounted) return
        setJobs((data ?? []) as Job[])
      } catch {
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    load()

    return () => { mounted = false }
  }, [])

  return (
    <main className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your jobs</h1>
        <Link href="/dashboard/employer/jobs/new" className="rounded-md border px-3 py-1 text-sm">Create job</Link>
      </div>

      <div className="mt-4">
        {loading ? (
          <div>Loading…</div>
        ) : jobs.length === 0 ? (
          <div className="text-sm text-zinc-600">No jobs yet.</div>
        ) : (
          <ul className="mt-2 space-y-2">
            {jobs.map((j: Job) => (
              <li key={j.id} className="rounded-md border p-3 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{j.title}</div>
                    <div className="text-xs text-zinc-500">{j.visibility} • {j.status}</div>
                  </div>
                  <Link href={`/dashboard/employer/jobs/${j.id}`} className="text-sm text-primary">Manage</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
