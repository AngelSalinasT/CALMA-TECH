#!/bin/bash

# Script para verificar la configuración de Google Cloud OAuth

echo "=========================================="
echo "VERIFICACIÓN DE CONFIGURACIÓN DE GOOGLE CLOUD"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "📋 CREDENCIALES ACTUALES:"
echo "----------------------------------------"

# Verificar archivo .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Archivo backend/.env encontrado"

    CLIENT_ID=$(grep GOOGLE_CLIENT_ID backend/.env | cut -d'=' -f2)
    CLIENT_SECRET=$(grep GOOGLE_CLIENT_SECRET backend/.env | cut -d'=' -f2)
    SCOPES=$(grep GOOGLE_CLASSROOM_SCOPES backend/.env | cut -d'=' -f2)

    echo "  Client ID: ${CLIENT_ID}"
    echo "  Client Secret: ${CLIENT_SECRET:0:20}... (oculto)"
    echo ""
    echo "  Scopes configurados:"

    # Parsear y mostrar scopes
    IFS=' ' read -ra SCOPE_ARRAY <<< "$SCOPES"
    for scope in "${SCOPE_ARRAY[@]}"; do
        if [[ $scope == *"classroom"* ]]; then
            echo -e "    ${GREEN}✓${NC} $scope"
        else
            echo "    • $scope"
        fi
    done
else
    echo -e "${RED}✗${NC} Archivo backend/.env NO encontrado"
fi

echo ""
echo "----------------------------------------"
echo "📋 CLIENT IDs ENCONTRADOS:"
echo "----------------------------------------"

# Verificar google_credentials.json
if [ -f "backend/google_credentials.json" ]; then
    echo -e "${YELLOW}⚠${NC}  google_credentials.json existe pero tiene un Client ID diferente"
    CRED_CLIENT_ID=$(grep -o '"client_id":"[^"]*' backend/google_credentials.json | cut -d'"' -f4)
    echo "  Client ID en credentials.json: ${CRED_CLIENT_ID}"
fi

# Verificar frontend
if [ -f "frontend/src/main.jsx" ]; then
    FRONTEND_CLIENT_ID=$(grep "GOOGLE_CLIENT_ID = " frontend/src/main.jsx | grep -o "'[^']*'" | tr -d "'")
    echo "  Client ID en frontend: ${FRONTEND_CLIENT_ID}"

    if [ "$CLIENT_ID" == "$FRONTEND_CLIENT_ID" ]; then
        echo -e "  ${GREEN}✓${NC} Frontend y Backend usan el mismo Client ID"
    else
        echo -e "  ${RED}✗${NC} Frontend y Backend usan Client IDs diferentes"
    fi
fi

echo ""
echo "=========================================="
echo "🔍 VERIFICACIONES NECESARIAS EN GOOGLE CLOUD CONSOLE"
echo "=========================================="
echo ""

PROJECT_ID="hackathon-2025-475302"
ACTUAL_CLIENT_ID="939225644191-vtuanf6foq2680b7u8ll0k586ie0tt0g.apps.googleusercontent.com"

echo "Debes verificar manualmente en Google Cloud Console:"
echo ""

echo "1️⃣  GOOGLE CLASSROOM API"
echo "   Link: https://console.cloud.google.com/apis/library/classroom.googleapis.com?project=${PROJECT_ID}"
echo "   → Verifica que esté HABILITADA"
echo ""

echo "2️⃣  OAUTH CONSENT SCREEN"
echo "   Link: https://console.cloud.google.com/apis/credentials/consent?project=${PROJECT_ID}"
echo "   → Verifica que esté configurado como 'External'"
echo "   → Verifica que tenga los siguientes scopes:"
echo "      • openid"
echo "      • .../auth/userinfo.email"
echo "      • .../auth/userinfo.profile"
echo "      • .../auth/classroom.courses.readonly"
echo "      • .../auth/classroom.rosters.readonly"
echo "      • .../auth/classroom.coursework.students.readonly"
echo "      • .../auth/classroom.coursework.me.readonly"
echo "      • .../auth/classroom.announcements.readonly"
echo "   → Verifica que tu email esté en 'Test Users'"
echo ""

echo "3️⃣  OAUTH CLIENT ID"
echo "   Link: https://console.cloud.google.com/apis/credentials?project=${PROJECT_ID}"
echo "   → Busca el Client ID: ${ACTUAL_CLIENT_ID}"
echo "   → Haz clic en el ícono de lápiz (editar)"
echo ""
echo "   Authorized JavaScript origins debe incluir:"
echo "      • http://localhost:3000"
echo "      • http://localhost:5173"
echo "      • http://localhost:8000"
echo "      • http://127.0.0.1:3000"
echo "      • http://127.0.0.1:5173"
echo "      • http://127.0.0.1:8000"
echo ""
echo "   Authorized redirect URIs debe incluir:"
echo "      • http://localhost:3000"
echo "      • http://localhost:5173"
echo "      • http://localhost:8000/auth/google/callback"
echo "      • http://127.0.0.1:3000"
echo "      • http://127.0.0.1:5173"
echo "      • http://127.0.0.1:8000/auth/google/callback"
echo ""

echo "=========================================="
echo "🧪 PASOS PARA PROBAR"
echo "=========================================="
echo ""
echo "Después de verificar todo en Google Cloud Console:"
echo ""
echo "1. Reinicia el backend:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   uvicorn app.main:app --reload"
echo ""
echo "2. Reinicia el frontend:"
echo "   cd frontend"
echo "   npm run dev"
echo ""
echo "3. Abre http://localhost:5173 en el navegador"
echo "4. Haz clic en 'Continuar con Google'"
echo "5. Acepta TODOS los permisos que Google te pida"
echo "6. Verifica que carguen los datos de Classroom"
echo ""

echo "=========================================="
echo "📝 LOGS PARA DEPURACIÓN"
echo "=========================================="
echo ""
echo "Si hay errores, revisa los logs:"
echo "  Backend: tail -f backend_uvicorn.log"
echo "  Frontend: En la consola donde ejecutaste 'npm run dev'"
echo "  Navegador: F12 → Console y Network tabs"
echo ""
