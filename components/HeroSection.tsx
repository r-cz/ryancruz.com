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
            Ryan Cruz
          </h1>
          
          {/* Subtitle with aviation reference */}
          <div className="flex items-center justify-center space-x-3 text-xl md:text-2xl text-muted-foreground opacity-60 mb-8">
            <AirportIcon type="departure" className="w-6 h-6" />
            <span>Senior Cybersecurity Engineer</span>
          </div>
          
          {/* FAA-Style Status Data Blocks */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            {/* Primary Status Block */}
            <div className="flex items-center space-x-3 border border-muted-foreground/10 px-3 py-1.5 rounded-sm bg-background/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-airport-green rounded-full animate-pulse shadow-green-500/50 shadow-sm"></div>
              <div className="font-mono text-xs">
                <div className="text-foreground">RCZ001</div>
                <div className="text-muted-foreground opacity-40 text-[10px] leading-tight">ACTIVE</div>
              </div>
            </div>
            
            {/* Location Block */}
            <div className="flex items-center space-x-2 font-mono text-xs text-muted-foreground opacity-30">
              <div className="w-1 h-1 bg-current rounded-full"></div>
              <div>
                <div>32°46&apos;N</div>
                <div className="text-[10px] opacity-60">96°48&apos;W</div>
              </div>
            </div>
            
            {/* Operational Data */}
            <div className="flex items-center space-x-4 font-mono text-xs text-muted-foreground opacity-30">
              <div className="text-center">
                <div>FL350</div>
                <div className="text-[10px] opacity-60">ALT</div>
              </div>
              <div className="w-px h-4 bg-current opacity-20"></div>
              <div className="text-center">
                <div>EST18</div>
                <div className="text-[10px] opacity-60">YRS</div>
              </div>
            </div>
            
            {/* Squawk Code */}
            <div className="font-mono text-xs text-muted-foreground opacity-20">
              <div className="flex items-center space-x-1">
                <div className="w-1 h-1 bg-airport-yellow rounded-full"></div>
                <span>7700</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}