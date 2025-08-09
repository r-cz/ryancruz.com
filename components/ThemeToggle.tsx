'use client'

import { useTheme } from './ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if running on iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    setIsIOS(iOS)
  }, [])

  if (!mounted) {
    // Prevent hydration mismatch
    return (
      <div className="w-14 h-8 bg-airport-gray rounded-full opacity-50" />
    )
  }

  // Hide theme toggle entirely on iOS
  if (isIOS) {
    return null
  }

  const toggleTheme = () => {
    if (theme === 'system') {
      // If currently system, switch to opposite of current resolved theme
      setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
    } else {
      // Toggle between light and dark
      setTheme(theme === 'dark' ? 'light' : 'dark')
    }
  }

  const isCurrentlyDark = resolvedTheme === 'dark'

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative w-14 h-8 rounded-full p-1 transition-colors duration-300 ease-in-out
        ${isCurrentlyDark 
          ? 'bg-airport-yellow' 
          : 'bg-airport-black'
        }
        focus:outline-none focus:ring-2 focus:ring-airport-yellow focus:ring-opacity-50
      `}
      aria-label={`Switch to ${isCurrentlyDark ? 'light' : 'dark'} mode`}
    >
      <motion.div
        className={`
          w-6 h-6 rounded-full flex items-center justify-center
          ${isCurrentlyDark 
            ? 'bg-airport-black text-airport-yellow' 
            : 'bg-airport-white text-airport-black'
          }
        `}
        layout
        initial={false}
        animate={{
          x: isCurrentlyDark ? 24 : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30
        }}
      >
        <AnimatePresence mode="wait">
          {isCurrentlyDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <Icon 
                icon="system-uicons:moon"
                width={14}
                height={14}
              />
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <Icon 
                icon="system-uicons:sun"
                width={14}
                height={14}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Status indicator */}
      <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
        <span className="text-xs font-mono text-airport-gray dark:text-airport-light-gray">
          {theme === 'system' ? 'AUTO' : theme.toUpperCase()}
        </span>
      </div>
    </button>
  )
}