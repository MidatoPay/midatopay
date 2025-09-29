'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Mail, DollarSign, Users, Clock } from 'lucide-react'
import PillNav from '@/components/PillNav'

export default function AnotatePage() {
  const [email, setEmail] = useState('')
  const [monthlyBilling, setMonthlyBilling] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/waitlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          monthly_billing_usd: parseInt(monthlyBilling)
        }),
      })

      if (response.ok) {
        setIsSuccess(true)
        setEmail('')
        setMonthlyBilling('')
      } else {
        const data = await response.json()
        setError(data.message || 'Error al unirse a la lista de espera')
      }
    } catch (err) {
      setError('Error de conexión. Por favor, intenta nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f6' }}>
      {/* Content */}
      <div className="relative z-10">
        {/* PillNav Header */}
        <div className="flex justify-center pt-6 pb-4">
          <PillNav
            logo="/logo.png"
            logoAlt="MidatoPay Logo"
            items={[
              { label: 'Inicio', href: '/' },
              { label: 'Anotate', href: '/anotate' },
              { label: 'Iniciar Sesion', href: '/auth/login' },
              { label: 'Comenzar', href: '/auth/register' }
            ]}
            activeHref="/anotate"
            baseColor="#1a1a1a"
            pillColor="#f7f7f6"
            hoveredPillTextColor="#f7f7f6"
            pillTextColor="#1a1a1a"
            className="custom-pill-nav"
          />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            {/* Header Section */}
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              
              <h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                style={{ fontFamily: 'Gromm, sans-serif', color: '#fe6c1c' }}
              >
                UNITE A LA LISTA DE ESPERA
              </h1>
              
              <p 
                className="text-xl md:text-2xl mb-8"
                style={{ fontFamily: 'Montserrat, sans-serif', color: '#1a1a1a' }}
              >
                Sé el primero en conocer el lanzamiento de MidatoPay
              </p>
            </motion.div>

            {/* Stats Section */}
            <motion.div 
              className="flex flex-col md:flex-row justify-center gap-6 mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl"
                  style={{ 
                    backgroundColor: '#f7f7f6', 
                    borderColor: '#fe6c1c',
                    boxShadow: '0 4px 20px rgba(254, 108, 28, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Users className="w-12 h-12 mx-auto mb-4" style={{ color: '#fe6c1c' }} />
                    </motion.div>
                    <motion.h3 
                      className="text-2xl font-bold mb-2" 
                      style={{ color: '#1a1a1a' }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      20+
                    </motion.h3>
                    <p className="text-sm" style={{ color: '#5d5d5d' }}>Empresas interesadas</p>
                  </CardContent>
                </Card>
              </motion.div>
              
              <motion.div
                whileHover={{ 
                  scale: 1.05,
                  y: -5,
                  transition: { duration: 0.2 }
                }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card 
                  className="cursor-pointer transition-all duration-300 hover:shadow-xl"
                  style={{ 
                    backgroundColor: '#f7f7f6', 
                    borderColor: '#fe6c1c',
                    boxShadow: '0 4px 20px rgba(254, 108, 28, 0.1)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <CardContent className="p-6 text-center">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Clock className="w-12 h-12 mx-auto mb-4" style={{ color: '#fe6c1c' }} />
                    </motion.div>
                    <motion.h3 
                      className="text-2xl font-bold mb-2" 
                      style={{ color: '#1a1a1a' }}
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      2025
                    </motion.h3>
                    <p className="text-sm" style={{ color: '#5d5d5d' }}>Lanzamiento previsto</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>

            {/* Form Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Card style={{ backgroundColor: '#f7f7f6', borderColor: '#fe6c1c' }}>
                <CardHeader>
                  <CardTitle 
                    className="text-2xl text-center"
                    style={{ fontFamily: 'Gromm, sans-serif', color: '#1a1a1a' }}
                  >
                    Formulario de registro
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isSuccess ? (
                    <motion.div 
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: '#fe6c1c' }} />
                      <h3 className="text-xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
                        ¡Te has unido exitosamente!
                      </h3>
                      <p style={{ color: '#5d5d5d' }}>
                        Te notificaremos cuando MidatoPay esté disponible.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="email" style={{ color: '#1a1a1a' }}>
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 w-4 h-4" style={{ color: '#5d5d5d' }} />
                          <Input
                            id="email"
                            type="email"
                            placeholder="tu@empresa.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-10"
                            style={{ 
                              backgroundColor: '#ffffff', 
                              borderColor: '#fe6c1c',
                              color: '#1a1a1a'
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="monthlyBilling" style={{ color: '#1a1a1a' }}>
                          Facturación Mensual Estimada (USD)
                        </Label>
                        <select
                          id="monthlyBilling"
                          value={monthlyBilling}
                          onChange={(e) => setMonthlyBilling(e.target.value)}
                          className="w-full p-3 border rounded-md"
                          style={{ 
                            backgroundColor: '#ffffff', 
                            borderColor: '#fe6c1c',
                            color: '#1a1a1a'
                          }}
                          required
                        >
                          <option value="">Selecciona tu rango de facturación</option>
                          <option value="1000">$1,000 - $5,000</option>
                          <option value="5000">$5,000 - $10,000</option>
                          <option value="10000">$10,000 - $25,000</option>
                          <option value="25000">$25,000 - $50,000</option>
                          <option value="50000">$50,000 - $100,000</option>
                          <option value="100000">$100,000+</option>
                        </select>
                      </div>

                      {error && (
                        <motion.div 
                          className="p-3 rounded-md"
                          style={{ backgroundColor: '#fee2e2', borderColor: '#fca5a5' }}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <p className="text-sm" style={{ color: '#dc2626' }}>{error}</p>
                        </motion.div>
                      )}

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        style={{ backgroundColor: '#fe6c1c' }}
                      >
                        {isSubmitting ? 'Uniéndose...' : 'Unirse a la Lista de Espera'}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            
          </div>
        </div>
      </div>
    </div>
  )
}
