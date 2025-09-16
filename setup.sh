#!/bin/bash

# MidatoPay Setup Script
# Este script configura el entorno completo para MidatoPay

set -e

echo "🚀 Configurando MidatoPay..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar si Node.js está instalado
check_node() {
    if ! command -v node &> /dev/null; then
        print_error "Node.js no está instalado. Por favor instala Node.js 18+ desde https://nodejs.org/"
        exit 1
    fi
    
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js versión 18+ es requerida. Versión actual: $(node --version)"
        exit 1
    fi
    
    print_success "Node.js $(node --version) detectado"
}

# Verificar si PostgreSQL está instalado
check_postgres() {
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL no está instalado. Necesitarás instalarlo para usar la base de datos."
        print_warning "Instrucciones: https://www.postgresql.org/download/"
        return 1
    fi
    
    print_success "PostgreSQL detectado"
    return 0
}

# Instalar dependencias
install_dependencies() {
    print_status "Instalando dependencias del proyecto..."
    
    # Instalar dependencias principales
    npm install
    
    # Instalar dependencias del backend
    print_status "Instalando dependencias del backend..."
    cd backend
    npm install
    cd ..
    
    # Instalar dependencias del frontend
    print_status "Instalando dependencias del frontend..."
    cd frontend
    npm install
    cd ..
    
    print_success "Dependencias instaladas correctamente"
}

# Configurar variables de entorno
setup_env() {
    print_status "Configurando variables de entorno..."
    
    # Backend .env
    if [ ! -f backend/.env ]; then
        print_status "Creando archivo .env para backend..."
        cp backend/env.example backend/.env
        
        # Generar JWT secret
        JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "midatopay_jwt_secret_$(date +%s)")
        
        # Actualizar .env con valores por defecto
        sed -i.bak "s/tu_jwt_secret_super_seguro_aqui/$JWT_SECRET/" backend/.env
        rm backend/.env.bak 2>/dev/null || true
        
        print_success "Archivo .env del backend creado"
        print_warning "IMPORTANTE: Edita backend/.env con tus configuraciones de base de datos"
    else
        print_warning "El archivo backend/.env ya existe"
    fi
    
    # Frontend .env.local
    if [ ! -f frontend/.env.local ]; then
        print_status "Creando archivo .env.local para frontend..."
        cp frontend/env.example frontend/.env.local
        print_success "Archivo .env.local del frontend creado"
    else
        print_warning "El archivo frontend/.env.local ya existe"
    fi
}

# Configurar base de datos
setup_database() {
    print_status "Configurando base de datos..."
    
    if check_postgres; then
        print_status "¿Quieres crear la base de datos ahora? (y/n)"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            print_status "Creando base de datos..."
            
            # Leer configuración de .env
            if [ -f backend/.env ]; then
                DB_URL=$(grep DATABASE_URL backend/.env | cut -d'=' -f2 | tr -d '"')
                DB_NAME=$(echo $DB_URL | cut -d'/' -f4)
                DB_USER=$(echo $DB_URL | cut -d'/' -f3 | cut -d':' -f1)
                DB_HOST=$(echo $DB_URL | cut -d'/' -f3 | cut -d':' -f2 | cut -d'@' -f2)
                DB_PORT=$(echo $DB_URL | cut -d'/' -f3 | cut -d':' -f3 | cut -d'@' -f1)
                
                # Crear base de datos
                createdb -h $DB_HOST -p $DB_PORT -U $DB_USER $DB_NAME 2>/dev/null || print_warning "La base de datos ya existe o no se pudo crear"
                
                # Ejecutar migraciones
                print_status "Ejecutando migraciones..."
                cd backend
                npm run db:migrate
                npm run db:generate
                npm run db:seed
                cd ..
                
                print_success "Base de datos configurada correctamente"
            else
                print_error "No se encontró el archivo backend/.env"
            fi
        fi
    else
        print_warning "PostgreSQL no está disponible. Configura la base de datos manualmente."
    fi
}

# Verificar puertos
check_ports() {
    print_status "Verificando puertos..."
    
    BACKEND_PORT=3001
    FRONTEND_PORT=3000
    
    if lsof -Pi :$BACKEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Puerto $BACKEND_PORT está en uso"
    else
        print_success "Puerto $BACKEND_PORT disponible"
    fi
    
    if lsof -Pi :$FRONTEND_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Puerto $FRONTEND_PORT está en uso"
    else
        print_success "Puerto $FRONTEND_PORT disponible"
    fi
}

# Mostrar información final
show_final_info() {
    echo ""
    echo "🎉 ¡MidatoPay configurado exitosamente!"
    echo ""
    echo "📋 Próximos pasos:"
    echo "1. Edita backend/.env con tu configuración de PostgreSQL"
    echo "2. Ejecuta 'npm run dev' para iniciar el servidor de desarrollo"
    echo "3. Visita http://localhost:3000 para ver la aplicación"
    echo ""
    echo "🔑 Credenciales de demo:"
    echo "   Comercio: barista@cafe.com / merchant123"
    echo "   Admin: admin@midatopay.com / admin123"
    echo ""
    echo "📚 Comandos útiles:"
    echo "   npm run dev          - Iniciar desarrollo"
    echo "   npm run dev:backend  - Solo backend"
    echo "   npm run dev:frontend - Solo frontend"
    echo "   npm run build        - Build de producción"
    echo ""
    echo "🐛 Si encuentras problemas:"
    echo "   - Verifica que PostgreSQL esté ejecutándose"
    echo "   - Revisa los archivos .env"
    echo "   - Consulta el README.md para más información"
    echo ""
}

# Función principal
main() {
    echo "🚀 Iniciando configuración de MidatoPay..."
    echo ""
    
    check_node
    check_ports
    install_dependencies
    setup_env
    setup_database
    
    show_final_info
}

# Ejecutar script
main "$@"
