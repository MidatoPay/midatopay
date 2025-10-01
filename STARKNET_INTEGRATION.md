# 🚀 Integración Starknet - MidatoPay

## 📋 Descripción General

Esta integración permite que MidatoPay funcione con Starknet, permitiendo pagos en criptomonedas (USDT, STRK) en la red Starknet Sepolia (testnet) y Mainnet.

### 🏗️ Arquitectura

```
Cliente (Wallet Starknet) → QR Code → Smart Contract → Backend → Base de Datos
                                           ↓
                                    Event Listener ← WebSocket ← Frontend
```

## 📁 Estructura de Archivos

```
backend/
├── starknet/
│   ├── contracts/
│   │   └── payment_gateway.cairo      # Smart contract principal
│   ├── scripts/
│   │   └── deploy.js                  # Script de despliegue
│   ├── Scarb.toml                     # Configuración de Cairo
│   └── deployment.json                # Info de contratos desplegados
├── src/
│   └── services/
│       └── starknet.js               # Servicio backend Starknet

frontend/
├── src/
│   └── lib/
│       └── starknet.ts               # Utilidades frontend Starknet
└── package.json                     # Dependencias actualizadas
```

## 🛠️ Configuración Inicial

### 1. Instalar Dependencias

**Frontend:**
```bash
cd frontend
npm install @starknet-react/core @starknet-react/chains starknet starknetkit
```

**Backend:**
```bash
cd backend
npm install starknet prisma
```

### 2. Instalar Scarb (Compilador Cairo)

```bash
# macOS/Linux
curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh

# Windows (PowerShell)
Invoke-WebRequest -Uri https://docs.swmansion.com/scarb/install.ps1 -UseBasicParsing | Invoke-Expression
```

### 3. Configurar Wallet Starknet

1. **Instalar Argent X o Braavos** (extensiones de browser)
2. **Crear cuenta en Sepolia testnet**
3. **Obtener ETH de prueba**: https://starknet-faucet.vercel.app/
4. **Guardar private key y address** para despliegue

## 🚀 Despliegue en Sepolia Testnet

### 1. Configurar Variables de Entorno

```bash
# Crear archivo .env en /backend
STARKNET_PRIVATE_KEY=0x1234567890abcdef...
STARKNET_ACCOUNT_ADDRESS=0x1234567890abcdef...
```

### 2. Compilar y Desplegar

```bash
cd backend/starknet

# Compilar contrato
scarb build

# Desplegar
node scripts/deploy.js
```

### 3. Configurar Frontend

```bash
# Crear archivo .env.local en /frontend
NEXT_PUBLIC_STARKNET_GATEWAY_ADDRESS=0x...
NEXT_PUBLIC_STARKNET_USDT_ADDRESS=0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_7
```

## 💻 Uso en el Frontend

### 1. Envolver la App con StarknetProvider

```tsx
// app/layout.tsx
import { StarknetConfig, publicProvider } from '@starknet-react/core'
import { sepolia } from '@starknet-react/chains'
import { connectors } from '@/lib/starknet'

export default function RootLayout({ children }) {
  return (
    <StarknetConfig
      chains={[sepolia]}
      provider={publicProvider()}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  )
}
```

### 2. Componente de Conexión de Wallet

```tsx
// components/StarknetWallet.tsx
'use client'
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core'

export function StarknetWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected) {
    return (
      <div>
        <p>Conectado: {address}</p>
        <button onClick={() => disconnect()}>Desconectar</button>
      </div>
    )
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button key={connector.id} onClick={() => connect({ connector })}>
          Conectar {connector.name}
        </button>
      ))}
    </div>
  )
}
```

### 3. Procesar Pagos

```tsx
// components/StarknetPayment.tsx
import { StarknetPaymentService } from '@/lib/starknet'
import { useAccount, useProvider } from '@starknet-react/core'

export function StarknetPayment({ qrData }) {
  const { account } = useAccount()
  const provider = useProvider()

  const handlePayment = async () => {
    if (!account || !provider) return

    try {
      const paymentService = new StarknetPaymentService(provider, account)
      const txHash = await paymentService.processPayment(qrData)
      
      console.log('Pago enviado:', txHash)
      // Redirigir a página de éxito
    } catch (error) {
      console.error('Error en pago:', error)
    }
  }

  return (
    <button onClick={handlePayment}>
      Pagar con Starknet
    </button>
  )
}
```

## 🔧 Backend Integration

### 1. Inicializar Servicio Starknet

```javascript
// server.js
const StarknetService = require('./src/services/starknet');

const starknetService = new StarknetService();

async function startServer() {
  await starknetService.initialize();
  await starknetService.startEventListener();
  
  // ... resto del servidor
}
```

### 2. Crear Pagos Starknet

```javascript
// routes/payments.js
app.post('/api/payments/starknet/create', async (req, res) => {
  try {
    const payment = await starknetService.createStarknetPayment(req.body);
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 3. Procesar Transacciones

```javascript
// routes/transactions.js
app.post('/api/transactions/starknet/process', async (req, res) => {
  try {
    const { transactionHash, paymentId } = req.body;
    const result = await starknetService.processPayment(transactionHash, paymentId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 🧪 Testing en Sepolia

### 1. Obtener Tokens de Prueba

```bash
# ETH Sepolia
curl -X POST https://starknet-faucet.vercel.app/api/faucet \
  -H "Content-Type: application/json" \
  -d '{"address": "YOUR_ADDRESS"}'

# USDT de prueba (usar bridge desde Ethereum Sepolia)
# 1. Ir a https://sepolia.etherscan.io
# 2. Obtener USDT Sepolia
# 3. Usar Starknet bridge para transferir
```

### 2. Flujo de Testing

```bash
# 1. Crear pago desde dashboard
curl -X POST http://localhost:3001/api/payments/starknet/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "USDT", 
    "merchantAddress": "0x...",
    "concept": "Test Payment"
  }'

# 2. Escanear QR generado
# 3. Conectar wallet en frontend
# 4. Aprobar y enviar transacción
# 5. Verificar evento en backend
```

### 3. Monitoring

```bash
# Ver logs del backend
tail -f backend/logs/starknet.log

# Verificar eventos en Starkscan
open "https://sepolia.starkscan.co/contract/YOUR_CONTRACT_ADDRESS"
```

## 🚀 Migración a Mainnet

### 1. Actualizar Configuración

```bash
# .env production
STARKNET_RPC_URL=https://starknet-mainnet.public.blastapi.io/rpc/v0_7
STARKNET_CHAIN_ID=SN_MAIN

# Direcciones mainnet reales
STARKNET_USDT_ADDRESS=0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8
```

### 2. Re-desplegar Contratos

```bash
# Actualizar Scarb.toml para mainnet
cd backend/starknet
STARKNET_NETWORK=mainnet node scripts/deploy.js
```

### 3. Testing Pre-Producción

- [ ] Testing exhaustivo en testnet
- [ ] Auditoria de seguridad del contrato
- [ ] Testing de stress con múltiples pagos
- [ ] Verificación de event listeners
- [ ] Testing de recovery en caso de fallas

## 🔒 Consideraciones de Seguridad

### Smart Contract

```cairo
// Verificar reentrancy
assert(!self.processing.read(), 'Reentrancy detected');
self.processing.write(true);

// Verificar allowance antes de transferir
let allowance = token.allowance(caller, contract_address);
assert(allowance >= amount, 'Insufficient allowance');

// Marcar pago como procesado
self.processed_payments.write(payment_id, true);
```

### Backend

```javascript
// Validar direcciones Starknet
function validateStarknetAddress(address) {
  try {
    const addressBN = BigInt(address);
    return addressBN >= 0n && addressBN < 2n ** 252n;
  } catch {
    return false;
  }
}

// Rate limiting para API
const rateLimit = require('express-rate-limit');
app.use('/api/starknet', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
}));
```

### Frontend

```typescript
// Validar QR data
function validateQRData(qrData: any): qrData is StarknetPaymentData {
  return (
    qrData?.type === 'starknet_payment' &&
    qrData?.payment_id &&
    qrData?.merchant_address &&
    qrData?.token_address &&
    qrData?.amount
  );
}
```

## 📊 Monitoreo y Analytics

### 1. Métricas Importantes

- Transacciones por segundo
- Tiempo promedio de confirmación
- Tasa de fallo de transacciones
- Gas usado promedio
- Balance de contratos

### 2. Alertas

```javascript
// Alertas para monitoreo
const alertThresholds = {
  maxGasPrice: '1000000000', // 1 GWEI
  minConfirmationTime: 30, // 30 segundos
  maxFailureRate: 0.05 // 5%
};
```

## 🆘 Troubleshooting

### Errores Comunes

1. **"Account not found"**
   - Verificar que la cuenta tenga ETH para gas
   - Confirmar que la dirección sea correcta

2. **"Insufficient allowance"**
   - El usuario debe aprobar tokens antes del pago
   - Verificar balance del usuario

3. **"Transaction failed"**
   - Verificar gas price
   - Confirmar que el contrato esté desplegado correctamente

4. **"Event not detected"**
   - Verificar que el event listener esté corriendo
   - Confirmar configuración de RPC

### Logs de Debug

```javascript
// Activar logs detallados
process.env.STARKNET_DEBUG = 'true';

// Ver transacciones en detalle
console.log('Transaction receipt:', JSON.stringify(receipt, null, 2));
```

## 📚 Referencias

- [Starknet Documentation](https://docs.starknet.io/)
- [Cairo Book](https://book.cairo-lang.org/)
- [Starknet React](https://starknet-react.com/)
- [Starknet.js](https://www.starknetjs.com/)
- [OpenZeppelin Cairo](https://github.com/OpenZeppelin/cairo-contracts)

## 📞 Soporte

Para problemas específicos:
1. Revisar logs del backend y frontend
2. Verificar configuración de red
3. Confirmar balance de accounts
4. Probar en testnet primero
5. Consultar documentación oficial de Starknet
