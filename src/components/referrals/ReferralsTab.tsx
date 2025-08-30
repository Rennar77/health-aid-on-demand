import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MapPin, UserPlus, Calendar, Building2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface Referral {
  id: string
  notes: string | null
  created_at: string
  clinics: {
    name: string
    address: string
    contact_info: string | null
  }
}

interface Clinic {
  id: string
  name: string
  address: string
  contact_info: string | null
}

export const ReferralsTab = () => {
  const { user } = useAuth()
  const [selectedClinicId, setSelectedClinicId] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [clinics, setClinics] = useState<Clinic[]>([])

  useEffect(() => {
    if (user) {
      fetchReferrals()
      fetchClinics()
    }
  }, [user])

  const fetchReferrals = async () => {
    const { data, error } = await supabase
      .from('referrals')
      .select(`
        *,
        clinics (
          name,
          address,
          contact_info
        )
      `)
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Failed to load referrals')
    } else {
      setReferrals(data || [])
    }
  }

  const fetchClinics = async () => {
    const { data, error } = await supabase
      .from('clinics')
      .select('*')
      .order('name')
    
    if (error) {
      console.error('Error fetching clinics:', error)
    } else {
      setClinics(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedClinicId) return
    
    setLoading(true)
    
    const { error } = await supabase
      .from('referrals')
      .insert({
        user_id: user.id,
        clinic_id: selectedClinicId,
        notes: notes.trim() || null
      })
    
    if (error) {
      toast.error('Failed to create referral')
    } else {
      toast.success('Referral created successfully')
      setSelectedClinicId('')
      setNotes('')
      fetchReferrals()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Request Referral
          </CardTitle>
          <CardDescription>
            Create a referral to a specific clinic
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="clinic">Select Clinic</Label>
              <Select value={selectedClinicId} onValueChange={setSelectedClinicId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a clinic" />
                </SelectTrigger>
                <SelectContent>
                  {clinics.map((clinic) => (
                    <SelectItem key={clinic.id} value={clinic.id}>
                      <div>
                        <div className="font-medium">{clinic.name}</div>
                        <div className="text-xs text-muted-foreground">{clinic.address}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any specific notes about your referral request..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={loading || !selectedClinicId} className="w-full">
              {loading ? 'Creating Referral...' : 'Create Referral'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Your Referrals
          </CardTitle>
          <CardDescription>
            Your referral history and requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals.length === 0 ? (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No referrals yet</p>
              <p className="text-sm text-muted-foreground">
                Create your first referral above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{referral.clinics.name}</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {referral.clinics.address}
                      </p>
                      {referral.clinics.contact_info && (
                        <p className="text-sm text-muted-foreground">
                          📞 {referral.clinics.contact_info}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(referral.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  {referral.notes && (
                    <div className="mt-3 p-3 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {referral.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}