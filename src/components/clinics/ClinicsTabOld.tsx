import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Map as MapIcon, List } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import mapboxgl from 'mapbox-gl'

interface Clinic {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  contact_info: string | null
}

export const ClinicsTab = () => {
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [view, setView] = useState<'list' | 'map'>('list')
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapboxToken, setMapboxToken] = useState('')
  const [showTokenInput, setShowTokenInput] = useState(false)

  useEffect(() => {
    fetchClinics()
    
    // Try to get user location
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          })
        },
        (error) => {
          console.log('Geolocation error:', error)
        }
      )
    }
  }, [])

  useEffect(() => {
    if (view === 'map' && mapboxToken && mapContainer.current && !map.current) {
      initializeMap()
    }
  }, [view, mapboxToken])

  const fetchClinics = async () => {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('name')
    
    if (error) {
      toast.error('Failed to load clinics')
    } else {
      setClinics(data || [])
    }
  }

  const initializeMap = () => {
    if (!mapContainer.current || !mapboxToken) return

    mapboxgl.accessToken = mapboxToken
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [-74.0060, 40.7128],
      zoom: 12
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl())

    // Add user location marker if available
    if (userLocation) {
      new mapboxgl.Marker({ color: 'blue' })
        .setLngLat([userLocation.lng, userLocation.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h4>Your Location</h4>'))
        .addTo(map.current)
    }

    // Add clinic markers
    clinics.forEach(clinic => {
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<h4>${clinic.name}</h4>
         <p>${clinic.address}</p>
         ${clinic.contact_info ? `<p>📞 ${clinic.contact_info}</p>` : ''}`
      )

      new mapboxgl.Marker({ color: 'red' })
        .setLngLat([clinic.longitude, clinic.latitude])
        .setPopup(popup)
        .addTo(map.current!)
    })
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  const clinicsWithDistance = userLocation 
    ? clinics.map(clinic => ({
        ...clinic,
        distance: calculateDistance(
          userLocation.lat, userLocation.lng,
          clinic.latitude, clinic.longitude
        )
      })).sort((a, b) => (a.distance || 0) - (b.distance || 0))
    : clinics

  const handleMapView = () => {
    if (!mapboxToken) {
      setShowTokenInput(true)
      return
    }
    setView('map')
  }

  const handleTokenSubmit = () => {
    if (mapboxToken.trim()) {
      setShowTokenInput(false)
      setView('map')
    } else {
      toast.error('Please enter a valid Mapbox token')
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Healthcare Clinics
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={view === 'list' ? 'default' : 'outline'}
                onClick={() => setView('list')}
              >
                <List className="w-4 h-4" />
                List
              </Button>
              <Button
                size="sm"
                variant={view === 'map' ? 'default' : 'outline'}
                onClick={handleMapView}
              >
                <MapIcon className="w-4 h-4" />
                Map
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            Find and explore healthcare clinics near you
          </CardDescription>
        </CardHeader>
      </Card>

      {showTokenInput && (
        <Card>
          <CardHeader>
            <CardTitle>Mapbox Configuration</CardTitle>
            <CardDescription>
              To view clinics on the map, please enter your Mapbox public token.
              You can get one for free at <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">mapbox.com</a>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter your Mapbox public token..."
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <Button onClick={handleTokenSubmit}>
                Use Token
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'list' ? (
        <Card>
          <CardContent className="p-6">
            {clinicsWithDistance.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No clinics available</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {clinicsWithDistance.map((clinic) => (
                  <div key={clinic.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{clinic.name}</h3>
                      {userLocation && 'distance' in clinic && clinic.distance !== undefined && (
                        <Badge variant="secondary">
                          {(clinic.distance as number).toFixed(1)} km
                        </Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground flex items-start gap-2">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        {clinic.address}
                      </p>
                      
                      {clinic.contact_info && (
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {clinic.contact_info}
                        </p>
                      )}
                      
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline">
                          Get Directions
                        </Button>
                        <Button size="sm" variant="outline">
                          Call Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div ref={mapContainer} className="w-full h-96 rounded-lg" />
          </CardContent>
        </Card>
      )}
    </div>
  )
}