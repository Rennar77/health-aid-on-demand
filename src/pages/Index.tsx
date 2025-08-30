import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Heart, User, Stethoscope, FileText, UserPlus, MapPin, Bell, LogOut } from 'lucide-react'
import { AuthProvider, useAuth } from '@/hooks/useAuth'
import { AuthPage } from '@/components/auth/AuthPage'
import { ProfileTab } from '@/components/profile/ProfileTab'
import { SymptomsTab } from '@/components/symptoms/SymptomsTab'
import { HealthRecordsTab } from '@/components/records/HealthRecordsTab'
import { ReferralsTab } from '@/components/referrals/ReferralsTab'
import { ClinicsTab } from '@/components/clinics/ClinicsTab'
import { AlertsTab } from '@/components/alerts/AlertsTab'
import { Toaster } from 'sonner'

const AppContent = () => {
  const { user, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="text-center text-white">
          <Heart className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          <p>Loading HealthTrack...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">HealthTrack</h1>
                <p className="text-sm text-muted-foreground">Your Pocket Health Companion</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <Card className="mb-6">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="symptoms" className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" />
                <span className="hidden sm:inline">Symptoms</span>
              </TabsTrigger>
              <TabsTrigger value="records" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Records</span>
              </TabsTrigger>
              <TabsTrigger value="referrals" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Referrals</span>
              </TabsTrigger>
              <TabsTrigger value="clinics" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Clinics</span>
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
            </TabsList>
          </Card>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>

          <TabsContent value="symptoms">
            <SymptomsTab />
          </TabsContent>

          <TabsContent value="records">
            <HealthRecordsTab />
          </TabsContent>

          <TabsContent value="referrals">
            <ReferralsTab />
          </TabsContent>

          <TabsContent value="clinics">
            <ClinicsTab />
          </TabsContent>

          <TabsContent value="alerts">
            <AlertsTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

const Index = () => {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  )
}

export default Index
