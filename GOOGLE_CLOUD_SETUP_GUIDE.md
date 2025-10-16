# Guía de Configuración de Google Cloud Console

## ⚠️ PROBLEMA ACTUAL

El login con Google funciona, pero NO se pueden cargar los datos de Google Classroom porque:

1. Los scopes no estaban sincronizados entre frontend y backend ✅ **YA CORREGIDO**
2. Falta configurar correctamente Google Cloud Console (esta guía)

---

## 🔧 PASOS PARA CONFIGURAR GOOGLE CLOUD CONSOLE

### 1. Habilitar Google Classroom API

**Link directo:**
```
https://console.cloud.google.com/apis/library/classroom.googleapis.com?project=hackathon-2025-475302
```

**Pasos:**
1. Haz clic en el link de arriba
2. Clic en el botón **"ENABLE"** o **"HABILITAR"**
3. Espera unos segundos a que se active

---

### 2. Configurar OAuth Consent Screen

**Link directo:**
```
https://console.cloud.google.com/apis/credentials/consent?project=hackathon-2025-475302
```

**Pasos:**

#### A) Tipo de Usuario
- Selecciona **"External"** (para usar con cualquier cuenta de Google)
- Clic en **"CREATE"** o **"CREAR"**

#### B) Información de la App
- **App name:** `CALMA TECH`
- **User support email:** Tu email
- **App logo:** (Opcional) Puedes subir el logo
- **Developer contact information:** Tu email
- Clic en **"SAVE AND CONTINUE"**

#### C) Scopes (IMPORTANTE)
- Clic en **"ADD OR REMOVE SCOPES"**
- Busca y selecciona los siguientes scopes:

```
✓ openid
✓ .../auth/userinfo.email
✓ .../auth/userinfo.profile
✓ .../auth/classroom.courses.readonly
✓ .../auth/classroom.rosters.readonly
✓ .../auth/classroom.coursework.students.readonly
✓ .../auth/classroom.coursework.me.readonly
✓ .../auth/classroom.announcements.readonly
```

**Para buscar scopes de Classroom:**
1. En el campo de búsqueda escribe: `classroom`
2. Marca TODOS los scopes que terminen en `.readonly`

- Clic en **"UPDATE"** y luego **"SAVE AND CONTINUE"**

#### D) Test Users
Ya que la app está en modo desarrollo, necesitas agregar usuarios de prueba:

- Clic en **"ADD USERS"**
- Agrega los emails de las cuentas de Google que usarás para probar:
  ```
  tu-email@gmail.com
  otro-email@gmail.com
  ```
- Clic en **"SAVE AND CONTINUE"**

---

### 3. Configurar OAuth Client ID

**Link directo:**
```
https://console.cloud.google.com/apis/credentials?project=hackathon-2025-475302
```

**Pasos:**
1. Busca tu OAuth 2.0 Client ID: `939225644191-vtuanf6foq2680b7u8ll0k586ie0tt0g.apps.googleusercontent.com`
2. Haz clic en el ícono de lápiz (editar)

#### A) Authorized JavaScript origins
Agrega las siguientes URLs:
```
http://localhost:3000
http://localhost:5173
http://localhost:8000
http://127.0.0.1:3000
http://127.0.0.1:5173
http://127.0.0.1:8000
```

#### B) Authorized redirect URIs
Agrega las siguientes URLs:
```
http://localhost:3000
http://localhost:5173
http://localhost:3000/auth/callback
http://localhost:5173/auth/callback
http://localhost:8000/auth/google/callback
http://127.0.0.1:3000
http://127.0.0.1:5173
http://127.0.0.1:3000/auth/callback
http://127.0.0.1:5173/auth/callback
http://127.0.0.1:8000/auth/google/callback
```

3. Clic en **"SAVE"** o **"GUARDAR"**

---

## 🧪 PROBAR LA CONFIGURACIÓN

### 1. Reiniciar el backend (importante para cargar los nuevos scopes)

```bash
cd ~/Documents/Projects/hackathon_2025/backend

# Si está corriendo, detenerlo con Ctrl+C

# Activar el entorno virtual
source venv/bin/activate

# Iniciar el servidor
uvicorn app.main:app --reload
```

### 2. Reiniciar el frontend

```bash
cd ~/Documents/Projects/hackathon_2025/frontend

# Si está corriendo, detenerlo con Ctrl+C

# Iniciar el servidor
npm run dev
```

### 3. Probar el flujo completo

1. Abre el navegador en: `http://localhost:5173`
2. Haz clic en **"Continuar con Google"**
3. Selecciona tu cuenta de Google
4. **IMPORTANTE:** Google te pedirá permisos adicionales para acceder a Classroom
   - Revisa los permisos y acepta TODOS
5. Deberías ser redirigido al dashboard correspondiente (alumno o profesor)
6. Los datos de Google Classroom deberían cargarse correctamente

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"
**Causa:** La URL de redirect no está autorizada en Google Cloud Console

**Solución:**
1. Ve a la configuración del OAuth Client ID
2. Verifica que las Authorized redirect URIs incluyan exactamente la URL que estás usando
3. Guarda los cambios y espera 5 minutos para que se propague

### Error: "access_denied" o "restricted_client"
**Causa:** La aplicación no tiene los scopes aprobados o el usuario no está en la lista de test users

**Solución:**
1. Ve al OAuth Consent Screen
2. Verifica que TODOS los scopes de Classroom estén agregados
3. Agrega tu email a la lista de Test Users
4. Intenta nuevamente

### Error: 401 Unauthorized al cargar el dashboard
**Causa:** El token no tiene los permisos necesarios

**Solución:**
1. Borra las cookies y localStorage del navegador
2. Cierra sesión de Google en el navegador
3. Vuelve a hacer el flujo de login completo
4. Google te pedirá los nuevos permisos

### Los datos de Classroom no cargan
**Causa:** Puede ser que la cuenta de Google no tenga cursos activos en Classroom

**Solución:**
1. Verifica que la cuenta de Google tenga cursos en Google Classroom
2. Si eres alumno, verifica que estés inscrito en al menos 1 curso activo
3. Si eres profesor, verifica que hayas creado al menos 1 curso activo
4. Revisa los logs del backend para ver el error específico:
   ```bash
   cd ~/Documents/Projects/hackathon_2025/backend
   tail -f backend_uvicorn.log
   ```

---

## ✅ Checklist de Verificación

- [ ] Google Classroom API habilitada en Google Cloud Console
- [ ] OAuth Consent Screen configurado (tipo External)
- [ ] Scopes de Classroom agregados al Consent Screen
- [ ] Test users agregados (tu email)
- [ ] Authorized JavaScript origins configurados
- [ ] Authorized redirect URIs configurados
- [ ] Backend reiniciado (para cargar nuevos scopes del .env)
- [ ] Frontend reiniciado
- [ ] Probado el login con Google
- [ ] Dashboard carga datos de Classroom correctamente

---

## 📝 Información de Configuración Actual

**Project ID:** `hackathon-2025-475302`
**Client ID:** `939225644191-vtuanf6foq2680b7u8ll0k586ie0tt0g.apps.googleusercontent.com`

**Scopes configurados:**
- openid
- profile
- email
- https://www.googleapis.com/auth/classroom.courses.readonly
- https://www.googleapis.com/auth/classroom.rosters.readonly
- https://www.googleapis.com/auth/classroom.coursework.students.readonly
- https://www.googleapis.com/auth/classroom.coursework.me.readonly
- https://www.googleapis.com/auth/classroom.announcements.readonly

**Backend URL:** `http://127.0.0.1:8000`
**Frontend URL:** `http://localhost:5173`

---

## 🎯 Resultado Esperado

Después de seguir esta guía:

1. ✅ Puedes hacer login con Google
2. ✅ Google te pide permisos de Classroom
3. ✅ Te redirige al dashboard correcto (alumno/profesor)
4. ✅ El dashboard carga automáticamente:
   - Tus cursos
   - Tareas pendientes
   - Anuncios recientes
   - Estadísticas

---

## 💡 Notas Importantes

- Los cambios en Google Cloud Console pueden tardar hasta 5 minutos en propagarse
- Después de cambiar scopes, es necesario volver a hacer el flujo de login completo
- En producción, deberás cambiar el OAuth Consent Screen a "Internal" o publicar la app
- Los tokens se almacenan temporalmente en memoria (no en base de datos aún)
