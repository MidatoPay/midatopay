# MidatoPay - Sistema de Pagos con Criptomonedas

Sistema completo de pagos que permite a comercios recibir pagos en criptomonedas (USDT, BTC, ETH) y convertirlos automáticamente a pesos argentinos.

## 🚀 Características

- **Frontend**: Next.js 14 con Tailwind CSS, Radix UI y Framer Motion
- **Backend**: Node.js con Express y PostgreSQL
- **Pagos**: Integración con USDT (TRC20/ERC20), BTC, ETH
- **Oráculo de Precios**: Consulta en tiempo real a Ripio y Binance
- **Conversión Automática**: Liquidación automática en ARS para comercios
- **QR Codes**: Generación de códigos QR únicos para cada transacción
- **WebSocket**: Notificaciones en tiempo real
- **Docker**: Configuración completa con Docker Compose

## 📁 Estructura del Proyecto

```
midatopay/
├── backend/              # API Node.js + PostgreSQL
│   ├── src/
│   │   ├── routes/       # Rutas de la API
│   │   ├── services/     # Servicios (oráculo, blockchain, websocket)
│   │   ├── middleware/   # Middleware de autenticación y errores
│   │   └── config/       # Configuración de base de datos
│   ├── prisma/           # Esquemas y migraciones
│   └── Dockerfile
├── frontend/             # Next.js + Tailwind + Radix UI
│   ├── src/
│   │   ├── app/          # Páginas de Next.js 14
│   │   ├── components/   # Componentes reutilizables
│   │   ├── lib/          # Utilidades y API client
│   │   ├── store/        # Estado global con Zustand
│   │   └── types/        # Tipos de TypeScript
│   └── Dockerfile
├── docker-compose.yml    # Configuración de Docker
├── setup.sh             # Script de instalación automática
└── package.json         # Scripts principales
```

## 🛠️ Instalación Rápida

### Opción 1: Script Automático (Recomendado)

```bash
# Clonar el repositorio
git clone <tu-repo>
cd midatopay

# Ejecutar script de configuración
./setup.sh
```

### Opción 2: Instalación Manual

```bash
# 1. Instalar dependencias
npm run install:all

# 2. Configurar variables de entorno
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env.local

# 3. Configurar base de datos PostgreSQL
# Editar backend/.env con tus credenciales

# 4. Ejecutar migraciones
cd backend
npm run db:migrate
npm run db:generate
npm run db:seed
cd ..

# 5. Iniciar desarrollo
npm run dev
```

### Opción 3: Docker (Más Fácil)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Detener servicios
docker-compose down
```

## 🔧 Configuración

### Backend (.env)
```env
# Database
DATABASE_URL="postgresql://usuario:password@localhost:5432/midatopay"

# JWT
JWT_SECRET="tu_jwt_secret_super_seguro_aqui"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# APIs Externas
RIPIO_API_KEY="tu_ripio_api_key"
BINANCE_API_KEY="tu_binance_api_key"
BINANCE_SECRET_KEY="tu_binance_secret_key"

# Blockchain (para MVP usamos simulación)
USDT_CONTRACT_ADDRESS="TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
USDT_DECIMALS=6

# WebSocket
WS_PORT=3002
```

### Frontend (.env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3002

# App Configuration
NEXT_PUBLIC_APP_NAME=MidatoPay
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 📱 Flujo de Pagos

1. **Comercio crea cobro** → Genera QR único
2. **Cliente escanea QR** → Elige moneda (ARS/USD/USDT/BTC/ETH)
3. **Oráculo calcula precio** → Muestra monto exacto con cotización en tiempo real
4. **Cliente paga** → Simulación de transacción blockchain (MVP)
5. **Sistema convierte** → Liquida automáticamente en ARS al comercio
6. **Notificaciones** → WebSocket confirma a ambas partes

## 🚀 Scripts Disponibles

### Scripts Principales
- `npm run dev` - Ejecuta backend y frontend en paralelo
- `npm run dev:backend` - Solo backend
- `npm run dev:frontend` - Solo frontend
- `npm run build` - Build de producción
- `npm run start` - Inicia servidor de producción

### Scripts de Base de Datos
- `npm run db:migrate` - Ejecutar migraciones
- `npm run db:generate` - Generar cliente Prisma
- `npm run db:seed` - Poblar base de datos con datos de prueba
- `npm run db:reset` - Resetear base de datos

### Scripts de Docker
- `docker-compose up -d` - Iniciar servicios en background
- `docker-compose up` - Iniciar servicios con logs
- `docker-compose down` - Detener servicios
- `docker-compose logs -f` - Ver logs en tiempo real

## 🔑 Credenciales de Demo

```
Comercio:
Email: barista@cafe.com
Password: merchant123

Administrador:
Email: admin@midatopay.com
Password: admin123
```

## 📊 Tecnologías

### Backend
- **Node.js 18+** + Express
- **PostgreSQL** + Prisma ORM
- **JWT** Authentication
- **WebSocket** (notificaciones en tiempo real)
- **APIs externas**: Ripio y Binance para precios
- **Rate Limiting** y seguridad
- **Cron Jobs** para actualización de precios

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS** + Radix UI
- **Framer Motion** (animaciones)
- **React Hook Form** + Zod (validación)
- **Zustand** (state management)
- **TypeScript** (tipado estático)
- **WebSocket** client

### DevOps
- **Docker** + Docker Compose
- **PostgreSQL** (base de datos)
- **Redis** (cache, opcional)
- **Scripts** de automatización

## 🔐 Seguridad

- ✅ Validación de transacciones blockchain
- ✅ Rate limiting en APIs
- ✅ Encriptación de contraseñas (bcrypt)
- ✅ Autenticación JWT con expiración
- ✅ CORS configurado
- ✅ Validación de entrada con express-validator
- ✅ Manejo seguro de errores
- ✅ Variables de entorno para secretos

## 📈 Características Implementadas

- ✅ Sistema de autenticación completo
- ✅ Creación de pagos con QR
- ✅ Oráculo de precios en tiempo real
- ✅ Múltiples opciones de pago (ARS, USDT, BTC, ETH)
- ✅ Simulación de transacciones blockchain
- ✅ WebSocket para notificaciones
- ✅ Dashboard para comercios
- ✅ Sistema de transacciones
- ✅ Conversión automática de monedas
- ✅ Interfaz responsive y moderna
- ✅ Demo interactivo

## 🚀 Próximas Características

- [ ] Integración real con blockchain (TRC20/ERC20)
- [ ] Soporte para más criptomonedas
- [ ] Dashboard de analytics avanzado
- [ ] Integración con más exchanges
- [ ] App móvil nativa (React Native)
- [ ] Sistema de referidos y comisiones
- [ ] API pública para desarrolladores
- [ ] Sistema de webhooks
- [ ] Multi-idioma
- [ ] Modo offline

## 🐛 Solución de Problemas

### Error de conexión a PostgreSQL
```bash
# Verificar que PostgreSQL esté ejecutándose
sudo service postgresql status

# Reiniciar PostgreSQL
sudo service postgresql restart
```

### Error de puertos ocupados
```bash
# Verificar puertos en uso
lsof -i :3000
lsof -i :3001

# Matar proceso si es necesario
kill -9 <PID>
```

### Error de dependencias
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error de Docker
```bash
# Limpiar contenedores y volúmenes
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## 📞 Soporte

Si encuentras algún problema:

1. Revisa la sección de solución de problemas
2. Verifica que todas las dependencias estén instaladas
3. Asegúrate de que PostgreSQL esté ejecutándose
4. Revisa los logs con `docker-compose logs -f`
5. Consulta el archivo de configuración `.env`

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.
