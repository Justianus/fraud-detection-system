import { API_CONFIG, APP_CONFIG, buildApiUrl } from '@/config/api';

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// HTTP Client class
class HttpClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string = API_CONFIG.BASE_URL, timeout: number = APP_CONFIG.REQUEST_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = buildApiUrl(endpoint);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new ApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return await response.text() as unknown as T;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new ApiError('Request timeout', 408);
        }
        throw new ApiError(error.message, 0);
      }
      
      throw new ApiError('Unknown error occurred', 0);
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create default HTTP client instance
export const apiClient = new HttpClient();

// API Service functions
export const apiService = {
  // Health check
  async healthCheck(): Promise<{ status: string; message: string; timestamp: string }> {
    return apiClient.get(API_CONFIG.ENDPOINTS.HEALTH);
  },

  // Claims
  async getClaims(params?: { region?: string; risk_level?: string }): Promise<{ claims: any[] }> {
    const queryParams = new URLSearchParams();
    if (params?.region) queryParams.append('region', params.region);
    if (params?.risk_level) queryParams.append('risk_level', params.risk_level);
    
    const endpoint = `${API_CONFIG.ENDPOINTS.CLAIMS}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get(endpoint);
  },

  async createClaim(claimData: any): Promise<{ claim_id: string; database_id: number; message: string }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.CLAIMS, claimData);
  },

  async predictFraud(claimId: string): Promise<{ prediction: any; risk_level: string; fraud_probability: number }> {
    return apiClient.post(API_CONFIG.ENDPOINTS.CLAIM_PREDICT(claimId));
  },

  // Dashboard
  async getDashboardStats(): Promise<any> {
    return apiClient.get(API_CONFIG.ENDPOINTS.DASHBOARD_STATS);
  },

  // Reports
  async getMonthlyTrends(): Promise<any[]> {
    return apiClient.get(API_CONFIG.ENDPOINTS.REPORTS.MONTHLY_TRENDS);
  },

  async getRegionalAnalysis(): Promise<any[]> {
    return apiClient.get(API_CONFIG.ENDPOINTS.REPORTS.REGIONAL_ANALYSIS);
  },

  async getSummaryStats(): Promise<any> {
    return apiClient.get(API_CONFIG.ENDPOINTS.REPORTS.SUMMARY_STATS);
  },

  async exportReports(format: 'csv' | 'excel' | 'pdf'): Promise<Blob> {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.REPORTS.EXPORT(format)));
    if (!response.ok) {
      throw new ApiError(`Export failed: ${response.statusText}`, response.status);
    }
    return response.blob();
  },
};

export default apiService;


