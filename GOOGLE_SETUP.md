# Configuración de Google Cloud Platform

## ✅ Estado Actual

Las credenciales de Google OAuth ya están configuradas:

- **Client ID**: `939225644191-9epekva47v8uc05a4idjm2ehgbjc05ql.apps.googleusercontent.com`
- **Project ID**: `hackathon-2025-475302`
- **Archivo**: `backend/google_credentials.json`
- **Configurado en**: `backend/.env`

## 🔧 APIs Necesarias

Para que el proyecto funcione completamente, necesitas habilitar las siguientes APIs en Google Cloud Console:

### 1. Google Classroom API ✅ (Probablemente ya habilitada)

**Habilitar:**
1. Ve a: https://console.cloud.google.com/apis/library/classroom.googleapis.com?project=hackathon-2025-475302
2. Click en "ENABLE" (Habilitar)

**Scopes usados:**
- `https://www.googleapis.com/auth/classroom.courses.readonly` - Leer cursos
- `https://www.googleapis.com/auth/classroom.rosters.readonly` - Leer lista de alumnos
- `https://www.googleapis.com/auth/classroom.coursework.students.readonly` - Leer tareas y entregas

### 2. OAuth 2.0 - URIs Autorizados

**Actualizar en Google Cloud Console:**
1. Ve a: https://console.cloud.google.com/apis/credentials?project=hackathon-2025-475302
2. Click en tu OAuth 2.0 Client ID
3. Agregar en "Authorized redirect URIs":
   ```
   http://localhost:8000/auth/google/callback
   http://localhost:3000/auth/callback
   http://localhost:5173/auth/callback
   ```

4. Agregar en "Authorized JavaScript origins":
   ```
   http://localhost:8000
   http://localhost:3000
   http://localhost:5173
   ```

### 3. OAuth Consent Screen

Configurar la pantalla de consentimiento:

1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=hackathon-2025-475302
2. Tipo: **Internal** (si es Google Workspace) o **External** (para cualquier cuenta)
3. Información de la app:
   - **Nombre**: CALMA TECH
   - **Email de soporte**: tu email
   - **Logo**: (opcional) puedes usar el logo de CALMA TECH
4. Scopes:
   - Agregar los scopes de Classroom mencionados arriba
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. Test users (si es External):
   - Agregar los emails de los usuarios que probarán la app

## 📋 Scopes Completos Requeridos

```
openid
profile
email
https://www.googleapis.com/auth/classroom.courses.readonly
https://www.googleapis.com/auth/classroom.rosters.readonly
https://www.googleapis.com/auth/classroom.coursework.students.readonly
https://www.googleapis.com/auth/classroom.announcements.readonly
https://www.googleapis.com/auth/classroom.coursework.me.readonly
```

## 🔐 Seguridad

### ⚠️ IMPORTANTE: No subir credenciales a Git

El archivo `.gitignore` ya está configurado para ignorar:
- `backend/.env`
- `backend/google_credentials.json`
- Cualquier archivo `client_secret*.json`

**Verificar antes de hacer commit:**
```bash
git status
# Asegúrate que NO aparezcan archivos con credenciales
```

## 🧪 Probar Autenticación

Una vez configurado todo, puedes probar la autenticación:

```bash
# 1. Iniciar backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# 2. En el navegador, ir a:
http://localhost:8000/auth/google/login
```

## 📚 Documentación de Google

- [Classroom API](https://developers.google.com/classroom)
- [OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Python Client Library](https://github.com/googleapis/google-api-python-client)

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
- Verifica que la URI en el código coincida EXACTAMENTE con la configurada en Google Cloud
- No debe haber espacios ni caracteres extra

### Error: "access_denied"
- Verifica que el usuario esté en la lista de test users (si OAuth Consent es External)
- Verifica que los scopes estén aprobados

### Error: "invalid_client"
- Verifica que el Client ID y Client Secret en `.env` sean correctos
- Regenera las credenciales si es necesario

## 🔄 Regenerar Credenciales (si es necesario)

Si las credenciales se comprometen:

1. Ve a: https://console.cloud.google.com/apis/credentials?project=hackathon-2025-475302
2. Click en el OAuth 2.0 Client ID
3. Click "RESET SECRET"
4. Descarga el nuevo JSON
5. Actualiza `backend/.env` con el nuevo `GOOGLE_CLIENT_SECRET`

## ✅ Checklist de Configuración

- [x] Credenciales descargadas y copiadas
- [x] `backend/.env` configurado
- [x] `.gitignore` actualizado
- [ ] Google Classroom API habilitada
- [ ] OAuth redirect URIs configurados
- [ ] OAuth Consent Screen configurado
- [ ] Test users agregados (si aplica)
- [ ] Probar login con Google

## 🎯 Próximos Pasos

1. Habilitar las APIs en Google Cloud Console
2. Configurar OAuth Consent Screen
3. Agregar redirect URIs
4. Crear endpoints de autenticación en FastAPI
5. Integrar con Google Classroom API
