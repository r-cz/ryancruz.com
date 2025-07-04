'use client'

export default function PassportCover() {
  return (
    <div className="w-80 h-112 mx-auto rounded-lg shadow-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #1a1a5c 0%, #0f0f3d 100%)',
        width: '320px',
        height: '448px',
      }}
    >
      {/* Cover Design */}
      <div className="relative h-full p-8 md:p-10 flex flex-col justify-center items-center"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.1) 100%)',
        }}
      >
        {/* Title */}
        <h1 className="text-white font-bold text-3xl tracking-[0.3em] mb-8 drop-shadow-lg" style={{ fontFamily: 'Minion Pro, serif', filter: 'brightness(0) saturate(100%) invert(83%) sepia(65%) saturate(348%) hue-rotate(5deg) brightness(100%) contrast(97%)' }}>
          PASSPORT
        </h1>
        
        {/* USA Seal */}
        <div className="w-24 h-24 mb-8 flex items-center justify-center">
          <img 
            src="/seal.svg" 
            alt="US Seal" 
            className="w-full h-full"
            style={{ filter: 'brightness(0) saturate(100%) invert(83%) sepia(65%) saturate(348%) hue-rotate(5deg) brightness(100%) contrast(97%)' }}
          />
        </div>
        
        {/* Country */}
        <p className="text-white text-lg tracking-tight mb-4 italic font-bold" style={{ fontFamily: 'Minion Pro, serif', filter: 'brightness(0) saturate(100%) invert(83%) sepia(65%) saturate(348%) hue-rotate(5deg) brightness(100%) contrast(97%)' }}>
          United States
        </p>
        <p className="text-white text-lg tracking-tight mb-8 italic font-bold" style={{ fontFamily: 'Minion Pro, serif', filter: 'brightness(0) saturate(100%) invert(83%) sepia(65%) saturate(348%) hue-rotate(5deg) brightness(100%) contrast(97%)' }}>
          of America
        </p>
        
        {/* E-chip symbol */}
        <div className="flex items-center justify-center mb-4">
          <img 
            src="/icons/EPassport_logo.svg" 
            alt="E-Passport Chip Symbol" 
            className="w-12 h-8"
            style={{ filter: 'brightness(0) saturate(100%) invert(83%) sepia(65%) saturate(348%) hue-rotate(5deg) brightness(100%) contrast(97%)' }}
          />
        </div>
      </div>
    </div>
  )
}