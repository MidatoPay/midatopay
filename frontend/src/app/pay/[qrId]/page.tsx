'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CreditCard, CheckCircle, AlertCircle, DollarSign } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
// Removed Cavos imports - client doesn't need wallet

interface PaymentData {
  sessionId: string
  merchantName: string
  amountARS: number
  targetCrypto: string
  cryptoAmount: number
  exchangeRate: number
  concept: string
  expiresAt: string
  status: string
}

// Componente principal simplificado - cliente no necesita wallet
export default function PayPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.qrId as string
  
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      fetchPaymentData(sessionId)
    }
  }, [sessionId])

  const fetchPaymentData = async (sessionId: string) => {
    try {
      setLoading(true)
      console.log('🔍 Buscando pago con sessionId:', sessionId)
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/midatopay/scan-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrData: sessionId })
      })

      const data = await response.json()
      console.log('📱 Respuesta del backend:', data)

      if (data.success && data.data && data.data.success) {
        setPaymentData(data.data.paymentData)
      } else {
        setError(data.error || data.data?.error || 'Error al obtener datos del pago')
      }
    } catch (err) {
      console.error('Error fetching payment data:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  // Cliente no necesita wallet - pago directo en ARS

  const handlePayment = async () => {
    if (!paymentData) return

    try {
      setProcessing(true)
      
      // Simular procesamiento de pago ARS
      // En producción, aquí se integraría con el sistema bancario argentino
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Procesar pago en el backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/midatopay/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: paymentData.sessionId,
          arsPaymentData: {
            amount: paymentData.amountARS,
            currency: 'ARS',
            method: 'BANK_TRANSFER', // Simulamos transferencia bancaria
            reference: `PAY_${Date.now()}`,
            merchantName: paymentData.merchantName,
            concept: paymentData.concept,
            targetCrypto: paymentData.targetCrypto,
            cryptoAmount: paymentData.cryptoAmount,
            exchangeRate: paymentData.exchangeRate
          }
        })
      })

      const data = await response.json()

      if (data.success) {
        toast.success('¡Pago procesado exitosamente!')
        router.push(`/payment-success/${data.transactionId}`)
      } else {
        toast.error(data.error || 'Error al procesar el pago')
      }
    } catch (err) {
      console.error('Error processing payment:', err)
      toast.error('Error al procesar el pago')
    } finally {
      setProcessing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatCryptoAmount = (amount: number, crypto: string) => {
    return `${amount.toFixed(6)} ${crypto}`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f7f6' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos del pago...</p>
        </div>
      </div>
    )
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f7f7f6' }}>
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
              <p className="text-gray-600 mb-6">{error || 'No se pudieron cargar los datos del pago'}</p>
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
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fe6c1c 0%, #fe9c42 100%)' }}>
                <CreditCard className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Gromm, sans-serif', color: '#1a1a1a' }}>Confirmar Pago</h1>
                <p className="text-sm" style={{ color: '#5d5d5d' }}>Revisa los detalles antes de pagar</p>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" style={{ color: '#fe6c1c' }} />
                <span>Detalles del Pago</span>
              </CardTitle>
              <CardDescription>
                Confirma los detalles antes de proceder con el pago
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información del Comercio */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Comercio</h3>
                <p className="text-lg font-semibold" style={{ color: '#fe6c1c' }}>{paymentData.merchantName}</p>
                <p className="text-sm text-gray-600">{paymentData.concept}</p>
              </div>

              {/* Monto a Pagar */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">Monto a Pagar</h3>
                <p className="text-2xl font-bold text-blue-900">{formatCurrency(paymentData.amountARS)}</p>
                <p className="text-sm text-blue-700">Pagarás en pesos argentinos (ARS)</p>
              </div>

              {/* Conversión */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900 mb-2">El comercio recibirá</h3>
                <p className="text-xl font-semibold text-green-900">{formatCryptoAmount(paymentData.cryptoAmount, paymentData.targetCrypto)}</p>
                <p className="text-sm text-green-700">
                  Tasa: 1 {paymentData.targetCrypto} = {formatCurrency(paymentData.exchangeRate)}
                </p>
              </div>

              {/* Información Adicional */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">ID de Sesión:</span>
                  <span className="text-sm font-mono text-gray-900">{paymentData.sessionId}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className="text-sm font-medium text-green-600 capitalize">{paymentData.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expira:</span>
                  <span className="text-sm text-gray-900">
                    {new Date(paymentData.expiresAt).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Cliente no necesita wallet - pago directo */}

              {/* Botón de Pago - Cliente paga directamente */}
              <div className="pt-4">
                <Button
                  onClick={handlePayment}
                  disabled={processing || paymentData.status !== 'PENDING'}
                  className="w-full"
                  size="lg"
                  style={{ 
                    background: 'linear-gradient(135deg, #fe6c1c 0%, #fe9c42 100%)',
                    color: 'white'
                  }}
                >
                  {processing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando Pago...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pagar {formatCurrency(paymentData.amountARS)}
                    </>
                  )}
                </Button>
              </div>

              {/* Información de Seguridad */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Información del Pago
                </h4>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• Pagas en pesos argentinos (ARS) - No necesitas wallet</li>
                  <li>• El comercio recibirá {paymentData.targetCrypto} automáticamente</li>
                  <li>• La conversión se realiza al mejor precio disponible</li>
                  <li>• Este QR expira el {new Date(paymentData.expiresAt).toLocaleString('es-AR')}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}