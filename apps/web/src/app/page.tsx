import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-start bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <main className="flex flex-1 w-full max-w-5xl flex-col items-start py-12 px-6 bg-white dark:bg-black">
        <header className="w-full mb-8 flex items-center justify-between">
          <div className="text-lg font-semibold">RemoHire</div>
          <nav className="flex items-center gap-4">
            <Link className="text-sm" href="/jobs">Jobs</Link>
            <Link className="text-sm" href="/dashboard">Dashboard</Link>
            <Link className="text-sm" href="/candidate/profile">Profile</Link>
            <Link className="text-sm" href="/supabase-test">Auth test</Link>
          </nav>
        </header>

        <section className="w-full bg-white py-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold leading-tight">Find great talent or your next role</h1>
            <p className="mt-4 text-lg text-zinc-600">Public job board and employer dashboard mock UI — fully interactive. Use the links above to explore the product flows.</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/jobs" className="rounded-md bg-black px-4 py-2 text-white">Browse Jobs</Link>
              <Link href="/dashboard" className="rounded-md border px-4 py-2">Open Dashboard</Link>
              <Link href="/candidate/profile" className="rounded-md border px-4 py-2">Edit Profile</Link>
            </div>
          </div>
        </section>

        <section className="w-full mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded border p-6">
              <h2 className="font-medium">Public Job Board</h2>
              <p className="mt-2 text-sm text-zinc-600">Browse public, published jobs posted by employers.</p>
              <div className="mt-4">
                <Link href="/jobs" className="text-sm text-primary">View jobs →</Link>
              </div>
            </div>

            <div className="rounded border p-6">
              <h2 className="font-medium">Employer Dashboard</h2>
              <p className="mt-2 text-sm text-zinc-600">Create and manage jobs (invite-only employers).</p>
              <div className="mt-4">
                <Link href="/dashboard" className="text-sm text-primary">Open dashboard →</Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
