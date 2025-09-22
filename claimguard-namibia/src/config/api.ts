// API Configuration
export const API_CONFIG = {
  // Base URL for API calls
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  
  // API Endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    CLAIMS: '/api/claims',
    CLAIM_PREDICT: (claimId: string) => `/api/claims/${claimId}/predict`,
    DASHBOARD_STATS: '/api/dashboard/stats',
    REPORTS: {
      MONTHLY_TRENDS: '/api/reports/monthly-trends',
      REGIONAL_ANALYSIS: '/api/reports/regional-analysis',
      SUMMARY_STATS: '/api/reports/summary-stats',
      EXPORT: (format: string) => `/api/reports/export/${format}`,
    }
  }
};

// App Configuration
export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'ClaimGuard Namibia',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  
  // Request timeout (in milliseconds)
  REQUEST_TIMEOUT: 30000,
  
  // Retry configuration
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

// Helper function to build full API URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to check if we're in development
export const isDevelopment = (): boolean => {
  return APP_CONFIG.ENVIRONMENT === 'development';
};

// Helper function to check if we're in production
export const isProduction = (): boolean => {
  return APP_CONFIG.ENVIRONMENT === 'production';
};



