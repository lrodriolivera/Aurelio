# Sistema de Gestión de Transporte de Carga

Sistema integral para digitalizar y optimizar la operación de transporte de carga Santiago - Coyhaique (vía Puerto Montt).

## Características Principales

- 🚚 **Gestión completa de carga**: Desde recepción hasta entrega
- 📦 **Tracking en tiempo real**: 8 estados de seguimiento con portal público
- 🏷️ **Etiquetado inteligente**: QR por bulto con lectores de código de barras
- 📊 **Dashboard en vivo**: Valor embarcado en tiempo real
- 🔔 **Notificaciones automáticas**: WhatsApp integration
- 💰 **Control financiero**: Integración con NUBOX
- 📱 **PWA**: Funcionalidad offline para bodegas

## Stack Tecnológico

### Backend
- Node.js 18+ + Express
- TypeScript 5.3
- PostgreSQL 15
- Redis 7
- Socket.io (real-time)
- JWT + bcrypt

### Frontend
- React 18 + Vite
- TypeScript 5.3
- TailwindCSS 3
- React Router 6
- Zustand (estado global)
- TanStack Query (server state)
- Socket.io Client

### Infraestructura
- Docker Compose (desarrollo local)
- Railway (backend producción)
- Vercel (frontend producción)

## Módulos del Sistema

### 01 - Recepción de Carga
- Registro digital de clientes
- Cálculo automático de fletes
- Generación de OR con QR
- Aplicación de seguros (2% > $1M)
- Etiquetado inteligente por bulto

### 02 - Gestión y Despacho
- Escaneo de bultos al cargar
- Dashboard valor embarcado en tiempo real
- Generación automática de manifiestos
- Control carga vs inventario
- 8 estados de seguimiento

### 03 - Tracking y Portal
- Portal público de consulta
- Notificaciones automáticas
- Historial completo de estados
- Estimación de llegada
- Sin login requerido

### 04 - Gestión de Destino
- Registro de descarga
- Notificación a clientes
- Control de retiros con firma digital
- Panel carga pendiente
- Entregas a domicilio

## Inicio Rápido

### Prerrequisitos
- Node.js 18+
- Docker y Docker Compose
- Git

### Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd Proyecto_Aurelio
```

2. Configurar variables de entorno
```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

3. Iniciar servicios con Docker Compose
```bash
docker-compose up -d
```

4. Instalar dependencias
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

5. Inicializar base de datos
```bash
docker exec -i postgres psql -U postgres -d transport_db < database/schema.sql
```

6. Iniciar desarrollo
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## URLs de Desarrollo

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

## Credenciales por Defecto

**Usuario Admin:**
- Email: admin@transport.com
- Password: admin123

⚠️ **IMPORTANTE**: Cambiar estas credenciales en producción

## Documentación

- [API Documentation](./docs/API.md)
- [Arquitectura](./docs/ARQUITECTURA.md)
- [Manual de Usuario](./docs/MANUAL_USUARIO.md)
- [Guía de Despliegue](./docs/DEPLOYMENT.md)

## Estructura del Proyecto

```
Proyecto_Aurelio/
├── backend/              # API Node.js + Express
│   └── src/
│       ├── config/       # Configuración
│       ├── controllers/  # HTTP handlers
│       ├── middleware/   # Express middleware
│       ├── routes/       # Definición de rutas
│       ├── services/     # Lógica de negocio
│       ├── types/        # TypeScript types
│       └── utils/        # Utilidades
├── frontend/             # React App
│   └── src/
│       ├── components/   # Componentes UI
│       ├── pages/        # Páginas
│       ├── services/     # API clients
│       ├── store/        # Zustand stores
│       └── types/        # TypeScript types
├── database/             # SQL schemas
├── docs/                 # Documentación
└── docker-compose.yml    # Docker setup
```

## Beneficios Esperados

### Operativos
- ✅ 70% reducción en tiempo de recepción
- ✅ Visibilidad en tiempo real del valor embarcado
- ✅ Control exacto de inventario
- ✅ Trazabilidad completa de cada bulto
- ✅ Eliminación de errores de carga

### Comerciales
- ✅ Tracking automático (ventaja competitiva)
- ✅ Mejor control financiero por viaje
- ✅ Datos para optimizar rutas y tarifas
- ✅ Profesionalización del servicio

### Administrativos
- ✅ Generación automática de documentos
- ✅ Integración con NUBOX
- ✅ Reportes ejecutivos en tiempo real
- ✅ Auditoría completa de operaciones

## Estados de Tracking

1. **RECIBIDO** - Carga ingresada en origen
2. **EN_BODEGA_ORIGEN** - Almacenado en Santiago
3. **EN_TRANSITO_PUERTO** - Camino a Puerto Montt
4. **EN_BODEGA_PUERTO** - Almacenado en Puerto Montt
5. **EN_TRANSITO_DESTINO** - Camino a Coyhaique
6. **EN_BODEGA_DESTINO** - Almacenado en Coyhaique
7. **LISTO_RETIRO** - Disponible para retiro
8. **ENTREGADO** - Entregado al cliente

## Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run test         # Tests
```

### Frontend
```bash
npm run dev          # Desarrollo
npm run build        # Build producción
npm run preview      # Preview build
npm run lint         # Linting
```

## Licencia

Propietario - Todos los derechos reservados

## Soporte

Para soporte y consultas, contactar al equipo de desarrollo.
