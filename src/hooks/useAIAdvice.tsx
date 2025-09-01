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

      let adviceData: AIAdviceResponse

      if (error || !data?.advice) {
        // Always provide fallback basic advice if AI fails
        adviceData = {
          advice: severity === 'high' 
            ? 'Based on your symptoms, we recommend seeking medical attention promptly.'
            : 'Here are some general wellness recommendations for your symptoms.',
          isUrgent: severity === 'high',
          nextSteps: [
            severity === 'high' ? 'Seek medical attention promptly' : 'Monitor your symptoms carefully',
            'Stay hydrated and get adequate rest',
            'Maintain a healthy diet with nutritious foods',
            'Consult a healthcare provider if symptoms persist or worsen'
          ]
        }
      } else {
        adviceData = {
          advice: data.advice,
          isUrgent: data.isUrgent || severity === 'high',
          nextSteps: data.nextSteps || [
            severity === 'high' ? 'Seek immediate medical attention' : 'Monitor symptoms',
            'Stay hydrated and rest',
            'Consider visiting a healthcare provider if symptoms persist'
          ]
        }
      }

      setAdvice(adviceData)
      return adviceData
    } catch (error) {
      console.error('AI Advice Error:', error)
      
      // Always provide fallback basic advice even on error
      const fallbackAdvice: AIAdviceResponse = {
        advice: severity === 'high' 
          ? 'Based on your symptoms, we recommend seeking medical attention promptly.'
          : 'Here are some general wellness recommendations for your symptoms.',
        isUrgent: severity === 'high',
        nextSteps: [
          severity === 'high' ? 'Seek medical attention promptly' : 'Monitor your symptoms carefully',
          'Stay hydrated and get adequate rest',
          'Maintain a healthy diet with nutritious foods',
          'Consult a healthcare provider if symptoms persist or worsen'
        ]
      }
      
      setAdvice(fallbackAdvice)
      return fallbackAdvice
    } finally {
      setLoading(false)
    }
  }

  return { getAIAdvice, advice, loading }
}