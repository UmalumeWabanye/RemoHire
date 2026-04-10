"use client"

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function SupabaseTestPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    let mounted = true
    supabase.auth
      .getSession()
      .then((res) => {
        if (!mounted) return
        if (res.error) {
          setError(res.error?.message ?? String(res.error))
        } else {
          setHasSession(!!res.data.session)
        }
      })
      .catch((err) => {
        if (!mounted) return
        setError(String(err))
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  return <div>OK. Session: {hasSession ? 'yes' : 'no'}</div>
}
