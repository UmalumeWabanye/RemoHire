"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import provider from "@/lib/supabase/provider"
import { Input, Textarea } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

export default function ManageJobPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  type Job = {
    id: string
    title: string
    description: string
    visibility: string
    status: string
    created_at?: string | null
  }

  const [job, setJob] = useState<Job | null | undefined>(undefined)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState<"public" | "private">("private")
  const [status, setStatus] = useState<"draft" | "published" | "closed">("draft")

  useEffect(() => {
    let mounted = true
    provider.getJob(id).then((j) => {
      if (!mounted) return
      setJob(j)
      if (j) {
        setTitle(j.title)
        setDescription(j.description)
        setVisibility(j.visibility)
        setStatus(j.status)
      }
    }).catch(() => {
      if (!mounted) return
      setJob(null)
    })
    return () => {
      mounted = false
    }
  }, [id])

  if (job === undefined) return <div className="p-8">Loading…</div>
  if (job === null) return <div className="p-8">Job not found</div>

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    await provider.updateJob(id, { title, description, visibility, status })
    router.refresh()
  }

  async function handlePublish() {
    await provider.updateJob(id, { status: "published" })
    router.refresh()
  }

  async function handleClose() {
    await provider.updateJob(id, { status: "closed" })
    router.refresh()
  }

  return (
    <main className="p-8">
      <Card>
        <h1 className="text-2xl font-semibold">Manage job</h1>
        <form className="mt-4 max-w-lg" onSubmit={handleSave}>
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
            <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "published" | "closed")} className="rounded border px-2 py-1 text-sm">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="mt-4 flex gap-3">
            <button className="rounded-md bg-black px-4 py-2 text-white" type="submit">Save</button>
            <button type="button" onClick={handlePublish} className="rounded-md border px-3 py-2">Publish</button>
            <button type="button" onClick={handleClose} className="rounded-md border px-3 py-2">Close</button>
          </div>
        </form>
      </Card>
    </main>
  )
}
