import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { User, Mail, UserCheck, Calendar, Crown, CreditCard } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { usePayments } from '@/hooks/usePayments'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'
import { PaymentHistory } from './PaymentHistory'

interface UserProfile {
  id: string
  name: string | null
  role: string | null
  is_premium: boolean
  created_at: string
}

export const ProfileTab = () => {
  const { user, signOut } = useAuth()
  const { createPayment, loading: paymentLoading } = usePayments()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      setProfile(data)
      setEditName(data.name || '')
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!user || !editName.trim()) return
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ name: editName.trim() })
        .eq('id', user.id)
      
      if (error) throw error
      
      setProfile(prev => prev ? { ...prev, name: editName.trim() } : null)
      setIsEditing(false)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    }
  }

  const handleCancel = () => {
    setEditName(profile?.name || '')
    setIsEditing(false)
  }

  const handleUpgradeToPremium = async () => {
    try {
      const result = await createPayment(700) // KES 700 for premium upgrade
      if (result?.checkoutUrl) {
        window.open(result.checkoutUrl, '_blank')
        toast.success('Redirecting to payment...')
      } else {
        throw new Error('Payment initialization failed')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment could not be processed. Please try again or use an alternative method (M-Pesa, Card, Bank).')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Profile not found</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Manage your account details and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              {isEditing ? (
                <div className="flex gap-2 mt-1">
                  <Input
                    id="name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="Enter your name"
                  />
                  <Button onClick={updateProfile} size="sm">
                    Save
                  </Button>
                  <Button onClick={handleCancel} variant="outline" size="sm">
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-sm bg-muted px-3 py-2 rounded-md flex-1">
                    {profile.name || 'Not set'}
                  </p>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2 mt-1">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm bg-muted px-3 py-2 rounded-md flex-1">
                  {user.email}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="role">Account Type</Label>
              <div className="flex items-center gap-2 mt-1">
                {profile.is_premium ? (
                  <>
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white">
                      Premium Member
                    </Badge>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <Badge variant="outline">Free Member</Badge>
                  </>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="memberSince">Member Since</Label>
              <div className="flex items-center gap-2 mt-1">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm bg-muted px-3 py-2 rounded-md flex-1">
                  {new Date(profile.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {!profile.is_premium && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <Crown className="w-5 h-5" />
                  Upgrade to Premium
                </CardTitle>
                <CardDescription>
                  Unlock advanced health features and personalized recommendations
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
                      <li>• Priority clinic referrals</li>
                    </ul>
                  </div>
                  <Button
                    onClick={handleUpgradeToPremium}
                    disabled={paymentLoading}
                    className="flex items-center gap-1"
                  >
                    <CreditCard className="w-4 h-4" />
                    {paymentLoading ? 'Processing...' : 'Upgrade for KES 700'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end pt-4">
            <Button onClick={signOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>

      <PaymentHistory />
    </div>
  )
}