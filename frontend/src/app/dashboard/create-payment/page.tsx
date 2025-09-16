'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/store/auth'
import { ArrowLeft, QrCode, DollarSign, FileText, Hash } from 'lucide-react'
import Link from 'next/link'

const createPaymentSchema = z.object({
  amount: z.number().min(1, 'El monto debe ser mayor a 0'),
  concept: z.string().min(1, 'El concepto es requerido'),
  orderId: z.string().optional(),
  currency: z.enum(['ARS', 'USD']).default('ARS'),
})

type CreatePaymentForm = z.infer<typeof createPaymentSchema>

export default function CreatePaymentPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [createdPayment, setCreatedPayment] = useState<any>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreatePaymentForm>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      currency: 'ARS',
    },
  })

  const watchedAmount = watch('amount')
  const watchedConcept = watch('concept')

  const onSubmit = async (data: CreatePaymentForm) => {
    if (!isAuthenticated) {
      toast.error('Debes estar autenticado para crear pagos')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-storage') ? JSON.parse(localStorage.getItem('auth-storage')!).state.token : ''}`,
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Error al crear el pago')
      }

      setCreatedPayment(result.payment)
      toast.success('¡Pago creado exitosamente!')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al crear el pago')
    } finally {
      setIsCreating(false)
    }
  }

  if (!isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Link href="/dashboard" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <QrCode className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-bold text-gray-900">Crear Pago</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formulario */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Pago</CardTitle>
                <CardDescription>
                  Completa la información para generar el código QR
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Monto */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Monto</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...register('amount', { valueAsNumber: true })}
                        className={`pl-10 ${errors.amount ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-sm text-red-500">{errors.amount.message}</p>
                    )}
                  </div>

                  {/* Concepto */}
                  <div className="space-y-2">
                    <Label htmlFor="concept">Concepto</Label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="concept"
                        type="text"
                        placeholder="Ej: Café, Almuerzo, Producto..."
                        {...register('concept')}
                        className={`pl-10 ${errors.concept ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.concept && (
                      <p className="text-sm text-red-500">{errors.concept.message}</p>
                    )}
                  </div>

                  {/* ID de Orden */}
                  <div className="space-y-2">
                    <Label htmlFor="orderId">ID de Orden (opcional)</Label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="orderId"
                        type="text"
                        placeholder="ORD-001, MESA-5..."
                        {...register('orderId')}
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Identificador interno para tu referencia
                    </p>
                  </div>

                  {/* Moneda */}
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda Base</Label>
                    <select
                      {...register('currency')}
                      className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="ARS">Pesos Argentinos (ARS)</option>
                      <option value="USD">Dólares (USD)</option>
                    </select>
                  </div>

                  {/* Botón de envío */}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Creando pago...' : 'Crear Pago'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview y QR */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Preview del pago */}
            <Card>
              <CardHeader>
                <CardTitle>Vista Previa</CardTitle>
                <CardDescription>
                  Así se verá el pago para tus clientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">
                      {watchedConcept || 'Concepto del pago'}
                    </h3>
                    <p className="text-3xl font-bold mb-4">
                      ${watchedAmount || '0'} ARS
                    </p>
                    <p className="text-sm opacity-90">
                      Escanea el QR para pagar
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code generado */}
            {createdPayment && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600">¡Pago Creado!</CardTitle>
                    <CardDescription>
                      Comparte este código QR con tu cliente
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center space-y-4">
                      <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
                        <img
                          src={createdPayment.qrCode}
                          alt="QR Code del pago"
                          className="w-48 h-48 mx-auto"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <p className="font-semibold text-lg">
                          {createdPayment.concept}
                        </p>
                        <p className="text-2xl font-bold text-green-600">
                          ${createdPayment.amount} {createdPayment.currency}
                        </p>
                        {createdPayment.orderId && (
                          <p className="text-sm text-gray-600">
                            Orden: {createdPayment.orderId}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(createdPayment.qrCode)
                            toast.success('QR copiado al portapapeles')
                          }}
                        >
                          Copiar QR
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a')
                            link.href = createdPayment.qrCode
                            link.download = `pago-${createdPayment.id}.png`
                            link.click()
                          }}
                        >
                          Descargar QR
                        </Button>
                      </div>

                      <div className="text-xs text-gray-500">
                        <p>Expira: {new Date(createdPayment.expiresAt).toLocaleString('es-AR')}</p>
                        <p>ID: {createdPayment.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Información del Pago</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• El código QR expira en 30 minutos</p>
                <p>• Los clientes pueden pagar con ARS, USDT, BTC o ETH</p>
                <p>• La conversión se hace automáticamente al mejor precio</p>
                <p>• Recibirás la notificación cuando se complete el pago</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
