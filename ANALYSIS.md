# Project Analysis: DMR (Digital Menu Restaurant)

Comprehensive codebase analysis covering architecture, security, testing, and technical debt.

**Analysis Date**: April 2026  
**Codebase**: Monorepo (NestJS API + Vite React)

---

## Executive Summary

DMR is a **well-architected monorepo** with clean module organization and multi-tenant support. However, there are **3 critical security issues** in CORS configuration and JWT handling, plus significant gaps in testing and type safety. Overall: **7/10 production readiness**.

| Dimension | Score | Status |
|-----------|-------|--------|
| Architecture | 8/10 | Clean modular design, good separation |
| Error Handling | 6/10 | Consistent exceptions but no global handlers |
| Type Safety | 7/10 | Strict in core, loose in API client |
| **Security** | **5/10** | **🚨 CRITICAL ISSUES FOUND** |
| Testing | 3/10 | Minimal coverage (~5%), mostly smoke tests |
| Dependencies | 9/10 | All current, no outdated packages |
| Code Quality | 7/10 | Well-organized, some duplication |
| Database | 8/10 | Good schema, missing search indexes |
| Performance | 7/10 | Good caching, pagination implemented |
| Documentation | 5/10 | Basic README, lacks architecture docs |

---

## 1. Architecture Analysis

### Strengths ✅

**Backend (NestJS)**:
- 16+ feature modules with clear separation of concerns
- Each domain (auth, users, restaurants, menus, etc.) is self-contained
- Proper dependency injection throughout
- Multi-tenancy via `RestaurantScopeModule` - elegant restaurant isolation per request

**Frontend (Vite + React)**:
- Features-based organization: `shared/` (reusable), `features/` (domain-specific)
- Context-based state management (Auth, Restaurant, Cart, Locale)
- Clear route structure at `/` (public) and `/admin/*` (protected)

### Weaknesses ⚠️

1. **Monolithic API Client** (`apps/web/src/features/admin/lib/api.ts` — 640 lines):
   - Should be split into domain modules (menu-items.api.ts, categories.api.ts, etc.)
   - Duplicated error handling patterns
   - Hard to test or reuse

2. **No Cross-Cutting Concerns Separation**:
   - No global error handler middleware in API
   - No error boundaries in React
   - Logging scattered across files

3. **Inconsistent Response Handling**:
   - Web app uses `as unknown` casts instead of strict typing
   - No validation of API response shapes

**Recommendation**: Split api.ts by domain (menuItems, categories, menuTypes, auth, etc.)

---

## 2. Security Analysis — 🚨 CRITICAL ISSUES

### Critical: CORS Misconfiguration

**Location**: `apps/api/src/main.ts:48-57`

```typescript
app.enableCors({
  origin: (origin, cb) => {
    if (!origin) cb(null, true);                    // Allows requests without origin
    if (defaultOrigins.includes(origin)) cb(null, true);
    cb(null, true);  // ⚠️ ALLOWS ANY ORIGIN!
  },
  credentials: true,  // Allows cookies/auth with any origin
});
```

**Risk**: ANY website can make authenticated requests to your API. An attacker can:
- Steal JWT tokens from users
- Make admin API calls on behalf of logged-in users
- Access/modify menu data from third-party sites

**Fix**: Reject unlisted origins
```typescript
app.enableCors({
  origin: (origin, cb) => {
    const allowed = [
      process.env.FRONTEND_URL || 'http://localhost:5173',
      process.env.ADMIN_URL || 'http://localhost:5174',
    ];
    if (!origin || allowed.includes(origin)) {
      cb(null, true);
    } else {
      cb(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
});
```

---

### Critical: JWT Secret Fallback

**Location**: `apps/api/src/auth/jwt.strategy.ts` and `apps/api/src/auth/auth.module.ts`

```typescript
secretOrKey: config.get<string>('JWT_SECRET') || 'default-secret-change-me'
```

**Risk**: If `JWT_SECRET` env variable is missing:
- Falls back to hardcoded `'default-secret-change-me'`
- Any attacker knowing the default can forge valid JWT tokens
- Startup logs hint about missing GEMINI_API_KEY but NOT JWT_SECRET

**Fix**: Require JWT_SECRET and throw error if missing
```typescript
const jwtSecret = config.get<string>('JWT_SECRET');
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET env var required (min 32 chars)');
}
secretOrKey: jwtSecret
```

---

### Critical: Weak Admin Password Policy

**Location**: `apps/api/src/auth/login.dto.ts`

```typescript
@MinLength(6)
password: string;
```

**Risk**: Admin password can be only 6 characters, enabling brute-force attacks

**Fix**: Require minimum 12 characters, optional: add complexity rules (uppercase, numbers, symbols)

---

### High: No Env Var Validation on Startup

**Issue**: No validation that critical env vars are set (DATABASE_URL, JWT_SECRET, etc.)
- App may fail cryptically at runtime instead of on startup

**Fix**: Add startup validation in AppModule or main.ts:
```typescript
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
const missing = requiredEnvVars.filter(v => !process.env[v]);
if (missing.length > 0) {
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}
```

---

### Medium: File Upload Security

**Location**: `apps/api/src/menu-items/menu-items.controller.ts`

```typescript
// File upload
diskStorage({
  destination: UPLOADS_DIR,
  filename: (req, file, cb) => {
    // Relies on multer default: timestamp + randomization
  }
}),
fileFilter: (req, file, cb) => {
  const allowed = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
  cb(null, allowed.includes(file.mimetype));
}
```

**Status**: ✅ MIME type and size limits are good  
**Minor issues**:
- No explicit filename sanitization (relies on multer)
- Filenames predictable if timestamp is known
- Consider: add random UUID to filename for extra security

---

### Medium: SQL Injection Prevention

**Status**: ✅ **SAFE** - Prisma parameterized queries prevent injection
```typescript
// Correctly uses template literals with Prisma.sql
Prisma.sql\`m."restaurantId" = ${restaurantId}\`
```

---

### Medium: Session/Token Management

**Issues**:
- JWT expiration: 7 days - reasonable but not validated on startup
- No token revocation mechanism (logout invalidates token only client-side)
- No refresh token rotation

**Recommendation**: For sensitive operations, add short-lived tokens + refresh rotation

---

### Medium: Multi-Tenancy Isolation

**Pattern**: Uses restaurant ID from JWT claims + RestaurantAccessGuard

**Potential bypass**: If JWT claim can be modified → access other restaurants

**Current safeguard**: ✅ JwtAuthGuard validates signature. But:
- ⚠️ ReliesX-Forwarded-Host header for public restaurant lookup (can be spoofed in non-proxied setups)
- ✅ Internal endpoints validate restaurantId from claims, not headers

**Recommendation**: Use IP/domain-based restaurant detection only in public endpoints, verify in protected endpoints

---

## 3. Type Safety Analysis

### Current State: 7/10

**Strict Areas** ✅:
- API service layer: Strong DTO typing with class-validator
- Prisma relations: Auto-generated types are strict
- Component props: React components properly typed

**Loose Areas** ⚠️:

1. **Web API Client** (`apps/web/src/features/admin/lib/api.ts`):
   ```typescript
   const res = await fetch(`${API}/menu-items`);
   return (await res.json()) as Promise<MenuItemResponse[]>;  // ⚠️ Unchecked cast
   ```
   - Uses `as unknown` and `as Promise<Type>` without validation
   - No runtime schema validation

2. **Booking Service**:
   ```typescript
   itemsJson: Prisma.InputJsonValue | undefined
   // No validation that JSON is valid cart structure
   ```

3. **Optional But Unvalidated**:
   - Request DTOs mark fields optional but don't validate presence when needed
   - Search input doesn't validate string length before querying

### Recommendation: 
- Use `zod` or `io-ts` for runtime validation of API responses
- Add stricter types to api.ts functions
- Validate JSON payloads on storage

---

## 4. Testing Analysis

### Current Coverage: ~3-5%

**Tests Present**:
- `apps/api/src/auth/auth.service.spec.ts` — 102 lines (unit tests for AuthService)
- `apps/web/src/App.test.tsx` — 30 lines (smoke test: renders without crash)

**API Tests** ✅:
```typescript
// Covers:
- Valid login + JWT generation
- Invalid credentials → UnauthorizedException
- validateUser with valid/invalid payloads
- Uses mocks for Prisma and JwtService
```

**Web Tests** ❌:
```typescript
// Only smoke test: App renders
// Missing: Component logic, hooks, context, API integration
```

### Missing Tests ❌:

1. **Controllers** (untested):
   - Menu endpoints not tested
   - Category CRUD not tested
   - Auth endpoints not tested (only service)

2. **Integration Tests**:
   - No E2E tests with real database
   - No API contract tests

3. **Web Components**:
   - No tests for LoginPage, MenuPage, AdminDashboard
   - No context tests (AuthContext, CartContext)
   - No hook tests (useAuth, useCart)

4. **Database**:
   - No migration tests
   - No seed.ts validation

### Test Configuration:
- **API**: Jest configured, coverage reporting available
- **Web**: Vitest configured but minimal tests
- **CI/CD**: No test step in deployment (Docker doesn't run tests)

### Recommendation:
1. Add controller tests: `npm run test` should cover 80%+ of API
2. Add E2E tests with test database
3. Add component tests for critical web paths (login, admin CRUD)
4. Add test step to Docker build process (fail if tests fail)

---

## 5. Dependency Analysis

### Status: 9/10 ✅

**All Major Packages Current**:
- NestJS: 11.0.0 (latest)
- Prisma: 6.0.0 (latest)
- React: 19.0.0 (latest)
- TypeScript: 5.9.0 (latest)
- Vite: 6.0.0 (latest)
- Vitest: 2.1.0 (latest)
- bcrypt: 5.1.1 (latest)
- JWT: 11.0.0 (latest)

**Security-Critical Packages** ✅:
- bcrypt: ^5.1.1 (actively maintained)
- passport: ^0.7.0 (latest)
- passport-jwt: ^4.0.1 (latest)

**Potential Improvements**:
- No `npm audit` script configured
- No Dependabot/Renovate for auto-updates
- No SCA (Software Composition Analysis) tool integrated

**Recommendation**: Add to package.json scripts:
```json
"scripts": {
  "audit": "npm audit --audit-level=moderate",
  "deps:check": "npm outdated"
}
```

---

## 6. Code Quality Analysis

### Linting & Formatting

**ESLint Config** (`eslint.config.mjs`):
- ✅ TypeScript plugin enabled
- ✅ React hooks rules enabled
- ❌ Return types optional (`explicit-function-return-type: off`)
- ❌ No formatter (prettier) configured

**Code Smells Found**:

### 1. Monolithic API Client (640 lines)
```
apps/web/src/features/admin/lib/api.ts
```

Should split into:
- `api/auth.ts` — login, logout
- `api/menus.ts` — CRUD menus
- `api/menuItems.ts` — CRUD items
- `api/categories.ts` — CRUD categories
- `api/translations.ts` — translate endpoint
- `api/bookings.ts` — booking queries

### 2. Magic Numbers

**Without meaning**:
```typescript
// apps/api/src/bookings/bookings.service.ts
take: 500  // Why 500? Hardcoded limit

// apps/api/src/public-menu/public-menu.service.ts
60 * 1000  // Cache TTL - should be named constant

// apps/api/src/menu-items/menu-items.controller.ts
2 * 1024 * 1024  // 2MB - unclear intent
```

**Fix**: Use named constants
```typescript
const MAX_BOOKING_RESULTS = 500;
const CACHE_TTL_MS = 60 * 1000;
const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
```

### 3. Duplicate Code Patterns

**Image Upload** — repeated in MenuItemsController and CategoriesController:
```typescript
// Should extract to reusable service or decorator
uploadImageHelper(file: Express.Multer.File) {
  // Same logic in 2+ places
}
```

**Translation Update** — MenuType, Category, MenuItem all follow same pattern:
```typescript
// Could extract to base service
updateTranslations(entity, locale, text) { }
```

### 4. Type Casting Anti-patterns

```typescript
// Loose:
const res = await fetch(url);
return (await res.json()) as Promise<Type>;  // Unsafe

// Better:
const res = await fetch(url);
if (!res.ok) throw new Error(...);
const data: unknown = await res.json();
return validateType(data) as Type;  // Runtime validation
```

### 5. Inconsistent Error Messages

Mixed Russian/English:
```typescript
// Russian: "Неверные учетные данные"
// English: "Invalid credentials"
// Should standardize per language
```

---

## 7. Database Analysis

### Schema Design: 8/10 ✅

**Strengths**:
- Well-normalized structure
- Proper foreign key relationships
- Soft deletes via `isActive` boolean (prevents accidental data loss)
- Polymorphic translation pattern (MenuTypeTranslation, CategoryTranslation, MenuItemTranslation)
- Multi-tenancy: All entities properly scoped to restaurant

**Entity Relationship** (simplified):
```
User --[1..n]--> UserRestaurant --[n..1]--> Restaurant
    (role: OWNER/EDITOR)

Restaurant --[1]-- SiteSettings (branding, contact)
Restaurant --[1..n]-- Menu
    Menu --[1..n]-- MenuType (code: main, bar, wine, etc.)
        MenuType --[1..n]-- Category
            Category --[1..n]-- MenuItem
                MenuItem --[0..n]-- MenuItemTranslation (per locale)
                Category --[0..n]-- CategoryTranslation
            MenuType --[0..n]-- MenuTypeTranslation

Restaurant --[1..n]-- Booking
```

### Indexes: 7/10

**Present** ✅:
```prisma
Language { code @unique }
User { email @unique }
Restaurant { slug @unique }
UserRestaurant { [userId, restaurantId] @unique }
RestaurantDomain { host @unique }
Booking { [restaurantId, orderNumber] @unique }
Booking { index [restaurantId, createdAt] }
```

**Missing** ⚠️:
```prisma
// Search on MenuItemTranslation.description is not indexed
// Query: WHERE POSITION(LOWER(name) IN search)
// Should add: index on [menuTypeId, restaurantId, locale]
```

### Constraints: 6/10

**Missing**:
- No max length constraints on TEXT fields (description, contactInfo)
- No default values for timestamps (should use @default(now()))
- Booking.itemsJson (JSON) has no schema validation

### Migrations: ✅

```
20250228 - Initial schema
20250301 - Add SiteSettings, restaurant contact fields
20250305 - Add Booking model
```

All migrations tracked in `apps/api/prisma/migrations/`

---

## 8. Performance Analysis

### Caching: 7/10

**In-Memory Cache** (PublicMenuService):
- ✅ 60-second TTL for menu queries
- ✅ Invalidation on content changes (category update, item delete, translation)
- Cache keys: `mt:{restaurantId}:{locale}`

**Issue**: Broad invalidation
```typescript
// When ANY translation updates, invalidates ALL caches
// Could optimize: invalidate only affected locale/menu
```

### Query Optimization: 7/10

**Good Patterns** ✅:
- Pagination in MenuItemsService (default 10, max 100 per page)
- Proper `include` relations (no N+1 queries)
- Server-side sorting via SQL

**Issues** ⚠️:
1. **Search without index**:
   ```typescript
   // POSITION(LOWER(...)) on non-indexed column
   WHERE POSITION(LOWER(name) IN ${search})
   ```
   Could use database full-text search instead

2. **Admin bookings endpoint**:
   ```typescript
   // Fetches all 500 records every time
   take: 500
   // Should paginate
   ```

3. **Missing lazy loading**:
   - Restaurant lookup could cache between requests

### Estimated Performance Impact:
- **Small scale** (1-10 restaurants): No issues
- **Medium scale** (100+ restaurants, 10k+ items): Search queries may slow down
- **Large scale** (1000+ restaurants): Need full-text search, Redis cache

**Recommendation**:
1. Add index on MenuItemTranslation(restaurantId, locale, name)
2. Implement pagination for bookings admin view
3. Add Redis cache layer for menu queries (instead of in-memory)
4. Use Prisma's scalar lists or separate index table for full-text search

---

## 9. Error Handling Analysis

### API Layer: 6/10

**Consistent Exceptions** ✅:
```typescript
// AuthService
throw new UnauthorizedException('Invalid credentials');

// UsersService
throw new ConflictException(`Email already exists`);

// MenuItemsService
throw new NotFoundException(`MenuItem ${id} not found`);
```

**Missing** ⚠️:
1. **No global exception filter**:
   ```typescript
   // Logs would show raw stack traces
   // Should implement:
   @Catch()
   export class GlobalExceptionFilter implements ExceptionFilter {
     catch(exception, host) {
       // Format, log, return consistent error response
     }
   }
   ```

2. **Uncaught promise rejections**:
   ```typescript
   // Telegram send failure only logs, doesn't fail gracefully
   bookingsService.createBooking() {
     await telegramService.send().catch(e => console.error(e));
   }
   ```

3. **No request logging**:
   - No middleware to log incoming requests and responses
   - Makes debugging production issues harder

### Web Layer: 5/10

**Context-Level Handling** ✅:
```typescript
// AuthContext catches login errors and redirects
catch (error) {
  setError('Invalid credentials');
  return false;
}
```

**Missing** ❌:
1. **No Error Boundaries**:
   - Component crashes would show white screen
   - Should wrap features with `<ErrorBoundary>`

2. **No global error handler**:
   - Unhandled promise rejections bubble up
   - No user-friendly error messages

3. **Inconsistent error UI**:
   - Some errors show in toast (Sonner)
   - Some in component state
   - No standardized error display

**Recommendation**: Add global error handler + Error Boundary
```typescript
// React Error Boundary
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    logErrorToService(error);
  }
  render() {
    if (this.state.hasError) return <ErrorFallback />;
    return this.props.children;
  }
}

// Wrap App:
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## 10. Documentation Analysis

### Current State: 5/10

**Existing** ✅:
- README.md (84 lines) — covers setup, structure, public API
- CLAUDE.md (250 lines) — architecture and commands
- DOCKER.md (180 lines) — Docker setup
- `.env.example` — environment template
- Swagger API docs at `/api` (auto-generated from NestJS decorators)

**Missing** ❌:

1. **No Architecture Diagrams**:
   - Data model visualization needed
   - Request flow diagrams (auth, menu fetch)
   - Module dependency graph

2. **No Service Documentation**:
   - What does TranslateService do?
   - How does multi-tenancy work?
   - What's the caching strategy?

3. **No Inline Documentation**:
   - JSDoc comments on exported functions: 0%
   - Complex logic (like Prisma SQL) needs comments
   - Guard implementations undocumented

4. **No Migration Guide**:
   - How to migrate from one database to another?
   - How to add a new language?
   - How to rename a restaurant?

5. **No API Specification**:
   - Swagger is enabled but not documented in README
   - No OpenAPI schema export
   - Endpoint examples missing

6. **No Troubleshooting**:
   - DOCKER.md has some troubleshooting
   - But main README lacks it
   - No FAQ section

### Documentation Quality by File:

| File | Completeness | Quality |
|------|--------------|---------|
| README.md | 60% | Clear structure, setup works |
| CLAUDE.md | 95% | Comprehensive architecture |
| DOCKER.md | 90% | Complete Docker guide |
| Code comments | 20% | Minimal, mostly Russian |
| JSDoc | 0% | None present |
| Architecture docs | 0% | No diagrams |

**Recommendation**:
1. Add API documentation section to README
2. Document each service with purpose and examples
3. Create architecture diagram (PlantUML or Miro)
4. Add JSDoc to exported functions
5. Document translation/multi-language flow

---

## Technical Debt Summary

### Critical (Fix Before Production) 🚨
1. **CORS configuration** — allows any origin (line 57, main.ts)
2. **JWT secret fallback** — hardcoded default (auth.module.ts, jwt.strategy.ts)
3. **No env validation** — app could fail at runtime

### High (Plan for Next Sprint) 📌
1. **Missing test coverage** — only 5% tested
2. **Monolithic api.ts** — 640 lines should split into modules
3. **No error boundaries** — React component crashes not handled
4. **No global exception filter** — API errors not formatted consistently

### Medium (Backlog) 📋
1. **Missing search index** — MenuItemTranslation queries slow
2. **Weak password policy** — 6 character minimum too short
3. **Duplicate code** — image upload pattern, translation pattern
4. **No logging middleware** — can't debug production issues
5. **Booking pagination missing** — loads 500 records every time

### Low (Nice to Have)
1. **No API versioning** — will be needed as API evolves
2. **Magic numbers throughout** — should extract to constants
3. **Inconsistent error messages** — mix of Russian/English
4. **No E2E tests** — only unit tests
5. **No performance monitoring** — can't track slow queries

---

## Recommendations by Priority

### Week 1 — Security Fixes
```typescript
// 1. Fix CORS (main.ts:48-57)
app.enableCors({
  origin: (origin, cb) => {
    const allowed = [FRONTEND_URL, ADMIN_URL];
    cb(origin && allowed.includes(origin) ? null : new Error('CORS'));
  }
});

// 2. Remove JWT fallback (auth.module.ts)
const secret = config.get<string>('JWT_SECRET');
if (!secret || secret.length < 32) throw new Error('Invalid JWT_SECRET');

// 3. Add env validation (main.ts)
['DATABASE_URL', 'JWT_SECRET'].forEach(v => {
  if (!process.env[v]) throw new Error(`Missing ${v}`);
});
```

### Month 1 — Foundation
1. Add controller tests (50 tests, 80% API coverage)
2. Add E2E tests with test database (20 tests)
3. Add error boundary in React
4. Add global exception filter in NestJS
5. Increase password minimum to 12 chars

### Month 2 — Quality
1. Split api.ts into modules
2. Add search index on MenuItemTranslation
3. Implement Redis caching
4. Add logging middleware
5. Extract magic numbers to constants

### Backlog
1. Architecture documentation with diagrams
2. API versioning
3. Performance monitoring (APM)
4. Database audit trail (created_by, updated_at)
5. Token revocation on logout

---

## Conclusion

**DMR is a solid foundation** with clean architecture and good dependencies. However, **3 critical security issues must be fixed before production**: CORS misconfiguration, JWT secret fallback, and weak password policy.

**Testing is the biggest gap** (~5% coverage). Implementing basic unit and E2E tests would catch many issues early.

**Overall Production Readiness: 6/10**
- Fix critical security issues: +2 points
- Add test coverage (50%+): +1 point
- Improve type safety: +1 point
- **Target: 8/10 production-ready**

See CLAUDE.md for architecture and DOCKER.md for deployment instructions.
