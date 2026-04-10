import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// During Next.js build (server-side), NEXT_PUBLIC_* env vars may be missing.
// createClient throws if no URL is provided, which breaks prerendering. To
// avoid that, export a small stub when the env vars are not present, and
// otherwise export the real client.
type SupabaseLike = {
	auth: {
		getSession: () => Promise<{
			data: { session: unknown | null }
			error: { message?: string } | null
		}>
	}
}

let supabase: SupabaseLike | ReturnType<typeof createClient>

try {
	if (!supabaseUrl || !supabaseAnonKey) {
		// Minimal stub implementing the parts we use in the smoke test.
		supabase = {
			auth: {
				getSession: async () => ({ data: { session: null }, error: null }),
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
		},
	}
}

export { supabase }
export default supabase
