'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  QrCode, 
  ArrowRight,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [cardsSwapped, setCardsSwapped] = useState(false)
  const [activeIndicator, setActiveIndicator] = useState(0)

  const handleTransition = () => {
    setIsTransitioning(true)
    // Change cards immediately when loading completes
    setCardsSwapped(!cardsSwapped)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1500) // Keep transition duration for visual effect
  }

  // Auto-advance indicator every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndicator((prev) => (prev + 1) % 3)
      handleTransition()
    }, 7000)
    return () => clearInterval(interval)
  }, [cardsSwapped]) // Add cardsSwapped dependency to restart interval

  return (
    <div className="min-h-screen bg-black relative overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Purple light effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      {/* Content */}
      <div className="relative z-10">
      {/* Header */}
      <div className="flex justify-center pt-6 pb-4">
        <header className="bg-black/20 backdrop-blur-md border border-white/10 rounded-full px-6 py-3 flex items-center justify-between max-w-4xl w-full mx-4" style={{ position: 'static' }}>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <QrCode className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold text-white">
              MidatoPay
            </span>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-white hover:text-gray-300" asChild>
              <Link href="/auth/login">Iniciar Sesión</Link>
            </Button>
            <Button className="bg-lime-500 hover:bg-lime-600 text-white" asChild>
              <Link href="/auth/register">Comenzar</Link>
            </Button>
          </div>
        </header>
      </div>

      {/* Hero Section with Side Cards */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            {/* Left Side Cards - Fan Out Effect */}
            <div className="lg:col-span-2 flex flex-col items-end space-y-48">
              {/* Seguro y Confiable */}
              <motion.div
                initial={{ opacity: 0, x: -100, rotate: 15, scale: 0.9 }}
                animate={{ 
                  opacity: isTransitioning ? 0 : 1, 
                  x: isTransitioning ? 0 : [-20, 20, -20],
                  rotate: 8, // Always positive rotation for left side
                  scale: 1
                }}
                whileHover={{ rotate: 12, scale: 1.05, x: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.1,
                  x: {
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="bg-white/5 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-2xl shadow-purple-500/20 transition-all duration-300 w-48"
                style={{ transformOrigin: "bottom center" } as React.CSSProperties}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 transition-all duration-300">
                  {cardsSwapped ? <QrCode className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {cardsSwapped ? "QR Instantáneo" : "Seguro y Confiable"}
                </h3>
              </motion.div>

              {/* Oráculo de Precios */}
              <motion.div
                initial={{ opacity: 0, x: -80, rotate: 7, scale: 0.9 }}
                animate={{ 
                  opacity: isTransitioning ? 0 : 1, 
                  x: isTransitioning ? 0 : [-15, 25, -15],
                  rotate: 4, // Always positive rotation for left side
                  scale: 1
                }}
                whileHover={{ rotate: 8, scale: 1.05, x: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.2,
                  x: {
                    duration: 5.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="bg-white/5 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-2xl shadow-purple-500/20 transition-all duration-300 w-48"
                style={{ transformOrigin: "bottom center" } as React.CSSProperties}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 transition-all duration-300">
                  {cardsSwapped ? <Zap className="w-6 h-6 text-white" /> : <TrendingUp className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {cardsSwapped ? "Conversión Automática" : "Oráculo de Precios"}
                </h3>
              </motion.div>
            </div>

            {/* Center Content */}
            <div className="lg:col-span-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Badge variant="secondary" className="mb-4">
                  🚀 Nuevo: Soporte para Bitcoin y Ethereum
                </Badge>
                
                <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Pagos con
                  <br />
                  Criptomonedas
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                  Recibe pagos en USDT, Bitcoin y Ethereum. Convierte automáticamente a pesos argentinos 
                  con el mejor precio del mercado. Simple, rápido y seguro.
                </p>
                
                <div className="flex justify-center mb-12">
                  <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <Link href="/auth/login">
                      Iniciar Sesión
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </Button>
                </div>

                {/* Loading Rectangle Indicators */}
                <div className="flex justify-center items-center space-x-3 mb-8">
                  {[0, 1, 2].map((index) => (
                    <div key={index} className="relative">
                      {/* Background rectangle */}
                      <div className="w-12 h-2 bg-gray-400/30 rounded-full overflow-hidden">
                        {/* Loading fill - only for active indicator */}
                        {activeIndicator === index && (
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-violet-600 rounded-full"
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{
                              duration: 6.5, // 6.5 seconds to fill completely (leaving 0.5s for transition)
                              ease: "linear"
                            }}
                            key={activeIndicator} // Force re-render when activeIndicator changes
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Demo QR Code */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="inline-block"
              >
                <Card className="w-64 mx-auto shadow-2xl bg-white/10 backdrop-blur-sm border-white/20">
                  <CardContent className="p-6">
                    <div className="w-48 h-48 bg-white/20 rounded-lg flex items-center justify-center mb-4">
                      <QrCode className="w-24 h-24 text-white" />
                    </div>
                    <p className="text-sm text-gray-300">Escanea para pagar</p>
                    <p className="font-semibold text-white">Café: $2.000 ARS</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Side Cards - Fan Out Effect */}
            <div className="lg:col-span-2 flex flex-col items-start space-y-48">
              {/* QR Instantáneo */}
              <motion.div
                initial={{ opacity: 0, x: 100, rotate: -15, scale: 0.9 }}
                animate={{ 
                  opacity: isTransitioning ? 0 : 1, 
                  x: isTransitioning ? 0 : [20, -20, 20],
                  rotate: -8, // Always negative rotation for right side
                  scale: 1
                }}
                whileHover={{ rotate: -12, scale: 1.05, x: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.3,
                  x: {
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="bg-white/5 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-2xl shadow-purple-500/20 transition-all duration-300 w-48"
                style={{ transformOrigin: "bottom center" } as React.CSSProperties}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 transition-all duration-300">
                  {cardsSwapped ? <Shield className="w-6 h-6 text-white" /> : <QrCode className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {cardsSwapped ? "Seguro y Confiable" : "QR Instantáneo"}
                </h3>
              </motion.div>

              {/* Conversión Automática */}
              <motion.div
                initial={{ opacity: 0, x: 80, rotate: -7, scale: 0.9 }}
                animate={{ 
                  opacity: isTransitioning ? 0 : 1, 
                  x: isTransitioning ? 0 : [15, -25, 15],
                  rotate: -4, // Always negative rotation for right side
                  scale: 1
                }}
                whileHover={{ rotate: -8, scale: 1.05, x: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 0.4,
                  x: {
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="bg-white/5 backdrop-blur-lg border border-white/30 rounded-xl p-4 shadow-2xl shadow-purple-500/20 transition-all duration-300 w-48"
                style={{ transformOrigin: "bottom center" } as React.CSSProperties}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-3 transition-all duration-300">
                  {cardsSwapped ? <TrendingUp className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-semibold text-white">
                  {cardsSwapped ? "Oráculo de Precios" : "Conversión Automática"}
                </h3>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}
