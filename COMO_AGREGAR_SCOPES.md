# Cómo Agregar Scopes en Google Cloud Console

## 📍 Estás aquí:
https://console.cloud.google.com/apis/credentials/consent?project=hackathon-2025-475302

## 🔍 Encontrar la sección de Scopes

Dependiendo del estado de tu OAuth Consent Screen, hay dos formas de acceder:

### Opción 1: Si ves el botón "EDIT APP"

1. En la página del OAuth Consent Screen, busca el botón **"EDIT APP"** (usualmente en la parte superior)
2. Click en **"EDIT APP"**
3. Te llevará a un wizard con varios pasos:
   - App information
   - **Scopes** ← Aquí es donde debes ir
   - Test users
   - Summary

4. Navega hasta la sección **"Scopes"** (puede ser el paso 2)
5. Ahí verás un botón **"ADD OR REMOVE SCOPES"**

### Opción 2: Si la app está en modo "Testing" o "In Production"

Si no ves "EDIT APP", busca:

1. En la página principal del OAuth Consent Screen
2. Scroll hacia abajo hasta encontrar una sección llamada **"Scopes"** o **"OAuth Scopes"**
3. Debería haber un botón para editar o agregar scopes

### Opción 3: Verificar el estado actual

La app puede estar en uno de estos estados:
- **Testing** (modo prueba)
- **In production** (publicada)
- **Draft** (borrador)

El estado se muestra en la parte superior de la página.

## ✅ Cómo Agregar los Scopes de Classroom

Una vez que encuentres el botón "ADD OR REMOVE SCOPES":

1. **Click en "ADD OR REMOVE SCOPES"**

2. **Se abrirá un modal/panel lateral** con dos opciones:
   - **Manually add scopes** (agregar manualmente)
   - **Filter** (buscar scopes disponibles)

3. **Opción A: Buscar en la lista**
   - En el campo de búsqueda escribe: `classroom`
   - Aparecerá una lista de scopes de Google Classroom
   - Marca TODOS los que terminen en `.readonly`:
     ```
     ✓ https://www.googleapis.com/auth/classroom.courses.readonly
     ✓ https://www.googleapis.com/auth/classroom.rosters.readonly
     ✓ https://www.googleapis.com/auth/classroom.coursework.students.readonly
     ✓ https://www.googleapis.com/auth/classroom.coursework.me.readonly
     ✓ https://www.googleapis.com/auth/classroom.announcements.readonly
     ```

4. **Opción B: Agregar manualmente**
   - Click en "Manually add scopes"
   - Pega cada uno de estos scopes (uno por línea):
     ```
     https://www.googleapis.com/auth/classroom.courses.readonly
     https://www.googleapis.com/auth/classroom.rosters.readonly
     https://www.googleapis.com/auth/classroom.coursework.students.readonly
     https://www.googleapis.com/auth/classroom.coursework.me.readonly
     https://www.googleapis.com/auth/classroom.announcements.readonly
     ```

5. **Click en "UPDATE"** o "ADD" (dependiendo de la versión)

6. **Click en "SAVE AND CONTINUE"** para guardar los cambios

## 🚨 Si NO encuentras la opción de Scopes

Puede ser que tu OAuth Consent Screen esté configurado como **"Internal"** en lugar de **"External"**.

### Verificar el tipo:

1. En la página principal del OAuth Consent Screen
2. Busca "User Type" o "Audience"
3. Debería decir **"External"**

Si dice **"Internal"**:
- Solo funciona con cuentas de Google Workspace de tu organización
- Los scopes pueden estar pre-aprobados automáticamente

### Cambiar de Internal a External (si es necesario):

1. En OAuth Consent Screen, busca la opción "User Type"
2. Selecciona **"External"**
3. Guarda los cambios
4. Ahora deberías poder agregar scopes

## 🎯 Verificar que los Scopes están agregados

Después de agregar los scopes, en la página principal del OAuth Consent Screen deberías ver:

**Scopes for Google APIs:**
- openid
- .../auth/userinfo.email
- .../auth/userinfo.profile
- .../auth/classroom.courses.readonly
- .../auth/classroom.rosters.readonly
- .../auth/classroom.coursework.students.readonly
- .../auth/classroom.coursework.me.readonly
- .../auth/classroom.announcements.readonly

**Total: 8 scopes**

## 📸 ¿Qué ves en tu pantalla?

Si sigues sin encontrar la opción, dime exactamente qué opciones ves en la página:
- ¿Hay un botón "EDIT APP"?
- ¿Qué dice en "Publishing status"?
- ¿Qué dice en "User type"?
- ¿Ves alguna sección que diga "OAuth Scopes" o "Scopes"?

Con esa información te puedo ayudar mejor.

## 🔄 Alternativa: Usar gcloud CLI (avanzado)

Si tienes gcloud instalado, puedes verificar los scopes con:

```bash
gcloud auth application-default login --scopes=\
openid,\
https://www.googleapis.com/auth/userinfo.email,\
https://www.googleapis.com/auth/userinfo.profile,\
https://www.googleapis.com/auth/classroom.courses.readonly,\
https://www.googleapis.com/auth/classroom.rosters.readonly,\
https://www.googleapis.com/auth/classroom.coursework.students.readonly,\
https://www.googleapis.com/auth/classroom.coursework.me.readonly,\
https://www.googleapis.com/auth/classroom.announcements.readonly
```

Pero esto es para desarrollo local, no afecta la configuración del OAuth Consent Screen.
