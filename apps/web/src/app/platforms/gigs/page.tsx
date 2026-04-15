import React from "react"
import Link from "next/link"

export default function GigsPage(): React.ReactElement {
  // Minimal Fiverr-like gigs listing scaffold. We'll reuse jobs as gigs for now.
  const sampleGigs = [
    { id: "g1", title: "Build a landing page", price: "$300" },
    { id: "g2", title: "Design product logo", price: "$120" },
  ]

  return (
    <main className="mx-auto max-w-4xl p-6">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gigs</h1>
          <p className="text-sm text-zinc-600 mt-1">Browse or post short-term gigs (Fiverr-like flow).</p>
        </div>
        <Link href="/platforms/gigs/new" className="rounded bg-green-600 px-3 py-2 text-sm text-white">Post a Gig</Link>
      </header>

      <section className="grid gap-4">
        {sampleGigs.map((g) => (
          <article key={g.id} className="rounded-md border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">{g.title}</div>
                <div className="text-sm text-zinc-600">{g.price}</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded border px-3 py-1 text-sm">Contact</button>
                <button className="rounded bg-sky-600 px-3 py-1 text-sm text-white">Order</button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}
