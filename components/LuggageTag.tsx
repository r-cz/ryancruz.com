'use client'

import { motion } from 'framer-motion'
import ThemeAwareLogo from './ThemeAwareLogo'

interface LuggageTagProps {
  institution: string
  degree: string
  duration: string
  details?: string[]
  logo?: string
}

export default function LuggageTag({
  institution,
  degree,
  duration,
  details = [],
  logo
}: LuggageTagProps) {
  const hash = institution.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const tagNumber = `${(hash % 9000) + 1000}`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="relative inline-block"
    >
      {/* Simplified card design */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow w-80">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <ThemeAwareLogo company={institution} width={32} height={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-card-foreground">
                {institution}
              </h3>
              <p className="text-sm text-muted-foreground font-mono">
                {duration}
              </p>
            </div>
          </div>
          <div className="text-xs font-mono text-muted-foreground">
            #{tagNumber}
          </div>
        </div>

        {/* Degree */}
        <div className="mb-4">
          <h4 className="text-base font-medium text-card-foreground">
            {degree}
          </h4>
          <div className="h-px bg-border w-12 mt-2"></div>
        </div>

        {/* Details */}
        {details.length > 0 && (
          <div className="space-y-1.5 mb-4">
            {details.map((detail, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                <span className="text-airport-green">✓</span>
                <span>{detail}</span>
              </div>
            ))}
          </div>
        )}

        {/* Status indicator */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="text-xs font-mono text-muted-foreground uppercase">
            EDU • COMPLETE
          </span>
          <div className="flex items-center space-x-1 text-airport-green">
            <div className="w-1.5 h-1.5 bg-airport-green rounded-full"></div>
            <span className="text-xs font-mono">Verified</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}