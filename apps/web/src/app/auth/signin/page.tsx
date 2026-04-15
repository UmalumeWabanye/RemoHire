"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"

export default function SignInPage(): React.ReactElement {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await supabase.auth.getSession()
        if (!mounted) return
        if (res?.data?.session?.user?.email) {
          router.replace("/dashboard")
        }
      } catch {}
    })()
    return () => { mounted = false }
  }, [router])

  async function handleSignIn(e?: React.FormEvent) {
    e?.preventDefault()
    setLoading(true)
    setMessage(null)
    try {
      type AuthRes = { data?: { session?: { user?: { email?: string } } } | null; error?: { message?: string } | null }
  const auth = (supabase as unknown as { auth: { signInWithPassword?: (args: { email: string; password: string }) => Promise<AuthRes> } }).auth

      if (!auth.signInWithPassword) {
        setMessage('Auth client not available')
        setLoading(false)
        return
      }

      const res = await auth.signInWithPassword({ email, password })
      if (res?.error) {
        setMessage(res.error.message || String(res.error))
      } else {
        router.push("/dashboard")
      }
    } catch (err) {
      setMessage(String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-semibold mb-4">Sign in</h1>
      {message && <div className="mb-4 text-red-600">{message}</div>}
      <form onSubmit={handleSignIn} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" name="email" value={email} onChange={(e)=>setEmail(e.target.value)} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input type="password" name="password" value={password} onChange={(e)=>setPassword(e.target.value)} required className="mt-1 w-full rounded border px-3 py-2" />
        </div>
        <div className="flex justify-between items-center">
          <a href="/auth/signup" className="text-sm text-sky-600">Create account</a>
          <button type="submit" className="rounded bg-sky-600 px-4 py-2 text-white" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
      </form>
    </main>
  )
}
