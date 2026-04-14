import React from "react"
import { createClient } from "@supabase/supabase-js"

async function getPublicJobs() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) return []

  const supabase = createClient(url, anon)

  const { data } = await supabase
    .from("jobs")
    .select("id, title, description, created_at")
    .eq("visibility", "public")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  return data ?? []
}

export default async function JobsPage() {
  const jobs = await getPublicJobs()

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Public Jobs</h1>
      <div className="mt-6 grid gap-4">
        {jobs.length === 0 ? (
          <div className="text-sm text-zinc-600">No public jobs published yet.</div>
        ) : (
          jobs.map((job: { id: string; title: string; description: string; created_at: string | null }) => (
            <article key={job.id} className="rounded-md border p-4 bg-white">
              <h2 className="font-medium text-lg">{job.title}</h2>
              <p className="mt-2 text-sm text-zinc-700">{job.description}</p>
              <div className="mt-2 text-xs text-zinc-500">{job.created_at ? new Date(job.created_at).toLocaleString() : ""}</div>
              <div className="mt-3">
                <a href={`/jobs/${job.id}`} className="text-sm text-primary">View job →</a>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  )
}
