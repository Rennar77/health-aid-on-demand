import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CreditCard, CheckCircle, X, Clock } from 'lucide-react'
import { usePayments } from '@/hooks/usePayments'
import { useAuth } from '@/hooks/useAuth'

export const PaymentHistory = () => {
  const { user } = useAuth()
  const { transactions, fetchTransactions } = usePayments()

  useEffect(() => {
    if (user) {
      fetchTransactions()
    }
  }, [user, fetchTransactions])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'failed':
        return <X className="w-4 h-4 text-red-600" />
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500'
      case 'failed': return 'bg-red-500'
      case 'pending': return 'bg-yellow-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment History
        </CardTitle>
        <CardDescription>
          Your payment transactions and premium purchases
        </CardDescription>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <p className="text-muted-foreground text-center py-4">
            No payment history yet
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(transaction.status)}
                  <div>
                    <p className="font-medium">
                      {transaction.currency} {transaction.amount}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(transaction.created_at).toLocaleDateString()}
                      <span>•</span>
                      <span className="text-xs">{transaction.reference}</span>
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(transaction.status)} text-white capitalize`}>
                  {transaction.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}