import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, Calendar, Info, AlertTriangle, Heart } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface Alert {
  id: string
  title: string
  message: string
  created_at: string
}

export const AlertsTab = () => {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAlerts()
  }, [])

  const fetchAlerts = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Failed to load alerts')
    } else {
      setAlerts(data || [])
    }
    setLoading(false)
  }

  const getAlertIcon = (title: string) => {
    const lowercaseTitle = title.toLowerCase()
    if (lowercaseTitle.includes('health')) return <Heart className="w-5 h-5" />
    if (lowercaseTitle.includes('emergency') || lowercaseTitle.includes('urgent')) return <AlertTriangle className="w-5 h-5" />
    return <Info className="w-5 h-5" />
  }

  const getAlertVariant = (title: string) => {
    const lowercaseTitle = title.toLowerCase()
    if (lowercaseTitle.includes('emergency') || lowercaseTitle.includes('urgent')) return 'destructive'
    if (lowercaseTitle.includes('reminder')) return 'secondary'
    return 'default'
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-1/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Health Alerts & Notifications
          </CardTitle>
          <CardDescription>
            Important health information and reminders
          </CardDescription>
        </CardHeader>
      </Card>

      {alerts.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts at the moment</p>
            <p className="text-sm text-muted-foreground">
              We'll notify you of important health updates here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => (
            <Card key={alert.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {getAlertIcon(alert.title)}
                    </div>
                    <div>
                      <CardTitle className="text-base">{alert.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getAlertVariant(alert.title)}>
                          {alert.title.toLowerCase().includes('tip') ? 'Tip' : 
                           alert.title.toLowerCase().includes('reminder') ? 'Reminder' : 
                           'Info'}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(alert.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground leading-relaxed">
                  {alert.message}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Stay Informed</h4>
              <p className="text-sm text-blue-700">
                Enable notifications to get timely health alerts and reminders on your device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}