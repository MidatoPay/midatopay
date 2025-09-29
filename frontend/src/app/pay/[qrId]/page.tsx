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
      // Siempre seleccionar ARS automáticamente
      const arsOption = data.paymentOptions.find(option => option.currency === 'ARS')
      setSelectedOption(arsOption || data.paymentOptions[0])
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayment = async () => {
    if (!payment) return

    setIsProcessing(true)
    try {
      const transactionData = {
        paymentId: payment.id,
        currency: 'ARS',
        amount: payment.amount,
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
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f6' }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: '#f7f7f6', borderColor: 'rgba(26,26,26,0.08)' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fe6c1c 0%, #fe9c42 100%)' }}>
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Gromm, sans-serif', color: '#1a1a1a' }}>Pagar con MidatoPay</h1>
                <p className="text-sm" style={{ color: '#5d5d5d' }}>Pago seguro y rápido</p>
              </div>
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
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1a1a1a', fontFamily: 'Gromm, sans-serif' }}>Detalles del Pago</CardTitle>
                <CardDescription style={{ color: '#5d5d5d' }}>
                  Información del comercio y el pago
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>Comercio:</span>
                  <span className="font-medium" style={{ color: '#1a1a1a' }}>{payment.merchant.name}</span>
                </div>
                
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
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>Monto original:</span>
                  <span className="font-bold text-lg" style={{ color: '#1a1a1a' }}>${payment.amount} ARS</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>Expira:</span>
                  <span className="text-sm" style={{ color: '#5d5d5d' }}>
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
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardHeader>
                <CardTitle style={{ color: '#1a1a1a', fontFamily: 'Gromm, sans-serif' }}>Opciones de Pago</CardTitle>
                <CardDescription style={{ color: '#5d5d5d' }}>
                  Paga directamente en pesos argentinos
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Solo mostrar ARS */}
                <div className="space-y-3 mb-6">
                  {paymentOptions.filter(option => option.currency === 'ARS').map((option, index) => (
                    <div
                      key={option.currency}
                      className="p-4 rounded-lg border-2 cursor-pointer transition-all"
                      style={{ 
                        border: '2px solid rgba(254,108,28,0.3)',
                        backgroundColor: 'rgba(254,108,28,0.05)'
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: '#fe6c1c' }}>
                            <img src="/logo-arg.png" alt="ARS" className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium" style={{ color: '#1a1a1a' }}>ARS</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg" style={{ color: '#1a1a1a' }}>
                            ${payment.amount} ARS
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Resumen del pago simplificado */}
                <div className="rounded-lg p-4 mb-6" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <h3 className="font-semibold mb-2" style={{ color: '#10b981' }}>Resumen del Pago</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span style={{ color: '#1a1a1a' }}>Monto a pagar:</span>
                      <span className="font-medium" style={{ color: '#1a1a1a' }}>
                        ${payment.amount} ARS
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span style={{ color: '#5d5d5d' }}>Recibirá el comercio:</span>
                      <span className="font-medium" style={{ color: '#1a1a1a' }}>${payment.amount} ARS</span>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full h-12 text-base font-semibold rounded-xl transition-all duration-200"
                  style={{ 
                    backgroundColor: '#fe6c1c', 
                    color: '#ffffff', 
                    border: 'none',
                    fontFamily: 'Gromm, sans-serif'
                  }}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando pago...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Pagar
                    </>
                  )}
                </Button>

                <div className="mt-4 text-xs text-center" style={{ color: '#5d5d5d' }}>
                  <p>Al pagar, aceptas nuestros términos y condiciones</p>
                  <p>El pago se procesará de forma segura</p>
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
          <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
            <CardHeader>
              <CardTitle className="text-lg" style={{ color: '#1a1a1a', fontFamily: 'Gromm, sans-serif' }}>¿Cómo funciona?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(254,108,28,0.1)' }}>
                    <QrCode className="w-6 h-6" style={{ color: '#fe6c1c' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: '#fe6c1c' }}>1. Escanea el QR</h3>
                  <p className="text-sm" style={{ color: '#5d5d5d' }}>
                    El comercio genera un código QR único para el pago
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(254,108,28,0.1)' }}>
                    <DollarSign className="w-6 h-6" style={{ color: '#fe6c1c' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: '#fe6c1c' }}>2. Paga en ARS</h3>
                  <p className="text-sm" style={{ color: '#5d5d5d' }}>
                    Paga directamente en pesos argentinos de forma segura
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                    <CheckCircle className="w-6 h-6" style={{ color: '#10b981' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: '#10b981' }}>3. Confirmación</h3>
                  <p className="text-sm" style={{ color: '#5d5d5d' }}>
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
