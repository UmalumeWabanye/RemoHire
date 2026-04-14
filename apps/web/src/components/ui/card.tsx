"use client"

import * as React from "react"

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={("rounded border bg-white p-4 shadow-sm " + (className ?? "")).trim()}>{children}</div>
  )
}

export default Card
