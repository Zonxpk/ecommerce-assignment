# Post-Implementation Checklist

Use this checklist to verify the Express.js integration is complete and working correctly.

## ✅ Files & Structure Verification

### Server Application (`apps/server/`)
- [ ] `src/server.ts` exists and contains Express app setup
- [ ] `src/middleware/index.ts` exists with validation & error handling
- [ ] `src/types/response.ts` exists with API response types
- [ ] `src/utils.ts` exists with helper functions
- [ ] `src/routes/dashboard.ts` exists with analytics endpoint
- [ ] `src/routes/products.ts` exists with product CRUD
- [ ] `src/routes/webhooks.ts` exists (placeholder webhooks)
- [ ] `package.json` exists with dependencies
- [ ] `tsconfig.json` exists with TypeScript config
- [ ] `.env.example` exists with template
- [ ] `README.md` exists with documentation

**Total expected files:** 11

### Database Package (`packages/db/`)
- [ ] `src/index.ts` exists with Prisma client
- [ ] `package.json` exists
- [ ] `tsconfig.json` exists

**Total expected files:** 3

### Documentation (Root)
- [ ] `EXPRESS_SETUP.md` exists
- [ ] `EXPRESS_QUICK_REF.md` exists
- [ ] `MIGRATION_GUIDE.md` exists
- [ ] `ARCHITECTURE.md` exists
- [ ] `EXPRESS_IMPLEMENTATION.md` exists

**Total expected files:** 5

### Configuration Updates
- [ ] Root `package.json` has updated scripts section
- [ ] `apps/server/.env.example` has DATABASE_URL template

---

## 📦 Dependency Verification

### Check apps/server/package.json
```bash
cd apps/server
```

- [ ] `express` dependency exists
- [ ] `cors` dependency exists
- [ ] `dotenv` dependency exists
- [ ] `@types/express` in devDependencies
- [ ] `tsx` in devDependencies
- [ ] `shared`, `@packages/db`, `adapters` workspace references exist

### Check packages/db/package.json
- [ ] `@prisma/client` dependency exists

---

## 🚀 Running the Server

### 1. Install Dependencies
```bash
bun install
# or
npm install
```

- [ ] Command completes without errors
- [ ] `node_modules` directory created
- [ ] No security vulnerabilities reported

### 2. Create Environment File
```bash
cd apps/server
cp .env.example .env
```

- [ ] `apps/server/.env` file created
- [ ] Edit and add your DATABASE_URL
- [ ] Format: `postgresql://user:password@localhost:5432/ecommerce`

### 3. Run Development Server
```bash
# From root directory
bun run dev:server
```

Watch for output:
```
Server running on port 3001
Health check: http://localhost:3001/health
```

- [ ] Server starts without errors
- [ ] Server runs on port 3001
- [ ] No "address already in use" errors

### 4. Test Health Endpoint
```bash
curl http://localhost:3001/health
```

Expected response:
```json
{ "status": "ok" }
```

- [ ] Returns 200 status
- [ ] Response is valid JSON
- [ ] Contains `"status": "ok"`

---

## 🧪 API Endpoint Testing

### Test with curl or Postman

#### GET /api/products (List)
```bash
curl http://localhost:3001/api/products?page=1&limit=10
```
- [ ] Returns 200 status
- [ ] Contains `success: true`
- [ ] Contains `data` object with `products` array
- [ ] Contains `pagination` object

#### GET /api/dashboard (Analytics)
```bash
curl http://localhost:3001/api/dashboard?days=30
```
- [ ] Returns 200 status (or 500 if no data)
- [ ] Contains `success: true`
- [ ] Contains analytics data structure
- [ ] Includes `summary`, `clicksByCampaign`, etc.

#### GET /api/products/invalid (Not Found)
```bash
curl http://localhost:3001/api/products/invalid-id
```
- [ ] Returns 404 status
- [ ] Contains `success: false`
- [ ] Contains error message

---

## 🔗 Next.js Integration Verification

### Check if Services Can Communicate

#### From Next.js to Express (Proxy approach)
1. Open `apps/web/app/api/dashboard/route.ts`
2. Add temporary proxy code:
```typescript
const EXPRESS_URL = "http://localhost:3001";
const response = await fetch(`${EXPRESS_URL}/api/dashboard`);
```
3. Test in Next.js app
- [ ] Request succeeds
- [ ] Data is received correctly

#### CORS Testing
```bash
curl -H "Origin: http://localhost:3000" http://localhost:3001/health
```
- [ ] Returns 200
- [ ] Response includes CORS headers
- [ ] Access-Control-Allow-Origin header present

---

## 📊 Code Quality Checks

### TypeScript Compilation
```bash
cd apps/server
bun run build
```
- [ ] Compiles without errors
- [ ] No TypeScript errors in IDE
- [ ] `dist/` directory created with compiled JS

### Route Handler Verification
Check each route file exists:
- [ ] `src/routes/dashboard.ts` - 1 endpoint
- [ ] `src/routes/products.ts` - 5 endpoints
- [ ] `src/routes/webhooks.ts` - 2 placeholder endpoints

Total: 8+ endpoints

### Middleware Chain
- [ ] CORS middleware applies to all routes
- [ ] Body parser handles JSON
- [ ] Error handler catches unhandled errors
- [ ] Validation middleware can validate requests

---

## 🗄️ Database Connectivity

### Test Database Connection
```bash
# From apps/server directory
bun run dev:server
```

Monitor console for:
- [ ] No "Cannot find module" errors
- [ ] No database connection errors
- [ ] Server starts successfully
- [ ] Make request to /api/dashboard
- [ ] Check database is queried (check for any SQL logs if configured)

---

## 📝 Documentation Review

### EXPRESS_QUICK_REF.md
- [ ] All sections present
- [ ] Links work correctly
- [ ] Commands are accurate

### EXPRESS_SETUP.md
- [ ] Installation steps clear
- [ ] All endpoints documented
- [ ] Configuration instructions correct

### MIGRATION_GUIDE.md
- [ ] All 3 options explained
- [ ] Code examples provided
- [ ] Environment variables documented

### ARCHITECTURE.md
- [ ] Diagrams are clear
- [ ] Flow descriptions accurate
- [ ] Deployment section complete

---

## 🚀 Running Both Servers Together

### Install concurrently (if not installed)
```bash
bun add -d concurrently
```
- [ ] Package installed successfully

### Run Both Servers
```bash
bun run dev
```

Should see output:
```
Next.js app running on :3000
Express server running on :3001
```

- [ ] Both servers start without errors
- [ ] Can access Next.js on http://localhost:3000
- [ ] Can access Express on http://localhost:3001
- [ ] No port conflicts

---

## 🔒 Security Checks

- [ ] `.env` file is in `.gitignore` (don't commit secrets)
- [ ] Database credentials not in code
- [ ] CORS is configured (adjust for production)
- [ ] Error messages don't expose internals
- [ ] Input validation is in place

---

## 📊 Project Structure Final Review

```bash
# Verify directory structure
ls -la apps/server/src/
# Should contain: server.ts middleware/ routes/ types/ utils.ts

ls -la packages/db/src/
# Should contain: index.ts

ls -la /
# Should contain: EXPRESS_*.md, ARCHITECTURE.md, MIGRATION_GUIDE.md
```

- [ ] All directories exist
- [ ] All files present
- [ ] No unexpected files

---

## ✨ Optional Enhancements (Future)

- [ ] Add request logging middleware
- [ ] Add rate limiting
- [ ] Add authentication (JWT/API keys)
- [ ] Add API documentation (Swagger)
- [ ] Add integration tests
- [ ] Add load testing
- [ ] Configure monitoring (Sentry, DataDog)
- [ ] Add caching (Redis)
- [ ] Implement real webhooks

---

## 🎯 Success Criteria

**All of the following must be true:**

1. ✅ All 14+ files created successfully
2. ✅ No TypeScript compilation errors
3. ✅ Express server runs on port 3001
4. ✅ Health endpoint returns `{ "status": "ok" }`
5. ✅ Database client loads without errors
6. ✅ API endpoints are accessible
7. ✅ CORS allows requests from localhost:3000
8. ✅ Monorepo packages resolve correctly
9. ✅ Documentation is complete
10. ✅ Both servers can run simultaneously

---

## 📞 Troubleshooting

### Port Already in Use
```bash
# Find process using port 3001
lsof -i :3001

# Kill it (if needed)
kill -9 <PID>
```

### Database Connection Error
- [ ] Check `DATABASE_URL` in `apps/server/.env`
- [ ] Verify PostgreSQL is running
- [ ] Test connection: `psql $DATABASE_URL`

### Module Not Found Errors
```bash
# Reinstall dependencies
bun install

# Clear cache
rm -rf node_modules
rm -rf apps/server/node_modules
bun install
```

### TypeScript Errors
```bash
# Force TypeScript rebuild
cd apps/server
tsc --noEmit
```

---

## ✅ Final Verification

Run this final check:

```bash
# 1. Install
bun install

# 2. Check structure
ls -la apps/server/src/
ls -la packages/db/src/

# 3. Build
cd apps/server && bun run build

# 4. Run server
bun run dev:server

# 5. In another terminal
curl http://localhost:3001/health

# 6. Should return:
# { "status": "ok" }
```

If all checks pass, you're ready to use Express.js! 🎉

---

**Status:** Ready for implementation ✨  
**Next step:** Review EXPRESS_QUICK_REF.md for next steps
