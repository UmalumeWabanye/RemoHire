"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import provider from "@/lib/supabase/provider"
import { Input, Textarea } from "@/components/ui/input"

export default function NewJobPage(): React.ReactElement {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<"public" | "private">("private")
  const [status, setStatus] = useState<"draft" | "published">("draft")

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
  const job = await provider.createJob({ title, description, visibility, status })
  if (!job) throw new Error("Failed to create job")
  // Navigate to management page for the new job
  router.push(`/dashboard/employer/jobs/${job.id}`)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Create job</h1>
      <form className="mt-4 max-w-lg" onSubmit={handleCreate}>
        <label className="block mb-2 text-sm">Title</label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required />

        <label className="block mt-3 mb-2 text-sm">Description</label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />

        <div className="mt-3 flex gap-3">
          <label className="text-sm">Visibility</label>
          <select value={visibility} onChange={(e) => setVisibility(e.target.value as "public" | "private")} className="rounded border px-2 py-1 text-sm">
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        <div className="mt-3 flex gap-3 items-center">
          <label className="text-sm">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published")} className="rounded border px-2 py-1 text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div className="mt-4">
          <button className="rounded-md bg-black px-4 py-2 text-white" type="submit">Create job</button>
        </div>
      </form>
    </main>
  )
}
