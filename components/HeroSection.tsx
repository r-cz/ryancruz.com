'use client'

import { motion } from 'framer-motion'
import AirportIcon from './AirportIcon'

export default function HeroSection() {
  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 py-20">
      {/* FAA Sectional Chart Grid Pattern */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.03]">
        {/* Primary grid lines */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`h-${i}`} className="absolute left-0 right-0 h-px bg-current" style={{ top: `${i * 5}%` }} />
          ))}
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={`v-${i}`} className="absolute top-0 bottom-0 w-px bg-current" style={{ left: `${i * 5}%` }} />
          ))}
        </div>
        {/* Major grid lines */}
        <div className="absolute inset-0 opacity-60">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`mh-${i}`} className="absolute left-0 right-0 h-px bg-current" style={{ top: `${i * 20}%` }} />
          ))}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`mv-${i}`} className="absolute top-0 bottom-0 w-px bg-current" style={{ left: `${i * 20}%` }} />
          ))}
        </div>
      </div>

      {/* Radar Sweep Animation */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.08]">
        <motion.div
          className="absolute top-1/2 left-1/2 w-[120vh] h-[120vh] -translate-x-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border border-current opacity-10"></div>
          <div className="absolute top-0 left-1/2 w-px h-1/2 bg-gradient-to-b from-current to-transparent origin-bottom -translate-x-1/2"></div>
        </motion.div>
      </div>

      {/* Navigation Waypoints */}
      <div className="absolute inset-0 overflow-hidden opacity-[0.06]">
        <div className="absolute top-[20%] left-[15%] w-1 h-1 bg-current rounded-full data-flow">
          <div className="absolute -top-3 -left-6 text-xs font-mono">KIAH</div>
        </div>
        <div className="absolute top-[35%] right-[25%] w-1 h-1 bg-current rounded-full data-flow" style={{ animationDelay: '1s' }}>
          <div className="absolute -top-3 -left-6 text-xs font-mono">KDAL</div>
        </div>
        <div className="absolute bottom-[30%] left-[30%] w-1 h-1 bg-current rounded-full data-flow" style={{ animationDelay: '2s' }}>
          <div className="absolute -top-3 -left-6 text-xs font-mono">KAUS</div>
        </div>
        
        {/* Flight path vectors */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M 15 20 Q 50 10 75 35" stroke="currentColor" strokeWidth="0.1" fill="none" strokeDasharray="1,2" />
          <path d="M 30 70 Q 60 50 85 25" stroke="currentColor" strokeWidth="0.1" fill="none" strokeDasharray="1,2" />
        </svg>
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