import { useEffect, useRef, useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Clock, Star, Navigation } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

interface Clinic {
  id: string
  name: string
  address: string
  phone: string
  rating: number
  distance: string
  hours: string
  specialties: string[]
  coordinates: [number, number]
}

const ClinicFinder = () => {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapboxToken, setMapboxToken] = useState("")
  const [location, setLocation] = useState("")
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null)

  // Mock clinic data
  const mockClinics: Clinic[] = [
    {
      id: "1",
      name: "City Medical Center",
      address: "123 Health Street, Medical District",
      phone: "+1 (555) 123-4567",
      rating: 4.8,
      distance: "0.5 miles",
      hours: "24/7 Emergency Care",
      specialties: ["Emergency Care", "General Medicine", "Cardiology"],
      coordinates: [-74.006, 40.7128]
    },
    {
      id: "2", 
      name: "Family Health Clinic",
      address: "456 Wellness Ave, Downtown",
      phone: "+1 (555) 234-5678",
      rating: 4.6,
      distance: "1.2 miles",
      hours: "Mon-Fri: 8AM-6PM, Sat: 9AM-3PM",
      specialties: ["Family Medicine", "Pediatrics", "Women's Health"],
      coordinates: [-74.002, 40.7589]
    },
    {
      id: "3",
      name: "Urgent Care Plus",
      address: "789 Care Blvd, Midtown", 
      phone: "+1 (555) 345-6789",
      rating: 4.4,
      distance: "1.8 miles",
      hours: "Daily: 7AM-11PM",
      specialties: ["Urgent Care", "X-Ray", "Lab Services"],
      coordinates: [-73.991, 40.7505]
    }
  ]

  const searchClinics = async () => {
    setIsLoading(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setClinics(mockClinics)
    setIsLoading(false)
    
    // Initialize map with clinics if token is provided
    if (mapboxToken && mapContainer.current && !map.current) {
      initializeMap()
    }
  }

  const initializeMap = () => {
    if (!mapboxToken || !mapContainer.current) return

    mapboxgl.accessToken = mapboxToken
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-74.006, 40.7128], // NYC coordinates
      zoom: 12,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Add clinic markers
    clinics.forEach((clinic) => {
      if (map.current) {
        const marker = new mapboxgl.Marker({
          color: '#3B82F6',
        })
        .setLngLat(clinic.coordinates)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h4 class="font-semibold">${clinic.name}</h4>
                <p class="text-sm text-gray-600">${clinic.address}</p>
                <p class="text-sm">${clinic.phone}</p>
              </div>
            `)
        )
        .addTo(map.current)
      }
    })
  }

  useEffect(() => {
    return () => {
      map.current?.remove()
    }
  }, [])

  const getSpecialtyColor = (specialty: string) => {
    const colors: Record<string, string> = {
      "Emergency Care": "bg-red-100 text-red-800 border-red-200",
      "General Medicine": "bg-blue-100 text-blue-800 border-blue-200", 
      "Cardiology": "bg-purple-100 text-purple-800 border-purple-200",
      "Family Medicine": "bg-green-100 text-green-800 border-green-200",
      "Pediatrics": "bg-yellow-100 text-yellow-800 border-yellow-200",
      "Women's Health": "bg-pink-100 text-pink-800 border-pink-200",
      "Urgent Care": "bg-orange-100 text-orange-800 border-orange-200",
      "X-Ray": "bg-gray-100 text-gray-800 border-gray-200",
      "Lab Services": "bg-indigo-100 text-indigo-800 border-indigo-200"
    }
    return colors[specialty] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-3 gradient-hero rounded-full">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Nearby Healthcare</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Locate medical facilities, clinics, and healthcare providers in your area 
              with real-time availability and ratings.
            </p>
          </div>

          {/* Map Token Input (for demo purposes) */}
          {!mapboxToken && (
            <Card className="p-6 mb-8 border-dashed border-2">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Enter Your Mapbox Token</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  To enable interactive maps, please enter your Mapbox public token. 
                  Get one free at <a href="https://mapbox.com" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">mapbox.com</a>
                </p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <Input
                    placeholder="pk.eyJ1IjoieW91ci11c2VybmFtZSIs..."
                    value={mapboxToken}
                    onChange={(e) => setMapboxToken(e.target.value)}
                  />
                  <Button onClick={() => mapboxToken && initializeMap()}>
                    Enable Map
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Search */}
          <Card className="shadow-medium p-6 mb-8">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-2">
                  Your Location
                </label>
                <Input
                  placeholder="Enter your address, zip code, or city"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              <HeroButton
                variant="medical"
                size="lg"
                onClick={searchClinics}
                disabled={isLoading}
                className="px-8"
              >
                {isLoading ? "Searching..." : "Find Clinics"}
              </HeroButton>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Clinic List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Healthcare Facilities</h3>
              {clinics.length === 0 ? (
                <Card className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Enter your location to find nearby healthcare facilities
                  </p>
                </Card>
              ) : (
                clinics.map((clinic) => (
                  <Card 
                    key={clinic.id} 
                    className={`p-4 cursor-pointer transition-smooth hover:shadow-medium ${
                      selectedClinic?.id === clinic.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedClinic(clinic)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="text-lg font-semibold">{clinic.name}</h4>
                        <p className="text-muted-foreground text-sm">{clinic.address}</p>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span>{clinic.rating}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="w-4 h-4" />
                        {clinic.phone}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Navigation className="w-4 h-4" />
                        {clinic.distance}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {clinic.hours}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-4">
                      {clinic.specialties.map((specialty) => (
                        <Badge 
                          key={specialty} 
                          variant="outline"
                          className={`text-xs ${getSpecialtyColor(specialty)}`}
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Navigation className="w-4 h-4 mr-2" />
                        Directions
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Map */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Map View</h3>
              <Card className="h-96 lg:h-full min-h-[400px] overflow-hidden">
                {mapboxToken ? (
                  <div ref={mapContainer} className="w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full bg-muted">
                    <div className="text-center">
                      <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        Interactive map will appear here after entering Mapbox token
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ClinicFinder