#!/usr/bin/env node
const { readFileSync } = require('fs')
const { join } = require('path')
const { Client } = require('pg')

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) {
    console.error('Please set DATABASE_URL environment variable (postgres://...)')
    process.exit(2)
  }

  const client = new Client({ connectionString: url })
  try {
    await client.connect()
    const migrationsDir = join(__dirname, '..', 'supabase', 'migrations')
    const files = [
      '0001_init.sql',
      '0002_jobs_visibility_and_employer_invites.sql',
      '0003_add_applications_and_invite_token.sql',
    ]

    for (const f of files) {
      const path = join(migrationsDir, f)
      console.log('\n---- Running', f)
      const sql = readFileSync(path, 'utf8')
      try {
        await client.query(sql)
        console.log('Applied', f)
      } catch (err) {
        console.error('Error applying', f, err.message)
        throw err
      }
    }

    // Verification
    console.log('\nVerifying tables...')
    const res1 = await client.query("SELECT to_regclass('public.applications') as applications")
    console.log('applications table:', res1.rows[0])
    const res2 = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name='employer_invites'")
    console.log('employer_invites columns:')
    console.table(res2.rows)

    console.log('\nMigrations completed successfully')
  } catch (err) {
    console.error('Migration run failed:', err.message)
    process.exitCode = 1
  } finally {
    await client.end()
  }
}

run()
