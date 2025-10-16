#!/bin/bash

# CALMA TECH - Script de configuración de Base de Datos
# Este script configura y levanta PostgreSQL usando Docker y Colima

set -e

echo "🚀 CALMA TECH - Configuración de Base de Datos"
echo "=============================================="
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar si Colima está instalado
if ! command -v colima &> /dev/null; then
    echo -e "${RED}❌ Colima no está instalado${NC}"
    echo "Instalar con: brew install colima"
    exit 1
fi

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado${NC}"
    echo "Instalar con: brew install docker docker-compose"
    exit 1
fi

# Verificar si Colima está corriendo
if ! colima status &> /dev/null; then
    echo -e "${YELLOW}⚠️  Colima no está corriendo. Iniciando...${NC}"
    colima start
    echo -e "${GREEN}✅ Colima iniciado${NC}"
else
    echo -e "${GREEN}✅ Colima ya está corriendo${NC}"
fi

# Verificar si el archivo docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ docker-compose.yml no encontrado${NC}"
    echo "Asegúrate de estar en el directorio raíz del proyecto"
    exit 1
fi

# Levantar contenedores
echo ""
echo "🐳 Levantando contenedores Docker..."
docker-compose up -d

# Esperar a que PostgreSQL esté listo
echo ""
echo "⏳ Esperando a que PostgreSQL esté listo..."
sleep 5

# Verificar que los contenedores estén corriendo
if docker ps | grep -q calmatech_postgres; then
    echo -e "${GREEN}✅ PostgreSQL está corriendo${NC}"
else
    echo -e "${RED}❌ Error al iniciar PostgreSQL${NC}"
    docker-compose logs postgres
    exit 1
fi

# Crear archivo .env si no existe
if [ ! -f "backend/.env" ]; then
    echo ""
    echo "📝 Creando archivo backend/.env..."
    cp backend/.env.example backend/.env
    echo -e "${GREEN}✅ Archivo backend/.env creado${NC}"
    echo -e "${YELLOW}⚠️  Recuerda configurar tus API keys en backend/.env${NC}"
fi

# Mostrar información
echo ""
echo "=============================================="
echo -e "${GREEN}✅ Base de datos configurada correctamente${NC}"
echo ""
echo "📊 Información de conexión:"
echo "  - Database: calmatech_db"
echo "  - User: calmatech_user"
echo "  - Password: calmatech_dev_password_2025"
echo "  - Host: localhost"
echo "  - Port: 5432"
echo ""
echo "🌐 pgAdmin (UI):"
echo "  - URL: http://localhost:5050"
echo "  - Email: admin@calmatech.local"
echo "  - Password: admin123"
echo ""
echo "🔧 Comandos útiles:"
echo "  - Ver logs: docker-compose logs -f postgres"
echo "  - Detener: docker-compose down"
echo "  - Reiniciar: docker-compose restart"
echo "  - Conectar: docker exec -it calmatech_postgres psql -U calmatech_user -d calmatech_db"
echo ""
echo "📚 Más info en: DATABASE.md"
echo "=============================================="
