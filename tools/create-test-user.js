// Simple script to create a test user via Supabase Auth REST API using the anon key.
// Usage: node tools/create-test-user.js test+1@example.com Password123!
// Requires NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be set in environment or in apps/web/.env.local

const [,, email, password] = process.argv

if (!email || !password) {
  console.error('Usage: node tools/create-test-user.js <email> <password>')
  process.exit(2)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!url || !anonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment')
  process.exit(2)
}

async function run() {
  const endpoint = `${url.replace(/\/$/, '')}/auth/v1/signup`
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
      body: JSON.stringify({ email, password }),
    })

    const body = await res.text()
    console.log('Status:', res.status)
    console.log(body)
  } catch (err) {
    console.error('Request failed:', err)
  }
}

run()
