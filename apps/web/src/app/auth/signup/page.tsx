"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import Card from "@/components/ui/card"
import Input from "@/components/ui/input"

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
    <main className="min-h-[70vh] flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md mx-auto">
        <h1 className="text-2xl font-semibold mb-2">Create account</h1>
        <p className="text-sm text-muted-foreground mb-4">Create an account to post jobs and manage applicants.</p>
        {message && <div className="mb-4 text-sm text-slate-700">{message}</div>}
        <form onSubmit={handleSignUp} className="space-y-4">
          <Input label="Full name" value={fullName} onChange={(e)=>setFullName(e.target.value)} />
          <Input label="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          <Input label="Password" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          <div className="flex items-center justify-between">
            <a href="/auth/signin" className="text-sm text-sky-600">Already have an account?</a>
            <button type="submit" className="rounded-full bg-sky-600 px-4 py-2 text-white" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
          </div>
        </form>
      </Card>
    </main>
  )
}
