# Comprehensive Reference Codebase Analysis Report
## Aire Acondicionado Platform

**Project Type:** Full-stack IoT Management System
**Status:** Production-Ready
**Date:** October 2024

---

## TABLE OF CONTENTS

1. [Overall Project Structure](#overall-project-structure)
2. [File Naming Conventions](#file-naming-conventions)
3. [Directory Structure & Organization](#directory-structure--organization)
4. [Code Architecture & Patterns](#code-architecture--patterns)
5. [Documentation Style](#documentation-style)
6. [Technologies & Frameworks](#technologies--frameworks)
7. [Reusable Patterns & Templates](#reusable-patterns--templates)
8. [Best Practices Identified](#best-practices-identified)

---

## 1. OVERALL PROJECT STRUCTURE

### High-Level Overview
The Aire Acondicionado platform is a professional-grade, full-stack web application built on modern technologies following a clean 3-tier architecture (Presentation, Application, Data layers).

**Key Characteristics:**
- Monorepo structure with separate backend and frontend
- Production-deployed on Railway (backend) and Vercel (frontend)
- 100% TypeScript implementation for type safety
- Docker containerization for development and deployment
- PostgreSQL + Redis + MQTT as data and communication layers

### Project Scope
- **Frontend**: React 18 SPA with real-time capabilities
- **Backend**: Node.js/Express RESTful API with WebSocket support
- **Devices**: Multi-protocol support (MQTT, HTTP, Modbus, BACnet)
- **Database**: PostgreSQL with advanced features (partitioning, JSONB)
- **Infrastructure**: Docker Compose for local dev, Railway/Vercel for production

---

## 2. FILE NAMING CONVENTIONS

### Backend (Node.js/TypeScript)

#### Service Files
```
Pattern: {domain}.service.ts
Examples:
  - auth.service.ts          (Authentication logic)
  - device.service.ts        (Device operations)
  - device-control.service.ts (Control commands)
  - telemetry.service.ts     (Data collection)
  - alert.service.ts         (Alert management)
  - scheduler.service.ts     (Task scheduling)
  - socket.service.ts        (WebSocket management)
```

#### Controller Files
```
Pattern: {domain}.controller.ts
Examples:
  - auth.controller.ts
  - device.controller.ts
  - device-control.controller.ts
  - telemetry.controller.ts
```

#### Route Files
```
Pattern: {domain}.routes.ts
Examples:
  - auth.routes.ts
  - device.routes.ts
  - device-control.routes.ts
  - command.routes.ts
```

#### Utility Files
```
Pattern: {functionality}.ts (lowercase)
Examples:
  - logger.ts    (Winston logging setup)
  - password.ts  (bcrypt utilities)
  - jwt.ts       (JWT token management)
```

#### Configuration Files
```
Pattern: {service}.ts or index.ts
Examples:
  - index.ts     (Main config aggregation)
  - database.ts  (PostgreSQL connection)
  - redis.ts     (Redis client)
```

#### Adapter Files
```
Pattern: {Protocol}{Adapter}.ts or Adapter{Protocol}.ts
Examples:
  - AdapterFactory.ts
  - BaseAdapter.ts or ACAdapter.ts
  - GenericMQTTAdapter.ts
  - GenericHTTPAdapter.ts
```

#### Middleware Files
```
Pattern: {purpose}.ts
Examples:
  - auth.ts          (JWT authentication)
  - errorHandler.ts  (Global error handling)
  - notFoundHandler.ts (404 handling)
  - validation.ts    (Input validation)
  - rateLimit.ts     (Rate limiting)
```

#### Type Definition Files
```
Pattern: index.ts (in types folder)
Content: All TypeScript interfaces and enums for the module
```

### Frontend (React/TypeScript)

#### Page Components
```
Pattern: {PageName}.tsx (PascalCase)
Examples:
  - Dashboard.tsx
  - Devices.tsx
  - DeviceDetail.tsx
  - Login.tsx
  - Alerts.tsx
  - Settings.tsx
```

#### UI Components
```
Pattern: {ComponentName}.tsx (PascalCase)
Examples:
  - Layout.tsx
  - PrivateRoute.tsx
```

#### Service Files
```
Pattern: {domain}.service.ts (camelCase)
Examples:
  - api.ts           (Base HTTP client)
  - auth.service.ts
  - device.service.ts
  - alert.service.ts
  - socket.service.ts
```

#### Store Files
```
Pattern: {domain}Store.ts
Examples:
  - authStore.ts (Zustand store)
```

#### Type Definition Files
```
Pattern: index.ts (in types folder)
```

---

## 3. DIRECTORY STRUCTURE & ORGANIZATION

### Root Level Organization
```
Aire_Acondicionado/
├── backend/              # Node.js API server
├── frontend/             # React web application
├── docker/               # Docker configurations
├── docs/                 # Project documentation
├── docker-compose.yml    # Development orchestration
├── package.json          # Root-level scripts
├── .env.example          # Environment variable template
└── .gitignore           # Git ignore rules
```

### Backend Directory Structure
```
backend/
├── src/
│   ├── adapters/         # Protocol adapters (MQTT, HTTP, Modbus, BACnet)
│   │   ├── base/         # Abstract base class
│   │   ├── mqtt/         # MQTT implementation
│   │   ├── http/         # HTTP implementation
│   │   └── AdapterFactory.ts
│   │
│   ├── config/           # Configuration management
│   │   ├── index.ts      # Main config
│   │   ├── database.ts   # PostgreSQL setup
│   │   └── redis.ts      # Redis client
│   │
│   ├── controllers/      # Express request handlers
│   │   ├── auth.controller.ts
│   │   ├── device.controller.ts
│   │   ├── device-control.controller.ts
│   │   └── ... (one per domain)
│   │
│   ├── middleware/       # Express middleware
│   │   ├── auth.ts       # JWT verification
│   │   ├── errorHandler.ts
│   │   ├── notFoundHandler.ts
│   │   ├── validation.ts
│   │   └── rateLimit.ts
│   │
│   ├── routes/           # Route definitions
│   │   ├── auth.routes.ts
│   │   ├── device.routes.ts
│   │   └── ... (one per domain)
│   │
│   ├── services/         # Business logic
│   │   ├── auth.service.ts
│   │   ├── device.service.ts
│   │   ├── device-control.service.ts
│   │   ├── telemetry.service.ts
│   │   ├── alert.service.ts
│   │   ├── scheduler.service.ts
│   │   ├── socket.service.ts
│   │   └── ... (domain services)
│   │
│   ├── types/            # TypeScript definitions
│   │   └── index.ts      # All interfaces and enums
│   │
│   ├── utils/            # Utility functions
│   │   ├── logger.ts     # Winston logger
│   │   ├── password.ts   # bcrypt helpers
│   │   └── jwt.ts        # JWT utilities
│   │
│   ├── scripts/          # Executable scripts
│   │   └── init-db.ts
│   │
│   └── index.ts          # Main app entry point
│
├── init.sql              # Database schema
├── seed-data.sql         # Sample data
├── railway-init.sql      # Production DB init
├── package.json
├── tsconfig.json
├── Dockerfile
└── logs/                 # Application logs
```

### Frontend Directory Structure
```
frontend/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Layout.tsx    # Main layout wrapper
│   │   └── PrivateRoute.tsx
│   │
│   ├── pages/            # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Devices.tsx
│   │   ├── DeviceDetail.tsx
│   │   ├── Alerts.tsx
│   │   ├── Schedules.tsx
│   │   ├── Locations.tsx
│   │   ├── Users.tsx
│   │   ├── Models.tsx
│   │   ├── Brands.tsx
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   │
│   ├── services/         # API communication
│   │   ├── api.ts        # Axios instance
│   │   ├── auth.service.ts
│   │   ├── device.service.ts
│   │   ├── alert.service.ts
│   │   ├── telemetry.service.ts
│   │   ├── socket.service.ts
│   │   └── ... (domain services)
│   │
│   ├── store/            # State management
│   │   └── authStore.ts  # Zustand auth store
│   │
│   ├── types/            # TypeScript definitions
│   │   └── index.ts      # All interfaces
│   │
│   ├── hooks/            # Custom React hooks (future)
│   │   └── (useDevices.ts, useAlerts.ts, etc.)
│   │
│   ├── utils/            # Utility functions
│   │   └── (helpers, formatters)
│   │
│   ├── assets/           # Static files
│   │
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # React DOM entry point
│   └── index.css         # Global styles
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── Dockerfile
└── firebase.json
```

### Documentation Structure
```
docs/
├── API.md           # API endpoints documentation
├── ARQUITECTURA.md  # System architecture diagrams
├── DEPLOYMENT.md    # Deployment guides
├── DESARROLLO.md    # Developer guide
└── USUARIO.md       # User manual
```

---

## 4. CODE ARCHITECTURE & PATTERNS

### 4.1 Backend Architecture Patterns

#### A. Service-Controller-Route Pattern

**Flow:**
Route → Controller → Service → Database/External Services

**Example - Auth Flow:**

```typescript
// routes/auth.routes.ts
router.post('/login', authLimiter, authController.login);

// controllers/auth.controller.ts
async login(req: AuthRequest, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.json({ success: true, data: result });
}

// services/auth.service.ts
async login(email: string, password: string) {
  const user = await database.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  const isValid = await comparePassword(password, user.password_hash);
  // Return tokens
}
```

**Benefits:**
- Separation of concerns
- Easy to test
- Reusable services across controllers
- Clear request/response flow

#### B. Singleton Pattern for Infrastructure Services

```typescript
// database.ts
class Database {
  private static instance: Database;
  private constructor() { }
  
  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }
}

export default Database.getInstance();
```

**Used for:**
- PostgreSQL connection pool
- Redis client
- Configuration management

#### C. Factory Pattern for Device Adapters

```typescript
// adapters/AdapterFactory.ts
export class AdapterFactory {
  private static adapters: Map<string, ACAdapterInterface> = new Map();
  
  static async createAdapter(
    deviceId: string,
    protocolType: ProtocolType,
    config: any
  ): Promise<ACAdapterInterface> {
    switch (protocolType) {
      case ProtocolType.MQTT:
        adapter = new GenericMQTTAdapter(deviceId, config);
        break;
      case ProtocolType.HTTP:
        adapter = new GenericHTTPAdapter(deviceId, config);
        break;
    }
    await adapter.connect();
    this.adapters.set(deviceId, adapter);
    return adapter;
  }
}
```

**Purpose:**
- Dynamic protocol selection
- Abstraction over multiple implementations
- Easy to extend with new protocols

#### D. Error Handling Pattern

```typescript
// middleware/errorHandler.ts
export class ApiError extends Error implements AppError {
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
  
  static badRequest(message: string) {
    return new ApiError(400, message);
  }
  
  static unauthorized(message = 'Unauthorized') {
    return new ApiError(401, message);
  }
}

// In services
throw ApiError.badRequest('Invalid email');
throw ApiError.unauthorized('Token expired');
```

#### E. Middleware Stack Pattern

```typescript
// index.ts - Express setup
this.app.use(helmet());
this.app.use(cors());
this.app.use(express.json());
this.app.use(morgan('dev'));
// Custom middlewares
this.app.use(authMiddleware);
this.app.use(validationMiddleware);
this.app.use(errorHandler);
```

**Order Matters:**
1. Security headers (helmet)
2. CORS
3. Body parsing
4. Logging
5. Authentication
6. Validation
7. Routes
8. Error handlers

#### F. Type-Safe Configuration Management

```typescript
// config/index.ts
interface Config {
  env: string;
  port: number;
  database: { url: string };
  redis: { url: string };
  mqtt: { brokerUrl: string };
  jwt: { secret: string; expiresIn: string };
  cors: { origin: string };
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  // ...
};
```

### 4.2 Frontend Architecture Patterns

#### A. Page + Layout + Component Hierarchy

```
App.tsx
  ├── <BrowserRouter>
  ├── <QueryClientProvider>
  └── <Routes>
      └── <Route path="/login" element={<Login />} />
      └── <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          ├── <Route path="dashboard" element={<Dashboard />} />
          ├── <Route path="devices" element={<Devices />} />
          └── <Route path="devices/:id" element={<DeviceDetail />} />
```

#### B. Custom Hooks for Data Management

Pattern (Future Implementation):
```typescript
// hooks/useDevices.ts
export const useDevices = () => {
  return useQuery({
    queryKey: ['devices'],
    queryFn: () => deviceService.getAll()
  });
};

// Usage in component
const { data: devices, isLoading } = useDevices();
```

#### C. Service Layer Pattern

```typescript
// services/auth.service.ts
export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data.data;
  },
  
  async logout() {
    await api.post('/auth/logout');
  }
};

// Usage
const result = await authService.login({ email, password });
```

#### D. Zustand State Management

```typescript
// store/authStore.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      setAuth: (user, tokens) => set({ user, tokens, isAuthenticated: true }),
      logout: () => set({ user: null, tokens: null, isAuthenticated: false })
    }),
    { name: 'auth-storage' }
  )
);

// Usage
const { user, logout } = useAuthStore();
```

#### E. Protected Route Pattern

```typescript
// components/PrivateRoute.tsx
export default function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

// Usage in App.tsx
<Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
```

#### F. React Query Integration

```typescript
// In page component
const { data: devices, isLoading } = useQuery({
  queryKey: ['devices'],
  queryFn: () => deviceService.getAll()
});

// For mutations
const createMutation = useMutation({
  mutationFn: (data) => deviceService.create(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['devices'] });
    toast.success('Created successfully');
  }
});
```

#### G. Axios Interceptor Pattern

```typescript
// services/api.ts
class ApiService {
  constructor() {
    this.api = axios.create({ baseURL: `${API_URL}/api` });
    
    // Request interceptor for auth
    this.api.interceptors.request.use((config) => {
      const { tokens } = useAuthStore.getState();
      if (tokens?.accessToken) {
        config.headers.Authorization = `Bearer ${tokens.accessToken}`;
      }
      return config;
    });
    
    // Response interceptor for 401
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
}
```

### 4.3 Database Architecture Pattern

#### Entity-Relationship Model

```
brands
  ├── models (1-to-many)
      ├── devices (1-to-many)
          ├── device_status (1-to-1)
          ├── device_telemetry (1-to-many, partitioned)
          ├── device_commands (1-to-many)
          └── alerts (1-to-many)

locations (hierarchical)
  └── devices (1-to-many)

users
  ├── refresh_tokens (1-to-many)
  ├── device_commands (1-to-many, foreign key)
  └── alerts (1-to-many, acknowledgement)

schedules
└── devices (many-to-many)

audit_logs
└── users (foreign key)
```

#### Optimization Strategies

**Partitioning:**
```sql
device_telemetry PARTITION BY RANGE (timestamp)
  ├── device_telemetry_2025_01 (Jan)
  ├── device_telemetry_2025_02 (Feb)
  └── ... (monthly partitions)
```

**Indexing:**
```sql
CREATE INDEX idx_devices_model ON devices(model_id);
CREATE INDEX idx_device_status_device ON device_status(device_id);
CREATE INDEX idx_telemetry_device_time ON device_telemetry(device_id, timestamp DESC);
```

**JSONB for Flexibility:**
```sql
-- Models store flexible configs
connection_config JSONB,
capabilities JSONB,

-- Devices can have custom settings
config JSONB
```

### 4.4 Real-Time Communication Pattern

#### Socket.io Architecture

```typescript
// Backend setup
this.io.on('connection', (socket) => {
  // Device subscriptions
  socket.on('subscribe:device', (deviceId) => {
    socket.join(`device:${deviceId}`);
  });
  
  socket.on('unsubscribe:device', (deviceId) => {
    socket.leave(`device:${deviceId}`);
  });
});

// Broadcasting state updates
(global as any).io.to(`device:${deviceId}`).emit('device:status-updated', newStatus);

// Frontend
socket.on('device:status-updated', (data) => {
  // Update UI with new state
});
```

---

## 5. DOCUMENTATION STYLE

### 5.1 README Structure

**Main README.md covers:**
1. Project overview with branding
2. Access credentials (production URLs)
3. Key features (organized by category)
4. Stack technologies (organized by layer)
5. System architecture diagram (ASCII art)
6. Installation steps (prerequisites, local setup, Docker)
7. Usage guide (first login, main features, workflow)
8. API documentation with examples
9. Deployment instructions
10. Security measures
11. Testing commands
12. Troubleshooting guide
13. Performance optimizations
14. Roadmap for future versions
15. Contribution guidelines

### 5.2 Inline Code Documentation

**Pattern:**
- File headers with purpose
- Complex logic explained inline
- TypeScript types document intent
- Function purposes clear from naming

**Example:**
```typescript
// src/config/database.ts
/**
 * Database connection pool manager
 * Implements singleton pattern for global access
 * Supports transaction management
 */
class Database {
  private pool: Pool;
  private static instance: Database;
  
  // Connection lifecycle management with retries
  private constructor() {
    this.pool = new Pool({
      max: 20,
      idleTimeoutMillis: 30000,
      // ...
    });
  }
}
```

### 5.3 Environment Documentation

**.env.example:**
```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/ac_platform

# Redis Configuration
REDIS_URL=redis://localhost:6379

# JWT Secrets (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# MQTT Broker
MQTT_BROKER_URL=mqtt://localhost:1883

# Frontend Configuration
VITE_API_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3000
```

### 5.4 API Documentation Style

**Format:**
```http
POST /api/endpoint
Authorization: Bearer <token>
Content-Type: application/json

Request Body:
{
  "field": "value"
}

Response:
{
  "success": true,
  "data": { ... }
}
```

### 5.5 Documentation Files

1. **EMPEZAR_AQUI.md** - Quick start in 5 minutes
2. **ESTADO_FINAL.md** - Project completion status
3. **PROYECTO_RESUMEN.md** - Technical summary
4. **docs/ARQUITECTURA.md** - Detailed architecture
5. **docs/DEPLOYMENT.md** - Production deployment
6. **docs/DESARROLLO.md** - Developer guide
7. **docs/API.md** - API reference
8. **docs/USUARIO.md** - User manual

---

## 6. TECHNOLOGIES & FRAMEWORKS

### Backend Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express.js | 4.18.2 | HTTP server framework |
| **Language** | TypeScript | 5.3.3 | Type-safe JavaScript |
| **Database** | PostgreSQL | 15-alpine | Relational data storage |
| **ORM/Query** | pg (raw SQL) | 8.11.3 | Database queries |
| **Cache** | Redis | 7-alpine | Session & data cache |
| **Protocol** | MQTT | 5.3.5 | IoT device communication |
| **WebSocket** | Socket.io | 4.6.1 | Real-time bidirectional |
| **Auth** | jsonwebtoken | 9.0.2 | JWT token management |
| **Password** | bcrypt | 5.1.1 | Password hashing |
| **Config** | dotenv | 16.3.1 | Environment variables |
| **Logging** | winston | 3.11.0 | Structured logging |
| **Validation** | zod | 3.22.4 | Schema validation |
| **Rate Limit** | express-rate-limit | 7.1.5 | API protection |
| **Security** | helmet | 7.1.0 | Security headers |
| **Task Queue** | bull | 4.12.0 | Job queue (optional) |
| **Scheduling** | node-cron | 3.0.3 | Cron tasks |
| **Correlation ID** | uuid | 9.0.1 | Unique identifiers |
| **HTTP Client** | axios | 1.12.2 | HTTP requests |

### Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | React | 18.2.0 | UI library |
| **Language** | TypeScript | 5.3.3 | Type-safe JavaScript |
| **Build Tool** | Vite | 5.0.10 | Fast dev server |
| **Styling** | TailwindCSS | 3.4.0 | Utility-first CSS |
| **Routing** | React Router | 6.21.1 | Client-side navigation |
| **State Mgmt** | Zustand | 4.4.7 | Global state management |
| **Server State** | TanStack Query | 5.17.9 | Server state management |
| **HTTP Client** | axios | 1.6.5 | HTTP requests |
| **WebSocket** | Socket.io Client | 4.6.1 | Real-time connection |
| **Notifications** | React Hot Toast | 2.4.1 | Toast notifications |
| **Icons** | Lucide React | 0.303.0 | Icon components |
| **Charts** | Recharts | 2.10.3 | Data visualization |
| **Dates** | date-fns | 3.0.6 | Date manipulation |
| **Class Utils** | clsx | 2.1.0 | Conditional CSS classes |

### Infrastructure

| Service | Technology | Purpose |
|---------|-----------|---------|
| **Backend Hosting** | Railway | API deployment & databases |
| **Frontend Hosting** | Vercel | Static site hosting & CDN |
| **Containerization** | Docker | Local development & deployment |
| **Orchestration** | Docker Compose | Multi-container local dev |
| **CI/CD** | GitHub Actions (implicit) | Automated deployments |
| **Message Broker** | Mosquitto | MQTT broker for IoT |

---

## 7. REUSABLE PATTERNS & TEMPLATES

### 7.1 Backend Service Template

**Template for creating new domain services:**

```typescript
// services/new-domain.service.ts
import database from '../config/database';
import { ApiError } from '../middleware/errorHandler';

export class NewDomainService {
  async getAll(filters?: Record<string, any>): Promise<any[]> {
    let query = 'SELECT * FROM table_name';
    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    // Filter building
    if (filters?.property) {
      conditions.push(`property = $${paramCount++}`);
      params.push(filters.property);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';
    const result = await database.query(query, params);
    return result.rows;
  }

  async getById(id: string): Promise<any> {
    const result = await database.query(
      'SELECT * FROM table_name WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Resource not found');
    }

    return result.rows[0];
  }

  async create(data: any): Promise<any> {
    try {
      const result = await database.query(
        'INSERT INTO table_name (field1, field2) VALUES ($1, $2) RETURNING *',
        [data.field1, data.field2]
      );
      return result.rows[0];
    } catch (error: any) {
      if (error.code === '23505') { // Unique violation
        throw ApiError.badRequest('Duplicate entry');
      }
      throw error;
    }
  }

  async update(id: string, data: any): Promise<any> {
    const result = await database.query(
      'UPDATE table_name SET field1 = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [data.field1, id]
    );

    if (result.rows.length === 0) {
      throw ApiError.notFound('Resource not found');
    }

    return result.rows[0];
  }

  async delete(id: string): Promise<void> {
    const result = await database.query(
      'DELETE FROM table_name WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      throw ApiError.notFound('Resource not found');
    }
  }
}

export default new NewDomainService();
```

### 7.2 Backend Controller Template

```typescript
// controllers/new-domain.controller.ts
import { Response, NextFunction } from 'express';
import newDomainService from '../services/new-domain.service';
import { AuthRequest } from '../middleware/auth';

export class NewDomainController {
  async getAll(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const filters = {
        property: req.query.property as string,
      };
      const results = await newDomainService.getAll(filters);
      res.json({ success: true, data: results });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await newDomainService.getById(req.params.id);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await newDomainService.create(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await newDomainService.update(req.params.id, req.body);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await newDomainService.delete(req.params.id);
      res.json({ success: true, message: 'Deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default new NewDomainController();
```

### 7.3 Backend Routes Template

```typescript
// routes/new-domain.routes.ts
import { Router } from 'express';
import newDomainController from '../controllers/new-domain.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Public authenticated routes
router.get('/', newDomainController.getAll);
router.get('/:id', newDomainController.getById);

// Admin-only routes
router.post('/', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), newDomainController.create);
router.put('/:id', authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN), newDomainController.update);
router.delete('/:id', authorize(UserRole.SUPER_ADMIN), newDomainController.delete);

export default router;
```

### 7.4 Frontend Page Template

```typescript
// pages/NewPage.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNewDomainService } from '../services/new-domain.service';
import toast from 'react-hot-toast';

export default function NewPage() {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ field1: '', field2: '' });
  const queryClient = useQueryClient();

  // Data fetching
  const { data: items, isLoading } = useQuery({
    queryKey: ['items'],
    queryFn: () => newDomainService.getAll()
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => newDomainService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Created successfully');
      setShowModal(false);
      setFormData({ field1: '', field2: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error creating');
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => newDomainService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Deleted successfully');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Items</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Item
        </button>
      </div>

      {/* Items Grid/List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((item: any) => (
          <div key={item.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold">{item.name}</h3>
            <p className="text-gray-600">{item.description}</p>
            <button
              onClick={() => deleteMutation.mutate(item.id)}
              className="mt-4 text-red-600 hover:text-red-800"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Field 1"
                value={formData.field1}
                onChange={(e) => setFormData({ ...formData, field1: e.target.value })}
                className="w-full border px-4 py-2 rounded-lg"
              />
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </form>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-gray-600 hover:text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 7.5 Frontend Service Template

```typescript
// services/new-domain.service.ts
import api from './api';
import { NewDomainItem } from '../types';

export const newDomainService = {
  async getAll(filters?: any): Promise<NewDomainItem[]> {
    const response = await api.get('/new-domain', { params: filters });
    return response.data.data;
  },

  async getById(id: string): Promise<NewDomainItem> {
    const response = await api.get(`/new-domain/${id}`);
    return response.data.data;
  },

  async create(data: any): Promise<NewDomainItem> {
    const response = await api.post('/new-domain', data);
    return response.data.data;
  },

  async update(id: string, data: any): Promise<NewDomainItem> {
    const response = await api.put(`/new-domain/${id}`, data);
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/new-domain/${id}`);
  }
};
```

### 7.6 Zustand Store Template

```typescript
// store/newStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface NewState {
  data: any | null;
  isLoading: boolean;
  setData: (data: any) => void;
  setLoading: (loading: boolean) => void;
  reset: () => void;
}

export const useNewStore = create<NewState>()(
  persist(
    (set) => ({
      data: null,
      isLoading: false,
      setData: (data) => set({ data }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ data: null, isLoading: false })
    }),
    {
      name: 'new-storage'
    }
  )
);
```

### 7.7 Database Table Template

```sql
CREATE TABLE IF NOT EXISTS new_domain (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_new_domain_status ON new_domain(status);
CREATE INDEX idx_new_domain_created_by ON new_domain(created_by);

-- Triggers for updated_at
CREATE TRIGGER update_new_domain_timestamp
BEFORE UPDATE ON new_domain
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();
```

---

## 8. BEST PRACTICES IDENTIFIED

### 8.1 Security Best Practices

1. **JWT Token Strategy**
   - Short-lived access tokens (7 days)
   - Refresh tokens stored in database
   - Token verification on every protected endpoint

2. **Password Management**
   - bcrypt with 10 rounds
   - Never store plain text passwords
   - Hash verification before token generation

3. **Rate Limiting**
   - Different limiters for different endpoints
   - Auth endpoints: strict limits (5 requests/15 minutes)
   - API endpoints: moderate limits

4. **CORS Configuration**
   - Specific origins only
   - Credentials support where needed
   - Method restrictions

5. **Environment Variables**
   - All secrets in .env (never in code)
   - Different configs for dev/prod
   - Default values for optional features

6. **SQL Injection Prevention**
   - Parameterized queries exclusively
   - Never string concatenation for user input

7. **Input Validation**
   - Zod schemas for request validation
   - Type checking at compile time
   - Runtime validation at request handlers

### 8.2 Performance Best Practices

1. **Database Optimization**
   - Strategic indexing on frequently queried columns
   - Partitioning for large tables (telemetry)
   - Connection pooling with max 20 connections

2. **Caching Strategy**
   - Redis for session storage
   - Redis for rate limiting
   - React Query stale time optimization (5 minutes)

3. **Frontend Optimization**
   - Lazy loading of routes
   - Code splitting via Vite
   - Asset CDN via Vercel
   - Recharts for data visualization

4. **API Response Format**
   - Consistent JSON structure
   - Data wrapping in `{ success, data/error }`
   - Pagination for list endpoints

### 8.3 Maintainability Best Practices

1. **Type Safety**
   - Full TypeScript strict mode
   - No `any` types without justification
   - Interfaces for all data structures

2. **Code Organization**
   - Single responsibility principle
   - Clear folder structure
   - Service layer for business logic

3. **Error Handling**
   - Custom ApiError class
   - Consistent error responses
   - Graceful fallbacks for missing data

4. **Logging**
   - Winston for structured logging
   - Different log levels (debug, info, error)
   - File and console output
   - Contextual information in logs

5. **Documentation**
   - README with architecture diagrams
   - Inline code comments for complex logic
   - API documentation with examples
   - .env.example for configuration

### 8.4 Scalability Best Practices

1. **Adapter Pattern**
   - New protocols don't require core changes
   - Factory pattern for dynamic adapter creation
   - Protocol abstraction layer

2. **Service Orientation**
   - Stateless services (can be replicated)
   - Database as single source of truth
   - Redis for distributed caching

3. **Multi-Protocol Support**
   - MQTT for IoT devices
   - HTTP for web services
   - Modbus ready (boilerplate)
   - BACnet ready (boilerplate)

4. **WebSocket Architecture**
   - Socket.io for fallback support
   - Room-based subscriptions (device:id)
   - Broadcasting to multiple clients

### 8.5 Development Experience

1. **Docker Development**
   - Docker Compose for local environment
   - Hot reload with nodemon (backend)
   - Vite dev server (frontend)

2. **TypeScript Configuration**
   - Strict mode enabled
   - Source maps for debugging
   - ES2020 target

3. **Environment Setup**
   - Clear prerequisites in docs
   - Quick start guide (5 minutes)
   - Detailed setup for different OS

4. **Testing Ready**
   - Jest configuration in place
   - Test script in package.json
   - Service isolation for unit tests

---

## SUMMARY & KEY TAKEAWAYS

### Strengths of This Codebase:

1. **Enterprise-Grade Architecture**: Clean 3-tier architecture suitable for scaling
2. **Type Safety**: Full TypeScript implementation prevents runtime errors
3. **Production-Ready**: Deployed to production with monitoring
4. **Well-Documented**: Multiple documentation files at different levels
5. **IoT-Focused Design**: Protocol abstraction for multi-brand device support
6. **Real-Time Capable**: WebSocket integration for live updates
7. **Security-First**: JWT, bcrypt, rate limiting, CORS all implemented
8. **Maintainable Code**: Clear patterns, single responsibility, DRY principles
9. **Modern Stack**: Latest stable versions of popular frameworks
10. **Scalable Patterns**: Adapters, services, singletons for extensibility

### Ready-to-Use Templates:

- Service layer with CRUD operations
- Controller with request/response handling
- Route definitions with auth guards
- Database table schemas with indexes
- React page components with data fetching
- Zustand store for state management
- Frontend service patterns
- Error handling patterns
- Middleware composition

### Replication Guidelines:

When creating similar projects:
1. Follow the naming conventions consistently
2. Implement the 3-tier architecture pattern
3. Use the service-controller-route flow
4. Apply TypeScript strict mode
5. Implement error handling early
6. Set up logging from the start
7. Use environment variables for config
8. Plan database schema with indexing
9. Implement WebSocket early if needed
10. Document as you build

---

**End of Report**

Generated: October 22, 2024
Project: Aire Acondicionado Platform
Status: 100% Complete and Production-Ready
