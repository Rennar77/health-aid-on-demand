import { HeroButton } from "@/components/ui/hero-button"
import { Heart, Shield, MapPin, Brain } from "lucide-react"

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-transparent to-green-500/20" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000" />
      
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/20 rounded-full shadow-strong">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            HealthTrack
            <span className="block text-3xl md:text-4xl font-normal mt-2 opacity-90">
              Your Pocket Health Companion
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
            Empowering individuals with immediate access to reliable health insights, 
            AI-powered symptom checking, and nearby medical care recommendations.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <HeroButton variant="hero" size="xl" className="text-lg px-12 py-6">
              Get Started Free
            </HeroButton>
            <HeroButton variant="outline" size="xl" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Learn More
            </HeroButton>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-lg mb-3">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">AI Symptom Checker</h3>
              <p className="text-sm opacity-80">Instant health insights</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-lg mb-3">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">Secure Records</h3>
              <p className="text-sm opacity-80">Private health data</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-lg mb-3">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">Clinic Finder</h3>
              <p className="text-sm opacity-80">Nearby healthcare</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-lg mb-3">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold mb-1">Health Alerts</h3>
              <p className="text-sm opacity-80">Smart reminders</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom wave transition */}
      <div className="absolute bottom-0 w-full">
        <svg className="w-full h-24 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="currentColor"></path>
        </svg>
      </div>
    </section>
  )
}

export default HeroSection