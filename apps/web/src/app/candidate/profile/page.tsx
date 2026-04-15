"use client"

import React, { useState } from "react"
import { Input } from "@/components/ui/input"

export default function CandidateProfilePage(): React.ReactElement {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [fiverr, setFiverr] = useState("")

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    try {
      const cleanEmail = (email || '').trim().toLowerCase()
      const res = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, full_name: name || undefined, linkedin: linkedin || undefined, fiverr: fiverr || undefined })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'create profile failed')
      setMessage(`Saved profile ${json?.data ? 'ok' : '(no data)'}`)
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

  <label className="block mt-3 mb-2 text-sm">LinkedIn profile</label>
  <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/in/yourhandle" />

  <label className="block mt-3 mb-2 text-sm">Fiverr profile</label>
  <Input value={fiverr} onChange={(e) => setFiverr(e.target.value)} placeholder="https://www.fiverr.com/yourhandle" />

        <div className="mt-4">
          <button className="rounded-md bg-black px-4 py-2 text-white" type="submit">Save profile</button>
          {message && <div className="mt-2 text-sm text-zinc-600">{message}</div>}
        </div>
      </form>
    </main>
  )
}
