import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MapPin, Plus, Calendar, Activity } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface SymptomLog {
  id: string
  symptom: string
  severity: string
  created_at: string
}

interface Clinic {
  id: string
  name: string
  address: string
  latitude: number
  longitude: number
  contact_info: string | null
}

export const SymptomsTab = () => {
  const { user } = useAuth()
  const [symptom, setSymptom] = useState('')
  const [severity, setSeverity] = useState('')
  const [loading, setLoading] = useState(false)
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([])
  const [clinics, setClinics] = useState<Clinic[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearestClinic, setNearestClinic] = useState<Clinic | null>(null)

  useEffect(() => {
    if (user) {
      fetchSymptomLogs()
      fetchClinics()
    }
  }, [user])

  useEffect(() => {
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

  const fetchSymptomLogs = async () => {
    const { data, error } = await supabase
      .from('symptom_logs')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Failed to load symptom logs')
    } else {
      setSymptomLogs(data || [])
    }
  }

  const fetchClinics = async () => {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
    
    if (error) {
      console.error('Error fetching clinics:', error)
    } else {
      setClinics(data || [])
    }
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

  const findNearestClinic = () => {
    if (!userLocation || clinics.length === 0) return null
    
    let nearest = clinics[0]
    let minDistance = calculateDistance(
      userLocation.lat, userLocation.lng,
      nearest.latitude, nearest.longitude
    )
    
    clinics.forEach(clinic => {
      const distance = calculateDistance(
        userLocation.lat, userLocation.lng,
        clinic.latitude, clinic.longitude
      )
      if (distance < minDistance) {
        minDistance = distance
        nearest = clinic
      }
    })
    
    return nearest
  }

  const createReferral = async (clinicId: string) => {
    const { error } = await supabase
      .from('referrals')
      .insert({
        user_id: user?.id,
        clinic_id: clinicId,
        notes: `Auto-referral for high severity symptom: ${symptom}`
      })
    
    if (error) {
      console.error('Error creating referral:', error)
    } else {
      toast.success('Referral created successfully')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !symptom.trim() || !severity) return
    
    setLoading(true)
    
    const { error } = await supabase
      .from('symptom_logs')
      .insert({
        user_id: user.id,
        symptom: symptom.trim(),
        severity
      })
    
    if (error) {
      toast.error('Failed to log symptom')
    } else {
      toast.success('Symptom logged successfully')
      
      // Check if severity is high and handle auto-referral
      if (severity === 'high') {
        const clinic = findNearestClinic()
        if (clinic) {
          setNearestClinic(clinic)
          await createReferral(clinic.id)
          toast.success(`We recommend visiting ${clinic.name}`, {
            description: clinic.address,
            duration: 10000
          })
        }
      }
      
      setSymptom('')
      setSeverity('')
      fetchSymptomLogs()
    }
    setLoading(false)
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-500'
      case 'medium': return 'bg-yellow-500'
      case 'high': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Log New Symptom
          </CardTitle>
          <CardDescription>
            Record your symptoms to track your health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="symptom">Symptom Description</Label>
              <Input
                id="symptom"
                placeholder="Describe your symptom..."
                value={symptom}
                onChange={(e) => setSymptom(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={severity} onValueChange={setSeverity} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Mild discomfort</SelectItem>
                  <SelectItem value="medium">Medium - Moderate discomfort</SelectItem>
                  <SelectItem value="high">High - Severe discomfort</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Logging...' : 'Log Symptom'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {nearestClinic && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              Recommended Clinic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <h4 className="font-semibold">{nearestClinic.name}</h4>
              <p className="text-sm flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {nearestClinic.address}
              </p>
              {nearestClinic.contact_info && (
                <p className="text-sm">📞 {nearestClinic.contact_info}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Based on your high severity symptom, we recommend visiting this nearby clinic.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Symptom History
          </CardTitle>
          <CardDescription>
            Your recent symptom logs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {symptomLogs.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No symptoms logged yet
            </p>
          ) : (
            <div className="space-y-3">
              {symptomLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{log.symptom}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(log.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`${getSeverityColor(log.severity)} text-white capitalize`}>
                    {log.severity}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}