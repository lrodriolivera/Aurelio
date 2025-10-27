# Reference Codebase Documentation

This directory contains comprehensive documentation analyzing the Aire Acondicionado reference codebase. These documents are designed to serve as a template and best practices guide for your own projects.

## Documents Included

### 1. REFERENCE_ANALYSIS_INDEX.md
**Quick reference guide** - Use this for quick lookups
- Fast navigation to key information
- Naming convention tables
- Technology stack overview
- Quick start guides for new projects
- Architecture patterns summary

**Ideal for:** Quick lookups, onboarding, quick reference

### 2. REFERENCE_CODEBASE_ANALYSIS.md
**Comprehensive analysis report** - Deep dive into the codebase
- Complete project structure explanation
- Detailed file naming conventions
- Full directory structure with descriptions
- Code architecture patterns with examples
- Documentation style guide
- Complete technology stack with versions
- Reusable templates for:
  - Backend services (CRUD pattern)
  - Backend controllers
  - Backend routes
  - Frontend pages
  - Frontend services
  - Zustand stores
  - Database tables
- Best practices across security, performance, maintainability, scalability
- Production deployment information

**Ideal for:** Deep learning, template copying, architecture understanding, best practices

---

## How to Use These Documents

### For Quick Reference
Start with `REFERENCE_ANALYSIS_INDEX.md`
- Look up naming conventions
- Find technology versions
- Get quick pattern summaries
- See directory structure overview

### For Implementation
Use `REFERENCE_CODEBASE_ANALYSIS.md`
- Copy templates for your new features
- Follow established patterns
- Understand architectural decisions
- Learn best practices with examples

### For Learning Architecture
Read Section 4 of full report: "Code Architecture & Patterns"
- Backend patterns with code examples
- Frontend patterns with code examples
- Database architecture strategies
- Real-time communication patterns

### For New Projects
Follow these steps:
1. Read REFERENCE_ANALYSIS_INDEX.md - understand conventions
2. Copy templates from REFERENCE_CODEBASE_ANALYSIS.md - Section 7
3. Implement following the patterns
4. Refer back to best practices - Section 8

---

## Key Takeaways

### Naming Conventions
- **Backend Services:** `{domain}.service.ts`
- **Backend Controllers:** `{domain}.controller.ts`
- **Frontend Pages:** `{PageName}.tsx` (PascalCase)
- **Frontend Services:** `{domain}.service.ts`
- **All types/interfaces:** Located in `types/index.ts`

### Architecture Pattern: Service-Controller-Route
```
Route → Controller → Service → Database
```
This is the core pattern used throughout the codebase.

### 3-Tier Architecture
- **Presentation Layer:** React frontend (Vercel)
- **Application Layer:** Express backend (Railway)
- **Data Layer:** PostgreSQL, Redis, MQTT

### Tech Stack Highlights
- **Full TypeScript:** Both backend and frontend
- **Type-Safe State:** Zustand + React Query
- **Production Hosting:** Railway (backend) + Vercel (frontend)
- **Real-Time:** Socket.io for WebSockets
- **IoT:** MQTT with factory-based protocol adapters

### Security Practices
- JWT with short-lived tokens
- Bcrypt password hashing
- Rate limiting on auth endpoints
- Parameterized SQL queries
- Environment-based secrets
- Input validation with Zod

---

## Reference Source

**Original Codebase Location:**
```
/home/rypcloud/Documentos/Aire_Acondicionado/
```

**Production URLs:**
- Frontend: https://aire-acondicionado-frontend.vercel.app
- Backend: https://aire-acondicionado-production.up.railway.app
- Health Check: https://aire-acondicionado-production.up.railway.app/health

**Key Project Files:**
- `/docs/ARQUITECTURA.md` - System architecture diagrams
- `/docs/API.md` - Complete API reference
- `/docs/DEPLOYMENT.md` - Production deployment guide
- `/README.md` - Full project documentation
- `/EMPEZAR_AQUI.md` - Quick start guide
- `/ESTADO_FINAL.md` - Project completion status

---

## Templates Provided

The comprehensive report includes **7 production-ready templates:**

1. **Backend Service Template** - Complete CRUD with filtering
2. **Backend Controller Template** - Request/response handling with error catching
3. **Backend Routes Template** - Routes with auth middleware and role guards
4. **Frontend Page Template** - useQuery, useMutation, modal patterns
5. **Frontend Service Template** - API client methods
6. **Zustand Store Template** - Global state with localStorage persistence
7. **Database Table Template** - Schema with indexes and triggers

Each template includes:
- Error handling
- Type safety
- Best practices
- Production-ready code
- Comments for guidance

---

## Best Practices by Category

### Code Organization
- Domain-based folder structure
- Single responsibility principle
- Clear separation of concerns
- Service layer for business logic

### Type Safety
- Full TypeScript strict mode
- No `any` types without justification
- Interfaces for all data structures
- Enum usage for fixed values

### Error Handling
- Custom `ApiError` class
- Consistent error response format
- Graceful fallbacks
- Detailed error logging

### Performance
- Database indexing strategy
- Redis caching patterns
- React Query staleTime optimization
- Asset CDN distribution

### Security
- JWT token management
- Password hashing with bcrypt
- Rate limiting implementation
- CORS configuration
- Input validation
- SQL injection prevention

### Scalability
- Adapter pattern for protocols
- Stateless services
- WebSocket room subscriptions
- Multi-protocol device support

---

## Quick Commands for Reference

### Backend
```bash
# Start development
cd backend && npm run dev

# Build
npm run build

# Run tests
npm run test

# Initialize database
npm run init-db
```

### Frontend
```bash
# Start development
cd frontend && npm run dev

# Build
npm run build

# Preview build
npm run preview
```

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

---

## File Sizes

- **REFERENCE_ANALYSIS_INDEX.md:** ~10 KB, 340 lines
- **REFERENCE_CODEBASE_ANALYSIS.md:** ~40 KB, 1442 lines
- **Total Documentation:** ~50 KB, 1782 lines

Both documents are thoroughly detailed with tables, code examples, and explanations.

---

## Next Steps

1. Read `REFERENCE_ANALYSIS_INDEX.md` for quick orientation
2. Reference `REFERENCE_CODEBASE_ANALYSIS.md` when implementing
3. Copy templates as needed for your project
4. Follow naming conventions consistently
5. Implement security and error handling from the start
6. Document as you build

---

## Additional Resources

The reference codebase itself is located at:
```
/home/rypcloud/Documentos/Aire_Acondicionado/
```

You can explore:
- Source code organization
- Actual implementation patterns
- Database schema in `/backend/init.sql`
- Configuration examples in `/backend/src/config/`
- Real service implementations in `/backend/src/services/`
- Frontend components in `/frontend/src/pages/`

---

## Support

These documents are comprehensive reference materials. For specific questions:

1. Check the index document first for quick answers
2. Refer to the full analysis for detailed explanations and examples
3. Review the original source code for implementation details
4. Check the project documentation in `/docs/` folder

---

**Last Updated:** October 22, 2024
**Source Project:** Aire_Acondicionado Platform
**Status:** Production-Ready, 100% Complete
