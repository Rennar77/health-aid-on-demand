import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Phone, Navigation, AlertTriangle, List, Map as MapIcon } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNearbyClinics } from '@/hooks/useNearbyClinics'
import { toast } from 'sonner'

interface Clinic {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  contact_info: string | null
  distance?: number
  source: 'openstreetmap' | 'supabase'
}

export const ClinicsTab = () => {
  const { fetchNearbyClinics, clinics: nearbyClinics, loading } = useNearbyClinics()
  const [supabaseClinics, setSupabaseClinics] = useState<Clinic[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loadingLocation, setLoadingLocation] = useState(false)
  const [view, setView] = useState<'directory' | 'nearby'>('directory')

  useEffect(() => {
    fetchSupabaseClinics()
  }, [])

  const fetchSupabaseClinics = async () => {
    try {
      const { data, error } = await supabase
        .from('clinics')
        .select('*')
        .order('name')
      
      if (error) throw error
      
      const transformedClinics = (data || []).map(clinic => ({
        ...clinic,
        source: 'supabase' as const
      }))
      
      setSupabaseClinics(transformedClinics)
    } catch (error) {
      console.error('Error fetching clinics:', error)
      toast.error('Failed to load clinic directory')
    }
  }

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser')
      return
    }

    setLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        }
        setUserLocation(location)
        fetchNearbyClinics(location.lat, location.lng)
        setView('nearby')
        setLoadingLocation(false)
      },
      (error) => {
        console.error('Geolocation error:', error)
        toast.error('Unable to get your location')
        setLoadingLocation(false)
      }
    )
  }

  const displayedClinics = view === 'nearby' ? nearbyClinics : supabaseClinics

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
                variant={view === 'directory' ? 'default' : 'outline'}
                onClick={() => setView('directory')}
              >
                <List className="w-4 h-4" />
                Directory
              </Button>
              <Button
                size="sm"
                variant={view === 'nearby' ? 'default' : 'outline'}
                onClick={getUserLocation}
                disabled={loadingLocation || loading}
              >
                {loadingLocation ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
                Nearby
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            {view === 'nearby' 
              ? 'Find healthcare facilities near your location using real-time data'
              : 'Browse our directory of registered healthcare clinics'
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {view === 'nearby' && nearbyClinics.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <MapIcon className="w-4 h-4" />
              <span className="text-sm font-medium">
                Showing live data from OpenStreetMap - {nearbyClinics.length} clinics found within 5km
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {displayedClinics.length > 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-2">
              {displayedClinics.map((clinic) => (
                <div key={clinic.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg">{clinic.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          clinic.source === 'openstreetmap' 
                            ? 'border-green-300 text-green-700 bg-green-50' 
                            : 'border-gray-300 text-gray-700 bg-gray-50'
                        }`}
                      >
                        {clinic.source === 'openstreetmap' ? 'Live Data' : 'Directory'}
                      </Badge>
                      {clinic.distance && (
                        <Badge variant="secondary" className="text-xs">
                          {clinic.distance.toFixed(1)} km
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{clinic.address}</span>
                    </div>
                    
                    {clinic.contact_info && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span>{clinic.contact_info}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      Get Directions
                    </Button>
                    {clinic.contact_info && (
                      <Button size="sm" variant="outline">
                        Call Now
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            {loading ? (
              <div className="space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-muted-foreground">Searching for nearby clinics...</p>
              </div>
            ) : view === 'nearby' && nearbyClinics.length === 0 && userLocation ? (
              <div className="space-y-4">
                <AlertTriangle className="w-12 h-12 text-yellow-600 mx-auto" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">No Nearby Clinics Found</h3>
                  <p className="text-yellow-700 text-sm mb-4">
                    We couldn't find any clinics within 5km of your location using live data.
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => setView('directory')}
                    className="text-yellow-800 border-yellow-300"
                  >
                    View Directory Instead
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <MapPin className="w-12 h-12 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">
                  {view === 'nearby' 
                    ? 'Click "Nearby" to find clinics near your location'
                    : 'No clinics available in directory'
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}