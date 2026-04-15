"use client"
import React from "react"
import { useRouter } from "next/navigation"
import { Input, Textarea } from "@/components/ui/input"

export default function NewGigPage(): React.ReactElement {
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    // For now we post to /api/jobs (reusing jobs table). In future we can split gigs table.
    const body = {
      title: String(fd.get("title") || ""),
      description: String(fd.get("description") || ""),
      visibility: "public",
      status: "published",
    }

    const res = await fetch('/api/jobs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      router.push('/platforms/gigs')
    } else {
      alert('Failed to create gig')
    }
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-semibold mb-4">Post a New Gig</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Input label="Title" name="title" required />
        </div>
        <div>
          <label className="mb-1 text-sm font-medium">Description</label>
          <Textarea name="description" required rows={6} />
        </div>
        <div className="flex justify-end">
          <button type="submit" className="rounded bg-sky-600 px-4 py-2 text-white">Create Gig</button>
        </div>
      </form>
    </main>
  )
}
