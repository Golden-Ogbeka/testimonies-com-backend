# Production Deployment Guide

## Testimonies.com Backend - Production Setup

### Prerequisites
- Node.js 20+
- MongoDB 6.0+ or MongoDB Atlas
- Environment variables configured
- Git for version control

### Environment Setup

Create a `.env.production` file with the following required variables:

```bash
# Core
NODE_ENV=production
PORT=5000
JWT_SECRET=your_super_secure_jwt_secret_here

# API Security
API_KEY=your_secure_api_key_here
CORS_ORIGINS=https://testimonies.com,https://admin.testimonies.com

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/testimonies_com?retryWrites=true&w=majority

# Email (SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_USER=apikey
EMAIL_PASS=SG.xxxxxxxxxx
EMAIL_FROM=noreply@testimonies.com
EMAIL_PORT=587

# Cloudinary (image hosting)
CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URLs
WEBSITE_URL=https://testimonies.com
ADMIN_DASHBOARD_URL=https://admin.testimonies.com
BASE_URL=https://api.testimonies.com

# Security
ENFORCE_HTTPS_REDIRECT=true
```

### Deployment

#### Docker Deployment

1. Build the Docker image:
```bash
docker build -t testimonies-backend:latest .
```

2. Run with environment variables:
```bash
docker run -d \
  --name testimonies-backend \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e JWT_SECRET=your_secret \
  -e API_KEY=your_api_key \
  -e MONGO_URI=mongodb+srv://... \
  -p 5000:5000 \
  testimonies-backend:latest
```

#### Docker Compose

```bash
docker-compose -f docker-compose.yml up -d
```

#### Direct Node Deployment

```bash
# Install dependencies
npm install --production

# Run migrations
npm run migrate:up

# Start server
npm start
```

### Health Checks

The application exposes a health check endpoint:
```
GET /health
```

Returns:
```json
{
  "status": "ok",
  "timestamp": "2026-03-04T20:00:00.000Z",
  "mongo": "connected",
  "uptimeSeconds": 3600
}
```

### Monitoring & Logging

- **Request Logging**: All requests are logged with request IDs via Winston
- **Error Logging**: Errors are reported to `logs/` directory
- **Request ID Tracking**: Every request has a unique ID (`x-request-id` header) for tracing

### Performance Optimization

- **Rate Limiting**: 500 requests per 15 minutes per IP (general)
- **Auth Rate Limiting**: 10 auth attempts per 15 minutes per IP
- **Compression**: Response compression enabled
- **Security Headers**: Helmet.js configured
- **CORS**: Properly configured for frontend domains
- **MongoDB Timeouts**: Connection timeout set to 10s, server selection to 10s

### Production Checklist

- [ ] All environment variables set
- [ ] HTTPS enabled
- [ ] JWT_SECRET is secure (min 32 characters)
- [ ] API_KEY is secure
- [ ] Database backups configured
- [ ] Email service verified
- [ ] Cloudinary credentials working
- [ ] CORS origins correctly set
- [ ] Monitoring/logging set up
- [ ] SSL certificates valid
- [ ] Rate limiting configured appropriately
- [ ] Error tracking configured

### Troubleshooting

**Application won't start**
- Check environment variables with: `npm run type:check`
- Verify MongoDB connection
- Check logs in `logs/` directory

**Slow requests**
- Check MongoDB connection pool
- Review rate limiter settings
- Monitor memory usage

**CORS errors**
- Verify `CORS_ORIGINS` includes frontend domains
- Check `BASE_URL` is correct

### Support

For issues, contact: support@testimonies.com
