'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface DepartureBoardProps {
  flight?: string
  destination?: string
  remarks?: string
  time?: string
}

export default function DepartureBoard({ 
  flight = "WN2025",
  destination = "DAL", 
  remarks = "ON TIME"
}: DepartureBoardProps) {
  const [currentTime, setCurrentTime] = useState<string | null>(null)

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

  return (
    <div className="w-full bg-airport-black p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-3 h-3 bg-airport-yellow rounded-full animate-pulse" />
            <span className="text-airport-yellow font-mono text-sm uppercase tracking-wider">
              Departures
            </span>
          </div>
          <span className="text-airport-white font-mono text-sm">
            {currentTime || '--:--'}
          </span>
        </div>

        {/* Main Display */}
        <div className="bg-airport-black border-2 border-airport-yellow p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {/* Flight */}
            <div>
              <div className="text-airport-yellow text-xs font-mono uppercase tracking-wider mb-2">
                Flight
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={flight}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="text-airport-white text-2xl md:text-3xl font-bold tracking-tight"
                >
                  {flight}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Destination */}
            <div>
              <div className="text-airport-yellow text-xs font-mono uppercase tracking-wider mb-2">
                Destination
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={destination}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="text-airport-white text-xl md:text-2xl font-semibold"
                >
                  {destination}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Remarks */}
            <div>
              <div className="text-airport-yellow text-xs font-mono uppercase tracking-wider mb-2">
                Remarks
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={remarks}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  className="text-airport-green text-xl md:text-2xl font-semibold"
                >
                  {remarks}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Info Bar */}
          <div className="mt-6 pt-4 border-t border-airport-gray flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <span className="text-airport-gray text-xs font-mono uppercase">
                Southwest Airlines
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-airport-green rounded-full" />
              <span className="text-airport-green text-xs font-mono uppercase">
                {remarks}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}