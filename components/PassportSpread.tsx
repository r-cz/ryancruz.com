'use client'

interface PassportSpreadProps {
  name?: string
  nationality?: string
  passportNumber?: string
  issueDate?: string
  expiryDate?: string
  issuingAuthority?: string
}

export default function PassportSpread({
  name = "RYAN CRUZ",
  nationality = "USA",
  passportNumber = "SW2018001",
  issueDate = "01 AUG 2018",
  expiryDate = "01 AUG 2028",
  issuingAuthority = "SOUTHWEST AIRLINES"
}: PassportSpreadProps) {
  return (
    <div className="mx-auto rounded-lg shadow-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #2b4c8c 0%, #1e3a6f 100%)',
        width: '480px',
        height: '720px',
      }}
    >
      {/* Two-page spread - vertical stack */}
      <div className="grid grid-rows-2 h-full">
        {/* Top Page - Blank with signature lines */}
        <div className="relative p-6 border-b border-white border-opacity-20"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          }}
        >
          {/* Page number */}
          <div className="absolute top-4 right-4 text-white opacity-30 text-xs font-mono">2</div>
          
          {/* Signature area at bottom */}
          <div className="absolute bottom-8 left-6 right-6">
            <div>
              <p className="text-xs text-white opacity-60 uppercase tracking-wider mb-2">Signature of Bearer</p>
              <div className="border-b border-white border-opacity-30 h-8"></div>
            </div>
          </div>
          
          {/* Watermark-style background text */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <div className="text-white text-6xl font-bold transform rotate-45">
              PASSPORT
            </div>
          </div>
        </div>

        {/* Bottom Page - Main Information */}
        <div className="relative p-7"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.05) 100%)',
          }}
        >
          {/* Gold foil accents */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500 to-transparent opacity-50"></div>
          
          {/* Header */}
          <div className="text-center mb-5">
            <h2 className="text-yellow-400 font-bold text-xl tracking-[0.3em] mb-2 drop-shadow-md">PASSPORT</h2>
            <p className="text-white text-sm font-mono uppercase tracking-[0.2em] opacity-90">
              UNITED STATES OF AMERICA
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-3 gap-5 mt-6">
            {/* Photo */}
            <div className="col-span-1">
              <div className="w-28 h-36 bg-gradient-to-b from-gray-300 to-gray-400 shadow-inner rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/Profile.png" 
                  alt="Ryan Cruz"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Personal Details */}
            <div className="col-span-2 space-y-4">
              {/* Type/Code/Number row */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Type</p>
                  <p className="font-mono text-base font-semibold text-white">P</p>
                </div>
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Code</p>
                  <p className="font-mono text-base font-semibold text-white">{nationality}</p>
                </div>
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Passport No.</p>
                  <p className="font-mono text-base font-semibold text-yellow-400">{passportNumber}</p>
                </div>
              </div>
              
              {/* Name */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Surname</p>
                  <p className="font-mono text-lg font-bold text-white">{name.split(' ')[1] || name}</p>
                </div>
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Given Names</p>
                  <p className="font-mono text-lg font-bold text-white">{name.split(' ')[0] || ''}</p>
                </div>
              </div>
              
              {/* Nationality */}
              <div>
                <p className="text-xs text-white opacity-60 uppercase tracking-wider">Nationality</p>
                <p className="font-mono text-base font-semibold text-white">UNITED STATES OF AMERICA</p>
              </div>
              
              {/* Birth info - REDACTED */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Date of Birth</p>
                  <div className="font-mono text-base bg-black bg-opacity-20 px-3 py-2 rounded inline-block">
                    <span className="text-white opacity-40">██ ███ ████</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Place of Birth</p>
                  <div className="font-mono text-base bg-black bg-opacity-20 px-3 py-2 rounded inline-block">
                    <span className="text-white opacity-40">████████, ███</span>
                  </div>
                </div>
              </div>
              
              {/* Issue/Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Date of Issue</p>
                  <p className="font-mono text-base text-white">{issueDate}</p>
                </div>
                <div>
                  <p className="text-xs text-white opacity-60 uppercase tracking-wider">Date of Expiry</p>
                  <p className="font-mono text-base text-white">{expiryDate}</p>
                </div>
              </div>
              
              {/* Authority */}
              <div>
                <p className="text-xs text-white opacity-60 uppercase tracking-wider">Authority</p>
                <p className="font-mono text-base text-white">{issuingAuthority}</p>
              </div>
            </div>
          </div>

          {/* Professional info bar */}
          <div className="mt-5 pt-4 border-t border-white border-opacity-20">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-white opacity-60 uppercase tracking-wider">Occupation</p>
                <p className="font-mono text-base font-semibold text-yellow-400">CYBERSECURITY ENGINEER</p>
              </div>
              <div>
                <p className="text-xs text-white opacity-60 uppercase tracking-wider">Location</p>
                <p className="font-mono text-base font-semibold text-white">DALLAS, TX</p>
              </div>
            </div>
          </div>

          {/* MRZ Zone */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent">
            <div className="bg-black bg-opacity-40 px-7 py-4 backdrop-blur-sm">
              <div className="font-mono text-sm text-white opacity-90 leading-relaxed tracking-[0.1em]">
                <p>P{'<'}USA{name.replace(' ', '<<').padEnd(39, '<').substring(0, 39)}</p>
                <p>{passportNumber}{'<'}0USAXXXXXX1M{expiryDate.replace(/\s/g, '').substring(2)}1{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}{'<'}06</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}