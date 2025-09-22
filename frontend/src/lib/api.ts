const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async getProfile() {
    return this.request('/auth/me');
  }

  // Instagram endpoints
  async connectInstagramAccount(facebookAccessToken: string) {
    return this.request('/instagram/connect', {
      method: 'POST',
      body: JSON.stringify({ facebookAccessToken }),
    });
  }

  async getAccountAnalytics(accountId: string) {
    return this.request(`/instagram/accounts/${accountId}/analytics`);
  }

  async refreshInsights(accountId: string) {
    return this.request(`/instagram/accounts/${accountId}/refresh-insights`, {
      method: 'POST',
    });
  }

  // Analytics endpoints
  async getAccountOverview(accountId: string) {
    return this.request(`/analytics/accounts/${accountId}/overview`);
  }

  async getContentAnalytics(accountId: string) {
    return this.request(`/analytics/accounts/${accountId}/content`);
  }

  async getEngagementAnalytics(accountId: string) {
    return this.request(`/analytics/accounts/${accountId}/engagement`);
  }

  // Recommendations endpoints
  async generateRecommendations(accountId: string) {
    return this.request(`/recommendations/accounts/${accountId}/generate`, {
      method: 'POST',
    });
  }

  async getRecommendations(accountId: string) {
    return this.request(`/recommendations/accounts/${accountId}`);
  }

  async updateRecommendationStatus(recommendationId: string, status: string) {
    return this.request(`/recommendations/${recommendationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export type { ApiResponse };
