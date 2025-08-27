import { fetchAuthSession } from 'aws-amplify/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class ApiService {
  private async getAuthHeaders(): Promise<HeadersInit> {
    try {
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken?.toString();

      return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };
    } catch (error) {
      console.error('Error getting auth token:', error);
      return {
        'Content-Type': 'application/json',
      };
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // User Profile APIs
  async getUserProfile(): Promise<ApiResponse> {
    return this.makeRequest('/api/user/profile');
  }

  async updateUserProfile(profileData: any): Promise<ApiResponse> {
    return this.makeRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  // User Preferences APIs
  async getUserPreferences(): Promise<ApiResponse> {
    return this.makeRequest('/api/user/preferences');
  }

  async updateUserPreferences(preferences: any): Promise<ApiResponse> {
    return this.makeRequest('/api/user/preferences', {
      method: 'POST',
      body: JSON.stringify(preferences),
    });
  }

  // Search History APIs
  async getSearchHistory(limit?: number): Promise<ApiResponse> {
    const params = limit ? `?limit=${limit}` : '';
    return this.makeRequest(`/api/searches/history${params}`);
  }

  async saveSearchQuery(
    query: string,
    api?: string,
    metadata?: any
  ): Promise<ApiResponse> {
    return this.makeRequest('/api/searches', {
      method: 'POST',
      body: JSON.stringify({ query, api, metadata }),
    });
  }

  async deleteSearchQuery(searchId: string): Promise<ApiResponse> {
    return this.makeRequest(`/api/searches/${searchId}`, {
      method: 'DELETE',
    });
  }

  // Chat Session APIs
  async getChatSessions(): Promise<ApiResponse> {
    return this.makeRequest('/api/chat/sessions');
  }

  async getChatMessages(
    sessionId: string,
    limit?: number
  ): Promise<ApiResponse> {
    const params = limit ? `?limit=${limit}` : '';
    return this.makeRequest(
      `/api/chat/sessions/${sessionId}/messages${params}`
    );
  }

  // Get all chat messages for current user
  async getAllChatMessages(limit?: number): Promise<ApiResponse> {
    console.log(
      '📡 Making API request to get all chat messages, limit:',
      limit
    );
    const params = limit ? `?limit=${limit}` : '';
    const response = await this.makeRequest(`/api/chat/messages${params}`);
    console.log('📡 API response for chat messages:', response);
    return response;
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse> {
    return this.makeRequest('/api/health');
  }

  // Sync user data after login
  async syncUserData(): Promise<ApiResponse> {
    // This will trigger the backend to sync user data from Cognito
    return this.makeRequest('/api/user/sync');
  }

  // Get user statistics
  async getUserStats(): Promise<ApiResponse> {
    return this.makeRequest('/api/user/stats');
  }
}

export const apiService = new ApiService();
export default apiService;
