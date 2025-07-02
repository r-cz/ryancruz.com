'use client'

import { motion } from 'framer-motion'
import AirportIcon from './AirportIcon'

interface PassportProps {
  name?: string
  nationality?: string
  dateOfBirth?: string
  placeOfBirth?: string
  passportNumber?: string
  issueDate?: string
  expiryDate?: string
  issuingAuthority?: string
}

export default function Passport({
  name = "RYAN CRUZ",
  nationality = "USA",
  dateOfBirth = "14 JUL 1996",
  placeOfBirth = "GEORGIA, USA",
  passportNumber = "SW2018001",
  issueDate = "01 AUG 2018",
  expiryDate = "01 AUG 2028",
  issuingAuthority = "SOUTHWEST AIRLINES"
}: PassportProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto bg-gradient-to-b from-blue-900 to-blue-800 text-white p-6 md:p-8 rounded-lg shadow-2xl border-2 border-gold-400"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #1d4ed8 100%)',
        borderColor: '#d4af37',
        aspectRatio: '1.4 / 1'
      }}
    >
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <AirportIcon type="plane" className="w-5 h-5 text-yellow-400" />
          <h2 className="text-yellow-400 font-bold text-lg tracking-wider">PASSPORT</h2>
        </div>
        <p className="text-yellow-200 text-xs font-mono uppercase tracking-widest">
          UNITED STATES OF AMERICA
        </p>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Photo and Basic Info */}
        <div className="space-y-4">
          <div className="flex space-x-4">
            <div className="w-24 h-32 border-2 border-white overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/images/Profile.png" 
                alt="Ryan Cruz"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Type</p>
                <p className="font-mono text-sm">P</p>
              </div>
              <div>
                <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Code</p>
                <p className="font-mono text-sm">{nationality}</p>
              </div>
              <div>
                <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Passport No.</p>
                <p className="font-mono text-sm font-bold">{passportNumber}</p>
              </div>
            </div>
          </div>

          {/* Professional Info */}
          <div className="pt-4 border-t border-yellow-200 border-opacity-30">
            <div className="text-center">
              <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Current Position</p>
              <p className="font-mono text-sm font-bold">CYBERSECURITY ENGINEER</p>
              <p className="text-yellow-200 text-xs mt-1">Dallas, Texas</p>
            </div>
          </div>
        </div>

        {/* Right Column - Personal Details */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Surname</p>
              <p className="font-mono text-sm font-bold">{name.split(' ')[1] || name}</p>
            </div>
            <div>
              <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Given Names</p>
              <p className="font-mono text-sm font-bold">{name.split(' ')[0] || ''}</p>
            </div>
          </div>
          
          <div>
            <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Nationality</p>
            <p className="font-mono text-sm">{nationality}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Date of Birth</p>
              <p className="font-mono text-sm">{dateOfBirth}</p>
            </div>
            <div>
              <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Sex</p>
              <p className="font-mono text-sm">M</p>
            </div>
          </div>
          
          <div>
            <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Place of Birth</p>
            <p className="font-mono text-sm">{placeOfBirth}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Date of Issue</p>
              <p className="font-mono text-sm">{issueDate}</p>
            </div>
            <div>
              <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Date of Expiry</p>
              <p className="font-mono text-sm">{expiryDate}</p>
            </div>
          </div>
          
          <div>
            <p className="text-yellow-200 text-xs font-mono uppercase mb-1">Authority</p>
            <p className="font-mono text-sm">{issuingAuthority}</p>
          </div>
        </div>
      </div>

      {/* MRZ-style bottom section */}
      <div className="mt-4 bg-black bg-opacity-30 p-2 rounded text-xs font-mono leading-tight">
        <p>P&lt;USA{name.replace(' ', '&lt;&lt;').padEnd(39, '&lt;').substring(0, 39)}</p>
        <p>{passportNumber}0USA{dateOfBirth.replace(/\s/g, '')}M{expiryDate.replace(/\s/g, '')}0&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;</p>
      </div>
    </motion.div>
  )
}