'use client'

import { motion } from 'framer-motion'
import AirportIcon from './AirportIcon'
import ThemeAwareLogo from './ThemeAwareLogo'

interface BoardingPassProps {
  company: string
  position: string
  duration: string
  description: string[]
  current?: boolean
}

export default function BoardingPass({
  company,
  position,
  duration,
  description,
  current = false
}: BoardingPassProps) {
  const isApple = company === 'Apple'
  const isSouthwest = company === 'Southwest Airlines'
  
  const companyFontClass = isApple 
    ? 'font-[SF_Pro_Display]' 
    : isSouthwest 
    ? 'font-[Southwest_Sans]' 
    : ''

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative group"
    >
      {/* Simplified card design */}
      <div className="bg-card border-l-4 border-l-primary/20 border-r border-t border-b border-border rounded-lg hover:shadow-lg transition-shadow">
        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center">
                <ThemeAwareLogo company={company} width={40} height={40} />
              </div>
              <div>
                <h3 className={`text-xl font-semibold text-card-foreground ${companyFontClass}`}>
                  {company}
                </h3>
                <p className="text-sm text-muted-foreground font-mono">
                  {duration}
                </p>
              </div>
            </div>
            {current && (
              <div className="flex items-center space-x-1 text-airport-green">
                <div className="w-2 h-2 bg-airport-green rounded-full animate-pulse"></div>
                <span className="text-xs font-mono uppercase">Active</span>
              </div>
            )}
          </div>

          {/* Position */}
          <div className="mb-6">
            <h4 className="text-lg font-medium text-card-foreground mb-1">
              {position}
            </h4>
            <div className="h-px bg-border w-16"></div>
          </div>

          {/* Key Achievements */}
          <div className="space-y-2">
            {description.map((item, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm text-muted-foreground">
                <AirportIcon type="right-arrow" className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
                <span>{item}</span>
              </div>
            ))}
          </div>

          {/* Subtle flight reference */}
          <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono aviation-theming">
            <span>FLT {company.substring(0, 2).toUpperCase()}{company === 'Southwest Airlines' ? '737' : '747'}</span>
            <span>EXP • ENGINEERING</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}