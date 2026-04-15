"use client"
import * as React from "react"

export function Card({ children, className = "" }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={("rounded-2xl bg-card p-6 shadow-sm " + className).trim()}>{children}</div>
  )
}

export default Card
