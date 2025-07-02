'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface FlipCardProps {
  text: string
  delay?: number
}

export default function FlipCard({ text, delay = 0 }: FlipCardProps) {
  const [displayText, setDisplayText] = useState(text)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    if (text !== displayText) {
      setTimeout(() => {
        setIsFlipping(true)
        setTimeout(() => {
          setDisplayText(text)
          setIsFlipping(false)
        }, 150)
      }, delay)
    }
  }, [text, displayText, delay])

  return (
    <div className="relative inline-block">
      <AnimatePresence mode="wait">
        <motion.div
          key={displayText + isFlipping}
          initial={{ rotateX: isFlipping ? -90 : 0 }}
          animate={{ rotateX: 0 }}
          exit={{ rotateX: 90 }}
          transition={{ 
            duration: 0.15,
            ease: "easeInOut"
          }}
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden"
          }}
          className="bg-airport-black text-airport-white font-mono text-inherit border border-airport-gray"
        >
          <div className="px-1 py-0.5">
            {displayText}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}