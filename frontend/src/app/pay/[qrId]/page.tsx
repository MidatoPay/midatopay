'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Copy,
  ExternalLink,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

interface PaymentOption {
  currency: string
  amount: string
  rate: number
  source: string
  validFor?: number
}

interface Payment {
  id: string
  amount: number
  currency: string
  concept: string
  orderId?: string
  merchant: {
    name: string
    email: string
  }
  expiresAt: string
  status: string
}

export default function PayPage() {
  const params = useParams()
  const router = useRouter()
  const qrId = params.qrId as string
  
  const [payment, setPayment] = useState<Payment | null>(null)
  const [paymentOptions, setPaymentOptions] = useState<PaymentOption[]>([])
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (qrId) {
      fetchPaymentInfo()
    }
  }, [qrId])

  const fetchPaymentInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/qr/${qrId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al cargar el pago')
      }

      setPayment(data.payment)
      setPaymentOptions(data.paymentOptions)
      setSelectedOption(data.paymentOptions[0]) // Seleccionar ARS por defecto
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!selectedOption || !payment) return

    setIsProcessing(true)
    try {
      const transactionData = {
        paymentId: payment.id,
        currency: selectedOption.currency,
        amount: parseFloat(selectedOption.amount),
      };
      
      console.log('📤 Enviando datos de transacción:', transactionData);
      
      // Crear transacción
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear la transacción')
      }

      // Simular pago (en producción esto sería real)
      toast.success('Transacción creada. Simulando pago...')
      
      // Simular confirmación después de 3 segundos
      setTimeout(async () => {
        try {
          const confirmResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${data.transaction.id}/confirm`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              txHash: '0x' + Math.random().toString(16).substring(2, 66)
            }),
          })

          if (confirmResponse.ok) {
            toast.success('¡Pago confirmado exitosamente!')
            router.push(`/payment-success/${data.transaction.id}`)
          }
        } catch (error) {
          toast.error('Error al confirmar el pago')
        }
      }, 3000)

    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al procesar el pago')
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copiado al portapapeles')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del pago...</p>
        </div>
      </div>
    )
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error || 'Pago no encontrado'}</p>
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
              <QrCode className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Pagar con MidatoPay</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Información del pago */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Pago</CardTitle>
                <CardDescription>
                  Información del comercio y el pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Comercio:</span>
                  <span className="font-medium">{payment.merchant.name}</span>
                </div>
                
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
                  <span className="text-sm text-gray-600">Monto original:</span>
                  <span className="font-bold text-lg">${payment.amount} {payment.currency}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expira:</span>
                  <span className="text-sm">
                    {new Date(payment.expiresAt).toLocaleString('es-AR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Opciones de pago */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Opciones de Pago</CardTitle>
                <CardDescription>
                  Elige cómo quieres pagar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  {paymentOptions.map((option, index) => (
                    <div
                      key={option.currency}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedOption?.currency === option.currency
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedOption(option)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                            option.currency === 'ARS' ? 'bg-blue-600' :
                            option.currency === 'USDT' ? 'bg-green-600' :
                            option.currency === 'BTC' ? 'bg-orange-600' :
                            'bg-purple-600'
                          }`}>
                            {option.currency}
                          </div>
                          <div>
                            <p className="font-medium">{option.currency}</p>
                            <p className="text-sm text-gray-600">
                              {option.source} • {option.rate ? `1 ${option.currency} = $${option.rate} ARS` : 'Directo'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">
                            {parseFloat(option.amount).toFixed(option.currency === 'BTC' ? 8 : 6)} {option.currency}
                          </p>
                          {option.validFor && (
                            <p className="text-xs text-gray-500">
                              Válido por {option.validFor}s
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedOption && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <h3 className="font-semibold mb-2">Resumen del Pago</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Monto a pagar:</span>
                        <span className="font-medium">
                          {parseFloat(selectedOption.amount).toFixed(selectedOption.currency === 'BTC' ? 8 : 6)} {selectedOption.currency}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Recibirá el comercio:</span>
                        <span className="font-medium">${payment.amount} {payment.currency}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tasa de cambio:</span>
                        <span className="font-medium">
                          {selectedOption.rate ? `1 ${selectedOption.currency} = $${selectedOption.rate} ARS` : 'Directo'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePayment}
                  disabled={!selectedOption || isProcessing}
                  className="w-full"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Pagar {selectedOption ? `${parseFloat(selectedOption.amount).toFixed(selectedOption.currency === 'BTC' ? 8 : 6)} ${selectedOption.currency}` : ''}
                    </>
                  )}
                </Button>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  <p>Al pagar, aceptas nuestros términos y condiciones</p>
                  <p>El pago se procesará de forma segura en la blockchain</p>
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
              <CardTitle className="text-lg">¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <QrCode className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">1. Escanea el QR</h3>
                  <p className="text-sm text-gray-600">
                    El comercio genera un código QR único para el pago
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold mb-2">2. Elige tu moneda</h3>
                  <p className="text-sm text-gray-600">
                    Paga con ARS, USDT, Bitcoin o Ethereum al mejor precio
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold mb-2">3. Confirmación</h3>
                  <p className="text-sm text-gray-600">
                    Recibe confirmación instantánea del pago
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
