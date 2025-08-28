import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Heart, 
  Activity, 
  Calendar, 
  Bell, 
  Plus, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"

interface HealthRecord {
  id: string
  type: 'vital' | 'medication' | 'appointment' | 'symptom'
  title: string
  value?: string
  date: string
  status?: 'normal' | 'warning' | 'critical' | 'scheduled'
}

interface HealthMetric {
  name: string
  value: number
  unit: string
  target: number
  icon: React.ReactNode
  color: string
}

const HealthDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')

  const healthMetrics: HealthMetric[] = [
    {
      name: "Heart Rate",
      value: 72,
      unit: "bpm",
      target: 80,
      icon: <Heart className="w-5 h-5" />,
      color: "text-red-500"
    },
    {
      name: "Steps",
      value: 8420,
      unit: "steps",
      target: 10000,
      icon: <Activity className="w-5 h-5" />,
      color: "text-blue-500"
    },
    {
      name: "Sleep",
      value: 7.5,
      unit: "hours",
      target: 8,
      icon: <Clock className="w-5 h-5" />,
      color: "text-purple-500"
    }
  ]

  const recentRecords: HealthRecord[] = [
    {
      id: "1",
      type: "vital",
      title: "Blood Pressure Check",
      value: "120/80 mmHg",
      date: "Today, 9:30 AM",
      status: "normal"
    },
    {
      id: "2",
      type: "medication",
      title: "Vitamin D Supplement",
      date: "Today, 8:00 AM",
      status: "normal"
    },
    {
      id: "3",
      type: "appointment",
      title: "Annual Checkup",
      date: "Tomorrow, 2:00 PM",
      status: "scheduled"
    },
    {
      id: "4",
      type: "symptom",
      title: "Mild Headache",
      date: "Yesterday, 3:15 PM",
      status: "warning"
    }
  ]

  const upcomingReminders = [
    {
      id: "1",
      title: "Take Evening Medication",
      time: "6:00 PM",
      type: "medication"
    },
    {
      id: "2", 
      title: "Doctor Appointment Reminder",
      time: "Tomorrow 1:30 PM",
      type: "appointment"
    },
    {
      id: "3",
      title: "Weekly Weight Check",
      time: "Sunday 8:00 AM", 
      type: "measurement"
    }
  ]

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'normal': return 'health-status-good'
      case 'warning': return 'health-status-warning'
      case 'critical': return 'health-status-critical'
      case 'scheduled': return 'health-status-excellent'
      default: return 'health-status-good'
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'normal': return <CheckCircle className="w-4 h-4" />
      case 'warning': return <AlertTriangle className="w-4 h-4" />
      case 'critical': return <AlertTriangle className="w-4 h-4" />
      case 'scheduled': return <Calendar className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  return (
    <section className="py-16 bg-gradient-accent">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">Health Dashboard</h2>
                <p className="text-muted-foreground">
                  Track your health metrics, appointments, and medication schedule
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Record
                </Button>
                <HeroButton variant="hero" size="lg">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Checkup
                </HeroButton>
              </div>
            </div>
          </div>

          {/* Health Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {healthMetrics.map((metric) => (
              <Card key={metric.name} className="p-6 shadow-medium">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className={`${metric.color}`}>
                      {metric.icon}
                    </div>
                    <h3 className="font-semibold">{metric.name}</h3>
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold">
                      {metric.value.toLocaleString()}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {metric.unit}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress to Goal</span>
                      <span>{Math.round((metric.value / metric.target) * 100)}%</span>
                    </div>
                    <Progress 
                      value={(metric.value / metric.target) * 100} 
                      className="h-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Target: {metric.target.toLocaleString()} {metric.unit}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Health Records */}
            <Card className="shadow-medium">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Recent Records</h3>
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {recentRecords.map((record) => (
                  <div key={record.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
                    <div className={`p-1 rounded ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{record.title}</p>
                      {record.value && (
                        <p className="text-sm text-muted-foreground">{record.value}</p>
                      )}
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                    <Badge variant="outline" className={`${getStatusColor(record.status)} text-xs`}>
                      {record.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>

            {/* Upcoming Reminders */}
            <Card className="shadow-medium">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Upcoming Reminders</h3>
                  <Button variant="ghost" size="sm">
                    <Bell className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {upcomingReminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center gap-3 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5">
                    <div className="p-2 bg-primary/20 rounded-full">
                      <Bell className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{reminder.title}</p>
                      <p className="text-sm text-muted-foreground">{reminder.time}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Dismiss
                    </Button>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Reminder
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mt-8">
            <Card className="p-6 shadow-medium">
              <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Activity className="w-5 h-5" />
                  <span className="text-sm">Check Symptoms</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Calendar className="w-5 h-5" />
                  <span className="text-sm">Book Appointment</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">Log Vitals</span>
                </Button>
                <Button variant="outline" className="h-16 flex-col gap-2">
                  <Bell className="w-5 h-5" />
                  <span className="text-sm">Set Reminder</span>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HealthDashboard