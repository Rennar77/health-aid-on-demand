import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { toast } from 'sonner'

interface AIAdviceResponse {
  advice: string
  isUrgent: boolean
  nextSteps: string[]
}

export const useAIAdvice = () => {
  const [loading, setLoading] = useState(false)
  const [advice, setAdvice] = useState<AIAdviceResponse | null>(null)

  const getAIAdvice = async (symptoms: string, severity: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('get-ai-advice', {
        body: { symptoms, severity }
      })

      if (error) throw error

      const adviceData: AIAdviceResponse = {
        advice: data.advice,
        isUrgent: data.isUrgent || severity === 'high',
        nextSteps: data.nextSteps || [
          severity === 'high' ? 'Seek immediate medical attention' : 'Monitor symptoms',
          'Stay hydrated and rest',
          'Consider visiting a healthcare provider if symptoms persist'
        ]
      }

      setAdvice(adviceData)
      return adviceData
    } catch (error) {
      console.error('AI Advice Error:', error)
      toast.error('Unable to get AI advice right now')
      return null
    } finally {
      setLoading(false)
    }
  }

  return { getAIAdvice, advice, loading }
}