'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  QrCode, 
  Smartphone, 
  ArrowRight,
  CheckCircle,
  DollarSign,
  Clock,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(1)

  const steps = [
    {
      id: 1,
      title: 'El comercio crea el pago',
      description: 'Ingresa el monto y concepto',
      icon: DollarSign,
    },
    {
      id: 2,
      title: 'Se genera el código QR',
      description: 'QR único para este pago específico',
      icon: QrCode,
    },
    {
      id: 3,
      title: 'Cliente ve las opciones',
      description: 'Elige cómo pagar',
      icon: Smartphone,
    },
    {
      id: 4,
      title: 'Cliente confirma el pago',
      description: 'Se muestra el monto exacto a pagar',
      icon: CheckCircle,
    },
    {
      id: 5,
      title: 'Pago procesado',
      description: 'Transacción confirmada en blockchain',
      icon: Zap,
    }
  ]

  const currentStepData = steps.find(step => step.id === currentStep)

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-2">Crear Pago</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monto:</span>
                  <span className="font-bold">$2.000 ARS</span>
                </div>
                <div className="flex justify-between">
                  <span>Concepto:</span>
                  <span>Café</span>
                </div>
                <div className="flex justify-between">
                  <span>Orden:</span>
                  <span>MESA-5</span>
                </div>
              </div>
            </div>
            <Button onClick={() => setCurrentStep(2)} className="w-full">
              Generar QR
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )
      case 2:
        return (
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border-2 border-dashed border-gray-300 text-center">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-16 h-16 text-gray-400" />
              </div>
              <p className="text-sm text-gray-600">Código QR generado</p>
              <p className="font-semibold">Café: $2.000 ARS</p>
            </div>
            <Button onClick={() => setCurrentStep(3)} className="w-full">
              Cliente escanea QR
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )
      case 3:
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-3">Opciones de Pago</h4>
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pagar en ARS</span>
                    <span className="font-bold">$2.000 ARS</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pagar en USDT</span>
                    <span className="font-bold">5.28 USDT</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Cotización: 379 ARS/USDT</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Pagar en BTC</span>
                    <span className="font-bold">0.000133 BTC</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Cotización: 15M ARS/BTC</p>
                </div>
              </div>
            </div>
            <Button onClick={() => setCurrentStep(4)} className="w-full">
              Cliente elige USDT
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )
      case 4:
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-3 text-green-600">Confirmar Pago</h4>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-2xl font-bold">5.28 USDT</p>
                  <p className="text-sm text-gray-600">Cotización válida por 30 segundos</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Recibirá el comercio:</span>
                    <span className="font-semibold">$2.006 ARS</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tasa de cambio:</span>
                    <span>380 ARS/USDT (Ripio)</span>
                  </div>
                </div>
              </div>
            </div>
            <Button onClick={() => setCurrentStep(5)} className="w-full">
              Confirmar y Pagar
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )
      case 5:
        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border">
              <h4 className="font-semibold mb-3 text-green-600">Pago Confirmado</h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Transacción confirmada</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm font-mono">Hash: 0x1234...5678</p>
                  <p className="text-sm">Confirmaciones: 1/1</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-semibold">Comercio notificado</p>
                  <p className="text-sm text-gray-600">$2.006 ARS acreditados</p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-4">¡Proceso completado!</p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  Repetir Demo
                </Button>
                <Button asChild>
                  <Link href="/auth/register">
                    Crear Cuenta
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              MidatoPay
            </span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/register">Comenzar</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Demo Interactivo
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Ve cómo funciona MidatoPay paso a paso. Desde la creación del pago hasta la confirmación final.
            </p>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Proceso de Pago</CardTitle>
                  <CardDescription>
                    Sigue el flujo completo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {steps.map((step) => (
                      <div
                        key={step.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all ${
                          currentStep === step.id
                            ? 'bg-blue-50 border border-blue-200'
                            : currentStep > step.id
                            ? 'bg-green-50 border border-green-200'
                            : 'bg-gray-50 border border-gray-200'
                        }`}
                        onClick={() => setCurrentStep(step.id)}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          currentStep === step.id
                            ? 'bg-blue-600 text-white'
                            : currentStep > step.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {currentStep > step.id ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-sm font-bold">{step.id}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${
                            currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {step.title}
                          </p>
                          <p className="text-xs text-gray-500">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-2">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <currentStepData?.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>{currentStepData?.title}</CardTitle>
                        <CardDescription>{currentStepData?.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {renderStepContent()}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Características Destacadas</CardTitle>
                <CardDescription className="text-center">
                  Lo que hace especial a MidatoPay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Tiempo Real</h3>
                    <p className="text-sm text-gray-600">
                      Precios actualizados cada 30 segundos desde Ripio y Binance
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <Zap className="w-6 h-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Conversión Automática</h3>
                    <p className="text-sm text-gray-600">
                      Los comercios reciben pesos argentinos automáticamente
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold mb-2">Seguro y Confiable</h3>
                    <p className="text-sm text-gray-600">
                      Transacciones verificadas en blockchain con máxima seguridad
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
