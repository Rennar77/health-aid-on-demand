import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, Plus, Calendar } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface HealthRecord {
  id: string
  record: string
  created_at: string
}

export const HealthRecordsTab = () => {
  const { user } = useAuth()
  const [record, setRecord] = useState('')
  const [loading, setLoading] = useState(false)
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([])

  useEffect(() => {
    if (user) {
      fetchHealthRecords()
    }
  }, [user])

  const fetchHealthRecords = async () => {
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      toast.error('Failed to load health records')
    } else {
      setHealthRecords(data || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !record.trim()) return
    
    setLoading(true)
    
    const { error } = await supabase
      .from('health_records')
      .insert({
        user_id: user.id,
        record: record.trim()
      })
    
    if (error) {
      toast.error('Failed to save health record')
    } else {
      toast.success('Health record saved successfully')
      setRecord('')
      fetchHealthRecords()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Add Health Record
          </CardTitle>
          <CardDescription>
            Record important health information, test results, or medical notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="record">Health Record</Label>
              <Textarea
                id="record"
                placeholder="Enter health information, test results, medications, or any medical notes..."
                value={record}
                onChange={(e) => setRecord(e.target.value)}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground mt-1">
                Include dates, doctor names, test results, or any relevant health information
              </p>
            </div>

            <Button type="submit" disabled={loading || !record.trim()} className="w-full">
              {loading ? 'Saving...' : 'Save Health Record'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Health Records History
          </CardTitle>
          <CardDescription>
            Your saved health records and medical information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {healthRecords.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No health records yet</p>
              <p className="text-sm text-muted-foreground">
                Start by adding your first health record above
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {healthRecords.map((healthRecord) => (
                <div key={healthRecord.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(healthRecord.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                    {healthRecord.record}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}