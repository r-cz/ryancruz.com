'use client'

import { useTheme } from './ThemeProvider'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

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
            <motion.svg
              key="moon"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: 180 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z"/>
            </motion.svg>
          ) : (
            <motion.svg
              key="sun"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="currentColor"
              initial={{ opacity: 0, rotate: 180 }}
              animate={{ opacity: 1, rotate: 0 }}
              exit={{ opacity: 0, rotate: -180 }}
              transition={{ duration: 0.2 }}
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z"/>
            </motion.svg>
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