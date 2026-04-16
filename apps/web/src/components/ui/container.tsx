import React from 'react'

export function Container({ children, className = '' }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <div className={("mx-auto max-w-7xl px-6 " + className).trim()}>{children}</div>
  )
}

export default Container
