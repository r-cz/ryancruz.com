'use client'

import { motion } from 'framer-motion'

import Image from 'next/image'

interface BoardingPassProps {
  company: string
  position: string
  duration: string
  description: string[]
  current?: boolean
  logo?: string
}

export default function BoardingPass({
  company,
  position,
  duration,
  description,
  current = false,
  logo
}: BoardingPassProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      {/* Main boarding pass */}
      <div className="bg-card border-2 border-primary rounded-lg overflow-hidden shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Left section - Company info */}
          <div className="md:col-span-2 p-6 md:p-8 border-b-2 md:border-b-0 md:border-r-2 border-dashed border-muted-foreground">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4">
                {logo && (
                  <Image
                    src={logo}
                    alt={`${company} logo`}
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                )}
                <div>
                  <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                    Carrier
                  </div>
                  <h3 className="text-2xl font-bold text-card-foreground">{company}</h3>
                </div>
              </div>
              {current && (
                <div className="bg-airport-green text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                  Current Flight
                </div>
              )}
            </div>

            <div className="mb-4">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Position
              </div>
              <p className="text-lg font-semibold text-card-foreground">{position}</p>
            </div>

            <div className="mb-4">
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                Flight Duration
              </div>
              <p className="font-mono text-card-foreground">{duration}</p>
            </div>

            <div>
              <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
                In-Flight Services
              </div>
              <ul className="space-y-1">
                {description.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-airport-blue mr-2">•</span>
                    <span className="text-sm text-card-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right section - Boarding info */}
          <div className="p-6 md:p-8 bg-muted">
            <div className="space-y-4">
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  Gate
                </div>
                <p className="text-3xl font-bold font-mono text-foreground">
                  {company.substring(0, 2).toUpperCase()}{company === 'Southwest Airlines' ? '54' : company === 'Apple' ? '63' : '42'}
                </p>
              </div>

              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  Seat
                </div>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {company === 'Southwest Airlines' ? '3A' : company === 'Apple' ? '15A' : '12A'}
                </p>
              </div>

              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-1">
                  Group
                </div>
                <p className="text-lg font-bold text-foreground">A</p>
              </div>
            </div>

            {/* Barcode */}
            <div className="mt-6 pt-4 border-t border-muted-foreground">
              <div className="bg-airport-black h-12 flex items-center justify-center">
                <div className="flex space-x-1">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white"
                      style={{
                        width: (company.charCodeAt(i % company.length) % 2) ? '2px' : '4px',
                        height: '32px'
                      }}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs font-mono text-center mt-2 text-muted-foreground">
                {company.toUpperCase().replace(/\s/g, '')}{position.substring(0, 3).toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Perforation effect */}
      <div className="absolute inset-y-0 right-1/3 w-px border-l-2 border-dashed border-muted-foreground opacity-50 hidden md:block" />
    </motion.div>
  )
}