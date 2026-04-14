"use client"

function uuidv4() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

type Job = {
  id: string
  title: string
  description: string
  visibility: "public" | "private"
  status: "draft" | "published" | "closed"
  created_at: string
  updated_at?: string
  created_by?: string
}

type Profile = {
  id: string
  email?: string
  full_name?: string
  role?: string
}

type Application = {
  id: string
  job_id: string
  profile_id?: string
  email?: string
  cover_letter?: string
  created_at: string
}

const STORAGE_KEY = "remohire:mock"

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { jobs: [], profiles: [] }
    return JSON.parse(raw)
  } catch {
    return { jobs: [], profiles: [] }
  }
}

function writeStore(state: { jobs?: Job[]; profiles?: Profile[] }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function ensureSeed() {
  const s = readStore()
  if (!s.jobs || s.jobs.length === 0) {
    const now = new Date().toISOString()
    s.jobs = [
      {
        id: uuidv4(),
        title: "Senior Frontend Engineer",
        description: "Work on a modern React + Next.js product. Remote-first.",
        visibility: "public",
        status: "published",
        created_at: now,
      },
      {
        id: uuidv4(),
        title: "Backend Engineer (Go)",
        description: "Build scalable APIs and services.",
        visibility: "public",
        status: "published",
        created_at: now,
      },
    ]
  }
  if (!s.profiles) s.profiles = []
  if (!s.applications) s.applications = []
  writeStore(s)
  return s
}

export function getPublicJobs(): Job[] {
  if (typeof window === "undefined") return []
  const s = ensureSeed()
  return (s.jobs || []).filter((j: Job) => j.visibility === "public" && j.status === "published")
}

export function getJob(id: string): Job | null {
  if (typeof window === "undefined") return null
  const s = ensureSeed()
  return (s.jobs || []).find((j: Job) => j.id === id) ?? null
}

export function createJob(payload: Partial<Job>): Job {
  const s = ensureSeed()
  const now = new Date().toISOString()
  const job: Job = {
    id: uuidv4(),
    title: payload.title || "Untitled",
    description: payload.description || "",
    visibility: (payload.visibility as "public" | "private") || "private",
    status: (payload.status as "draft" | "published" | "closed") || "draft",
    created_at: now,
    updated_at: now,
    created_by: payload.created_by,
  }
  s.jobs = [job, ...(s.jobs || [])]
  writeStore(s)
  return job
}

export function updateJob(id: string, patch: Partial<Job>) {
  const s = ensureSeed()
  s.jobs = (s.jobs || []).map((j: Job) => {
    if (j.id !== id) return j
    return { ...j, ...patch, updated_at: new Date().toISOString() }
  })
  writeStore(s)
  return s.jobs.find((j: Job) => j.id === id) || null
}

export function createProfile(email?: string, full_name?: string): Profile {
  const s = ensureSeed()
  const p = { id: uuidv4(), email, full_name, role: "developer" }
  s.profiles = [p, ...(s.profiles || [])]
  writeStore(s)
  return p
}

export function getProfileByEmail(email?: string): Profile | null {
  const s = ensureSeed()
  return (s.profiles || []).find((p: Profile) => p.email === email) ?? null
}

export function applyToJob(job_id: string, opts: { profile_id?: string; email?: string; cover_letter?: string }) {
  const s = ensureSeed()
  const app: Application = {
    id: uuidv4(),
    job_id,
    profile_id: opts.profile_id,
    email: opts.email,
    cover_letter: opts.cover_letter,
    created_at: new Date().toISOString(),
  }
  s.applications = [app, ...(s.applications || [])]
  writeStore(s)
  return app
}

const provider = {
  getPublicJobs,
  getJob,
  createJob,
  updateJob,
  createProfile,
  getProfileByEmail,
  applyToJob,
}

export default provider
