'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, ArrowLeft, Copy, ExternalLink, Clock } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

interface TransactionData {
  transactionId: string
  paymentId: string
  amount: number | string
  currency: string
  cryptoAmount: number | string
  cryptoCurrency: string
  exchangeRate: number | string
  status: string
  timestamp: string
  blockchainTxHash?: string
  mode?: string
}

export default function PaymentSuccessPage() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.transactionId as string
  
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (transactionId) {
      fetchTransactionData(transactionId)
    }
  }, [transactionId])

  const fetchTransactionData = async (transactionId: string) => {
    try {
      setLoading(true)
      
      // Obtener datos reales del backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${transactionId}`)
      
      if (!response.ok) {
        throw new Error('Error al obtener datos de la transacción')
      }
      
      const data = await response.json()
      
      if (data.success && data.transaction) {
        const transaction = data.transaction
        setTransactionData({
          transactionId: transaction.id,
          paymentId: transaction.paymentId,
          amount: transaction.finalAmount,
          currency: transaction.finalCurrency,
          cryptoAmount: transaction.amount,
          cryptoCurrency: transaction.currency,
          exchangeRate: transaction.exchangeRate,
          status: transaction.status,
          timestamp: transaction.createdAt,
          blockchainTxHash: transaction.blockchainTxHash,
          mode: data.mode || 'REAL'
        })
      } else {
        throw new Error('No se encontraron datos de la transacción')
      }
    } catch (err) {
      console.error('Error fetching transaction data:', err)
      setError('Error al obtener datos de la transacción')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copiado al portapapeles`)
  }

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numAmount)
  }

  const formatCryptoAmount = (amount: number | string, crypto: string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return `${numAmount.toFixed(6)} ${crypto}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f7f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando detalles de la transacción...</p>
        </div>
      </div>
    )
  }

  if (error || !transactionData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f7f6' }}>
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'No se pudieron cargar los datos de la transacción'}</p>
              <Link href="/scan">
                <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al Escáner
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f6' }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: '#f7f7f6', borderColor: 'rgba(26,26,26,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/scan" className="mr-4">
              <Button variant="ghost" size="sm" style={{ color: '#1a1a1a' }}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-green-500">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Gromm, sans-serif', color: '#1a1a1a' }}>Pago Exitoso</h1>
                <p className="text-sm" style={{ color: '#5d5d5d' }}>Tu pago se procesó correctamente</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mensaje de Éxito */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Pago Exitoso!</h2>
                <p className="text-gray-600 mb-4">
                  Tu pago de {formatCurrency(transactionData.amount)} se procesó correctamente
                </p>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <Clock className="w-4 h-4 mr-1" />
                  {new Date(transactionData.timestamp).toLocaleString('es-AR')}
                </div>
                </div>
              </CardContent>
            </Card>

          {/* Detalles de la Transacción */}
            <Card>
              <CardHeader>
              <CardTitle>Detalles de la Transacción</CardTitle>
                <CardDescription>
                Información completa de tu pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              {/* Monto Pagado */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Monto Pagado</h3>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(transactionData.amount)}</p>
                <p className="text-sm text-blue-700">Pagado en pesos argentinos</p>
              </div>

              {/* Crypto Enviado */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">Crypto Enviado al Comercio</h3>
                <p className="text-xl font-semibold text-green-900">
                  {formatCryptoAmount(transactionData.cryptoAmount, transactionData.cryptoCurrency)}
                </p>
                <p className="text-sm text-green-700">
                  Tasa utilizada: 1 {transactionData.cryptoCurrency} = {formatCurrency(transactionData.exchangeRate)}
                </p>
              </div>

              {/* Información Técnica */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ID de Transacción:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-900">{transactionData.transactionId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transactionData.transactionId, 'ID de Transacción')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ID de Pago:</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono text-gray-900">{transactionData.paymentId}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(transactionData.paymentId, 'ID de Pago')}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {transactionData.blockchainTxHash && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Hash de Blockchain:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-mono text-gray-900 truncate max-w-32">
                        {transactionData.blockchainTxHash}
                      </span>
                  <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transactionData.blockchainTxHash!, 'Hash de Blockchain')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className="text-sm font-medium text-green-600 capitalize">{transactionData.status}</span>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="pt-4 space-y-3">
                <Link href="/scan" className="block">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Realizar Otro Pago
                  </Button>
                </Link>
                  
                {transactionData.blockchainTxHash && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // Usar URL de Sepolia Voyager en lugar de Starkscan Mainnet
                      const explorerUrl = `https://sepolia.voyager.online/tx/${transactionData.blockchainTxHash}`;
                      window.open(explorerUrl, '_blank');
                    }}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {transactionData.mode === 'SIMULATION' 
                      ? 'Ver en Blockchain (Simulación)' 
                      : 'Ver en Blockchain (Sepolia)'}
                  </Button>
                )}
        </div>

              {/* Información Adicional */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-900 mb-2">📧 Recibo por Email</h4>
                <p className="text-sm text-yellow-800">
                  Te hemos enviado un recibo por email con todos los detalles de esta transacción.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}