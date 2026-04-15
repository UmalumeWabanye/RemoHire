import React from "react"
import Link from "next/link"

export default function NetworkPage(): React.ReactElement {
  // Minimal scaffold for a LinkedIn-like network page. This is a placeholder
  // to be wired to Supabase profiles / connections later.
  const sampleProfiles = [
    { id: "1", name: "Alex Johnson", title: "Frontend Engineer" },
    { id: "2", name: "Priya Sharma", title: "Product Designer" },
    { id: "3", name: "Sam Lee", title: "Backend Engineer" },
  ]

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">Network</h1>
        <p className="text-sm text-zinc-600 mt-1">Discover professionals, connect, and build your network.</p>
      </header>

      <section className="space-y-4">
        {sampleProfiles.map((p) => (
          <article key={p.id} className="flex items-center justify-between rounded-md border p-4">
            <div>
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-zinc-600">{p.title}</div>
            </div>
            <div className="flex gap-2">
              <button className="rounded border px-3 py-1 text-sm">Connect</button>
              <Link href={`/candidate/profile`} className="rounded bg-sky-600 px-3 py-1 text-sm text-white">View</Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
