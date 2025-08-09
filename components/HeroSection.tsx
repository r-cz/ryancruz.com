'use client'

import { motion } from 'framer-motion'
import AirportIcon from './AirportIcon'

export default function HeroSection() {
  return (
    <section className="relative z-10 min-h-[60vh] flex items-center justify-center px-4 py-20">
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Subtle entrance animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            RYAN CRUZ
          </h1>
          
          {/* Subtitle with aviation reference */}
          <div className="flex items-center justify-center space-x-3 text-xl md:text-2xl text-muted-foreground opacity-60 mb-8">
            <span>CYBERSECURITY ENGINEER</span>
          </div>
          
        </motion.div>
      </div>
    </section>
  )
}