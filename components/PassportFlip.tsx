'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import PassportCover from './PassportCover'
import PassportSpread from './PassportSpread'

export default function PassportFlip() {
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Track scroll progress within the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  })
  
  // Rotation: from 0 to 90 degrees (portrait to landscape)
  const rotation = useTransform(scrollYProgress, [0, 0.6], [0, 90])
  
  // Scale for the opening effect
  const scale = useTransform(scrollYProgress, [0.4, 1], [1, 1.05])
  
  // Opacity transitions
  const coverOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6], [1, 1, 0])
  const spreadOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1])
  
  return (
    <div ref={containerRef} className="h-[180vh] relative">
      {/* Sticky container for the passport */}
      <div className="sticky top-0 h-screen flex items-center justify-center px-4">
        <motion.div
          style={{
            rotate: rotation,
            scale: scale,
          }}
          className="relative flex items-center justify-center"
        >
          {/* Passport Cover (Portrait) */}
          <motion.div
            style={{ opacity: coverOpacity }}
            className="flex items-center justify-center"
          >
            <PassportCover />
          </motion.div>
          
          {/* Passport Spread (Landscape) */}
          <motion.div
            style={{ 
              opacity: spreadOpacity,
              rotate: -90, // Counter-rotate to make it appear normal when parent rotates 90
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          >
            <PassportSpread />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}