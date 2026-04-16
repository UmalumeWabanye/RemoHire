"use client"

import React, { useEffect, useState } from "react"
import provider from "@/lib/supabase/provider"
import { Input, Textarea } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  type Job = {
    id: string
    title: string
    description: string
    visibility: string
    status: string
    created_at?: string | null
  }

  const [job, setJob] = useState<Job | null | undefined>(undefined)
  const [email, setEmail] = useState("")
  const [cover, setCover] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    provider.getJob(id).then((j) => {
      if (!mounted) return
      setJob(j)
    }).catch(() => setJob(null))
    return () => {
      mounted = false
    }
  }, [id])

  if (job === undefined) return <div className="p-8">Loading…</div>
  if (job === null) return <div className="p-8">Job not found</div>

  async function handleApply(e: React.FormEvent) {
    e.preventDefault()
    try {
      await provider.applyToJob(id, { email, cover_letter: cover })
      setStatus("Application submitted")
      setEmail("")
      setCover("")
    } catch {
      setStatus("Failed to submit application")
    }
  }

  return (
    <main className="p-8">
      <Card>
        <h1 className="text-2xl font-semibold">{job.title}</h1>
        <p className="mt-3 text-zinc-700">{job.description}</p>
        <div className="mt-4 text-xs text-zinc-500">{job.visibility} • {job.status}</div>
      </Card>

      <section className="mt-6">
        <h2 className="text-lg font-medium">Apply</h2>
        <form className="mt-3 max-w-lg" onSubmit={handleApply}>
          <label className="block mb-2 text-sm">Email</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label className="block mt-3 mb-2 text-sm">Cover letter</label>
          <Textarea value={cover} onChange={(e) => setCover(e.target.value)} rows={6} />

          <div className="mt-4 flex items-center gap-3">
            <button className="rounded-md bg-black px-4 py-2 text-white" type="submit">Submit application</button>
            {status && <div className="text-sm text-zinc-600">{status}</div>}
          </div>
        </form>
      </section>
    </main>
  )
}
