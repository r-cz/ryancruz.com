import DepartureBoard from '@/components/DepartureBoard'
import BoardingPass from '@/components/BoardingPass'
import LuggageTag from '@/components/LuggageTag'
import AirportIcon from '@/components/AirportIcon'
import Passport from '@/components/Passport'
import ThemeToggle from '@/components/ThemeToggle'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Departure Board */}
      <DepartureBoard headerSlot={<ThemeToggle />} />
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section - Passport */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <div className="inline-block mb-6">
              <div className="airport-sign px-6 py-3 text-sm">
                <span className="flex items-center space-x-2">
                  <AirportIcon type="plane" className="w-4 h-4 brightness-0 invert" />
                  <span>Identity Verification</span>
                </span>
              </div>
            </div>
          </div>
          <Passport />
        </section>

        {/* Work Experience Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold flex items-center space-x-3">
              <AirportIcon type="departure" className="w-8 h-8" />
              <span>Flight History</span>
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
              logo="/images/LUV.svg"
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
              logo="/images/apple-light.svg"
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
              <AirportIcon type="luggage" className="w-8 h-8" />
              <span>Baggage Claim</span>
            </h2>
            <p className="text-airport-gray mt-2">Education & certifications collected</p>
          </div>

          {/* Education Cards */}
          <div className="flex flex-wrap gap-8 justify-center md:justify-start">
            <LuggageTag
              institution="University of Georgia"
              degree="Bachelor of Computer Systems Engineering"
              duration="2014 - 2018"
              logo="/images/uni.svg"
              details={[
                "Zell Miller Scholarship",
                "Presidential Scholar",
                "Certificate in Emerging Engineering Leaders Development Program"
              ]}
            />
          </div>
        </section>

        {/* Contact Section */}
        <section className="mb-16">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold flex items-center justify-center space-x-3">
              <span className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center text-lg font-bold">?</span>
              <span>Information</span>
            </h2>
          </div>

          {/* Contact Cards - Departure Board Style */}
          <div className="flex flex-wrap gap-6 justify-center">
            <a 
              href="mailto:mail@ryancruz.com" 
              className="bg-airport-black text-airport-white p-6 md:p-8 border-2 border-airport-yellow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center space-x-4">
                <AirportIcon type="mail" className="w-8 h-8 brightness-0 invert" />
                <div>
                  <div className="text-airport-yellow text-xs font-mono uppercase tracking-wider mb-2">Contact</div>
                  <div className="text-xl font-bold">Email</div>
                  <div className="font-mono text-sm mt-1">mail@ryancruz.com</div>
                </div>
              </div>
            </a>
            
            <a 
              href="https://linkedin.com/in/cruzryan" 
              className="bg-airport-black text-airport-white p-6 md:p-8 border-2 border-airport-yellow hover:shadow-lg transition-shadow"
              target="_blank"
              rel="noopener noreferrer"
            >
              <div className="flex items-center space-x-4">
                <AirportIcon type="up-right-arrow" className="w-8 h-8 brightness-0 invert" />
                <div>
                  <div className="text-airport-yellow text-xs font-mono uppercase tracking-wider mb-2">Connect</div>
                  <div className="text-xl font-bold">LinkedIn</div>
                  <div className="font-mono text-sm mt-1">linkedin.com/in/cruzryan</div>
                </div>
              </div>
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-airport-black text-airport-white py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-mono text-sm">
            © 2025 Ryan Cruz. All flights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}