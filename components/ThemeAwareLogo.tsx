'use client'

import { useTheme } from './ThemeProvider'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface ThemeAwareLogoProps {
  company: string
  width?: number
  height?: number
  className?: string
}

export default function ThemeAwareLogo({ 
  company, 
  width = 40, 
  height = 40, 
  className = "object-contain opacity-80" 
}: ThemeAwareLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Return a placeholder during SSR to prevent hydration mismatch
    return <div className={`w-${width/4} h-${height/4}`} />
  }

  const getLogoSrc = () => {
    switch (company) {
      case 'Apple':
        return '/images/apple-light.svg' // Always use the black version
      case 'Southwest Airlines':
        return '/images/LUV.svg'
      case 'University of Georgia':
        return '/images/uni.svg'
      default:
        return ''
    }
  }

  const getLogoFilter = () => {
    // For Apple logo, invert colors in dark mode to make black logo white
    if (company === 'Apple' && resolvedTheme === 'dark') {
      return 'invert(1)'
    }
    return 'none'
  }

  const logoSrc = getLogoSrc()
  
  if (!logoSrc) return null

  return (
    <Image
      src={logoSrc}
      alt={`${company} logo`}
      width={width}
      height={height}
      className={className}
      style={{ filter: getLogoFilter() }}
    />
  )
}