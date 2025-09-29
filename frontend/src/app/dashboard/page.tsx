'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth, useAuthActions } from '@/store/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  QrCode, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle,
  LogOut,
  Settings,
  History,
  Wallet,
  Package,
  Tags,
  BarChart3,
  Users,
  CreditCard,
  ShoppingBag,
  Calculator,
  FileText,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { logout } = useAuthActions()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPayments: 5,
    pendingPayments: 1,
    completedPayments: 4,
    totalAmount: 207000, // ARS
    totalUSDT: 150,
    totalBTC: 0,
    totalETH: 0,
    // Nuevas métricas profesionales
    dailyVolume: 89500, // ARS del día
    weeklyGrowth: 23.5, // %
    monthlyRevenue: 850000, // ARS
    totalCommissions: 12.8, // USDT
    averageTransaction: 41400, // ARS
    conversionRate: 98.2, // %
    totalCustomers: 47,
    activeProducts: 12
  })

  const [showMoreActions, setShowMoreActions] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = () => {
    logout()
    toast.success('Sesión cerrada')
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f7f7f6' }}>
      {/* Header */}
      <header className="shadow-sm border-b" style={{ backgroundColor: '#f7f7f6', borderColor: 'rgba(26,26,26,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #fe6c1c 0%, #fe9c42 100%)' }}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Gromm, sans-serif', color: '#1a1a1a' }}>MidatoPay</h1>
                <p className="text-sm" style={{ color: '#5d5d5d' }}>Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>{user.name}</p>
                <p className="text-xs" style={{ color: '#5d5d5d' }}>{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} style={{ color: '#1a1a1a' }}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Gromm, sans-serif', color: '#1a1a1a' }}>
            ¡Bienvenido, {user.name}!
          </h2>
          <p style={{ color: '#5d5d5d', fontFamily: 'Montserrat, sans-serif' }}>
            Gestiona tus pagos en criptomonedas desde aquí
          </p>
        </motion.div>

        {/* Stats Cards */}
        {/* Fila 1: Total recaudado a lo ancho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#fe6c1c,#fe9c42)' }}>
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#5d5d5d' }}>Saldo Total</p>
                  <p className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>
                    ${stats.totalAmount.toLocaleString()} ARS
                  </p>
                      </div>
                    </div>
              
              {/* Saldos en Criptomonedas */}
              <div>
                <h4 className="text-sm font-medium mb-4" style={{ color: '#5d5d5d' }}>Saldos en Criptomonedas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* USDT Card */}
                  <div className="rounded-xl p-4 border" style={{ 
                    background: 'linear-gradient(135deg, rgba(0,147,147,0.08) 0%, rgba(0,147,147,0.04) 100%)', 
                    border: '1px solid rgba(0,147,147,0.15)',
                    boxShadow: '0 4px 12px rgba(0,147,147,0.1)'
                  }}>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <g clipPath="url(#USDT_a_card)">
                            <path fill="#009393" d="M24 0H0v24h24z"/>
                            <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                          </g>
                          <defs>
                            <clipPath id="USDT_a_card">
                              <path fill="#fff" d="M0 0h24v24H0z"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-gray-900 mb-1">USDT</h5>
                      <p className="text-lg font-bold text-gray-900">${stats.totalUSDT} USD</p>
                      <p className="text-sm text-gray-500">≈ ${(stats.totalUSDT * 1000).toLocaleString()} ARS</p>
                      </div>
                    </div>
                  
                  {/* BTC Card */}
                  <div className="rounded-xl p-4 border" style={{ 
                    background: 'linear-gradient(135deg, rgba(247,147,26,0.08) 0%, rgba(247,147,26,0.04) 100%)', 
                    border: '1px solid rgba(247,147,26,0.15)',
                    boxShadow: '0 4px 12px rgba(247,147,26,0.1)'
                  }}>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#F7931A' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path fill="#fff" d="M18.763 10.236c.28-1.895-1.155-2.905-3.131-3.591l.64-2.553-1.56-.389-.623 2.49-1.245-.297.631-2.508L11.915 3l-.641 2.562-.992-.234v-.01l-2.157-.54-.415 1.668s1.155.272 1.137.28c.631.163.74.578.722.903l-.722 2.923.162.054-.171-.036-1.02 4.087c-.072.19-.27.478-.712.36.018.028-1.128-.27-1.128-.27l-.776 1.778 2.03.505 1.11.289-.65 2.59 1.56.387.633-2.562 1.253.324-.64 2.554 1.56.388.641-2.59c2.662.505 4.665.308 5.505-2.102.676-1.94-.037-3.05-1.435-3.79 1.02-.225 1.786-.902 1.985-2.282zm-3.564 4.999c-.479 1.94-3.745.884-4.8.63l.857-3.436c1.055.27 4.448.784 3.943 2.796zm.478-5.026c-.433 1.76-3.158.866-4.033.65l.775-3.113c.885.217 3.718.632 3.258 2.463"/>
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-gray-900 mb-1">BTC</h5>
                      <p className="text-lg font-bold text-gray-900">0 BTC</p>
                      <p className="text-sm text-gray-500">$0 ARS</p>
                    </div>
                  </div>
                  
                  {/* ETH Card */}
                  <div className="rounded-xl p-4 border" style={{ 
                    background: 'linear-gradient(135deg, rgba(98,126,234,0.08) 0%, rgba(98,126,234,0.04) 100%)', 
                    border: '1px solid rgba(98,126,234,0.15)',
                    boxShadow: '0 4px 12px rgba(98,126,234,0.1)'
                  }}>
                    <div className="flex items-center justify-center mb-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: '#627eea' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <g clipPath="url(#ETH_a_card)">
                            <path fill="#627eea" d="M24 0H0v24h24z"/>
                            <path fill="#fff" d="M12 4v5.912l5 2.236z"/>
                            <path fill="#fff" d="m12 4-5 8.148 5-2.236z"/>
                            <path fill="#fff" d="M12 15.98V20l5-6.92z"/>
                            <path fill="#fff" d="M12 20v-4.02l-5-2.9z"/>
                            <path fill="#fff" d="m12 15.048 5-2.9-5-2.236z"/>
                            <path fill="#fff" d="m7 12.148 5 2.9V9.912z"/>
                          </g>
                          <defs>
                            <clipPath id="ETH_a_card">
                              <path fill="#fff" d="M0 0h24v24H0z"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                    </div>
                    <div className="text-center">
                      <h5 className="font-semibold text-gray-900 mb-1">ETH</h5>
                      <p className="text-lg font-bold text-gray-900">0 ETH</p>
                      <p className="text-sm text-gray-500">$0 ARS</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Fila 2: tres métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#16a34a,#22c55e)' }}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium" style={{ color: '#5d5d5d' }}>Pagos Completados</p>
                    <p className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>{stats.completedPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium" style={{ color: '#5d5d5d' }}>Pagos Pendientes</p>
                    <p className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>{stats.pendingPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#fe6c1c,#fe9c42)' }}>
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium" style={{ color: '#5d5d5d' }}>Total Pagos</p>
                    <p className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>{stats.totalPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Métricas Profesionales Avanzadas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: '#1a1a1a', fontFamily: 'Gromm, sans-serif' }}>Metricas de Rendimiento</h3>
            
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Volumen Diario */}
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(59,130,246,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#3b82f6,#60a5fa)' }}>
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>HOY</div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: '#5d5d5d' }}>Volumen Diario</p>
                <p className="text-xl font-bold" style={{ color: '#1a1a1a' }}>${stats.dailyVolume.toLocaleString()}</p>
                <p className="text-xs mt-1" style={{ color: '#3b82f6' }}>+15.2% vs ayer</p>
              </CardContent>
            </Card>

            {/* Crecimiento Semanal */}
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(16,185,129,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>7D</div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: '#5d5d5d' }}>Crecimiento</p>
                <p className="text-xl font-bold" style={{ color: '#1a1a1a' }}>+{stats.weeklyGrowth}%</p>
                <p className="text-xs mt-1" style={{ color: '#10b981' }}>Tendencia alcista</p>
              </CardContent>
            </Card>

            {/* Productos Activos */}
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(20,184,166,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#14b8a6,#5eead4)' }}>
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(20,184,166,0.1)', color: '#14b8a6' }}>STOCK</div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: '#5d5d5d' }}>Productos</p>
                <p className="text-xl font-bold" style={{ color: '#1a1a1a' }}>{stats.activeProducts}</p>
                <p className="text-xs mt-1" style={{ color: '#14b8a6' }}>En menú activo</p>
              </CardContent>
            </Card>

            {/* Ingresos Mensuales */}
            <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(168,85,247,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#a855f7,#c084fc)' }}>
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7' }}>MES</div>
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: '#5d5d5d' }}>Facturación</p>
                <p className="text-xl font-bold" style={{ color: '#1a1a1a' }}>${stats.monthlyRevenue.toLocaleString()}</p>
                <p className="text-xs mt-1" style={{ color: '#a855f7' }}>Meta: $1M ARS</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: '#1a1a1a', fontFamily: 'Gromm, sans-serif' }}>Centro de Control</h3>
            <p className="text-sm" style={{ color: '#5d5d5d' }}>Gestiona tu negocio desde aquí</p>
          </div>
          
          {/* Acciones Principales */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
            <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
              background: 'linear-gradient(135deg, rgba(254,108,28,0.15) 0%, rgba(254,108,28,0.08) 100%)', 
              border: '1px solid rgba(254,108,28,0.3)',
              boxShadow: '0 4px 12px rgba(254,108,28,0.2)'
            }}>
              <Link href="/dashboard/create-payment">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#fe6c1c,#fe9c42)' }}>
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>Crear Pago</p>
                  <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>QR Instantáneo</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
              backgroundColor: 'rgba(247, 247, 246, 0.15)', 
              borderColor: 'rgba(16,185,129,0.3)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <Link href="/dashboard/transactions">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}>
                      <History className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Historial</p>
                  <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Transacciones</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
              backgroundColor: 'rgba(247, 247, 246, 0.15)', 
              borderColor: 'rgba(59,130,246,0.3)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <Link href="/dashboard/products">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#3b82f6,#60a5fa)' }}>
                      <Package className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Productos</p>
                  <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Gestionar menú</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
              backgroundColor: 'rgba(247, 247, 246, 0.15)', 
              borderColor: 'rgba(139,92,246,0.3)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <Link href="/dashboard/inventory">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#8b5cf6,#a78bfa)' }}>
                      <ShoppingBag className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Stock</p>
                  <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Inventario</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
              backgroundColor: 'rgba(247, 247, 246, 0.15)', 
              borderColor: 'rgba(245,158,11,0.3)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <Link href="/dashboard/analytics">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}>
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Analytics</p>
                  <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Reportes</p>
                </CardContent>
              </Link>
            </Card>

            <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
              backgroundColor: 'rgba(247, 247, 246, 0.15)', 
              borderColor: 'rgba(107,114,128,0.3)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <div className="cursor-pointer" onClick={() => setShowMoreActions(true)}>
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#6b7280,#9ca3af)' }}>
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Ver más</p>
                  <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Funciones</p>
                </CardContent>
              </div>
            </Card>
          </div>


          {/* Acciones Adicionales (expandidas) */}
          {showMoreActions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
              className="mt-4"
            >
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.15)', 
                  borderColor: 'rgba(14,165,233,0.3)', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
                  backdropFilter: 'blur(10px)' 
                }}>
              <Link href="/dashboard/payments">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#0ea5e9,#38bdf8)' }}>
                          <QrCode className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Mis Pagos</p>
                      <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Gestionar QRs</p>
                    </CardContent>
              </Link>
                </Card>

                <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.15)', 
                  borderColor: 'rgba(20,184,166,0.3)', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
                  backdropFilter: 'blur(10px)' 
                }}>
                  <Link href="/dashboard/pricing">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#14b8a6,#5eead4)' }}>
                          <Tags className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Precios</p>
                      <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Actualizar</p>
                    </CardContent>
              </Link>
                </Card>

                <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.15)', 
                  borderColor: 'rgba(236,72,153,0.3)', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
                  backdropFilter: 'blur(10px)' 
                }}>
                  <Link href="/dashboard/calculator">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#ec4899,#f472b6)' }}>
                          <Calculator className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Calculadora</p>
                      <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Precio + Crypto</p>
                    </CardContent>
              </Link>
                </Card>

                <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.15)', 
                  borderColor: 'rgba(5,150,105,0.3)', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
                  backdropFilter: 'blur(10px)' 
                }}>
                  <Link href="/dashboard/reports">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
                          <FileText className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Reportes</p>
                      <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Informes</p>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.15)', 
                  borderColor: 'rgba(168,85,247,0.3)', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
                  backdropFilter: 'blur(10px)' 
                }}>
                  <Link href="/dashboard/customers">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#a855f7,#c084fc)' }}>
                          <Users className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Clientes</p>
                      <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Base de datos</p>
                    </CardContent>
                  </Link>
                </Card>

                <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
                  backgroundColor: 'rgba(247, 247, 246, 0.15)', 
                  borderColor: 'rgba(13,148,136,0.3)', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
                  backdropFilter: 'blur(10px)' 
                }}>
                  <Link href="/dashboard/wallet">
                    <CardContent className="p-4 text-center">
                      <div className="flex justify-center mb-3">
                        <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#0d9488,#14b8a6)' }}>
                          <Wallet className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <p className="text-sm font-medium" style={{ color: '#1a1a1a' }}>Billetera</p>
                      <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>Gestión crypto</p>
                    </CardContent>
                  </Link>
                </Card>
              </div>

              <div className="flex justify-center mt-4">
                <Button 
                  onClick={() => setShowMoreActions(false)}
                  variant="outline" 
                  className="text-sm px-6 py-2 hover:scale-105 transition-all duration-200" 
                  style={{ 
                    borderColor: '#6b7280', 
                    color: '#6b7280',
                    borderWidth: '1px'
                  }}
                >
                  Ver menos
            </Button>
          </div>
            </motion.div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1a1a1a' }}>Actividad Reciente</CardTitle>
              <CardDescription style={{ color: '#5d5d5d' }}>
                Tus últimos pagos y transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Transacciones de la cafetería */}
                <div className="space-y-4">
                  {/* Transacción 1 */}
                  <div className="group relative overflow-hidden p-5 rounded-xl transition-all duration-300 hover:shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)', 
                    border: '1px solid rgba(16,185,129,0.15)',
                    boxShadow: '0 4px 15px rgba(16,185,129,0.08)'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                          }}>
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <span className="text-xs font-bold" style={{ color: '#10b981' }}>✓</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-bold text-base" style={{ color: '#1a1a1a' }}>Café Americano + Medialunas</h3>
                            <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                              backgroundColor: 'rgba(16,185,129,0.1)', 
                              color: '#10b981' 
                            }}>
                              Completado
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm" style={{ color: '#5d5d5d' }}>
                              <span className="font-medium">Pagó:</span>
                              <span className="font-bold" style={{ color: '#f59e0b' }}>$4,500 ARS</span>
                            </div>
                            <div className="text-xs" style={{ color: '#5d5d5d' }}>
                              <div className="mb-2">
                                <span>24 Sep 2025, 14:30</span>
                              </div>
                              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full" style={{ 
                                backgroundColor: 'rgba(0,147,147,0.1)', 
                                border: '1px solid rgba(0,147,147,0.2)' 
                              }}>
                                <span className="text-xs font-medium" style={{ color: '#009393' }}>1,380 ARS</span>
                                <span className="text-xs" style={{ color: '#5d5d5d' }}>→</span>
                                <span className="text-xs font-medium" style={{ color: '#009393' }}>1 USDT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: '#10b981' }}>+$3.26</p>
                          <p className="text-xs font-medium" style={{ color: '#009393' }}>USDT</p>
                          {/* Indicador de conversión */}
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <img src="/logo-arg.png" alt="ARS" className="w-6 h-6" />
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transacción 2 */}
                  <div className="group relative overflow-hidden p-5 rounded-xl transition-all duration-300 hover:shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)', 
                    border: '1px solid rgba(16,185,129,0.15)',
                    boxShadow: '0 4px 15px rgba(16,185,129,0.08)'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                          }}>
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <span className="text-xs font-bold" style={{ color: '#10b981' }}>✓</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-bold text-base" style={{ color: '#1a1a1a' }}>Cappuccino + Tostado</h3>
                            <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                              backgroundColor: 'rgba(16,185,129,0.1)', 
                              color: '#10b981' 
                            }}>
                              Completado
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm" style={{ color: '#5d5d5d' }}>
                              <span className="font-medium">Pagó:</span>
                              <span className="font-bold" style={{ color: '#f59e0b' }}>$6,200 ARS</span>
                            </div>
                            <div className="text-xs" style={{ color: '#5d5d5d' }}>
                              <div className="mb-2">
                                <span>24 Sep 2025, 10:15</span>
                              </div>
                              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full" style={{ 
                                backgroundColor: 'rgba(0,147,147,0.1)', 
                                border: '1px solid rgba(0,147,147,0.2)' 
                              }}>
                                <span className="text-xs font-medium" style={{ color: '#009393' }}>1,380 ARS</span>
                                <span className="text-xs" style={{ color: '#5d5d5d' }}>→</span>
                                <span className="text-xs font-medium" style={{ color: '#009393' }}>1 USDT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: '#10b981' }}>+$4.49</p>
                          <p className="text-xs font-medium" style={{ color: '#009393' }}>USDT</p>
                          {/* Indicador de conversión */}
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <img src="/logo-arg.png" alt="ARS" className="w-6 h-6" />
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transacción 3 */}
                  <div className="group relative overflow-hidden p-5 rounded-xl transition-all duration-300 hover:shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)', 
                    border: '1px solid rgba(16,185,129,0.15)',
                    boxShadow: '0 4px 15px rgba(16,185,129,0.08)'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                          }}>
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <span className="text-xs font-bold" style={{ color: '#10b981' }}>✓</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-bold text-base" style={{ color: '#1a1a1a' }}>Desayuno Completo</h3>
                            <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                              backgroundColor: 'rgba(16,185,129,0.1)', 
                              color: '#10b981' 
                            }}>
                              Completado
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm" style={{ color: '#5d5d5d' }}>
                              <span className="font-medium">Pagó:</span>
                              <span className="font-bold" style={{ color: '#f59e0b' }}>$8,900 ARS</span>
                            </div>
                            <div className="text-xs" style={{ color: '#5d5d5d' }}>
                              <div className="mb-2">
                                <span>23 Sep 2025, 16:45</span>
                              </div>
                              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full" style={{ 
                                backgroundColor: 'rgba(0,147,147,0.1)', 
                                border: '1px solid rgba(0,147,147,0.2)' 
                              }}>
                                <span className="text-xs font-medium" style={{ color: '#009393' }}>1,380 ARS</span>
                                <span className="text-xs" style={{ color: '#5d5d5d' }}>→</span>
                                <span className="text-xs font-medium" style={{ color: '#009393' }}>1 USDT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: '#10b981' }}>+$6.45</p>
                          <p className="text-xs font-medium" style={{ color: '#009393' }}>USDT</p>
                          {/* Indicador de conversión */}
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <img src="/logo-arg.png" alt="ARS" className="w-6 h-6" />
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transacción 4 */}
                  <div className="group relative overflow-hidden p-5 rounded-xl transition-all duration-300 hover:shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)', 
                    border: '1px solid rgba(16,185,129,0.15)',
                    boxShadow: '0 4px 15px rgba(16,185,129,0.08)'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                          }}>
                            <CheckCircle className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <span className="text-xs font-bold" style={{ color: '#10b981' }}>✓</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-bold text-base" style={{ color: '#1a1a1a' }}>Múltiples Cafés (Grupo)</h3>
                            <div className="px-2 py-1 rounded-full text-xs font-medium" style={{ 
                              backgroundColor: 'rgba(16,185,129,0.1)', 
                              color: '#10b981' 
                            }}>
                              Completado
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm" style={{ color: '#5d5d5d' }}>
                              <span className="font-medium">Pagó:</span>
                              <span className="font-bold" style={{ color: '#f59e0b' }}>$18,420 ARS</span>
                            </div>
                            <div className="text-xs" style={{ color: '#5d5d5d' }}>
                              <div className="mb-2">
                                <span>22 Sep 2025, 11:20</span>
                              </div>
                              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full" style={{ 
                                backgroundColor: 'rgba(0,147,147,0.1)', 
                                border: '1px solid rgba(0,147,147,0.2)' 
                              }}>
                                <span className="text-xs font-medium" style={{ color: '#009393' }}>1,380 ARS</span>
                                <span className="text-xs" style={{ color: '#5d5d5d' }}>→</span>
                                <span className="text-xs font-medium" style={{ color: '#009393' }}>1 USDT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: '#10b981' }}>+$13.35</p>
                          <p className="text-xs font-medium" style={{ color: '#009393' }}>USDT</p>
                          {/* Indicador de conversión */}
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <img src="/logo-arg.png" alt="ARS" className="w-6 h-6" />
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transacción pendiente */}
                  <div className="group relative overflow-hidden p-5 rounded-xl transition-all duration-300 hover:shadow-lg" style={{ 
                    background: 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(251,191,36,0.02) 100%)', 
                    border: '1px solid rgba(251,191,36,0.15)',
                    boxShadow: '0 4px 15px rgba(251,191,36,0.08)'
                  }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ 
                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            boxShadow: '0 4px 12px rgba(245,158,11,0.3)'
                          }}>
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f59e0b' }}></div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-bold text-base" style={{ color: '#1a1a1a' }}>Almuerzo Ejecutivo</h3>
                            <div className="px-2 py-1 rounded-full text-xs font-medium animate-pulse" style={{ 
                              backgroundColor: 'rgba(251,191,36,0.1)', 
                              color: '#f59e0b' 
                            }}>
                              Procesando
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-sm" style={{ color: '#5d5d5d' }}>
                              <span className="font-medium">Pagó:</span>
                              <span className="font-bold" style={{ color: '#f59e0b' }}>$12,400 ARS</span>
                            </div>
                            <div className="text-xs" style={{ color: '#5d5d5d' }}>
                              <div className="mb-2">
                                <span>24 Sep 2025, 13:15</span>
                              </div>
                              <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full animate-pulse" style={{ 
                                backgroundColor: 'rgba(251,191,36,0.1)', 
                                border: '1px solid rgba(251,191,36,0.2)' 
                              }}>
                                <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>1,380 ARS</span>
                                <span className="text-xs" style={{ color: '#5d5d5d' }}>→</span>
                                <span className="text-xs font-medium" style={{ color: '#f59e0b' }}>1 USDT</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end">
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: '#f59e0b' }}>~$8.99</p>
                          <p className="text-xs font-medium" style={{ color: '#009393' }}>USDT</p>
                          {/* Indicador de conversión */}
                          <div className="flex items-center justify-center space-x-2 mt-2">
                            <img src="/logo-arg.png" alt="ARS" className="w-6 h-6" />
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ 
                              backgroundColor: '#f3f4f6',
                              border: '1px solid #d1d5db'
                            }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14m-7-7l7 7-7 7" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Resumen total */}
                <div className="mt-6 pt-4 border-t" style={{ borderColor: 'rgba(26,26,26,0.08)' }}>
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-medium" style={{ color: '#5d5d5d' }}>Total acumulado en USDT:</p>
                    <p className="text-lg font-bold" style={{ color: '#10b981' }}>$150.00 USDT</p>
                  </div>
                  <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>
                    Equivalente a $207,000 ARS al tipo de cambio actual
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Crypto Prices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-8"
        >
          <Card style={{ backgroundColor: 'rgba(247, 247, 246, 0.15)', borderColor: 'rgba(254,108,28,0.3)', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', backdropFilter: 'blur(10px)' }}>
            <CardHeader>
              <CardTitle style={{ color: '#1a1a1a' }}>Precios Actuales</CardTitle>
              <CardDescription style={{ color: '#5d5d5d' }}>
                Cotizaciones en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* USDT Card */}
                <div className="p-6 rounded-xl" style={{ 
                  background: 'linear-gradient(135deg, rgba(0,147,147,0.08) 0%, rgba(0,147,147,0.04) 100%)', 
                  border: '1px solid rgba(0,147,147,0.15)',
                  boxShadow: '0 8px 25px rgba(0,147,147,0.12)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <g clipPath="url(#USDT_a)">
                          <path fill="#009393" d="M24 0H0v24h24z"/>
                          <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                        </g>
                        <defs>
                          <clipPath id="USDT_a">
                            <path fill="#fff" d="M0 0h24v24H0z"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <div>
                        <p className="font-bold text-lg" style={{ color: '#1a1a1a' }}>USDT</p>
                        <p className="text-sm" style={{ color: '#009393' }}>Tether</p>
                    </div>
                  </div>
                    <div className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ 
                      backgroundColor: 'rgba(239,68,68,0.15)', 
                      color: '#dc2626' 
                    }}>
                      -2.5%
                    </div>
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>$1.380 ARS</p>
                  </div>
                </div>

                {/* BTC Card */}
                <div className="p-6 rounded-xl" style={{ 
                  background: 'linear-gradient(135deg, rgba(247,147,26,0.08) 0%, rgba(247,147,26,0.04) 100%)', 
                  border: '1px solid rgba(247,147,26,0.15)',
                  boxShadow: '0 8px 25px rgba(247,147,26,0.12)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F7931A' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path fill="#fff" d="M18.763 10.236c.28-1.895-1.155-2.905-3.131-3.591l.64-2.553-1.56-.389-.623 2.49-1.245-.297.631-2.508L11.915 3l-.641 2.562-.992-.234v-.01l-2.157-.54-.415 1.668s1.155.272 1.137.28c.631.163.74.578.722.903l-.722 2.923.162.054-.171-.036-1.02 4.087c-.072.19-.27.478-.712.36.018.028-1.128-.27-1.128-.27l-.776 1.778 2.03.505 1.11.289-.65 2.59 1.56.387.633-2.562 1.253.324-.64 2.554 1.56.388.641-2.59c2.662.505 4.665.308 5.505-2.102.676-1.94-.037-3.05-1.435-3.79 1.02-.225 1.786-.902 1.985-2.282zm-3.564 4.999c-.479 1.94-3.745.884-4.8.63l.857-3.436c1.055.27 4.448.784 3.943 2.796zm.478-5.026c-.433 1.76-3.158.866-4.033.65l.775-3.113c.885.217 3.718.632 3.258 2.463"/>
                      </svg>
                    </div>
                    <div>
                        <p className="font-bold text-lg" style={{ color: '#1a1a1a' }}>Bitcoin</p>
                        <p className="text-sm" style={{ color: '#F7931A' }}>BTC</p>
                    </div>
                  </div>
                    <div className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ 
                      backgroundColor: 'rgba(34,197,94,0.15)', 
                      color: '#16a34a' 
                    }}>
                      +1.2%
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: '#1a1a1a' }}>$154.621.136,51 ARS</p>
                  </div>
                </div>

                {/* ETH Card */}
                <div className="p-6 rounded-xl" style={{ 
                  background: 'linear-gradient(135deg, rgba(98,126,234,0.08) 0%, rgba(98,126,234,0.04) 100%)', 
                  border: '1px solid rgba(98,126,234,0.15)',
                  boxShadow: '0 8px 25px rgba(98,126,234,0.12)'
                }}>
                  <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#627eea' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <g clipPath="url(#ETH_a)">
                            <path fill="#627eea" d="M24 0H0v24h24z"/>
                            <path fill="#fff" d="M12 4v5.912l5 2.236z"/>
                            <path fill="#fff" d="m12 4-5 8.148 5-2.236z"/>
                            <path fill="#fff" d="M12 15.98V20l5-6.92z"/>
                            <path fill="#fff" d="M12 20v-4.02l-5-2.9z"/>
                            <path fill="#fff" d="m12 15.048 5-2.9-5-2.236z"/>
                            <path fill="#fff" d="m7 12.148 5 2.9V9.912z"/>
                        </g>
                        <defs>
                          <clipPath id="ETH_a">
                            <path fill="#fff" d="M0 0h24v24H0z"/>
                          </clipPath>
                        </defs>
                      </svg>
                    </div>
                    <div>
                        <p className="font-bold text-lg" style={{ color: '#1a1a1a' }}>Ethereum</p>
                        <p className="text-sm" style={{ color: '#627eea' }}>ETH</p>
                    </div>
                  </div>
                    <div className="px-3 py-1.5 rounded-full text-sm font-semibold" style={{ 
                      backgroundColor: 'rgba(239,68,68,0.15)', 
                      color: '#dc2626' 
                    }}>
                      -0.8%
                    </div>
                  </div>
                  <div>
                    <p className="text-xl font-bold" style={{ color: '#1a1a1a' }}>$5.703.536,77 ARS</p>
                  </div>
                </div>
              </div>
              
              {/* MVP Info para Inversores */}
              <div className="mt-6 p-4 rounded-xl" style={{ 
                background: 'linear-gradient(135deg, rgba(254,108,28,0.05) 0%, rgba(254,108,28,0.02) 100%)', 
                border: '1px solid rgba(254,108,28,0.15)',
                boxShadow: '0 4px 15px rgba(254,108,28,0.08)'
              }}>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ 
                    backgroundColor: 'rgba(254,108,28,0.1)',
                    border: '1px solid rgba(254,108,28,0.2)'
                  }}>
                    <span className="text-sm font-bold" style={{ color: '#fe6c1c' }}>?</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-2" style={{ color: '#1a1a1a' }}>
                      Integración de Mercado - Roadmap Técnico
                    </h4>
                    <p className="text-xs leading-relaxed" style={{ color: '#5d5d5d' }}>
                      Los precios mostrados son datos demo. En producción se integrará la 
                      <strong className="text-orange-600"> API de "X"</strong> para 
                      obtener cotizaciones en tiempo real, aplicando un 
                      <strong className="text-orange-600"> spread</strong> como margen de ganancia. 
                      Esto garantiza rentabilidad sostenible mientras ofrecemos precios competitivos al cliente.
                    </p>
                    <div className="flex items-center space-x-4 mt-3 text-xs" style={{ color: '#5d5d5d' }}>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#16a34a' }}></div>
                        <span>API Integration Ready</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#fe6c1c' }}></div>
                        <span>Revenue Model Defined</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
