'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

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
  // Generate a random tag number
  const tagNumber = `EDU${Math.floor(Math.random() * 9000) + 1000}`

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="relative inline-block"
    >
      {/* Strap */}
      <div className="absolute -top-4 left-8 w-16 h-8">
        <div className="w-full h-4 bg-airport-black rounded-t-full" />
        <div className="w-8 h-4 bg-airport-black mx-auto" />
      </div>

      {/* Main tag */}
      <div className="bg-airport-yellow border-2 border-airport-black rounded-lg p-6 shadow-lg min-w-[320px] max-w-md">
        {/* Header with barcode */}
        <div className="border-b-2 border-airport-black pb-4 mb-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-xs font-mono uppercase">Priority</p>
              <p className="text-2xl font-bold">EDUCATION</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono">{tagNumber}</p>
              <div className="bg-airport-black h-8 w-24 flex items-center justify-center mt-1">
                <div className="flex space-x-0.5">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-airport-yellow"
                      style={{
                        width: Math.random() > 0.5 ? '1px' : '2px',
                        height: '24px'
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Destination info */}
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            {logo && (
              <Image
                src={logo}
                alt={`${institution} logo`}
                width={40}
                height={40}
                className="object-contain"
              />
            )}
            <div>
              <p className="text-xs font-mono uppercase">From</p>
              <p className="text-xl font-bold">{institution}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-mono uppercase">Program</p>
            <p className="text-lg font-semibold">{degree}</p>
          </div>

          <div>
            <p className="text-xs font-mono uppercase">Duration</p>
            <p className="font-mono">{duration}</p>
          </div>

          {details.length > 0 && (
            <div>
              <p className="text-xs font-mono uppercase mb-1">Special Handling</p>
              <ul className="space-y-0.5">
                {details.map((detail, index) => (
                  <li key={index} className="text-sm flex items-start">
                    <span className="mr-1">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom stamps */}
        <div className="mt-4 pt-4 border-t-2 border-dashed border-airport-black">
          <div className="flex justify-between items-center">
            <div className="transform -rotate-12">
              <div className="border-2 border-airport-red rounded p-1">
                <p className="text-xs font-bold text-airport-red">VERIFIED</p>
              </div>
            </div>
            <div className="transform rotate-6">
              <div className="border-2 border-airport-green rounded p-1">
                <p className="text-xs font-bold text-airport-green">COMPLETE</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}