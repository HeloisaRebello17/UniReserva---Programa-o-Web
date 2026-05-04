# 🎯 Production Checklist - UniReserva

## ✅ Pre-Deployment Validation

### 1. Code Quality
- [ ] `npm run lint` - zero warnings
- [ ] `npm test` - all 23 tests passing
- [ ] `npm run test:coverage` - coverage report generated
- [ ] All changes committed to git
- [ ] No sensitive data in code (.env in .gitignore)

### 2. GitHub Actions Pipeline
- [ ] Latest push triggers CI/CD workflow
- [ ] Workflow completes successfully
- [ ] All checks pass: tests, lint, security, docker build
- [ ] View workflow: https://github.com/seu-usuario/UniReserva/actions

### 3. Docker & Images
- [ ] `Dockerfile` present and valid
- [ ] `.dockerignore` configured
- [ ] `docker-compose.prod.yml` ready
- [ ] `docker image ls` - images built locally

### 4. Environment Setup
- [ ] `.env.example` has all required variables
- [ ] JWT_SECRET generation command documented
- [ ] Database credentials secure (long random strings)
- [ ] LOG_LEVEL set to production

---

## 🚀 Deployment Steps

### Option A: Railway (Recommended)
```
1. git push origin main
2. railway.app → New Project → Deploy from GitHub
3. Select UniReserva-main repository
4. Add PostgreSQL database
5. Configure environment variables
6. Deploy (automatic)
Time: ~10 minutes
```

**Result**: `https://seu-projeto.railway.app`

### Option B: Render
```
1. render.com → New Web Service
2. Connect GitHub repo
3. Add PostgreSQL database
4. Configure environment variables
5. Deploy
Time: ~15 minutes
```

**Result**: `https://seu-projeto.onrender.com`

### Option C: Docker VPS
```
1. SSH to server
2. docker-compose -f docker-compose.prod.yml up -d
3. Configure Nginx + SSL
4. Setup monitoring & backups
Time: ~30 minutes
```

**Result**: `https://seu-dominio.com`

---

## ✨ Post-Deployment Validation

### 1. Application Accessibility
```bash
# Test health endpoint
curl https://seu-app.com/api/health
# Expected: {"status":"ok","message":"UniReserva API em execução."}

# Test login
curl -X POST https://seu-app.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"professor@unireserva.com","password":"prof123"}'
# Expected: token in response
```

### 2. Database Connectivity
- [ ] Can connect from application
- [ ] Schema and seed data loaded
- [ ] Can create users/rooms/reservations
- [ ] No connection errors in logs

### 3. Monitoring & Alerts
- [ ] Dashboard accessible (Railway/Render)
- [ ] Logs visible in real-time
- [ ] Error tracking active (optional: Sentry)
- [ ] Alert rules configured

### 4. HTTPS & Security
- [ ] SSL certificate valid
- [ ] HTTPS enforced (http → https redirect)
- [ ] Security headers present
- [ ] CORS properly configured

### 5. Performance
- [ ] Response time < 500ms
- [ ] No 5xx errors
- [ ] Memory usage stable
- [ ] CPU usage < 50%

---

## 📊 Monitoring Setup

### Dashboards
- [ ] Railway/Render dashboard bookmarked
- [ ] Metrics visible (CPU, Memory, Requests)
- [ ] Logs accessible

### Alerts
- [ ] Error rate > 5%
- [ ] Response time > 2s
- [ ] Memory > 80%
- [ ] Application down
- [ ] Database unavailable

### Optional: Advanced Monitoring
- [ ] Sentry (error tracking)
- [ ] DataDog (APM)
- [ ] CloudFlare (analytics)
- [ ] Uptime Robot (external monitoring)

---

## 🔒 Security Verification

### Credentials
- [ ] JWT_SECRET is 32+ random characters
- [ ] DB_PASSWORD is 24+ random characters
- [ ] No credentials in source code
- [ ] .env file in .gitignore
- [ ] Environment variables set in platform

### HTTPS/TLS
- [ ] SSL certificate installed
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] No mixed content warnings

### API Security
- [ ] CORS restricted to allowed origins
- [ ] Rate limiting active (if implemented)
- [ ] Input validation working
- [ ] SQL injection protection (parameterized queries)
- [ ] JWT token validation strict

### Data Protection
- [ ] Passwords hashed (at least in future iterations)
- [ ] Sensitive data encrypted
- [ ] Logs don't contain secrets
- [ ] Database backup strategy defined

---

## 📈 Performance Benchmarks

### Target Metrics
| Metric | Target | Status |
|--------|--------|--------|
| Response Time | < 500ms | ? |
| Error Rate | < 1% | ? |
| Availability | > 99.5% | ? |
| CPU Usage | < 50% | ? |
| Memory Usage | < 75% | ? |

### Load Testing
```bash
# Optional: Test with Artillery or K6
# npm install -g artillery
# artillery run load-test.yml
```

---

## 🔄 Deployment Pipeline

```
git push origin main
         ↓
[GitHub Actions Workflow]
  ├─ Run Tests (23 passing)
  ├─ Lint Code (ESLint)
  ├─ Security Audit (npm audit)
  └─ Build Docker Image
         ↓
[All Checks Pass ✅]
         ↓
[Manual Deploy or Auto Deploy]
  ├─ Railway: Automatic
  ├─ Render: Automatic
  └─ VPS: Manual: docker-compose up -d
         ↓
[Application Running in Production 🚀]
         ↓
[Continuous Monitoring]
  ├─ Logs
  ├─ Metrics
  ├─ Alerts
  └─ Error Tracking
```

---

## 🆘 Quick Troubleshooting

### App not responding
```bash
# Check if container is running
docker-compose -f docker-compose.prod.yml ps

# Check logs
docker-compose -f docker-compose.prod.yml logs app | tail -50

# Restart
docker-compose -f docker-compose.prod.yml restart app
```

### Database errors
```bash
# Test connection
psql $DATABASE_URL

# Check PostgreSQL is running
docker-compose -f docker-compose.prod.yml ps postgres

# View database logs
docker-compose -f docker-compose.prod.yml logs postgres
```

### High CPU/Memory
```bash
# Monitor resources
docker stats

# Increase allocated memory
docker-compose -f docker-compose.prod.yml down
# Edit docker-compose.prod.yml: add 'mem_limit'
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Support Resources

| Issue | Resource |
|-------|----------|
| Railway Questions | https://docs.railway.app |
| Render Questions | https://render.com/docs |
| Docker Issues | https://docs.docker.com |
| Node.js Errors | https://nodejs.org/docs |
| PostgreSQL | https://www.postgresql.org/docs |

---

## 🎉 Success Criteria

Project is production-ready when:

✅ All tests pass locally and in CI/CD
✅ Code linted with zero warnings
✅ Docker image builds successfully
✅ Environment variables documented
✅ Deployed to at least one platform (Railway/Render/VPS)
✅ Health endpoint responding
✅ Login flow working in production
✅ Database connected and queries executing
✅ Logs visible in dashboard
✅ HTTPS active
✅ No 5xx errors
✅ Response times acceptable
✅ Team can monitor and maintain

---

**Status**: ✨ Ready for Production Deployment!
