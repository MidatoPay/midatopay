#!/bin/bash

# 🚀 Setup Script para Integración Starknet - MidatoPay
# Este script automatiza la configuración inicial del proyecto

set -e

echo "🚀 Configurando integración Starknet para MidatoPay..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir con colores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Verificar dependencias del sistema
check_dependencies() {
    print_info "Verificando dependencias del sistema..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Instala Node.js v18+ desde https://nodejs.org/"
        exit 1
    fi
    
    # Verificar npm
    if ! command -v npm &> /dev/null; then
        print_error "npm no está instalado."
        exit 1
    fi
    
    # Verificar curl
    if ! command -v curl &> /dev/null; then
        print_error "curl no está instalado."
        exit 1
    fi
    
    print_status "Dependencias del sistema verificadas"
}

# Instalar Scarb (compilador Cairo)
install_scarb() {
    print_info "Verificando instalación de Scarb..."
    
    if command -v scarb &> /dev/null; then
        print_status "Scarb ya está instalado: $(scarb --version)"
        return
    fi
    
    print_info "Instalando Scarb (compilador Cairo)..."
    
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # macOS o Linux
        curl --proto '=https' --tlsv1.2 -sSf https://docs.swmansion.com/scarb/install.sh | sh
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        # Windows
        print_warning "Para Windows, instala Scarb manualmente desde:"
        print_warning "https://docs.swmansion.com/scarb/download.html"
        print_warning "O ejecuta en PowerShell:"
        print_warning "Invoke-WebRequest -Uri https://docs.swmansion.com/scarb/install.ps1 -UseBasicParsing | Invoke-Expression"
        exit 1
    fi
    
    # Recargar PATH
    export PATH="$HOME/.local/bin:$PATH"
    
    if command -v scarb &> /dev/null; then
        print_status "Scarb instalado exitosamente: $(scarb --version)"
    else
        print_error "Error instalando Scarb. Instala manualmente desde https://docs.swmansion.com/scarb/"
        exit 1
    fi
}

# Instalar dependencias del proyecto
install_dependencies() {
    print_info "Instalando dependencias del proyecto..."
    
    # Backend dependencies
    print_info "Instalando dependencias del backend..."
    cd backend
    npm install starknet
    cd ..
    
    # Frontend dependencies
    print_info "Instalando dependencias del frontend..."
    cd frontend
    npm install @starknet-react/core @starknet-react/chains starknet starknetkit
    cd ..
    
    print_status "Dependencias instaladas"
}

# Compilar contratos
compile_contracts() {
    print_info "Compilando contratos Starknet..."
    
    cd backend/starknet
    
    if ! scarb build; then
        print_error "Error compilando contratos. Verifica la instalación de Scarb."
        exit 1
    fi
    
    print_status "Contratos compilados exitosamente"
    cd ../..
}

# Crear archivos de configuración
setup_config() {
    print_info "Configurando archivos de entorno..."
    
    # Copiar archivo de ejemplo para backend
    if [ ! -f "backend/.env" ]; then
        cp backend/starknet/env.example backend/.env.starknet
        print_status "Archivo backend/.env.starknet creado"
        print_warning "Edita backend/.env.starknet con tus claves de Starknet"
    fi
    
    # Crear archivo de ejemplo para frontend
    if [ ! -f "frontend/.env.local" ]; then
        cat > frontend/.env.local << EOF
# Starknet Configuration - Frontend
NEXT_PUBLIC_STARKNET_GATEWAY_ADDRESS=your_contract_address_here
NEXT_PUBLIC_STARKNET_USDT_ADDRESS=0x068f5c6a61780768455de69077e07e89787839bf8166decfbf92b645209c0fb8
NEXT_PUBLIC_STARKNET_STRK_ADDRESS=0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
NEXT_PUBLIC_STARKNET_RPC_URL=https://starknet-sepolia.public.blastapi.io/rpc/v0_7
EOF
        print_status "Archivo frontend/.env.local creado"
        print_warning "Actualiza frontend/.env.local después del despliegue"
    fi
}

# Mostrar próximos pasos
show_next_steps() {
    echo ""
    echo "🎉 Configuración inicial completada!"
    echo ""
    echo "📋 Próximos pasos:"
    echo ""
    echo "1. 🦊 Instalar wallet Starknet:"
    echo "   - Argent X: https://chrome.google.com/webstore/detail/argent-x/dlcobpjiigpikoobohmabehhmhfoodbb"
    echo "   - Braavos: https://chrome.google.com/webstore/detail/braavos-wallet/jnlgamecbpmbajjfhmmmlhejkemejdma"
    echo ""
    echo "2. 🌊 Configurar cuenta en Sepolia testnet:"
    echo "   - Crear cuenta en el wallet"
    echo "   - Cambiar a red Sepolia"
    echo "   - Obtener ETH: https://starknet-faucet.vercel.app/"
    echo ""
    echo "3. 🔑 Configurar variables de entorno:"
    echo "   - Editar backend/.env.starknet con tu private key y address"
    echo "   - Copiar las variables desde el wallet"
    echo ""
    echo "4. 🚀 Desplegar contratos:"
    echo "   cd backend/starknet"
    echo "   node scripts/deploy.js"
    echo ""
    echo "5. ⚙️  Actualizar configuración frontend:"
    echo "   - Copiar contract address a frontend/.env.local"
    echo "   - Reiniciar el servidor de desarrollo"
    echo ""
    echo "6. 🧪 Probar la integración:"
    echo "   - Crear un pago desde el dashboard"
    echo "   - Conectar wallet en el frontend"
    echo "   - Procesar pago de prueba"
    echo ""
    echo "📚 Documentación completa en: STARKNET_INTEGRATION.md"
    echo ""
    print_warning "IMPORTANTE: Solo usa testnet para desarrollo. Para producción, sigue la guía de migración a mainnet."
}

# Función principal
main() {
    echo "🚀 MidatoPay - Setup Starknet Integration"
    echo "========================================"
    echo ""
    
    check_dependencies
    install_scarb
    install_dependencies
    compile_contracts
    setup_config
    show_next_steps
}

# Verificar si el script se ejecuta desde la raíz del proyecto
if [ ! -f "package.json" ] || [ ! -d "frontend" ] || [ ! -d "backend" ]; then
    print_error "Este script debe ejecutarse desde la raíz del proyecto MidatoPay"
    exit 1
fi

# Ejecutar función principal
main
