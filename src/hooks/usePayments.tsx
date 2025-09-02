import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

interface Transaction {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'success' | 'failed'
  reference: string
  created_at: string
}

export const usePayments = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const createPayment = async (amount: number) => {
    if (!user) {
      toast.error('Please login to make payments')
      return null
    }

    setLoading(true)
    try {
      // Create payment request via Paystack
      const { data, error: paymentError } = await supabase.functions.invoke('create-payment', {
        body: { 
          amount,
          email: user.email
        }
      })

      if (paymentError) throw paymentError

      return { 
        checkoutUrl: data.checkout_url, 
        reference: data.reference,
        accessCode: data.access_code
      }
    } catch (error) {
      console.error('Payment creation error:', error)
      toast.error('Failed to create payment')
      return null
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions((data || []).map(transaction => ({
        ...transaction,
        status: transaction.status as 'pending' | 'success' | 'failed'
      })))
    } catch (error) {
      console.error('Error fetching transactions:', error)
      toast.error('Failed to load payment history')
    }
  }

  const verifyPayment = async (reference: string) => {
    if (!user) return false

    try {
      const { data, error } = await supabase.functions.invoke('verify-payment', {
        body: { reference }
      })

      if (error) throw error
      
      if (data.verified && data.payment_status === 'success') {
        toast.success('Payment verified successfully!')
        // Refresh transactions
        fetchTransactions()
        return true
      } else {
        toast.error('Payment verification failed')
        return false
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      toast.error('Payment verification failed')
      return false
    }
  }

  return {
    createPayment,
    fetchTransactions,
    verifyPayment,
    transactions,
    loading
  }
}