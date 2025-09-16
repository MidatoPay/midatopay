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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-bold text-gray-900">Pago Confirmado</h1>
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
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
          <p className="text-gray-600">
            Tu pago ha sido procesado y confirmado exitosamente
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Detalles del pago */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Pago</CardTitle>
                <CardDescription>
                  Información completa de la transacción
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Concepto:</span>
                  <span className="font-medium">{payment.concept}</span>
                </div>
                
                {payment.orderId && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Orden:</span>
                    <span className="font-medium">{payment.orderId}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Monto pagado:</span>
                  <span className="font-bold text-lg">
                    {parseFloat(transaction.amount).toFixed(transaction.currency === 'BTC' ? 8 : 6)} {transaction.currency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Recibido por comercio:</span>
                  <span className="font-bold text-lg">
                    ${parseFloat(transaction.finalAmount)} {transaction.finalCurrency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Tasa de cambio:</span>
                  <span className="font-medium">
                    1 {transaction.currency} = ${transaction.exchangeRate} {transaction.finalCurrency}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge variant="success">
                    {transaction.status === 'CONFIRMED' ? 'Confirmado' : transaction.status}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="font-medium">
                    {new Date(transaction.createdAt).toLocaleString('es-AR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Información blockchain */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Información Blockchain</CardTitle>
                <CardDescription>
                  Detalles de la transacción en la blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hash de transacción:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {transaction.blockchainTxHash?.substring(0, 20)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(transaction.blockchainTxHash || '')
                      }}
                    >
                      <Hash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Confirmaciones:</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{transaction.confirmationCount}</span>
                    <Clock className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ID de transacción:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                      {transaction.id.substring(0, 12)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(transaction.id)
                      }}
                    >
                      <Hash className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acciones */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Acciones</CardTitle>
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

        {/* Información adicional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">¿Qué sigue?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Pago Confirmado</h3>
                  <p className="text-sm text-gray-600">
                    El comercio recibirá la notificación y el dinero en su cuenta
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Conversión Automática</h3>
                  <p className="text-sm text-gray-600">
                    El pago se convierte automáticamente a pesos argentinos
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Hash className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">Transparencia Total</h3>
                  <p className="text-sm text-gray-600">
                    Toda la información está registrada en la blockchain
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
