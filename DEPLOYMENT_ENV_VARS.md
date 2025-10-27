# 🔐 Variables de Entorno para Deployment

Este archivo contiene las variables de entorno que necesitas configurar en Railway y Vercel.

---

## 🚂 RAILWAY (Backend)

### Variables CRÍTICAS (Configurar ANTES del primer deploy)

```env
# Environment
NODE_ENV=production

# JWT Secrets (GENERADOS - ÚSALOS TAL CUAL)
JWT_SECRET=d941b55a955a72b6406c304f2e7cba343914eb69e79752e0925de7c4a8371142de1e8467429d5499ba2185915cf66770db165cc6938e622583be02252d9e93d0
JWT_REFRESH_SECRET=251184121206f07d8f7933cb990e0458414d9abb580ccf6a234429e4b9ae457cab9c6dfc0327afcfde738f872fe6b7b558e0b4a9baa40e7cefd5e4e6694b7066

# CORS (Actualizar DESPUÉS de desplegar frontend)
CORS_ORIGIN=https://tu-app.vercel.app
```

### Variables Automáticas (Railway las genera)

```env
# Database (Railway lo genera automáticamente al añadir PostgreSQL)
DATABASE_URL=${RAILWAY_GENERATED}
```

### Variables Opcionales

```env
# Redis (Solo si añades servicio Redis en Railway)
REDIS_URL=redis://default:password@redis.railway.internal:6379

# Email (Gmail ejemplo)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicación
EMAIL_FROM=noreply@tudominio.com

# Logging
LOG_LEVEL=info
```

---

## ⚡ VERCEL (Frontend)

### Variables CRÍTICAS (Configurar ANTES del primer deploy)

```env
# API URLs (Actualizar con la URL real de Railway DESPUÉS de desplegarlo)
VITE_API_URL=https://tu-backend-production.up.railway.app
VITE_WS_URL=https://tu-backend-production.up.railway.app
```

### Variables Opcionales (Ya tienen valores por defecto)

```env
VITE_APP_NAME=Sistema de Gestión de Transporte
VITE_APP_VERSION=1.0.0
VITE_ENABLE_PWA=true
VITE_ENABLE_OFFLINE=true
```

---

## 📝 INSTRUCCIONES PASO A PASO

### 1. Railway (Backend)

1. **Ir a tu proyecto en Railway**
2. **Seleccionar el servicio backend**
3. **Click en "Variables" tab**
4. **Añadir las siguientes variables:**

   ```
   NODE_ENV = production
   JWT_SECRET = d941b55a955a72b6406c304f2e7cba343914eb69e79752e0925de7c4a8371142de1e8467429d5499ba2185915cf66770db165cc6938e622583be02252d9e93d0
   JWT_REFRESH_SECRET = 251184121206f07d8f7933cb990e0458414d9abb580ccf6a234429e4b9ae457cab9c6dfc0327afcfde738f872fe6b7b558e0b4a9baa40e7cefd5e4e6694b7066
   CORS_ORIGIN = http://localhost:3000
   ```

   (Nota: `CORS_ORIGIN` lo actualizarás después con la URL de Vercel)

5. **Añadir servicio PostgreSQL:**
   - Click en "+ New" en tu proyecto
   - Selecciona "Database" → "PostgreSQL"
   - Railway generará automáticamente `DATABASE_URL`

6. **Generar dominio público:**
   - En tu servicio backend → "Settings"
   - Sección "Networking" → "Generate Domain"
   - **Copia esta URL** (ej: `https://tu-app-production.up.railway.app`)

7. **Ejecutar migraciones:**
   - Después del primer deploy
   - Click en los 3 puntos (...) → "Shell"
   - Ejecutar: `npm run migrate`

### 2. Vercel (Frontend)

1. **Ir a tu proyecto en Vercel**
2. **Durante la configuración inicial:**
   - Framework Preset: `Vite`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Configurar variables de entorno:**
   - En "Environment Variables"
   - Añadir:
     ```
     VITE_API_URL = https://tu-app-production.up.railway.app
     VITE_WS_URL = https://tu-app-production.up.railway.app
     ```
   (Usa la URL de Railway que copiaste en el paso 6 anterior)

4. **Deploy**
   - Click "Deploy"
   - Espera a que termine
   - **Copia la URL de Vercel** (ej: `https://tu-app.vercel.app`)

### 3. Actualizar CORS en Railway

1. **Volver a Railway**
2. **Seleccionar servicio backend**
3. **Variables tab**
4. **Actualizar `CORS_ORIGIN`:**
   ```
   CORS_ORIGIN = https://tu-app.vercel.app
   ```
   (Usa la URL exacta de Vercel, sin barra final)

5. Railway redesplegará automáticamente

---

## ✅ VERIFICACIÓN

### Backend (Railway)
```bash
# Abrir en navegador:
https://tu-app-production.up.railway.app/api/health

# Deberías ver:
{
  "status": "healthy",
  "timestamp": "2025-10-27T..."
}
```

### Frontend (Vercel)
```bash
# Abrir en navegador:
https://tu-app.vercel.app

# Deberías ver la página de login
# Credenciales por defecto:
# Email: admin@transport.com
# Password: admin123
```

---

## 🔒 SEGURIDAD POST-DEPLOYMENT

### 1. Cambiar contraseña del admin
- Iniciar sesión con credenciales por defecto
- Ir a perfil/configuración
- Cambiar contraseña inmediatamente

### 2. Revisar logs
- **Railway**: Deployments → View Logs
- **Vercel**: Deployments → Function Logs

### 3. Monitorear métricas
- **Railway**: Tab "Metrics"
- **Vercel**: Tab "Analytics"

---

## 📧 EMAIL OPCIONAL (Gmail)

Si quieres activar notificaciones por email:

1. **Ir a tu cuenta de Google:**
   - Seguridad → Verificación en 2 pasos (activar)
   - Contraseñas de aplicación → Generar nueva

2. **Añadir en Railway:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASSWORD=contraseña-de-aplicación-generada
   EMAIL_FROM=noreply@tudominio.com
   ```

---

## 🚨 TROUBLESHOOTING

### Error: "Cannot connect to database"
- Verifica que el servicio PostgreSQL esté corriendo en Railway
- Verifica que `DATABASE_URL` esté configurada
- Revisa los logs en Railway

### Error: "CORS policy blocked"
- Verifica que `CORS_ORIGIN` coincida EXACTAMENTE con URL de Vercel
- No uses barra final: ✅ `https://app.vercel.app` ❌ `https://app.vercel.app/`

### Error: "API calls failing" en frontend
- Verifica que `VITE_API_URL` esté configurada en Vercel
- Verifica que la URL del backend sea correcta
- Abre DevTools → Network para ver el error exacto

### Error 500 en endpoints
- Revisa logs en Railway: Deployments → View Logs
- Verifica que las migraciones se ejecutaron: `npm run migrate`
- Verifica credenciales de base de datos

---

## 📱 URLs IMPORTANTES

Después del deployment, guarda estas URLs:

```
Frontend (Vercel): https://_____________________.vercel.app
Backend (Railway):  https://_____________________.up.railway.app
PostgreSQL:         [Gestionada por Railway - no necesitas acceder]
```

---

## 🎯 RESUMEN DE COMANDOS

```bash
# En Railway Shell (después del primer deploy)
npm run migrate

# Para generar nuevos JWT secrets (si los necesitas)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Para verificar health del backend
curl https://tu-backend.up.railway.app/api/health

# Para ver variables actuales en Railway (desde CLI de Railway)
railway variables
```

---

**✨ ¡Listo! Sigue estos pasos y tu aplicación estará en producción.**

**🔗 Documentación adicional:**
- Railway: https://docs.railway.app/
- Vercel: https://vercel.com/docs
- Guía completa: Ver `DEPLOYMENT_GUIDE.md`
