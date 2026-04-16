import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// During Next.js build (server-side), NEXT_PUBLIC_* env vars may be missing.
// createClient throws if no URL is provided, which breaks prerendering. To
// avoid that, export a small stub when the env vars are not present, and
// otherwise export the real client.
type SessionLike = { user?: { email?: string } } | null

type SupabaseLike = {
	auth: {
		getSession: () => Promise<{
			data: { session: SessionLike }
			error: { message?: string } | null
		}>
		signInWithPassword?: (args: { email: string; password: string }) => Promise<{ data: { session: SessionLike } ; error: { message?: string } | null }>
		signUp?: (args: { email: string; password: string }) => Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>
		signOut?: () => Promise<{ error: { message?: string } | null }>
		onAuthStateChange?: (cb: (event: string, session: SessionLike) => void) => { data?: { subscription?: { unsubscribe: () => void } } }
	}
}

let supabase: SupabaseLike | ReturnType<typeof createClient>

try {
	if (!supabaseUrl || !supabaseAnonKey) {
		// Minimal stub implementing the parts we use in the smoke test.
		const notConfiguredError = { message: 'Supabase not configured (missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)' }
		supabase = {
			auth: {
				getSession: async () => ({ data: { session: null }, error: null }),
				signInWithPassword: async () => ({ data: { session: null }, error: notConfiguredError }),
				signUp: async () => ({ data: null, error: notConfiguredError }),
				signOut: async () => ({ error: notConfiguredError }),
				onAuthStateChange: (cb: (event: string, session: SessionLike) => void) => {
					try {
						if (typeof cb === 'function') cb('INIT', null)
					} catch {}
					return { data: { subscription: { unsubscribe: () => undefined } } }
				},
			},
		}
	} else {
		supabase = createClient(supabaseUrl, supabaseAnonKey)
	}
} catch {
	// Fallback stub if createClient throws for any reason during build.
		supabase = {
				auth: {
					getSession: async () => ({ data: { session: null }, error: null }),
					signInWithPassword: async () => ({ data: { session: null }, error: { message: 'Supabase not configured' } }),
					signUp: async () => ({ data: null, error: { message: 'Supabase not configured' } }),
					signOut: async () => ({ error: { message: 'Supabase not configured' } }),
								onAuthStateChange: (cb?: (event: string, session: SessionLike) => void) => {
									try {
										if (typeof cb === 'function') cb('INIT', null)
									} catch {}
									return { data: { subscription: { unsubscribe: () => undefined } } }
								},
				},
		}
}

export { supabase }
export default supabase
