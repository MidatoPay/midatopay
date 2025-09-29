'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Download, 
  Share2, 
  ArrowLeft,
  Clock,
  DollarSign,
  Hash
} from 'lucide-react'

interface Transaction {
  id: string
  amount: string | number
  currency: string
  exchangeRate: string | number
  finalAmount: string | number
  finalCurrency: string
  status: string
  blockchainTxHash: string
  confirmationCount: number
  createdAt: string
}

interface Payment {
  id: string
  amount: number
  currency: string
  concept: string
  orderId?: string
}

export default function PaymentSuccessPage() {
  const params = useParams()
  const transactionId = params.transactionId as string
  
  const [transaction, setTransaction] = useState<Transaction | null>(null)
  const [payment, setPayment] = useState<Payment | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (transactionId) {
      fetchTransactionDetails()
    }
  }, [transactionId])

  const fetchTransactionDetails = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${transactionId}/status`)
      const data = await response.json()

      if (response.ok) {
        setTransaction(data.transaction)
        setPayment(data.payment)
      }
    } catch (error) {
      console.error('Error fetching transaction:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const downloadReceipt = () => {
    if (!transaction || !payment) return
    
    const receiptData = {
      transactionId: transaction.id,
      amount: parseFloat(transaction.amount),
      currency: transaction.currency,
      finalAmount: parseFloat(transaction.finalAmount),
      finalCurrency: transaction.finalCurrency,
      concept: payment.concept,
      date: new Date(transaction.createdAt).toLocaleString('es-AR'),
      txHash: transaction.blockchainTxHash,
      status: transaction.status
    }

    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `recibo-${transaction.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const shareReceipt = async () => {
    if (!transaction || !payment) return

    const shareData = {
      title: 'Recibo de Pago - MidatoPay',
      text: `Pago confirmado: ${parseFloat(transaction.amount)} ${transaction.currency} por ${payment.concept}`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles del pago...</p>
        </div>
      </div>
    )
  }

  if (!transaction || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Transacción no encontrada</h2>
            <p className="text-gray-600 mb-4">No se pudo encontrar la transacción solicitada</p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al inicio
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f6' }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: '#f7f7f6', borderColor: 'rgba(254,108,28,0.3)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fe6c1c 0%, #ff8c42 100%)' }}>
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Gromm, sans-serif', color: '#fe6c1c' }}>Pago Confirmado</h1>
                <p className="text-sm" style={{ color: '#5d5d5d' }}>Transacción exitosa</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(254,108,28,0.1)' }}>
            <CheckCircle className="w-10 h-10" style={{ color: '#fe6c1c' }} />
          </div>
          <h2 className="text-3xl font-bold mb-2" style={{ color: '#fe6c1c', fontFamily: 'Gromm, sans-serif' }}>¡Pago Exitoso!</h2>
          <p className="text-gray-600">
            Tu pago ha sido procesado y confirmado exitosamente
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto">
          {/* Detalles del pago */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-8"
          >
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardHeader>
                <CardTitle style={{ color: '#fe6c1c' }}>Detalles del Pago</CardTitle>
                <CardDescription style={{ color: '#5d5d5d' }}>
                  Información completa de la transacción
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>Concepto:</span>
                  <span className="font-medium" style={{ color: '#1a1a1a' }}>{payment.concept}</span>
                </div>
                
                {payment.orderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm" style={{ color: '#5d5d5d' }}>Orden:</span>
                    <span className="font-medium" style={{ color: '#1a1a1a' }}>{payment.orderId}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>Monto pagado:</span>
                  <span className="font-bold text-lg" style={{ color: '#1a1a1a' }}>
                    ${parseFloat(transaction.amount)} ARS
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>Recibido por comercio:</span>
                  <span className="font-bold text-lg" style={{ color: '#1a1a1a' }}>
                    ${parseFloat(transaction.finalAmount)} ARS
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>Estado:</span>
                  <Badge variant="success">
                    {transaction.status === 'CONFIRMED' ? 'Confirmado' : transaction.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>Fecha:</span>
                  <span className="font-medium" style={{ color: '#1a1a1a' }}>
                    {new Date(transaction.createdAt).toLocaleString('es-AR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Acciones */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardHeader>
                <CardTitle className="text-lg" style={{ color: '#fe6c1c' }}>Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    onClick={downloadReceipt}
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Descargar Recibo
                  </Button>
                  
                  <Button
                    onClick={shareReceipt}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Compartir Recibo
                  </Button>
                  
                  <Button asChild className="w-full">
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Volver al Inicio
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
