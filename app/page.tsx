import Header from '@/components/Header'
import BoardingPass from '@/components/BoardingPass'
import LuggageTag from '@/components/LuggageTag'
import AirportIcon from '@/components/AirportIcon'
import HeroSection from '@/components/HeroSection'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

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