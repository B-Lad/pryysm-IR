# Deployment Checklist for Prysm System

## Pre-Deployment

### Environment Setup
- [ ] Node.js 18+ installed
- [ ] PostgreSQL database provisioned
- [ ] Environment variables configured
- [ ] SSL certificates obtained

### Configuration
- [ ] `.env` file created with all required variables
- [ ] `DATABASE_URL` set correctly
- [ ] `NEXTAUTH_SECRET` generated (use `openssl rand -base64 32`)
- [ ] `NEXTAUTH_URL` set to production domain

### Database
- [ ] Run `npx prisma migrate deploy`
- [ ] Seed initial data if needed
- [ ] Verify database connection

## Build Process
- [ ] Run `npm run build` successfully
- [ ] Check for build warnings/errors
- [ ] Verify output in `.next` folder

## Deployment Steps

### 1. Upload Files
- [ ] Transfer build artifacts to server
- [ ] Ensure proper file permissions
- [ ] Set up process manager (PM2 recommended)

### 2. Start Application
- [ ] Configure PM2 ecosystem file
- [ ] Start application: `pm2 start ecosystem.config.js`
- [ ] Enable PM2 startup on boot

### 3. Reverse Proxy (Nginx)
- [ ] Configure Nginx server block
- [ ] Set up SSL with Let's Encrypt
- [ ] Test HTTPS redirect

## Post-Deployment Verification

### Functional Tests
- [ ] Homepage loads correctly
- [ ] Login/Signup functionality works
- [ ] Dashboard accessible
- [ ] API endpoints responding

### Performance Checks
- [ ] Page load times acceptable
- [ ] No console errors
- [ ] WebSocket connections stable

### Security Verification
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Rate limiting active
- [ ] Authentication working properly

## Monitoring Setup
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring enabled
- [ ] Log aggregation set up
- [ ] Alert notifications configured

## Rollback Plan
- [ ] Previous version backed up
- [ ] Rollback procedure documented
- [ ] Team notified of deployment

## Sign-off
- [ ] QA team approval
- [ ] Stakeholder notification
- [ ] Documentation updated
