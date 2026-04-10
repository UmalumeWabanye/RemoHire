"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function SupabaseTestPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<any | null>(null)

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

    // subscribe to auth changes
    const { data: listener } = (supabase as any).auth.onAuthStateChange((_, s: any) => {
      if (!mounted) return
      setSession(s ?? null)
    }) || { data: null }

    return () => {
      mounted = false
      if (listener && listener.subscription) listener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async (e?: React.FormEvent) => {
    e?.preventDefault()
    setActionLoading(true)
    setMessage(null)
    try {
      const res = await (supabase as any).auth.signInWithPassword({ email, password })
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
      const res = await (supabase as any).auth.signUp({ email, password })
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
      await (supabase as any).auth.signOut()
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
