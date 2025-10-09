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
  DollarSign, 
  CheckCircle,
  LogOut,
  Wallet,
} from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { AegisProvider, useAegis } from '@cavos/aegis'
import cavosConfig from '../../../cavos.config'
import { useTransactions } from '@/hooks/useTransactions'

// Componente interno que usa Cavos
function DashboardContent() {
  const { user, token, isAuthenticated, isLoading } = useAuth()
  const { logout, setUser } = useAuthActions()
  const router = useRouter()
  const { aegisAccount, isConnected } = useAegis()
  const { transactions, loading: transactionsLoading, error: transactionsError } = useTransactions()
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

  // Estado para wallet Cavos (usando estado real de Cavos)
  const [cavosWallet, setCavosWallet] = useState({
    isConnected: isConnected,
    address: isConnected ? aegisAccount.address : null,
    balance: null as string | null,
    isLoading: false
  })

  // Inicializar estado de wallet si ya existe una guardada
  useEffect(() => {
    if (user?.walletAddress && !cavosWallet.isConnected) {
      console.log('🔄 Inicializando wallet existente:', user.walletAddress)
      setCavosWallet({
        isConnected: true,
        address: user.walletAddress,
        balance: '0.0 STRK', // Balance simulado
        isLoading: false
      })
    }
  }, [user?.walletAddress])

  // Actualizar estado cuando cambie la conexión de Cavos
  useEffect(() => {
    // Solo actualizar si no tenemos una wallet guardada o si Cavos está realmente conectado
    if (isConnected && aegisAccount.address) {
      setCavosWallet(prev => ({
        ...prev,
        isConnected: true,
        address: aegisAccount.address
      }))
    }
  }, [isConnected, aegisAccount.address])

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

  // Funciones para manejar Cavos
  const connectCavosWallet = async () => {
    setCavosWallet(prev => ({ ...prev, isLoading: true }))
    try {
      // Verificar si ya hay una wallet guardada en la BD
      if (user?.walletAddress) {
        console.log('🔄 Reconectando a wallet existente:', user.walletAddress)
        
        // Reconectar a wallet existente usando Cavos
        // Nota: En Cavos, necesitamos usar la misma private key para reconectar
        // Por ahora, vamos a simular la reconexión
        
        setCavosWallet({
          isConnected: true,
          address: user.walletAddress,
          balance: '0.0 STRK', // Balance simulado
          isLoading: false
        })
        
        toast.success('Wallet Cavos reconectada exitosamente')
      } else {
        // Crear nueva wallet solo si no existe una previa
        console.log('🆕 Creando nueva wallet...')
        const privateKey = await aegisAccount.deployAccount()
        console.log('Nueva wallet creada:', privateKey)
        
        // Guardar wallet en la base de datos
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/update-wallet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            walletAddress: aegisAccount.address
          })
        })
        
        if (!response.ok) {
          throw new Error('Error guardando wallet en la base de datos')
        }
        
        // Actualizar el estado del usuario con la nueva wallet
        const updatedUser = { ...user!, walletAddress: aegisAccount.address || undefined }
        setUser(updatedUser)
        
        setCavosWallet({
          isConnected: true,
          address: aegisAccount.address,
          balance: '0.0 STRK',
          isLoading: false
        })
        
        toast.success('Wallet Cavos creada y conectada exitosamente')
      }
    } catch (error) {
      console.error('Error connecting Cavos wallet:', error)
      toast.error('Error conectando wallet Cavos')
      setCavosWallet(prev => ({ ...prev, isLoading: false }))
    }
  }

  const disconnectCavosWallet = async () => {
    try {
      await aegisAccount.disconnect()
      setCavosWallet({
        isConnected: false,
        address: null,
        balance: null,
        isLoading: false
      })
      toast.success('Wallet Cavos desconectada')
    } catch (error) {
      console.error('Error disconnecting wallet:', error)
      toast.error('Error desconectando wallet')
    }
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
      <div className="min-h-screen" style={{ backgroundColor: '#FFF4EC' }}>
      {/* Header */}
        <header className="shadow-sm border-b" style={{ backgroundColor: '#FFF4EC', borderColor: 'rgba(44,44,44,0.1)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #FF6A00 0%, #FF8A33 100%)' }}>
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C', fontWeight: 700 }}>MidatoPay</h1>
                <p className="text-sm" style={{ color: '#B4B4B4', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Wallet Status Indicator */}
              <div className="flex items-center space-x-2 px-3 py-1 rounded-full" style={{ 
                backgroundColor: cavosWallet.isConnected ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${cavosWallet.isConnected ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
              }}>
                <div className="w-2 h-2 rounded-full" style={{ 
                  backgroundColor: cavosWallet.isConnected ? '#10b981' : '#ef4444' 
                }}></div>
                <span className="text-xs font-medium" style={{ 
                  color: cavosWallet.isConnected ? '#10b981' : '#ef4444' 
                }}>
                  {cavosWallet.isConnected ? 'Wallet Conectada' : 'Wallet Desconectada'}
                </span>
              </div>
              
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
        {/* Header Section - Welcome and Total Balance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-end justify-between">
            {/* Welcome Section */}
                     <div style={{ marginTop: '48px' }}>
                       <h2 className="mb-0" style={{ fontFamily: 'Kufam, sans-serif', color: '#2C2C2C', fontWeight: 500, fontSize: '24px', marginBottom: '-10px' }}>
                         ¡Bienvenido,
                       </h2>
                       <h2 className="mb-0" style={{ fontFamily: 'Kufam, sans-serif', color: '#FF6A00', fontWeight: 600, fontSize: '62px' }}>
                         Café Meka!
          </h2>
                     </div>
            
            {/* Total Balance Card */}
            <Card style={{ backgroundColor: '#FFFFFF', border: '3px solid transparent', background: 'linear-gradient(#FFFFFF, #FFFFFF) padding-box, linear-gradient(135deg, #FF6A00, #FF8A33) border-box', boxShadow: '0px 6px 20px rgba(255,106,0,0.25)', borderRadius: '16px' }}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: '#E3F2FD' }}>
                    <img src="/logo-arg.png" alt="Argentina" className="w-8 h-8" />
                  </div>
                           <div className="flex-1">
                             <p className="text-base font-medium" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Saldo Total:</p>
                             <p className="text-3xl font-bold" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>
                               $ {stats.totalAmount.toLocaleString('es-AR')}
                             </p>
                           </div>
                  <div className="flex items-center space-x-1">
                    <svg className="w-4 h-4" style={{ color: '#FF6A00' }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>+2.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Saldos en Criptomonedas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div style={{ backgroundColor: '#2C2C2C', borderRadius: '20px', padding: '32px' }}>
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-lg font-semibold" style={{ color: '#FFFFFF', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Saldo en Criptomonedas:</h4>
              <button className="px-3 py-1 rounded-lg text-sm font-medium" style={{ backgroundColor: '#FF6A00', color: '#FFFFFF', fontFamily: 'Kufam, sans-serif', fontWeight: 500, borderRadius: '8px', boxShadow: '0px 2px 4px rgba(0,0,0,0.1)' }}>
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  <span>Filtrar</span>
                </div>
              </button>
            </div>
            
            <div style={{ backgroundColor: '#FFF9F5', border: '1.8px solid #FF6A00', borderRadius: '14px', boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.08)', padding: '24px' }}>
              {/* USDT Card */}
              <div className="flex items-center justify-between" style={{ padding: '16px 0' }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#009393' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <g clipPath="url(#USDT_real)">
                            <path fill="#009393" d="M24 0H0v24h24z"/>
                            <path fill="#fff" d="m12 18.4-8-7.892L7.052 5.6h9.896L20 10.508zm.8-7.2v-.976c1.44.072 2.784.352 3.2.716-.484.424-2.216.732-4 .732s-3.516-.308-4-.732c.412-.364 1.76-.64 3.2-.72v.98zM8 10.936v.588c.412.364 1.756.64 3.2.72V14.4h1.6v-2.16c1.44-.072 2.788-.352 3.2-.716v-1.172c-.412-.364-1.76-.644-3.2-.72V8.8h2.4V7.6H8.8v1.2h2.4v.832c-1.444.076-2.788.356-3.2.72z"/>
                          </g>
                          <defs>
                            <clipPath id="USDT_real">
                              <path fill="#fff" d="M0 0h24v24H0z"/>
                            </clipPath>
                          </defs>
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>USDT</h5>
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Tether</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-16">
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Saldo</p>
                        <p className="font-bold text-lg" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>150,00</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Tipo de cambio</p>
                        <p className="font-bold text-lg" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>$1.380,00</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Pesos Argentinos</p>
                        <p className="font-bold text-lg" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>$150.450,95</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" style={{ color: '#2ECC71' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium" style={{ color: '#2ECC71', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>+2.5%</span>
                    </div>
              </div>
              
              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(255,106,0,0.2)', margin: '0 0' }}></div>
              
              {/* BTC Card */}
              <div className="flex items-center justify-between" style={{ padding: '16px 0' }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#F7931A' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path fill="#fff" d="M18.763 10.236c.28-1.895-1.155-2.905-3.131-3.591l.64-2.553-1.56-.389-.623 2.49-1.245-.297.631-2.508L11.915 3l-.641 2.562-.992-.234v-.01l-2.157-.54-.415 1.668s1.155.272 1.137.28c.631.163.74.578.722.903l-.722 2.923.162.054-.171-.036-1.02 4.087c-.072.19-.27.478-.712.36.018.028-1.128-.27-1.128-.27l-.776 1.778 2.03.505 1.11.289-.65 2.59 1.56.387.633-2.562 1.253.324-.64 2.554 1.56.388.641-2.59c2.662.505 4.665.308 5.505-2.102.676-1.94-.037-3.05-1.435-3.79 1.02-.225 1.786-.902 1.985-2.282zm-3.564 4.999c-.479 1.94-3.745.884-4.8.63l.857-3.436c1.055.27 4.448.784 3.943 2.796zm.478-5.026c-.433 1.76-3.158.866-4.033.65l.775-3.113c.885.217 3.718.632 3.258 2.463"/>
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>BTC</h5>
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Bitcoin</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-16">
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Saldo</p>
                        <p className="font-bold text-lg" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>0,012</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Tipo de cambio</p>
                        <p className="font-bold text-lg" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>$187.258.448</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Pesos Argentinos</p>
                        <p className="font-bold text-lg" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>$2.247.101,38</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" style={{ color: '#2ECC71' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium" style={{ color: '#2ECC71', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>+0.5%</span>
                    </div>
                  </div>
              
              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(255,106,0,0.2)', margin: '0 0' }}></div>
              
              {/* ETH Card */}
              <div className="flex items-center justify-between" style={{ padding: '16px 0' }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#627eea' }}>
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 4v5.912l5 2.236z"/>
                          <path d="m12 4-5 8.148 5-2.236z"/>
                          <path d="M12 15.98V20l5-6.92z"/>
                          <path d="M12 20v-4.02l-5-2.9z"/>
                          <path d="m12 15.048 5-2.9-5-2.236z"/>
                          <path d="m7 12.148 5 2.9V9.912z"/>
                        </svg>
                      </div>
                      <div>
                        <h5 className="font-bold" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>ETH</h5>
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Ethereum</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-16">
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Saldo</p>
                        <p className="font-bold text-lg" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>0,000</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Tipo de cambio</p>
                        <p className="font-bold text-lg" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>$6.873.248,70</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Pesos Argentinos</p>
                        <p className="font-bold text-lg" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>$0,00</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" style={{ color: '#2ECC71' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium" style={{ color: '#2ECC71', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>+1.2%</span>
                </div>
              </div>
              
              {/* Divider */}
              <div style={{ height: '1px', backgroundColor: 'rgba(255,106,0,0.2)', margin: '0 0' }}></div>
              
              {/* STRK Card */}
              <div className="flex items-center justify-between" style={{ padding: '16px 0' }}>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: cavosWallet.isConnected ? '#FF6A00' : '#8B8B8B' }}>
                        <img src="/starknet-logo.png" alt="Starknet" className="w-6 h-6" />
                      </div>
                      <div>
                        <h5 className="font-bold" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>STRK</h5>
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Starknet</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-[1fr_1fr_1fr] gap-16">
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Saldo</p>
                        <p className="font-bold text-lg" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>
                          {cavosWallet.balance ? parseFloat(cavosWallet.balance).toFixed(3) : '0,000'}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Tipo de cambio</p>
                        <p className="font-bold text-lg" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>$229,51</p>
                      </div>
                      <div className="text-left">
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Pesos Argentinos</p>
                        <p className="font-bold text-lg" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>
                          ${(parseFloat(cavosWallet.balance || '0') * 229.51).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" style={{ color: '#2ECC71' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium" style={{ color: '#2ECC71', fontFamily: 'Kufam, sans-serif', fontWeight: 500 }}>+3.1%</span>
                  </div>
                  </div>
                </div>
          </div>
          </motion.div>

        {/* Sección de Información de Wallet - Solo mostrar cuando esté conectada */}
        {cavosWallet.isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card style={{ 
              backgroundColor: 'rgba(16,185,129,0.05)', 
              borderColor: 'rgba(16,185,129,0.2)', 
              boxShadow: '0 10px 30px rgba(16,185,129,0.1)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b981' }}>
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                  <span style={{ color: '#1a1a1a', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Información de Wallet</span>
                </CardTitle>
                <CardDescription style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                  Detalles de tu wallet Cavos Aegis conectada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Dirección */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Dirección</h4>
                    <p className="text-sm font-mono text-green-800 break-all" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                      {cavosWallet.address}
                    </p>
                    <p className="text-xs text-green-600 mt-1" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Dirección de tu wallet</p>
                  </div>
                  
                  {/* Red */}
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Red</h4>
                    <p className="text-lg font-bold text-purple-900" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Starknet Sepolia</p>
                    <p className="text-sm text-purple-700" style={{ fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Testnet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: '#1a1a1a', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Centro de Control</h3>
            <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Gestiona tu negocio desde aquí</p>
          </div>
          
          {/* Acciones Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
              background: 'linear-gradient(135deg, rgba(254,108,28,0.15) 0%, rgba(254,108,28,0.08) 100%)', 
              border: '1px solid #fe6c1c',
              boxShadow: '0 4px 12px rgba(254,108,28,0.2)'
            }}>
              <Link href="/dashboard/create-payment">
                <CardContent className="p-4 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-2 rounded-lg" style={{ background: 'linear-gradient(135deg,#fe6c1c,#fe9c42)' }}>
                      <Plus className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-semibold" style={{ color: '#1a1a1a', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Crear Pago</p>
                  <p className="text-xs mt-1" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>QR Instantáneo</p>
                </CardContent>
              </Link>
            </Card>

            {/* Wallet Cavos */}
            <Card className="group cursor-pointer hover:scale-105 transition-all duration-200" style={{ 
              backgroundColor: '#fff5f0', 
              borderColor: cavosWallet.isConnected ? '#fe6c1c' : '#5d5d5d', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.08)', 
              backdropFilter: 'blur(10px)' 
            }}>
              <CardContent className="p-4 text-center" onClick={cavosWallet.isConnected ? disconnectCavosWallet : connectCavosWallet}>
                <div className="flex justify-center mb-3">
                  <div className="p-2 rounded-lg" style={{ 
                    background: cavosWallet.isConnected 
                      ? 'linear-gradient(135deg,#fe6c1c,#fe9c42)' 
                      : 'linear-gradient(135deg,#5d5d5d,#5d5d5d)' 
                  }}>
                    <Wallet className="w-5 h-5 text-white" />
          </div>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>
                  {cavosWallet.isConnected ? 'Wallet Conectada' : 'Conectar Wallet'}
                </p>
                <p className="text-xs mt-1" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                  {cavosWallet.isConnected ? 'Cavos Aegis' : 'Cavos Aegis'}
                </p>
                {cavosWallet.isLoading && (
                  <div className="mt-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="text-xs mt-1" style={{ color: '#5d5d5d' }}>
                      {cavosWallet.isConnected ? 'Desconectando...' : 'Conectando...'}
                    </p>
              </div>
                )}
                {!cavosWallet.isLoading && !cavosWallet.isConnected && (
                  <p className="text-xs mt-2" style={{ color: '#5d5d5d' }}>
                    Click para conectar
                  </p>
                )}
                {!cavosWallet.isLoading && cavosWallet.isConnected && (
                  <p className="text-xs mt-2" style={{ color: '#fe6c1c' }}>
                    Click para desconectar
                  </p>
                )}
            </CardContent>
          </Card>
          </div>
        </motion.div>

        {/* Movimientos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Movimientos</h3>
            <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>Historial de transacciones</p>
                </div>

            <Card style={{ 
              backgroundColor: '#fff5f0', 
              borderColor: '#fec665', 
              boxShadow: '0 10px 30px rgba(254,108,28,0.08)', 
              backdropFilter: 'blur(10px)' 
            }}>
            <CardContent className="p-6">
              {transactionsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                  <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                    Cargando movimientos...
                  </p>
                </div>
              ) : transactionsError ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Error al cargar</h4>
                  <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                    {transactionsError}
                  </p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(254,108,28,0.1)' }}>
                    <svg className="w-8 h-8" style={{ color: '#fe6c1c' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h4 className="text-lg font-medium mb-2" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 700 }}>Sin movimientos aún</h4>
                  <p className="text-sm" style={{ color: '#5d5d5d', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                    Las transferencias exitosas aparecerán aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-white rounded-lg border" style={{ borderColor: 'rgba(254,108,28,0.2)' }}>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: transaction.status === 'CONFIRMED' ? '#10B981' : '#F59E0B' }}>
                          {transaction.status === 'CONFIRMED' ? (
                            <CheckCircle className="w-5 h-5 text-white" />
                          ) : (
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h5 className="font-medium" style={{ color: '#2C2C2C', fontFamily: 'Kufam, sans-serif', fontWeight: 600 }}>
                            {transaction.payment.concept}
                          </h5>
                          <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                            {new Date(transaction.createdAt).toLocaleDateString('es-AR')} {new Date(transaction.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold" style={{ color: '#FF6A00', fontFamily: 'Kufam, sans-serif', fontWeight: 600 }}>
                          ${transaction.amount.toLocaleString('es-AR')} ARS
                        </p>
                        <p className="text-sm" style={{ color: '#8B8B8B', fontFamily: 'Kufam, sans-serif', fontWeight: 400 }}>
                          → {transaction.finalAmount.toFixed(6)} {transaction.finalCurrency}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  )
}

// Componente principal que envuelve todo con AegisProvider
export default function DashboardPage() {
  return (
    <AegisProvider config={cavosConfig}>
      <DashboardContent />
    </AegisProvider>
  )
}