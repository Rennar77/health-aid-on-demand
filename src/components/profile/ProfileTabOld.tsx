import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Edit, Save, X } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  name: string | null
  role: string
  created_at: string
}

export const ProfileTab = () => {
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

  const fetchProfile = async () => {
    if (!user) return
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } else {
      setProfile(data)
      setEditName(data.name || '')
    }
  }

  const updateProfile = async () => {
    if (!user || !editName.trim()) return
    
    setLoading(true)
    const { error } = await supabase
      .from('users')
      .update({ name: editName.trim() })
      .eq('id', user.id)
    
    if (error) {
      toast.error('Failed to update profile')
    } else {
      toast.success('Profile updated successfully')
      setProfile(prev => prev ? { ...prev, name: editName.trim() } : null)
      setIsEditing(false)
    }
    setLoading(false)
  }

  const handleCancel = () => {
    setEditName(profile?.name || '')
    setIsEditing(false)
  }

  if (!profile) {
    return (
      <div className="animate-pulse">
        <Card>
          <CardHeader>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-3 bg-muted rounded w-1/2"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded"></div>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
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
            Manage your personal information and account settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={user?.email || ''}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Email cannot be changed
            </p>
          </div>

          <div>
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <div className="flex gap-2">
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                />
                <Button
                  size="sm"
                  onClick={updateProfile}
                  disabled={loading || !editName.trim()}
                >
                  <Save className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={profile.name || 'Not set'}
                  disabled
                  className="bg-muted"
                />
                <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <div>
            <Label>Role</Label>
            <div className="mt-1">
              <Badge variant="secondary" className="capitalize">
                {profile.role}
              </Badge>
            </div>
          </div>

          <div>
            <Label>Member Since</Label>
            <p className="text-sm text-muted-foreground">
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-destructive">Account Actions</CardTitle>
          <CardDescription>
            Manage your account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={signOut}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}