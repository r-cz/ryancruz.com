'use client'

import { motion } from 'framer-motion'
import AirportIcon from './AirportIcon'

export default function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-20">
      {/* Background Pattern - Subtle runway lights */}
      <div className="absolute inset-0 overflow-hidden opacity-5">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-current"></div>
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-current"></div>
      </div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Subtle entrance animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Ryan Cruz
          </h1>
          
          {/* Subtitle with aviation reference */}
          <div className="flex items-center justify-center space-x-3 text-xl md:text-2xl text-muted-foreground mb-8">
            <AirportIcon type="departure" className="w-6 h-6" />
            <span>Senior Cybersecurity Engineer</span>
          </div>
          
          {/* Status Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-airport-green rounded-full animate-pulse"></div>
              <span className="font-mono">ACTIVE</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground opacity-40">
              <span className="font-mono">DAL</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground opacity-40">
              <span className="text-sm">●</span>
              <span className="font-mono">EST. 2018</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}