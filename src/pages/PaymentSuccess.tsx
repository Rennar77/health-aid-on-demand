import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, ArrowLeft, CreditCard } from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { toast } from 'sonner'

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { updatePaymentStatus } = usePayments()
  const [loading, setLoading] = useState(true)
  const [paymentVerified, setPaymentVerified] = useState(false)

  const paymentId = searchParams.get('payment_id')

  useEffect(() => {
    const verifyPayment = async () => {
      if (!paymentId) {
        toast.error('Invalid payment reference')
        navigate('/')
        return
      }

      try {
        // Update payment status to success
        const success = await updatePaymentStatus(paymentId, 'success')
        if (success) {
          setPaymentVerified(true)
          toast.success('Payment verified successfully!')
        } else {
          throw new Error('Failed to verify payment')
        }
      } catch (error) {
        console.error('Payment verification error:', error)
        toast.error('Failed to verify payment')
        await updatePaymentStatus(paymentId, 'failed')
      } finally {
        setLoading(false)
      }
    }

    verifyPayment()
  }, [paymentId, updatePaymentStatus, navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {loading ? (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
            ) : paymentVerified ? (
              <CheckCircle className="w-12 h-12 text-green-600" />
            ) : (
              <CreditCard className="w-12 h-12 text-red-600" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {loading ? 'Verifying Payment...' : paymentVerified ? 'Payment Successful!' : 'Payment Failed'}
          </CardTitle>
          <CardDescription>
            {loading 
              ? 'Please wait while we verify your payment'
              : paymentVerified 
                ? 'Your premium health advice access has been activated'
                : 'We encountered an issue processing your payment'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!loading && paymentVerified && (
            <div className="text-center space-y-3">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">Premium Features Unlocked:</h4>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Detailed symptom analysis</li>
                  <li>• Personalized treatment recommendations</li>
                  <li>• Risk assessment and prevention tips</li>
                  <li>• 24/7 AI health assistant access</li>
                </ul>
              </div>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate('/')} 
              className="flex-1 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Health Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}