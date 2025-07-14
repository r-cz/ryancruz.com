'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import ThemeToggle from './ThemeToggle'
import AirportIcon from './AirportIcon'

export default function Header() {
  const { resolvedTheme } = useTheme()
  const [currentTime, setCurrentTime] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    // Set initial time on client
    setCurrentTime(new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: false 
    }))

    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const menuItems = [
    { label: 'Contact', href: 'mailto:mail@ryancruz.com' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/cruzryan' },
    { label: 'Resume', href: '/Resume.pdf' },
    { label: 'iam.tools', href: 'https://iam-tools.pages.dev' },
  ]

  return (
    <div className="relative">
      {/* Header */}
      <div className="w-full bg-card border-b border-border p-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-2 text-foreground hover:text-primary transition-colors"
          >
            <div className="w-6 h-6 flex flex-col justify-center space-y-1">
              <div className="w-full h-0.5 bg-current"></div>
              <div className="w-full h-0.5 bg-current"></div>
              <div className="w-full h-0.5 bg-current"></div>
            </div>
            <span className="font-mono text-sm uppercase tracking-wider hidden sm:block">Menu</span>
          </button>

          {/* Clock */}
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-airport-green rounded-full animate-pulse"></div>
            <span className="font-mono text-lg">
              {currentTime || '--:--'}
            </span>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-4 w-64 bg-card border border-border shadow-lg z-50"
          >
            {menuItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith('http') ? '_blank' : undefined}
                rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex items-center p-3 hover:bg-muted transition-colors"
                style={{
                  backgroundColor: index % 2 === 0 
                    ? (resolvedTheme === 'dark' ? 'var(--airport-darker-gray)' : 'var(--airport-white)')
                    : (resolvedTheme === 'dark' ? 'var(--airport-dark-gray)' : 'var(--airport-light-gray)')
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="w-8 text-card-foreground font-mono text-sm">
                  {index === 0 ? 'EM' : index === 1 ? 'LI' : index === 2 ? 'CV' : 'IA'}
                </div>
                <div className="flex-1 text-card-foreground font-mono text-sm">
                  {item.label}
                </div>
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}