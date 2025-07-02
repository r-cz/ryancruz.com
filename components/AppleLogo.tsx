'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface AppleLogoProps {
  width?: number
  height?: number
  className?: string
}

export default function AppleLogo({ width = 48, height = 48, className = '' }: AppleLogoProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check if user prefers dark mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    // Listen for changes
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return (
    <Image
      src={isDark ? '/images/apple-dark.svg' : '/images/apple-light.svg'}
      alt="Apple logo"
      width={width}
      height={height}
      className={className}
    />
  )
}