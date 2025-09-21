# Environment Variables Setup

## 🚨 **You currently don't have environment variables configured!**

Your frontend is hardcoded to use `http://localhost:5000` for all API calls, which makes it difficult to deploy to different environments.

## ✅ **Solution: Set up Environment Variables**

### 1. Create Environment Files

Create these files in your `claimguard-namibia` directory:

#### `.env.local` (for development)
```bash
# Development Environment Variables
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=ClaimGuard Namibia
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development
```

#### `.env.production` (for production)
```bash
# Production Environment Variables
VITE_API_BASE_URL=https://your-production-api.com
VITE_APP_NAME=ClaimGuard Namibia
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=production
```

#### `.env.example` (template for others)
```bash
# Environment Variables Example
# Copy this file to .env.local and update the values

# API Configuration
VITE_API_BASE_URL=http://localhost:5000

# App Configuration
VITE_APP_NAME=ClaimGuard Namibia
VITE_APP_VERSION=1.0.0
VITE_APP_ENVIRONMENT=development

# Production Example:
# VITE_API_BASE_URL=https://your-production-api.com
# VITE_APP_ENVIRONMENT=production
```

### 2. Update Your Components

I've already created:
- `src/config/api.ts` - Centralized API configuration
- `src/services/api.ts` - API service with proper error handling

### 3. How to Use

Instead of hardcoded URLs like:
```typescript
fetch('http://localhost:5000/api/claims')
```

Use the API service:
```typescript
import { apiService } from '@/services/api';

const claims = await apiService.getClaims();
```

## 🔧 **Benefits of This Setup:**

1. **Environment-specific URLs** - Different URLs for dev/staging/prod
2. **Centralized configuration** - All API endpoints in one place
3. **Better error handling** - Consistent error handling across the app
4. **Type safety** - TypeScript interfaces for API responses
5. **Timeout handling** - Automatic request timeouts
6. **Easy deployment** - Just change environment variables

## 📝 **Next Steps:**

1. Create the `.env.local` file with your development settings
2. Update your components to use the new API service
3. Test that everything still works
4. Create production environment files when ready to deploy

## 🚀 **For Deployment:**

When you deploy to production, just set:
```bash
VITE_API_BASE_URL=https://your-production-backend.com
VITE_APP_ENVIRONMENT=production
```

And your app will automatically use the production API!


