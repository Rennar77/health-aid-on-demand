import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, MapPin, Plus, Calendar, Activity, Brain, Stethoscope, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useAIAdvice } from '@/hooks/useAIAdvice'
import { useNearbyClinics } from '@/hooks/useNearbyClinics'
import { usePayments } from '@/hooks/usePayments'
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
  const { getAIAdvice, advice, loading: aiLoading } = useAIAdvice()
  const { fetchNearbyClinics, clinics: nearbyClinics, loading: clinicsLoading } = useNearbyClinics()
  const { createPayment, loading: paymentLoading } = usePayments()
  
  const [symptom, setSymptom] = useState('')
  const [severity, setSeverity] = useState('')
  const [loading, setLoading] = useState(false)
  const [symptomLogs, setSymptomLogs] = useState<SymptomLog[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [showPremiumAdvice, setShowPremiumAdvice] = useState(false)

  useEffect(() => {
    if (user) {
      fetchSymptomLogs()
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

  const handlePremiumPayment = async () => {
    const result = await createPayment(9.99) // $9.99 for premium advice
    if (result?.checkoutUrl) {
      window.open(result.checkoutUrl, '_blank')
      toast.success('Redirecting to payment...')
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

  const findNearestClinics = async () => {
    if (!userLocation) return []
    
    const clinics = await fetchNearbyClinics(userLocation.lat, userLocation.lng)
    return clinics.slice(0, 3) // Return top 3 nearest clinics
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
    
    try {
      // Log symptom first
      const { error } = await supabase
        .from('symptom_logs')
        .insert({
          user_id: user.id,
          symptom: symptom.trim(),
          severity
        })
      
      if (error) throw error
      
      toast.success('Symptom logged successfully')
      
      // Get AI advice
      const aiAdvice = await getAIAdvice(symptom, severity)
      
      // If severity is high or AI suggests urgency, find nearby clinics
      if (severity === 'high' || aiAdvice?.isUrgent) {
        if (userLocation) {
          const clinics = await findNearestClinics()
          if (clinics.length > 0) {
            // Auto-create referral for nearest clinic
            await createReferral(clinics[0].id)
            toast.success(`Referral created for ${clinics[0].name}`, {
              description: `${clinics[0].distance?.toFixed(1)}km away`,
              duration: 8000
            })
          }
        }
      }
      
      setSymptom('')
      setSeverity('')
      fetchSymptomLogs()
    } catch (error) {
      toast.error('Failed to log symptom')
    } finally {
      setLoading(false)
    }
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

      {advice && (
        <Card className={`${advice.isUrgent ? 'border-red-200 bg-red-50' : 'border-blue-200 bg-blue-50'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${advice.isUrgent ? 'text-red-800' : 'text-blue-800'}`}>
              <Brain className="w-5 h-5" />
              AI Health Advice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm">{advice.advice}</p>
              
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Next Steps:</h5>
                <ul className="text-sm space-y-1">
                  {advice.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-xs mt-1">•</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {advice.isUrgent && nearbyClinics.length > 0 && (
                <div className="mt-4 p-3 bg-white rounded-lg border">
                  <h5 className="font-semibold text-sm mb-2 flex items-center gap-1">
                    <Stethoscope className="w-4 h-4" />
                    Nearby Clinics
                  </h5>
                  <div className="space-y-2">
                    {nearbyClinics.slice(0, 2).map(clinic => (
                      <div key={clinic.id} className="text-xs p-2 bg-gray-50 rounded">
                        <p className="font-medium">{clinic.name}</p>
                        <p className="text-muted-foreground">{clinic.address}</p>
                        <p className="text-blue-600">{clinic.distance?.toFixed(1)}km away</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPremiumAdvice(true)}
                  className="flex items-center gap-1"
                >
                  <CreditCard className="w-3 h-3" />
                  Get Premium Advice ($9.99)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {showPremiumAdvice && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <CreditCard className="w-5 h-5" />
              Premium Health Advice
            </CardTitle>
            <CardDescription>
              Get detailed medical insights and personalized recommendations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <h5 className="font-semibold mb-2">Premium features include:</h5>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Detailed symptom analysis</li>
                  <li>• Personalized treatment recommendations</li>
                  <li>• Risk assessment and prevention tips</li>
                  <li>• 24/7 AI health assistant access</li>
                </ul>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePremiumPayment}
                  disabled={paymentLoading}
                  className="flex items-center gap-1"
                >
                  {paymentLoading ? 'Processing...' : 'Pay $9.99'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPremiumAdvice(false)}
                >
                  Cancel
                </Button>
              </div>
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