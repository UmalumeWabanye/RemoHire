import createBrowserClient from "@/utils/supabase/client"

type Job = {
  id: string
  title: string
  description: string
  visibility: "public" | "private"
  status: "draft" | "published" | "closed"
  created_at: string | null
  updated_at?: string | null
  created_by?: string | null
}

type Profile = {
  id: string
  email?: string
  full_name?: string
  role?: string
}

export async function getPublicJobs(): Promise<Job[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) return []

  const supabase = createBrowserClient()

  const { data } = await supabase
    .from("jobs")
    .select("id, title, description, visibility, status, created_at")
    .eq("visibility", "public")
    .eq("status", "published")
    .order("created_at", { ascending: false })

  return (data as Job[]) ?? []
}

export async function getJob(id: string): Promise<Job | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) return null

  const supabase = createBrowserClient()
  const { data } = await supabase.from("jobs").select("*").eq("id", id).limit(1)
  return (data && (data as Job[])[0]) ?? null
}

export async function createJob(payload: Partial<Job>): Promise<Job | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) throw new Error("Missing Supabase configuration for client")

  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("jobs").insert(payload).select().single()
  if (error) throw error
  return data as Job
}

export async function updateJob(id: string, patch: Partial<Job>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) throw new Error("Missing Supabase configuration for client")

  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("jobs").update(patch).eq("id", id).select().single()
  if (error) throw error
  return data as Job
}

export async function createProfile(email?: string, full_name?: string): Promise<Profile | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) throw new Error("Missing Supabase configuration for client")

  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("profiles").insert({ email, full_name }).select().single()
  if (error) throw error
  return data as Profile
}

export async function getProfileByEmail(email?: string): Promise<Profile | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) return null

  const supabase = createBrowserClient()
  const clean = typeof email === 'string' ? email.trim().toLowerCase() : email
  const { data } = await supabase.from("profiles").select("id, email, full_name, role, linkedin").eq("email", clean).limit(1)
  return (data && (data as Profile[])[0]) ?? null
}

export async function getDevProfile(user_id: string): Promise<{ user_id: string; headline?: string; linkedin_url?: string; skills?: string[] } | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) return null

  const supabase = createBrowserClient()
  const { data } = await supabase.from('developer_profiles').select('user_id, headline, linkedin_url, skills').eq('user_id', user_id).limit(1)
  return (data && (data as { user_id: string; headline?: string; linkedin_url?: string; skills?: string[] }[])[0]) ?? null
}

export async function applyToJob(job_id: string, opts: { profile_id?: string; email?: string; cover_letter?: string }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!url || !anon) throw new Error("Missing Supabase configuration for client")

  const supabase = createBrowserClient()
  const { data, error } = await supabase.from("applications").insert({ job_id, profile_id: opts.profile_id, email: opts.email, cover_letter: opts.cover_letter }).select().single()
  if (error) throw error
  return data
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
