import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface NearbyClinic {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  distance?: number
  contact_info?: string
  source: 'openstreetmap' | 'supabase'
}

export const useNearbyClinics = () => {
  const [loading, setLoading] = useState(false)
  const [clinics, setClinics] = useState<NearbyClinic[]>([])

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

  const fetchNearbyClinics = async (userLat: number, userLng: number) => {
    setLoading(true)
    try {
      // First try OpenStreetMap
      const query = `
        [out:json];
        (
          node["amenity"="clinic"](around:5000, ${userLat}, ${userLng});
          node["amenity"="hospital"](around:5000, ${userLat}, ${userLng});
          node["healthcare"="clinic"](around:5000, ${userLat}, ${userLng});
        );
        out;
      `
      const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query)
      
      const osmResponse = await fetch(url)
      const osmData = await osmResponse.json()
      
      let nearbyClinicsList: NearbyClinic[] = []
      
      if (osmData.elements && osmData.elements.length > 0) {
        nearbyClinicsList = osmData.elements
          .filter((element: any) => element.tags?.name)
          .map((element: any) => ({
            id: `osm-${element.id}`,
            name: element.tags.name,
            address: element.tags.addr?.street ? 
              `${element.tags.addr.street}${element.tags.addr.housenumber ? ' ' + element.tags.addr.housenumber : ''}` :
              'Address not available',
            latitude: element.lat,
            longitude: element.lon,
            contact_info: element.tags.phone || element.tags.contact?.phone,
            source: 'openstreetmap' as const,
            distance: calculateDistance(userLat, userLng, element.lat, element.lon)
          }))
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      }

      // If no OSM clinics found, fallback to Supabase
      if (nearbyClinicsList.length === 0) {
        const { data: supabaseClinics, error } = await supabase
          .from('clinics')
          .select('*')
        
        if (!error && supabaseClinics) {
          nearbyClinicsList = supabaseClinics
            .map(clinic => ({
              ...clinic,
              source: 'supabase' as const,
              distance: calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude)
            }))
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
        }
      }

      setClinics(nearbyClinicsList)
      return nearbyClinicsList
    } catch (error) {
      console.error('Error fetching nearby clinics:', error)
      toast.error('Unable to fetch nearby clinics')
      
      // Fallback to Supabase clinics
      try {
        const { data: supabaseClinics, error } = await supabase
          .from('clinics')
          .select('*')
        
        if (!error && supabaseClinics) {
          const fallbackClinics = supabaseClinics
            .map(clinic => ({
              ...clinic,
              source: 'supabase' as const,
              distance: calculateDistance(userLat, userLng, clinic.latitude, clinic.longitude)
            }))
            .sort((a, b) => (a.distance || 0) - (b.distance || 0))
          
          setClinics(fallbackClinics)
          return fallbackClinics
        }
      } catch (fallbackError) {
        console.error('Fallback clinic fetch failed:', fallbackError)
      }
      
      return []
    } finally {
      setLoading(false)
    }
  }

  return { fetchNearbyClinics, clinics, loading }
}