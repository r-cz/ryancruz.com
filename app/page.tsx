import Header from '@/components/Header'
import BoardingPass from '@/components/BoardingPass'
import LuggageTag from '@/components/LuggageTag'
import AirportIcon from '@/components/AirportIcon'
import HeroSection from '@/components/HeroSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* KDAL Airport Diagram Background - Full page */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Light mode - standard black SVG with higher opacity */}
        <div 
          className="absolute inset-0 dark:hidden opacity-[0.08]"
          style={{
            backgroundImage: 'url(/kdal.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            filter: 'contrast(1.1) brightness(0.3)'
          }}
        />
        {/* Dark mode - inverted SVG with lower opacity */}
        <div 
          className="absolute inset-0 hidden dark:block opacity-[0.04]"
          style={{
            backgroundImage: 'url(/kdal.svg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            backgroundRepeat: 'no-repeat',
            filter: 'invert(1) contrast(0.8) brightness(1.2)'
          }}
        />
        {/* Gradient overlay for depth - more subtle */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-background/15" />
      </div>

      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Work Experience Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold flex items-center space-x-3">
              <span>History</span>
              <AirportIcon type="right-arrow" className="w-6 h-6" />
            </h2>
            <p className="text-airport-gray mt-2">Professional journey & experience</p>
          </div>

          {/* Work Experience Cards */}
          <div className="space-y-8">
            <BoardingPass
              company="Southwest Airlines"
              position="Senior Cybersecurity Engineer"
              duration="Aug 2018 - Present"
              current={true}
              description={[
                "Building a modern Identity solution for 100M+ Southwest.com customers",
                "Previously migrated a legacy login solution for the Enterprise to a new Identity Provider",
                "Enabled 70,000+ employees with SSO and MFA across hundreds of onboarded applications"
              ]}
            />
            
            <BoardingPass
              company="Apple"
              position="Mac+ Technical Advisor"
              duration="Jul 2016 - May 2018"
              description={[
                "Provided technical support for all mobile and desktop Apple devices",
                "Specialized in Apple Account and iCloud services troubleshooting",
                "Maintained high customer satisfaction ratings in fast-paced environment"
              ]}
            />
          </div>
        </section>

        {/* Education Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold flex items-center space-x-3">
              <span>Education</span>
            </h2>
            <p className="text-airport-gray mt-2">Education & certifications collected</p>
          </div>

          {/* Education Cards */}
          <div className="flex flex-wrap gap-8 justify-center">
            <LuggageTag
              institution="University of Georgia"
              degree="Bachelor of Computer Systems Engineering"
              duration="2014 - 2018"
              details={[
                "Zell Miller Scholarship",
                "Presidential Scholar",
                "Certificate in Emerging Engineering Leaders Development Program"
              ]}
            />
          </div>
        </section>

      </main>
    </div>
  )
}