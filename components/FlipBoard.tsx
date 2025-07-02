'use client'

import { useState, useEffect } from 'react'
import FlipCard from './FlipCard'

interface FlipBoardProps {
  text: string
  className?: string
}

export default function FlipBoard({ text, className = '' }: FlipBoardProps) {
  const [displayText, setDisplayText] = useState(text)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (text !== displayText && !animating) {
      setAnimating(true)
      
      // Animate each character with a delay
      const maxLength = Math.max(text.length, displayText.length)
      const paddedOld = displayText.padEnd(maxLength, ' ')
      const paddedNew = text.padEnd(maxLength, ' ')
      
      let currentText = paddedOld
      
      for (let i = 0; i < maxLength; i++) {
        if (paddedOld[i] !== paddedNew[i]) {
          setTimeout(() => {
            currentText = currentText.substring(0, i) + paddedNew[i] + currentText.substring(i + 1)
            setDisplayText(currentText.trimEnd())
            
            if (i === maxLength - 1) {
              setTimeout(() => setAnimating(false), 100)
            }
          }, i * 50)
        }
      }
    }
  }, [text, displayText, animating])

  return (
    <div className={`flex space-x-0.5 ${className}`}>
      {displayText.split('').map((char, index) => (
        <FlipCard
          key={`${index}-${char}`}
          text={char === ' ' ? '\u00A0' : char}
          delay={index * 10}
        />
      ))}
    </div>
  )
}