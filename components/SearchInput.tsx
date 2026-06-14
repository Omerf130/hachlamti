'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface SearchInputProps {
  basePath: string
  placeholder?: string
  className?: string
  iconClassName?: string
  wrapperClassName?: string
}

export default function SearchInput({
  basePath,
  placeholder = 'חיפוש...',
  className,
  iconClassName,
  wrapperClassName,
}: SearchInputProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim()
      if (trimmed) {
        router.replace(`${basePath}?q=${encodeURIComponent(trimmed)}`)
      } else {
        router.replace(basePath)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [query, basePath, router])

  return (
    <div className={wrapperClassName}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <span className={iconClassName}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
    </div>
  )
}
