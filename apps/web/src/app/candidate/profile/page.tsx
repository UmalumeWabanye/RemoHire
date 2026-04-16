"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import provider, { getDevProfile } from "@/lib/supabase/provider"
import { Input } from "@/components/ui/input"

  // Response body from create-profile can be either { error: string } on
  // failure, or { data, devResult } on success. We'll parse as a generic
  // Record<string, unknown> and narrow before reading fields.

const SKILL_MAP: Record<string, string[]> = {
  frontend: ['React', 'Vue', 'Angular', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Next.js'],
  backend: ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'Postgres'],
  fullstack: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'Next.js', 'Postgres'],
  devops: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'GCP', 'CI/CD'],
  mobile: ['React Native', 'Flutter', 'Swift', 'Kotlin'],
  data: ['Python', 'Pandas', 'SQL', 'Spark', 'Machine Learning'],
}

export default function CandidateProfilePage(): React.ReactElement {
  const router = useRouter()

  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [devType, setDevType] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState("")
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // ...state declared above

  const updateSuggestions = useCallback((input: string) => {
    const base = devType && SKILL_MAP[devType] ? SKILL_MAP[devType] : Object.values(SKILL_MAP).flat()
    const q = input.trim().toLowerCase()
    const list = base
      .filter(s => !skills.includes(s))
      .filter(s => (q.length === 0) || s.toLowerCase().includes(q))
      .slice(0, 10)
    setSuggestions(list)
  }, [devType, skills])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
            // Use the current session to load profile + developer profile. We
            // don't ask for email during onboarding because signup already
            // collected it.
            const s = await (await import('@/lib/supabase/client')).supabase.auth.getSession()
            const session = (s as unknown as { data?: { session?: { user?: { id?: string; email?: string } } } })?.data?.session
            const uid = session?.user?.id
            const userEmail = session?.user?.email
            if (!mounted) return
            if (userEmail) {
              try {
                const p = await provider.getProfileByEmail(userEmail)
                if (p) setName(p.full_name ?? "")
              } catch {}
            }
            // try to load developer profile (dev-type/headline)
            try {
              if (uid) {
                const dev = await getDevProfile(uid)
                if (dev?.headline) setDevType(dev.headline ?? '')
                if (dev?.skills) setSkills(dev.skills ?? [])
                if (dev?.linkedin_url) setLinkedin(dev.linkedin_url ?? '')
              }
            } catch {}
            // set default suggestions for empty devType state
            updateSuggestions('')
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [updateSuggestions])

  if (loading) {
    return <div className="p-8">Loading profile…</div>
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage("")
    try {
      // Get current session to identify the user; onboarding should not ask
      // for email because signup already collected it.
      const s = await (await import('@/lib/supabase/client')).supabase.auth.getSession()
      const session = (s as unknown as { data?: { session?: { user?: { id?: string; email?: string } } } })?.data?.session
      const uid = session?.user?.id
      if (!uid) {
        setMessage('You must be signed in to complete onboarding. Please sign in and try again.')
        setSaving(false)
        return
      }

      // include dev profile fields in the same request so the server can persist
      // both profile and developer_profiles atomically (server will attempt the
      // dev upsert but will not block on failures). This avoids requiring the
      // client to present an access token for the dev upsert immediately after signup.
      const res = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: uid,
          full_name: name || undefined,
          linkedin: linkedin || undefined,
          onboarding_complete: true,
          headline: devType || undefined,
          skills: skills.length ? skills : undefined,
        })
      })
  let json: Record<string, unknown> | null = null
      try {
        json = await res.json()
      } catch (parseErr) {
        const text = await res.text().catch(() => '')
        console.error('create-profile response parse error', parseErr, text)
        throw new Error('create profile failed (unexpected response)')
      }
      if (!res.ok) {
        const errMsg = json && 'error' in json ? String((json as Record<string, unknown>)['error']) : 'create profile failed'
        throw new Error(errMsg)
      }

      // If the server attempted to persist developer_profiles but failed, it will
      // include a devResult.error property. We display a non-blocking message and
      // continue to redirect so onboarding flows are not blocked.
      const devResult = json && 'devResult' in json ? json['devResult'] : undefined
      if (devResult && typeof devResult === 'object' && 'error' in devResult && typeof (devResult as Record<string, unknown>)['error'] === 'string') {
        console.error('dev upsert warning', (devResult as Record<string, unknown>)['error'])
        setMessage('Profile saved, but saving developer details failed. You can complete them later.')
      } else {
        setMessage('Profile saved — redirecting to dashboard...')
      }

      // redirect after a short delay so the user sees the confirmation message
      setTimeout(() => router.push('/dashboard'), 800)
    } catch (err) {
      const e = err as Error | { message?: string }
      // Surface network/fetch errors to the user to help debugging.
      console.error('handleSave error', e)
      const msg = e?.message || String(e) || 'Failed to save profile'
      setMessage(msg)
    } finally {
      setSaving(false)
    }
  }

  // SKILL_MAP and updateSuggestions defined above to keep hooks order stable

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

          {/* Email is not collected during onboarding; signup already collected it */}

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

          <div>
            <label className="block mt-3 mb-2 text-sm">Skills (press Enter to add)</label>
            <div className="flex gap-2 flex-wrap">
              {skills.map((s) => (
                <span key={s} className="inline-flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1 text-sm">
                  {s}
                  <button type="button" onClick={() => setSkills(skills.filter(x => x !== s))} className="text-xs">×</button>
                </span>
              ))}
            </div>
            <input
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  const next = skillInput.trim()
                  if (next && !skills.includes(next)) setSkills([...skills, next])
                  setSkillInput('')
                }
              }}
              placeholder="Add a skill and press Enter"
              className="mt-2 w-full rounded border px-3 py-2"
            />
            {/* suggestion chips */}
            {suggestions.length > 0 && (
              <div className="mt-2 grid gap-2 grid-cols-2 sm:grid-cols-3">
                {suggestions.map(s => (
                  <button key={s} type="button" onClick={() => { if (!skills.includes(s)) setSkills([...skills, s]) }} className="rounded-md border px-2 py-1 text-sm text-left">{s}</button>
                ))}
              </div>
            )}
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
