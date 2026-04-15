"use client"
import * as React from "react"

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label?: string }

export const Input = React.forwardRef<HTMLInputElement, Props>(({ label, className = "", ...props }, ref) => {
  return (
    <div className={"flex flex-col"}>
      {label && <label className="mb-1 text-sm font-medium">{label}</label>}
      <input
        ref={ref}
        className={("rounded-lg border px-3 py-2 shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-sky-300 " + className).trim()}
        {...props}
      />
    </div>
  )
})

Input.displayName = 'Input'

export default Input

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={("rounded-lg border px-3 py-2 shadow-sm bg-background focus:outline-none focus:ring-2 focus:ring-sky-300 " + (props.className ?? "")).trim()}
    />
  )
}
