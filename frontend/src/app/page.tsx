'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
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
import Image from 'next/image'
import Link from 'next/link'
import PixelBlast from '@/components/PixelBlast'
import PillNav from '@/components/PillNav'

export default function HomePage() {
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [cardsSwapped, setCardsSwapped] = useState(false)
  const [activeIndicator, setActiveIndicator] = useState(0)
  const [typewriterText, setTypewriterText] = useState('')
  
  const words = ['INFLACION', 'DEVALUACION', 'CRISIS']
  const typewriterRef = useRef({
    currentWordIndex: 0,
    charIndex: 0,
    isDeleting: false,
    waitCount: 0
  })

  const handleTransition = () => {
    setIsTransitioning(true)
    // Change cards immediately when loading completes
    setCardsSwapped(!cardsSwapped)
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1500) // Keep transition duration for visual effect
  }

  // Typewriter effect
  useEffect(() => {
    const typeInterval = setInterval(() => {
      const currentWord = words[typewriterRef.current.currentWordIndex]
      
      if (!typewriterRef.current.isDeleting) {
        // Typing
        if (typewriterRef.current.charIndex < currentWord.length) {
          setTypewriterText(currentWord.substring(0, typewriterRef.current.charIndex + 1))
          typewriterRef.current.charIndex++
        } else {
          // Wait before deleting (20 iterations of 100ms = 2 seconds)
          typewriterRef.current.waitCount++
          if (typewriterRef.current.waitCount >= 20) {
            typewriterRef.current.isDeleting = true
            typewriterRef.current.waitCount = 0
          }
        }
      } else {
        // Deleting
        if (typewriterRef.current.charIndex > 0) {
          setTypewriterText(currentWord.substring(0, typewriterRef.current.charIndex - 1))
          typewriterRef.current.charIndex--
        } else {
          // Move to next word
          typewriterRef.current.isDeleting = false
          typewriterRef.current.currentWordIndex = (typewriterRef.current.currentWordIndex + 1) % words.length
          typewriterRef.current.charIndex = 0
        }
      }
    }, 100)
    
    return () => clearInterval(typeInterval)
  }, [])

  // Auto-advance indicator every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndicator((prev) => (prev + 1) % 3)
      handleTransition()
    }, 7000)
    return () => clearInterval(interval)
  }, [cardsSwapped]) // Add cardsSwapped dependency to restart interval

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#f7f7f6' }}>
      {/* PixelBlast Background */}
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color="#fe6c1c"
          patternScale={2.5}
          patternDensity={0.8}
          pixelSizeJitter={0.3}
          enableRipples
          rippleSpeed={0.3}
          rippleThickness={0.15}
          rippleIntensityScale={1.2}
          liquid
          liquidStrength={0.08}
          liquidRadius={1.0}
          liquidWobbleSpeed={4}
          speed={0.4}
          edgeFade={0.3}
          transparent
          className=""
          style={{}}
        />
      </div>
      
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
          activeHref="/"
          baseColor="#1a1a1a"
          pillColor="#f7f7f6"
          hoveredPillTextColor="#f7f7f6"
          pillTextColor="#1a1a1a"
          className="custom-pill-nav"
        />
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
                className="backdrop-blur-lg border rounded-xl p-4 shadow-2xl transition-all duration-300 w-48"
                style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.1)', 
                  borderColor: 'rgba(254, 108, 28, 0.3)', 
                  boxShadow: '0 25px 50px -12px rgba(254, 108, 28, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transformOrigin: "bottom center" 
                } as React.CSSProperties}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-300" style={{ background: 'linear-gradient(to bottom right, #fe6c1c, #fe9c42)' }}>
                  {cardsSwapped ? <QrCode className="w-6 h-6 text-white" /> : <Shield className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
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
                className="backdrop-blur-lg border rounded-xl p-4 shadow-2xl transition-all duration-300 w-48"
                style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.1)', 
                  borderColor: 'rgba(254, 108, 28, 0.3)', 
                  boxShadow: '0 25px 50px -12px rgba(254, 108, 28, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transformOrigin: "bottom center" 
                } as React.CSSProperties}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-300" style={{ background: 'linear-gradient(to bottom right, #fe6c1c, #fe9c42)' }}>
                  {cardsSwapped ? <Zap className="w-6 h-6 text-white" /> : <TrendingUp className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
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
                <div className="flex justify-center mb-4">
                  <Badge className="inline-flex items-center gap-2 px-3 py-1" style={{ backgroundColor: '#161819', color: '#f7f7f6' }}>
                    <span 
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: '#fe6c1c', color: '#ffffff' }}
                    >
                      NUEVO
                    </span>
                    Crecé tu negocio
                  </Badge>
                </div>
                
                <h1 
                  className="text-4xl md:text-6xl font-bold mb-6" 
                  style={{ 
                    fontFamily: 'Gromm, sans-serif', 
                    color: '#fe6c1c'
                  }}
                >
                  PROTEGE TU NEGOCIO DE LA
                  <br />
                  <span className="inline-block min-h-[1.2em]">
                    {typewriterText}
                    <span className="animate-pulse">|</span>
                  </span>
                </h1>
                
                <div className="text-center mb-8">
                  <p 
                    className="text-2xl font-semibold mb-6" 
                    style={{ 
                      fontFamily: 'Gromm, sans-serif', 
                      color: '#1a1a1a'
                    }}
                  >
                    TU NEGOCIO, SIN LIMITES:
                  </p>
                  <div className="flex items-center justify-center max-w-4xl mx-auto flex-wrap gap-4">
                    <span className="text-2xl font-semibold" style={{ fontFamily: 'Gromm, sans-serif', color: '#1a1a1a' }}>COBRA EN</span>
                    <div className="flex items-center gap-3">
                      {/* USDT Badge */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ 
                        background: 'linear-gradient(135deg, rgba(0,147,147,0.12) 0%, rgba(0,147,147,0.06) 100%)', 
                        border: '1px solid rgba(0,147,147,0.25)',
                        boxShadow: '0 4px 12px rgba(0,147,147,0.15)'
                      }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <g clipPath="url(#USDT_home_1)">
                              <path fill="#009393" d="M24 0H0v24h24z"/>
                              <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                            </g>
                            <defs>
                              <clipPath id="USDT_home_1">
                                <path fill="#fff" d="M0 0h24v24H0z"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#009393' }}>USDT</span>
                      </div>

                      {/* BTC Badge */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ 
                        background: 'linear-gradient(135deg, rgba(247,147,26,0.12) 0%, rgba(247,147,26,0.06) 100%)', 
                        border: '1px solid rgba(247,147,26,0.25)',
                        boxShadow: '0 4px 12px rgba(247,147,26,0.15)'
                      }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F7931A' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path fill="#fff" d="M18.763 10.236c.28-1.895-1.155-2.905-3.131-3.591l.64-2.553-1.56-.389-.623 2.49-1.245-.297.631-2.508L11.915 3l-.641 2.562-.992-.234v-.01l-2.157-.54-.415 1.668s1.155.272 1.137.28c.631.163.74.578.722.903l-.722 2.923.162.054-.171-.036-1.02 4.087c-.072.19-.27.478-.712.36.018.028-1.128-.27-1.128-.27l-.776 1.778 2.03.505 1.11.289-.65 2.59 1.56.387.633-2.562 1.253.324-.64 2.554 1.56.388.641-2.59c2.662.505 4.665.308 5.505-2.102.676-1.94-.037-3.05-1.435-3.79 1.02-.225 1.786-.902 1.985-2.282zm-3.564 4.999c-.479 1.94-3.745.884-4.8.63l.857-3.436c1.055.27 4.448.784 3.943 2.796zm.478-5.026c-.433 1.76-3.158.866-4.033.65l.775-3.113c.885.217 3.718.632 3.258 2.463"/>
                          </svg>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#F7931A' }}>BTC</span>
                      </div>

                      {/* ETH Badge */}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ 
                        background: 'linear-gradient(135deg, rgba(98,126,234,0.12) 0%, rgba(98,126,234,0.06) 100%)', 
                        border: '1px solid rgba(98,126,234,0.25)',
                        boxShadow: '0 4px 12px rgba(98,126,234,0.15)'
                      }}>
                        <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#627eea' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <g clipPath="url(#ETH_home_1)">
                              <path fill="#627eea" d="M24 0H0v24h24z"/>
                              <path fill="#fff" d="M12 4v5.912l5 2.236z"/>
                              <path fill="#fff" d="m12 4-5 8.148 5-2.236z"/>
                              <path fill="#fff" d="M12 15.98V20l5-6.92z"/>
                              <path fill="#fff" d="M12 20v-4.02l-5-2.9z"/>
                              <path fill="#fff" d="m12 15.048 5-2.9-5-2.236z"/>
                              <path fill="#fff" d="m7 12.148 5 2.9V9.912z"/>
                            </g>
                            <defs>
                              <clipPath id="ETH_home_1">
                                <path fill="#fff" d="M0 0h24v24H0z"/>
                              </clipPath>
                            </defs>
                          </svg>
                        </div>
                        <span className="text-sm font-bold" style={{ color: '#627eea' }}>ETH</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mb-12">
                  <Button size="lg" className="text-lg px-8 py-6 text-white" style={{ backgroundColor: '#fe6c1c' }} asChild>
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
                      <div className="w-12 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#5d5d5d30' }}>
                        {/* Loading fill - only for active indicator */}
                        {activeIndicator === index && (
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: 'linear-gradient(to right, #fe6c1c, #fe9c42)' }}
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
                <Card className="w-64 mx-auto shadow-2xl backdrop-blur-xl" style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.15)', 
                  borderColor: 'rgba(254, 108, 28, 0.3)',
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}>
                  <CardContent className="p-6">
                    <div className="w-48 h-48 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: 'rgba(26, 26, 26, 0.1)' }}>
                      <QrCode className="w-24 h-24" style={{ color: '#1a1a1a' }} />
                    </div>
                    <p className="text-sm" style={{ color: '#1a1a1a' }}>Escanea para pagar</p>
                    <p className="font-semibold" style={{ color: '#1a1a1a' }}>Café: $2.000 ARS</p>
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
                className="backdrop-blur-lg border rounded-xl p-4 shadow-2xl transition-all duration-300 w-48"
                style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.1)', 
                  borderColor: 'rgba(254, 108, 28, 0.3)', 
                  boxShadow: '0 25px 50px -12px rgba(254, 108, 28, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transformOrigin: "bottom center" 
                } as React.CSSProperties}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-300" style={{ background: 'linear-gradient(to bottom right, #fe6c1c, #fe9c42)' }}>
                  {cardsSwapped ? <Shield className="w-6 h-6 text-white" /> : <QrCode className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
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
                className="backdrop-blur-lg border rounded-xl p-4 shadow-2xl transition-all duration-300 w-48"
                style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.1)', 
                  borderColor: 'rgba(254, 108, 28, 0.3)', 
                  boxShadow: '0 25px 50px -12px rgba(254, 108, 28, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                  transformOrigin: "bottom center" 
                } as React.CSSProperties}
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-3 transition-all duration-300" style={{ background: 'linear-gradient(to bottom right, #fe6c1c, #fe9c42)' }}>
                  {cardsSwapped ? <TrendingUp className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
                </div>
                <h3 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>
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
