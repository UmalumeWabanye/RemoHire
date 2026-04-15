"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Card from "@/components/ui/card"
import Input from "@/components/ui/input"

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

  const cleanEmail = (email || '').trim().toLowerCase()
  const res = await auth.signInWithPassword({ email: cleanEmail, password })
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
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-muted-foreground mb-4">Access your account to manage jobs and applicants.</p>
        {message && <div className="mb-4 text-sm text-red-600">{message}</div>}
        <form onSubmit={handleSignIn} className="space-y-4">
          <Input label="Email" type="email" name="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <Input label="Password" type="password" name="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <div className="flex items-center justify-between">
            <a href="/auth/signup" className="text-sm text-sky-600">Create account</a>
            <button type="submit" className="rounded-full bg-sky-600 px-4 py-2 text-white" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
          </div>
        </form>
      </Card>
    </main>
  )
}
