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
  Wallet
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { logout } = useAuthActions()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalPayments: 0,
    pendingPayments: 0,
    completedPayments: 0,
    totalAmount: 0
  })

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MidatoPay</h1>
                <p className="text-sm text-gray-600">Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido, {user.name}!
          </h2>
          <p className="text-gray-600">
            Gestiona tus pagos en criptomonedas desde aquí
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <DollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Recaudado</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats.totalAmount.toLocaleString()} ARS
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pagos Completados</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.completedPayments}</p>
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pagos Pendientes</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
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
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Pagos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button asChild className="h-20 flex-col space-y-2">
              <Link href="/dashboard/create-payment">
                <Plus className="w-6 h-6" />
                <span>Crear Pago</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20 flex-col space-y-2">
              <Link href="/dashboard/payments">
                <QrCode className="w-6 h-6" />
                <span>Mis Pagos</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20 flex-col space-y-2">
              <Link href="/dashboard/transactions">
                <History className="w-6 h-6" />
                <span>Transacciones</span>
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="h-20 flex-col space-y-2">
              <Link href="/dashboard/settings">
                <Settings className="w-6 h-6" />
                <span>Configuración</span>
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Tus últimos pagos y transacciones
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Placeholder para actividad reciente */}
                <div className="text-center py-8 text-gray-500">
                  <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay actividad reciente</p>
                  <p className="text-sm">Crea tu primer pago para comenzar</p>
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
          <Card>
            <CardHeader>
              <CardTitle>Precios Actuales</CardTitle>
              <CardDescription>
                Cotizaciones en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-crypto-usdt rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">USDT</span>
                    </div>
                    <div>
                      <p className="font-medium">USDT</p>
                      <p className="text-sm text-gray-600">Tether</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$375 ARS</p>
                    <Badge variant="success" className="text-xs">+2.5%</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-crypto-btc rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">BTC</span>
                    </div>
                    <div>
                      <p className="font-medium">Bitcoin</p>
                      <p className="text-sm text-gray-600">BTC</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$15M ARS</p>
                    <Badge variant="success" className="text-xs">+1.2%</Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-crypto-eth rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">ETH</span>
                    </div>
                    <div>
                      <p className="font-medium">Ethereum</p>
                      <p className="text-sm text-gray-600">ETH</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">$2.5M ARS</p>
                    <Badge variant="destructive" className="text-xs">-0.8%</Badge>
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
