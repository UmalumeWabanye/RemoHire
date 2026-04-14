"use client"

import React, { useState } from "react"
import provider from "@/lib/supabase/provider"
import { Input } from "@/components/ui/input"

export default function CandidateProfilePage(): React.ReactElement {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      const p = await provider.createProfile(email || undefined, name || undefined)
      setMessage(`Saved profile ${p?.id ?? "(no id)"}`)
    } catch {
      setMessage("Failed to save profile")
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Your candidate profile</h1>
      <form className="mt-4 max-w-lg" onSubmit={handleSave}>
        <label className="block mb-2 text-sm">Full name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />

        <label className="block mt-3 mb-2 text-sm">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />

        <div className="mt-4">
          <button className="rounded-md bg-black px-4 py-2 text-white" type="submit">Save profile</button>
          {message && <div className="mt-2 text-sm text-zinc-600">{message}</div>}
        </div>
      </form>
    </main>
  )
}
