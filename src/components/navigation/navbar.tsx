import { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Heart, 
  Menu, 
  X, 
  Activity, 
  MapPin, 
  Calendar, 
  User,
  Bell
} from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import LanguageToggle from "@/components/health/language-toggle"

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = [
    { label: "Dashboard", href: "#dashboard", icon: <Activity className="w-4 h-4" /> },
    { label: "Symptoms", href: "#symptom-checker", icon: <Heart className="w-4 h-4" /> },
    { label: "Clinics", href: "#clinic-finder", icon: <MapPin className="w-4 h-4" /> },
    { label: "Appointments", href: "#appointments", icon: <Calendar className="w-4 h-4" /> }
  ]

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b shadow-soft">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="p-2 gradient-hero rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold">HealthTrack</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 text-foreground hover:text-primary transition-smooth"
              >
                {item.icon}
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageToggle />
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="w-5 h-5" />
            </Button>
            <HeroButton variant="outline" size="sm">
              Sign In
            </HeroButton>
            <HeroButton variant="hero" size="sm">
              Get Started
            </HeroButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-4 space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-3 text-foreground hover:text-primary hover:bg-muted/50 rounded-md transition-smooth"
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon}
                  {item.label}
                </a>
              ))}
              
              <div className="pt-4 space-y-2">
                <LanguageToggle />
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <HeroButton variant="outline" size="sm" className="w-full">
                    Sign In
                  </HeroButton>
                  <HeroButton variant="hero" size="sm" className="w-full">
                    Get Started
                  </HeroButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar