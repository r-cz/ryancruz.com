import DepartureBoard from '@/components/DepartureBoard'
import BoardingPass from '@/components/BoardingPass'
import LuggageTag from '@/components/LuggageTag'
import AirportIcon from '@/components/AirportIcon'
import AppleLogo from '@/components/AppleLogo'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header - Departure Board */}
      <DepartureBoard />
      
      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="mb-16 text-center">
          <div className="inline-block mb-6">
            <div className="airport-sign px-6 py-3 text-sm">
              <span className="flex items-center space-x-2">
                <AirportIcon type="plane" className="w-4 h-4 brightness-0 invert" />
                <span>Now Boarding</span>
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome Aboard
          </h1>
          <p className="text-xl text-airport-gray max-w-4xl mx-auto leading-relaxed">
            Cybersecurity Engineer with 6 years of experience. Currently building a CIAM solution 
            for Southwest Airlines. Working hybrid from Dallas, Texas.
          </p>
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
          <div className="mb-8">
            <h2 className="text-3xl font-bold flex items-center space-x-3">
              <AirportIcon type="telephone" className="w-8 h-8" />
              <span>Ground Control</span>
            </h2>
            <p className="text-airport-gray mt-2">Get in touch</p>
          </div>

          <div className="bg-airport-black text-airport-white p-8 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start space-x-3">
                <AirportIcon type="right-arrow" className="w-6 h-6 mt-1 brightness-0 invert" />
                <div>
                  <p className="text-airport-yellow text-xs font-mono uppercase mb-2">Location</p>
                  <p className="text-lg">Dallas, Texas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AirportIcon type="plane" className="w-6 h-6 mt-1 brightness-0 invert" />
                <div>
                  <p className="text-airport-yellow text-xs font-mono uppercase mb-2">Current Gate</p>
                  <p className="text-lg">Southwest Airlines</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <AirportIcon type="up-arrow" className="w-6 h-6 mt-1 brightness-0 invert" />
                <div>
                  <p className="text-airport-yellow text-xs font-mono uppercase mb-2">Status</p>
                  <p className="text-lg text-airport-green">Available for boarding</p>
                </div>
              </div>
            </div>
            
            {/* Contact methods */}
            <div className="mt-8 pt-6 border-t border-airport-gray">
              <div className="flex flex-wrap gap-6 justify-center">
                <a href="mailto:ryan@ryancruz.com" className="flex items-center space-x-2 hover:text-airport-yellow transition-colors">
                  <AirportIcon type="mail" className="w-5 h-5 brightness-0 invert" />
                  <span className="font-mono text-sm">Email</span>
                </a>
                <a href="tel:+1234567890" className="flex items-center space-x-2 hover:text-airport-yellow transition-colors">
                  <AirportIcon type="telephone" className="w-5 h-5 brightness-0 invert" />
                  <span className="font-mono text-sm">Phone</span>
                </a>
              </div>
            </div>
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