import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

interface Payment {
  id: string
  amount: number
  status: 'pending' | 'success' | 'failed'
  transaction_id?: string
  created_at: string
}

export const usePayments = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [payments, setPayments] = useState<Payment[]>([])

  const createPayment = async (amount: number) => {
    if (!user) {
      toast.error('Please login to make payments')
      return null
    }

    setLoading(true)
    try {
      // Create payment record in Supabase
      const { data: payment, error } = await supabase
        .from('payments')
        .insert({
          user_id: user.id,
          amount,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Initialize IntaSend payment
      const { data, error: paymentError } = await supabase.functions.invoke('create-payment', {
        body: { 
          amount,
          paymentId: payment.id,
          email: user.email
        }
      })

      if (paymentError) throw paymentError

      return { payment, checkoutUrl: data.checkout_url }
    } catch (error) {
      console.error('Payment creation error:', error)
      toast.error('Failed to create payment')
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchPayments = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPayments((data || []).map(payment => ({
        ...payment,
        status: payment.status as 'pending' | 'success' | 'failed'
      })))
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payment history')
    }
  }

  const updatePaymentStatus = async (paymentId: string, status: 'success' | 'failed', transactionId?: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ 
          status,
          transaction_id: transactionId 
        })
        .eq('id', paymentId)

      if (error) throw error
      
      // Refresh payments list
      fetchPayments()
      return true
    } catch (error) {
      console.error('Error updating payment status:', error)
      return false
    }
  }

  return {
    createPayment,
    fetchPayments,
    updatePaymentStatus,
    payments,
    loading
  }
}