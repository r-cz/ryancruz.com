'use client'

import Image from 'next/image'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

interface AirportIconProps {
  type: 'plane' | 'departure' | 'luggage' | 'information' | 'telephone' | 'mail' | 'right-arrow' | 'left-arrow' | 'up-arrow' | 'down-arrow' | 'up-right-arrow'
  className?: string
  variant?: 'auto' | 'light' | 'dark' | 'yellow'
}

export default function AirportIcon({ type, className = 'w-6 h-6', variant = 'auto' }: AirportIconProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const iconMap = {
    plane: '/icons/ss_24_Air-Transportation.svg',
    departure: '/icons/ss_42_DepartingFlights.svg',
    luggage: '/icons/ss_41_BaggageClaim.svg',
    information: '/icons/AIGA_information.svg',
    telephone: '/icons/ss_01_Telephone.svg',
    mail: '/icons/ss_02_Mail.svg',
    'right-arrow': '/icons/ss_53_Right-Arrow.svg',
    'left-arrow': '/icons/ss_61_LeftArrow.svg',
    'up-arrow': '/icons/ss_57_UpArrow.svg',
    'down-arrow': '/icons/ss_65_Down-Arrow.svg',
    'up-right-arrow': '/icons/ss_55_Forward-andRight-Arrow.svg'
  }

  const iconSrc = iconMap[type]
  
  if (!iconSrc) return null

  const getIconFilter = () => {
    if (!mounted) return 'brightness(0)' // Default for SSR
    
    switch (variant) {
      case 'light':
        return 'brightness(0)'
      case 'dark':
        return 'brightness(0) invert(1)'
      case 'yellow':
        return 'brightness(0) invert(1) saturate(2)'
      case 'auto':
      default:
        return resolvedTheme === 'dark' ? 'brightness(0) invert(1)' : 'brightness(0)'
    }
  }

  return (
    <Image
      src={iconSrc}
      alt={`${type} icon`}
      width={24}
      height={24}
      className={className}
      style={{ filter: getIconFilter() }}
    />
  )
}