"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import provider, { getDevProfile } from "@/lib/supabase/provider"
import { Input } from "@/components/ui/input"

export default function CandidateProfilePage(): React.ReactElement {
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [devType, setDevType] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // ...state declared above

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        // Attempt to load existing profile for the signed-in user
        const p = await provider.getProfileByEmail()
        if (!mounted) return
        if (p) {
          setEmail(p.email ?? "")
          setName(p.full_name ?? "")
          const pExtra = p as unknown as { linkedin?: string }
          setLinkedin(pExtra.linkedin ?? "")
          // try to load developer profile (dev-type/headline)
          try {
            // get current user id from session via client supabase
            const s = await (await import('@/lib/supabase/client')).supabase.auth.getSession()
            const uid = (s as unknown as { data?: { session?: { user?: { id?: string } } } })?.data?.session?.user?.id
            if (uid) {
              const dev = await getDevProfile(uid)
              if (dev?.headline) setDevType(dev.headline ?? '')
            }
          } catch {}
        }
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  if (loading) {
    return <div className="p-8">Loading profile…</div>
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      const cleanEmail = (email || '').trim().toLowerCase()
      const res = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, full_name: name || undefined, linkedin: linkedin || undefined })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'create profile failed')
      setMessage('Profile saved — redirecting to dashboard...')
      setTimeout(() => router.push('/dashboard'), 800)
      // also save developer profile dev-type
      try {
        const s = await (await import('@/lib/supabase/client')).supabase.auth.getSession()
        const uid = (s as unknown as { data?: { session?: { user?: { id?: string } } } })?.data?.session?.user?.id
        if (uid && devType) {
          await fetch('/api/dev-profile/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uid, headline: devType })
          })
        }
      } catch {}
    } catch {
      setMessage("Failed to save profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">Complete your profile</h1>

      <p className="mt-2 text-sm text-zinc-600">Fill in your name and optionally add a link to LinkedIn so employers can find you.</p>

      <div className="mt-4 max-w-lg">
        <div className="mb-4">
          <div className="text-sm font-medium">Onboarding progress</div>
          <div className="mt-2 h-2 w-full rounded bg-gray-100">
            <div className={`h-2 rounded bg-sky-600`} style={{ width: name ? '100%' : '33%' }} />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block mb-2 text-sm">Full name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block mt-3 mb-2 text-sm">Email</label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </div>

          <div>
            <label className="block mt-3 mb-2 text-sm">LinkedIn profile</label>
            <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://www.linkedin.com/in/yourhandle" />
          </div>

          <div>
            <label className="block mt-3 mb-2 text-sm">Developer type</label>
            <select value={devType} onChange={(e) => setDevType(e.target.value)} className="mt-1 w-full rounded border px-3 py-2">
              <option value="">Select your dev type</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Fullstack</option>
              <option value="devops">DevOps</option>
              <option value="mobile">Mobile</option>
              <option value="data">Data</option>
            </select>
          </div>

          {/* Fiverr removed from onboarding */}

          <div className="mt-4">
            <button className="rounded-md bg-black px-4 py-2 text-white" type="submit" disabled={saving || !name}>{saving ? 'Saving...' : 'Save and continue'}</button>
            {message && <div className="mt-2 text-sm text-zinc-600">{message}</div>}
          </div>
        </form>
      </div>
    </main>
  )
}
