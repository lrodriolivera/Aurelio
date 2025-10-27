# Reference Codebase Analysis - Quick Index

**Source:** Aire_Acondicionado Platform
**Location:** `/home/rypcloud/Documentos/Aire_Acondicionado/`
**Status:** Production-Ready, 100% Complete
**Generated:** October 22, 2024

## Document Location
Full comprehensive report: `/home/rypcloud/proyectos/Proyecto_Aurelio/REFERENCE_CODEBASE_ANALYSIS.md`

---

## QUICK NAVIGATION

### Project Overview
- **Type:** Full-stack IoT Management System
- **Frontend:** React 18 + TypeScript + Vite + TailwindCSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** PostgreSQL 15 + Redis 7 + MQTT Mosquitto
- **Deployment:** Vercel (frontend) + Railway (backend)

### Key Files & Directories

#### Backend
- `/backend/src/services/` - Business logic
- `/backend/src/controllers/` - HTTP request handlers
- `/backend/src/routes/` - Route definitions
- `/backend/src/adapters/` - Protocol adapters (MQTT, HTTP, etc.)
- `/backend/src/middleware/` - Auth, error handling, validation
- `/backend/src/config/` - Database, Redis, configuration
- `/backend/src/utils/` - Logger, JWT, password utilities
- `/backend/src/types/` - TypeScript interfaces

#### Frontend
- `/frontend/src/pages/` - Page components (Dashboard, Devices, etc.)
- `/frontend/src/components/` - Reusable UI components
- `/frontend/src/services/` - API communication layer
- `/frontend/src/store/` - Zustand state management
- `/frontend/src/types/` - TypeScript interfaces

#### Documentation
- `/docs/API.md` - API endpoints
- `/docs/ARQUITECTURA.md` - System architecture
- `/docs/DEPLOYMENT.md` - Production deployment
- `/docs/DESARROLLO.md` - Developer guide
- `/docs/USUARIO.md` - User manual
- `/README.md` - Main project documentation
- `/EMPEZAR_AQUI.md` - Quick start guide
- `/ESTADO_FINAL.md` - Project completion status

---

## NAMING CONVENTIONS

### Backend Files
| File Type | Pattern | Example |
|-----------|---------|---------|
| Service | `{domain}.service.ts` | `auth.service.ts`, `device.service.ts` |
| Controller | `{domain}.controller.ts` | `device.controller.ts` |
| Route | `{domain}.routes.ts` | `auth.routes.ts` |
| Middleware | `{purpose}.ts` | `errorHandler.ts`, `auth.ts` |
| Util | `{name}.ts` | `logger.ts`, `jwt.ts` |
| Adapter | `{Protocol}Adapter.ts` | `GenericMQTTAdapter.ts` |
| Config | `{service}.ts` or `index.ts` | `database.ts`, `redis.ts` |

### Frontend Files
| File Type | Pattern | Example |
|-----------|---------|---------|
| Page | `{PageName}.tsx` (PascalCase) | `Dashboard.tsx`, `Devices.tsx` |
| Component | `{ComponentName}.tsx` | `Layout.tsx` |
| Service | `{domain}.service.ts` | `device.service.ts` |
| Store | `{domain}Store.ts` | `authStore.ts` |
| Type | `index.ts` (in types folder) | `/types/index.ts` |

---

## ARCHITECTURE PATTERNS

### Backend Patterns
1. **Service-Controller-Route Flow** - Clean separation of concerns
2. **Singleton Pattern** - Database, Redis, Config instances
3. **Factory Pattern** - Device adapters creation
4. **Error Handling** - Custom ApiError class with HTTP status codes
5. **Middleware Stack** - Security → CORS → Parsing → Auth → Validation
6. **Type-Safe Config** - Strongly typed configuration object

### Frontend Patterns
1. **Page + Layout + Component Hierarchy** - Nested routing structure
2. **Service Layer** - Centralized API communication
3. **Zustand State** - Global state with localStorage persistence
4. **React Query** - Server state management with staleTime optimization
5. **Protected Routes** - PrivateRoute wrapper for auth
6. **Axios Interceptors** - Automatic auth headers and 401 handling

### Database Patterns
1. **Partitioning** - device_telemetry by monthly ranges
2. **Indexing** - Strategic indexes on frequently queried columns
3. **JSONB** - Flexible configuration storage
4. **Foreign Keys** - Proper relationships with cascading
5. **Triggers** - Automatic timestamp updates

---

## TECHNOLOGY STACK

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18.2
- **Language:** TypeScript 5.3.3
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Auth:** JWT (jsonwebtoken)
- **Password:** bcrypt
- **Logging:** Winston
- **Real-time:** Socket.io
- **IoT Protocol:** MQTT

### Frontend
- **Framework:** React 18.2.0
- **Build:** Vite 5.0.10
- **Styling:** TailwindCSS 3.4.0
- **Routing:** React Router 6.21.1
- **State:** Zustand 4.4.7
- **Server State:** TanStack Query 5.17.9
- **HTTP:** Axios 1.6.5
- **Real-time:** Socket.io Client
- **Notifications:** React Hot Toast
- **Icons:** Lucide React

### Infrastructure
- **Backend Hosting:** Railway
- **Frontend Hosting:** Vercel
- **Containerization:** Docker
- **Orchestration:** Docker Compose

---

## REUSABLE TEMPLATES

### Available in Full Report
1. **Backend Service Template** - CRUD operations with filtering
2. **Backend Controller Template** - Request/response handling
3. **Backend Routes Template** - Route definitions with auth
4. **Frontend Page Template** - Query, mutation, modal patterns
5. **Frontend Service Template** - API client methods
6. **Zustand Store Template** - State management with persistence
7. **Database Table Template** - Schema with indexes and triggers

All templates follow project conventions and include:
- Error handling
- Type safety
- Best practices
- Production-ready code

---

## BEST PRACTICES SUMMARY

### Security
- JWT with short-lived access tokens
- Bcrypt password hashing (10 rounds)
- Rate limiting on auth endpoints
- CORS configuration
- Environment-based secrets
- Parameterized SQL queries
- Input validation with Zod

### Performance
- Database connection pooling (max 20)
- Redis caching
- React Query staleTime optimization (5 min)
- Table partitioning for telemetry
- Strategic indexing
- Asset CDN (Vercel)

### Maintainability
- Full TypeScript strict mode
- Service layer abstraction
- Clear error handling
- Structured logging
- Comprehensive documentation
- Code organization by domain

### Scalability
- Adapter pattern for protocols
- Stateless services
- Socket.io room-based subscriptions
- Multi-protocol device support
- Extensible architecture

---

## DIRECTORY STRUCTURE

```
Aire_Acondicionado/
├── backend/
│   └── src/
│       ├── adapters/         # Protocol adapters
│       ├── config/           # Config management
│       ├── controllers/      # HTTP handlers
│       ├── middleware/       # Express middleware
│       ├── routes/           # Route definitions
│       ├── services/         # Business logic
│       ├── types/            # TypeScript types
│       ├── utils/            # Utilities
│       └── scripts/          # Executable scripts
│
├── frontend/
│   └── src/
│       ├── components/       # UI components
│       ├── pages/            # Page components
│       ├── services/         # API services
│       ├── store/            # State management
│       ├── types/            # TypeScript types
│       ├── hooks/            # Custom hooks
│       ├── utils/            # Utilities
│       └── assets/           # Static files
│
├── docker/                   # Docker configs
├── docs/                     # Documentation
└── Configuration files (docker-compose.yml, etc.)
```

---

## QUICK START FOR NEW PROJECTS

### 1. Copy Backend Structure
- Start with service template
- Follow naming convention
- Implement CRUD in service
- Create controller with try-catch
- Add routes with auth guards
- Write SQL with parameters

### 2. Copy Frontend Structure
- Create page with useQuery and useMutation
- Add service methods
- Use React Query patterns
- Implement error/loading states
- Add toast notifications

### 3. Database Setup
- Create table from template
- Add necessary indexes
- Create triggers for timestamps
- Write seed data

### 4. Configuration
- Copy .env.example
- Set environment variables
- Configure CORS
- Setup database connection

---

## PRODUCTION DEPLOYMENT

### Backend (Railway)
- PostgreSQL 15
- Redis 7
- Environment variables configuration
- Automatic CI/CD from GitHub

### Frontend (Vercel)
- Node.js build
- Environment variables
- Automatic deployments on push
- CDN distribution

---

## TESTING & QUALITY

### Testing Setup
- Jest configuration ready
- Unit test structure
- Integration test patterns
- Test commands in package.json

### Code Quality
- TypeScript strict mode
- ESLint configuration
- Type safety enforcement
- Documentation requirements

---

## FUTURE ENHANCEMENTS

### Planned Features
- Mobile app (React Native)
- Additional protocols (KNX, Z-Wave)
- Custom dashboards
- PDF/Excel reporting
- Machine learning optimization
- Multi-tenancy support
- Offline sync

---

## IMPORTANT NOTES

### Credentials (Default)
- Email: `admin@acplatform.com`
- Password: `admin123`
- **Change in production immediately**

### Environment Variables
- Never commit .env files
- Use .env.example as template
- Change JWT_SECRET in production
- Configure MQTT_BROKER_URL for devices

### Database Schema
- 279 lines of well-organized SQL
- Pre-built schema with 12+ tables
- Monthly partitions for telemetry
- Proper indexes and relationships

---

## CONTACT & SUPPORT

**Project Location:** `/home/rypcloud/Documentos/Aire_Acondicionado/`

**Key Documentation:**
- Full Report: `REFERENCE_CODEBASE_ANALYSIS.md`
- Quick Start: `EMPEZAR_AQUI.md`
- Architecture: `docs/ARQUITECTURA.md`
- API Reference: `docs/API.md`

**Production URLs:**
- Frontend: https://aire-acondicionado-frontend.vercel.app
- Backend API: https://aire-acondicionado-production.up.railway.app

---

*This index provides a quick reference to the comprehensive analysis. See the full report for detailed code examples, architecture diagrams, and implementation patterns.*
