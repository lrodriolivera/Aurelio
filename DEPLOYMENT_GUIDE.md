# 🚀 Guía de Despliegue - Railway + Vercel

Esta guía te llevará paso a paso para desplegar el backend en **Railway** y el frontend en **Vercel**.

---

## 📋 Requisitos Previos

- ✅ Cuenta en [Railway](https://railway.app/)
- ✅ Cuenta en [Vercel](https://vercel.com/)
- ✅ Git instalado
- ✅ Repositorio de GitHub (recomendado)

---

## 🔧 PASO 1: Preparar el Repositorio

### 1.1 Inicializar Git (si no lo has hecho)

```bash
cd /home/rypcloud/proyectos/Proyecto_Aurelio
git init
git add .
git commit -m "Initial commit - Transport Management System"
```

### 1.2 Crear repositorio en GitHub

1. Ve a [GitHub](https://github.com/new)
2. Crea un nuevo repositorio (público o privado)
3. NO inicialices con README, .gitignore o licencia
4. Copia la URL del repositorio

### 1.3 Subir el código

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
git branch -M main
git push -u origin main
```

---

## 🚂 PASO 2: Desplegar Backend en Railway

### 2.1 Crear Proyecto en Railway

1. Ve a [Railway.app](https://railway.app/)
2. Haz clic en "New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu cuenta de GitHub y selecciona tu repositorio
5. Railway detectará automáticamente el backend

### 2.2 Configurar Base de Datos PostgreSQL

1. En tu proyecto de Railway, haz clic en "+ New"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos
4. **Railway generará automáticamente la variable `DATABASE_URL`**

### 2.3 Configurar Variables de Entorno del Backend

1. En Railway, haz clic en tu servicio backend
2. Ve a la pestaña "Variables"
3. Agrega las siguientes variables:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=genera-una-cadena-aleatoria-super-segura-aqui-usa-un-generador-online
CORS_ORIGIN=https://tu-app.vercel.app
```

**IMPORTANTE**: El `CORS_ORIGIN` lo configurarás después de desplegar el frontend.

### 2.4 Configurar Root Directory

1. En Railway, ve a "Settings"
2. En "Root Directory" pon: `backend`
3. Guarda los cambios

### 2.5 Ejecutar Migraciones

1. En Railway, ve a tu servicio backend
2. Haz clic en "Deploy" para forzar un nuevo despliegue
3. Una vez desplegado, abre la consola CLI:
   - Haz clic en los 3 puntos (...) → "Shell"
4. Ejecuta el comando de migración:

```bash
npm run migrate
```

**Deberías ver:**
```
✅ Connected to database
✅ Schema created successfully
✅ Seed data inserted successfully
🎉 Migration completed successfully!
```

### 2.6 Obtener URL del Backend

1. En Railway, ve a "Settings" de tu servicio backend
2. En "Networking" verás "Public Networking"
3. Haz clic en "Generate Domain"
4. **Copia esta URL** (ejemplo: `https://tu-app-production.up.railway.app`)

---

## ⚡ PASO 3: Desplegar Frontend en Vercel

### 3.1 Conectar Repositorio a Vercel

1. Ve a [Vercel](https://vercel.com/dashboard)
2. Haz clic en "Add New..." → "Project"
3. Importa tu repositorio de GitHub
4. Vercel detectará automáticamente que es un proyecto de Vite/React

### 3.2 Configurar el Proyecto

**Framework Preset**: Vite
**Root Directory**: `frontend`
**Build Command**: `npm run build`
**Output Directory**: `dist`

### 3.3 Configurar Variables de Entorno del Frontend

Antes de hacer deploy, agrega la variable de entorno:

**Variable**:
- **Name**: `VITE_API_URL`
- **Value**: La URL de Railway que copiaste (ej: `https://tu-app-production.up.railway.app`)

### 3.4 Desplegar

1. Haz clic en "Deploy"
2. Vercel construirá y desplegará tu aplicación
3. Una vez completado, obtendrás una URL (ej: `https://tu-app.vercel.app`)

---

## 🔄 PASO 4: Actualizar CORS en Backend

Ahora que tienes la URL de Vercel, necesitas actualizar el backend:

### 4.1 Actualizar Variable de Entorno en Railway

1. Ve a tu proyecto en Railway
2. Selecciona el servicio backend
3. Ve a "Variables"
4. Actualiza `CORS_ORIGIN` con la URL de Vercel:

```env
CORS_ORIGIN=https://tu-app.vercel.app
```

5. Guarda y Railway redesplegará automáticamente

---

## ✅ PASO 5: Verificar el Despliegue

### 5.1 Probar el Backend

Abre en tu navegador:
```
https://tu-app-production.up.railway.app/api/health
```

Deberías ver algo como:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-23T..."
}
```

### 5.2 Probar el Frontend

1. Abre `https://tu-app.vercel.app`
2. Deberías ver la página de login
3. **Credenciales de prueba**:
   - Email: `admin@transport.com`
   - Password: `admin123` (CÁMBIALO INMEDIATAMENTE)

### 5.3 Probar la Conexión Completa

1. Inicia sesión en el frontend
2. Si ves el Dashboard con datos, ¡todo funciona! 🎉

---

## 🔐 PASO 6: Seguridad Post-Despliegue

### 6.1 Cambiar Contraseña del Admin

1. Inicia sesión con las credenciales por defecto
2. Ve a la página de usuarios o perfil
3. Cambia la contraseña inmediatamente

### 6.2 Generar Hash de Contraseña Segura

Si necesitas actualizar la contraseña directamente en la base de datos:

```javascript
// Ejecuta esto en Node.js
const bcrypt = require('bcrypt');
const password = 'TU_NUEVA_CONTRASEÑA_SEGURA';
bcrypt.hash(password, 10, (err, hash) => {
  console.log('Hash:', hash);
});
```

Luego en Railway Shell (PostgreSQL):
```sql
UPDATE users
SET password_hash = 'EL_HASH_GENERADO'
WHERE email = 'admin@transport.com';
```

---

## 📊 PASO 7: Configuración de Email (Opcional)

Si quieres habilitar notificaciones por email:

### 7.1 Configurar Gmail (Ejemplo)

1. Crea una contraseña de aplicación en Gmail:
   - Ve a tu cuenta de Google → Seguridad
   - Habilita verificación en 2 pasos
   - Genera una contraseña de aplicación

2. Agrega las variables en Railway:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicación
SMTP_FROM=noreply@tudominio.com
```

---

## 🔄 Actualizaciones Futuras

### Para actualizar el Backend:

```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway desplegará automáticamente.

### Para actualizar el Frontend:

```bash
git add .
git commit -m "Update frontend"
git push origin main
```

Vercel desplegará automáticamente.

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"

- Verifica que la variable `DATABASE_URL` esté configurada en Railway
- Verifica que el servicio de PostgreSQL esté corriendo

### Error: "CORS policy blocked"

- Verifica que `CORS_ORIGIN` en Railway coincida exactamente con la URL de Vercel
- No incluyas barra al final: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`

### Error: "API calls failing" en frontend

- Verifica que `VITE_API_URL` esté configurada en Vercel
- Verifica que la URL del backend sea correcta

### Error 500 en endpoints

- Revisa los logs en Railway: click en tu servicio → "Deployments" → click en el deployment → "View Logs"

---

## 📱 Monitoreo

### Railway

- Ve a tu proyecto → Deployments para ver logs
- Métricas disponibles en la pestaña "Metrics"

### Vercel

- Ve a tu proyecto → Deployments para ver el historial
- Analytics disponible en la pestaña "Analytics"

---

## 🎉 ¡Listo!

Tu aplicación está desplegada y funcionando. URLs importantes:

- **Frontend**: `https://tu-app.vercel.app`
- **Backend**: `https://tu-app-production.up.railway.app`
- **Database**: Gestionada por Railway (sin acceso directo necesario)

---

## 💡 Próximos Pasos Recomendados

1. ✅ Cambiar contraseña del admin
2. ✅ Configurar dominio personalizado en Vercel (opcional)
3. ✅ Configurar email notifications
4. ✅ Agregar más usuarios desde la interfaz
5. ✅ Revisar y ajustar las tarifas de flete en la aplicación

---

**¿Necesitas ayuda?** Revisa los logs en Railway y Vercel para diagnosticar cualquier problema.
