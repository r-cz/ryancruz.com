import Image from 'next/image'

interface AirportIconProps {
  type: 'plane' | 'departure' | 'luggage' | 'information' | 'telephone' | 'mail' | 'right-arrow' | 'left-arrow' | 'up-arrow' | 'down-arrow'
  className?: string
}

export default function AirportIcon({ type, className = 'w-6 h-6' }: AirportIconProps) {
  const iconMap = {
    plane: '/icons/ss_24_Air-Transportation.svg',
    departure: '/icons/ss_42_DepartingFlights.svg',
    luggage: '/icons/ss_41_BaggageClaim.svg',
    information: '/icons/ss_22_Information.svg',
    telephone: '/icons/ss_01_Telephone.svg',
    mail: '/icons/ss_02_Mail.svg',
    'right-arrow': '/icons/ss_53_Right-Arrow.svg',
    'left-arrow': '/icons/ss_61_LeftArrow.svg',
    'up-arrow': '/icons/ss_57_UpArrow.svg',
    'down-arrow': '/icons/ss_65_Down-Arrow.svg'
  }

  const iconSrc = iconMap[type]
  
  if (!iconSrc) return null

  return (
    <Image
      src={iconSrc}
      alt={`${type} icon`}
      width={24}
      height={24}
      className={className}
    />
  )
}