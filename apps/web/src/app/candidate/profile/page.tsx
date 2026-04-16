"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import provider, { getDevProfile } from "@/lib/supabase/provider"
import { Input } from "@/components/ui/input"

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

  const [email, setEmail] = useState("")
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
              if (dev?.skills) setSkills(dev.skills ?? [])
            }
          } catch {}
          // set default suggestions for empty devType state
          updateSuggestions('')
        }
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
      const cleanEmail = (email || '').trim().toLowerCase()
      const res = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, full_name: name || undefined, linkedin: linkedin || undefined, onboarding_complete: true })
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'create profile failed')

      // now persist developer profile (require authenticated user). If devType is empty
      // we skip developer profile persistence.
      if (devType) {
        try {
          const s = await (await import('@/lib/supabase/client')).supabase.auth.getSession()
          const session = (s as unknown as { data?: { session?: { user?: { id?: string }, access_token?: string } } })?.data?.session
          const accessToken = session?.access_token
          const uid = session?.user?.id

          if (!uid || !accessToken) {
            setMessage('You must be signed in to save your developer profile. Please sign in and try again.')
            return
          }

          const devRes = await fetch('/api/dev-profile/upsert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
            body: JSON.stringify({ headline: devType, skills })
          })
          const devJson = await devRes.json()
          if (!devRes.ok) {
            setMessage(devJson?.error || 'Failed to save developer profile')
            return
          }
        } catch (err) {
          console.error('dev-profile save failed', err)
          setMessage('Failed to save developer profile')
          return
        }
      }

      setMessage('Profile saved — redirecting to dashboard...')
      // redirect after the saves complete
      router.push('/dashboard')
    } catch (e) {
      console.error(e)
      setMessage("Failed to save profile")
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
