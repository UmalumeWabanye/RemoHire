"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type SessionLike = { user?: { email?: string } } | null

type AuthResponse<T> = { data: T; error: { message?: string } | null }

type SupabaseAuthLike = {
  getSession: () => Promise<AuthResponse<{ session: SessionLike }>>
  signInWithPassword?: (args: { email: string; password: string }) => Promise<AuthResponse<{ session: SessionLike }>>
  signUp?: (args: { email: string; password: string }) => Promise<AuthResponse<Record<string, unknown> | null>>
  signOut?: () => Promise<AuthResponse<null>>
  onAuthStateChange?: (cb: (event: string, session: SessionLike) => void) => { data?: { subscription?: { unsubscribe?: () => void } } } | { subscription?: { unsubscribe?: () => void } }
}

export default function SupabaseTestPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<SessionLike>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const check = async () => {
      try {
        const res = await supabase.auth.getSession()
        if (!mounted) return
        if (res.error) {
          setError(res.error?.message ?? String(res.error))
        } else {
          setSession(res.data.session ?? null)
        }
      } catch (err) {
        if (!mounted) return
        setError(String(err))
      } finally {
        if (mounted) setLoading(false)
      }
    }

    check()

    // subscribe to auth changes if available (some stubs may not implement it)
    let listener: { subscription?: { unsubscribe?: () => void } } | null = null
    const auth = (supabase as unknown as { auth: SupabaseAuthLike }).auth
    if (typeof auth.onAuthStateChange === 'function') {
      const res = auth.onAuthStateChange((_, s) => {
        if (!mounted) return
        setSession(s ?? null)
      })
      listener = (res as unknown as { data?: { subscription?: { unsubscribe?: () => void } } })?.data ?? (res as unknown as { subscription?: { unsubscribe?: () => void } })
    }

    return () => {
      mounted = false
      try {
        if (listener) {
          if (listener.subscription && typeof listener.subscription.unsubscribe === 'function') {
            listener.subscription.unsubscribe()
          } else if (typeof (listener as unknown as { unsubscribe?: () => void }).unsubscribe === 'function') {
            ;(listener as unknown as { unsubscribe?: () => void }).unsubscribe!()
          }
        }
      } catch {
        // ignore cleanup errors
      }
    }
  }, [])

  const signIn = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setActionLoading(true)
    setMessage(null)
    try {
      const auth = (supabase as unknown as { auth: SupabaseAuthLike }).auth
      const res = await auth.signInWithPassword!({ email, password })
      if (res.error) {
        setMessage(`Error: ${res.error.message ?? String(res.error)}`)
      } else {
        setMessage('Signed in')
        setSession(res.data.session ?? null)
      }
    } catch (err) {
      setMessage(`Error: ${String(err)}`)
    } finally {
      setActionLoading(false)
    }
  }

  const signUp = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setActionLoading(true)
    setMessage(null)
    try {
      const auth = (supabase as unknown as { auth: SupabaseAuthLike }).auth
      const res = await auth.signUp!({ email, password })
      if (res.error) {
        setMessage(`Error: ${res.error.message ?? String(res.error)}`)
      } else {
        setMessage('Sign-up requested — check your email if using email confirmation')
      }
    } catch (err) {
      setMessage(`Error: ${String(err)}`)
    } finally {
      setActionLoading(false)
    }
  }

  const signOut = async () => {
    setActionLoading(true)
    setMessage(null)
    try {
      const auth = (supabase as unknown as { auth: SupabaseAuthLike }).auth
      await auth.signOut!()
      setSession(null)
      setMessage('Signed out')
    } catch (err) {
      setMessage(`Error: ${String(err)}`)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div style={{ padding: 16, fontFamily: 'system-ui, sans-serif' }}>
      <h2>Supabase smoke test</h2>
      <div style={{ marginBottom: 8 }}>Session: {session ? 'yes' : 'no'}</div>

      {message && <div style={{ marginBottom: 8 }}>{message}</div>}

      {!session ? (
        <form onSubmit={signIn} style={{ display: 'grid', gap: 8, maxWidth: 400 }}>
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%' }}
              required
            />
          </label>

          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Working...' : 'Sign in'}
            </button>
            <button type="button" onClick={signUp} disabled={actionLoading}>
              {actionLoading ? 'Working...' : 'Sign up'}
            </button>
          </div>
        </form>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <div>Signed in as: {session.user?.email ?? 'unknown'}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={signOut} disabled={actionLoading}>
              {actionLoading ? 'Working...' : 'Sign out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
