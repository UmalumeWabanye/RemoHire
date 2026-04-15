"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function SignUpPage(): React.ReactElement {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSignUp(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      type AuthRes = { data?: { user?: { id?: string } } | null; error?: { message?: string } | null }
      const auth = (supabase as unknown as { auth: { signUp?: (args: { email: string; password: string }) => Promise<AuthRes> } }).auth

      if (!auth.signUp) {
        setMessage('Auth client not available')
        setLoading(false)
        return
      }

      const res = await auth.signUp({ email, password })
      if (res.error) {
        setMessage(res.error.message || String(res.error))
      } else {
        // attempt to create a profile via server API
        try {
          await fetch('/api/auth/create-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: res.data?.user?.id, email, full_name: fullName })
          })
        } catch {
          // ignore profile creation errors
        }
        // If confirmation email is required, show message; otherwise redirect
        setMessage('Check your email for a confirmation link if required. Redirecting...')
        setTimeout(() => router.push('/dashboard'), 1500)
      }
    } catch (err) {
      setMessage(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Create account</h1>
      {message && <div className="mb-4 text-sm text-slate-700">{message}</div>}
      <form onSubmit={handleSignUp} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input value={fullName} onChange={(e)=>setFullName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div className="flex justify-between items-center">
          <a href="/auth/signin" className="text-sm text-sky-600">Already have an account?</a>
          <button type="submit" className="rounded bg-sky-600 px-4 py-2 text-white" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
        </div>
      </form>
    </main>
  )
}
