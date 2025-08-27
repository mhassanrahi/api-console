import { useState, useEffect, useCallback } from 'react';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';
import apiService from '../services/apiService';

interface UserData {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  emailVerified: boolean;
  active: boolean;
  accountStatus: string;
  userType: string;
  loginCount: number;
  lastLogin: string;
  timezone: string;
  locale: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  company?: string;
  jobTitle?: string;
  metadata?: Record<string, any>;
}

interface UserPreferences {
  id: string;
  theme: string;
  defaultApis: string[];
  notifications: boolean;
  autoSaveSearch: boolean;
  maxSearchHistory: number;
  preferredLanguage: string;
  timezone: string;
}

interface UserStats {
  totalSearches: number;
  totalChatSessions: number;
  totalMessages: number;
  lastActivity: string | null;
}

export function useUserData() {
  const [user, setUser] = useState<UserData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user data with backend
  const syncUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is authenticated
      const cognitoUser = await getCurrentUser();
      if (!cognitoUser) {
        setUser(null);
        setPreferences(null);
        setStats(null);
        return;
      }

      // Get auth session to ensure we have a valid token
      const session = await fetchAuthSession();
      if (!session.tokens?.idToken) {
        throw new Error('No valid authentication token');
      }

      // Sync user data with backend
      const syncResponse = await apiService.syncUserData();
      if (!syncResponse.success) {
        throw new Error(syncResponse.error || 'Failed to sync user data');
      }

      // Fetch user profile
      const profileResponse = await apiService.getUserProfile();
      if (profileResponse.success && profileResponse.data) {
        setUser(profileResponse.data);
      }

      // Fetch user preferences
      const preferencesResponse = await apiService.getUserPreferences();
      if (preferencesResponse.success && preferencesResponse.data) {
        setPreferences(preferencesResponse.data);
      }

      // Fetch user stats (if available)
      try {
        const statsResponse = await apiService.getUserStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (statsError) {
        // Stats might not be available yet, don't fail the whole sync
        console.warn('Could not fetch user stats:', statsError);
      }
    } catch (err) {
      console.error('Error syncing user data:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync user data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Update user profile
  const updateProfile = useCallback(async (profileData: Partial<UserData>) => {
    try {
      setError(null);
      const response = await apiService.updateUserProfile(profileData);

      if (response.success && response.data) {
        setUser(prev => (prev ? { ...prev, ...response.data } : null));
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error || 'Failed to update profile');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Update user preferences
  const updatePreferences = useCallback(
    async (preferencesData: Partial<UserPreferences>) => {
      try {
        setError(null);
        const response =
          await apiService.updateUserPreferences(preferencesData);

        if (response.success && response.data) {
          setPreferences(prev => (prev ? { ...prev, ...response.data } : null));
          return { success: true, data: response.data };
        } else {
          throw new Error(response.error || 'Failed to update preferences');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to update preferences';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    },
    []
  );

  // Save search query
  const saveSearchQuery = useCallback(
    async (query: string, api?: string, metadata?: any) => {
      try {
        const response = await apiService.saveSearchQuery(query, api, metadata);
        return response;
      } catch (err) {
        console.error('Error saving search query:', err);
        return { success: false, error: 'Failed to save search query' };
      }
    },
    []
  );

  // Get search history
  const getSearchHistory = useCallback(async (limit?: number) => {
    try {
      const response = await apiService.getSearchHistory(limit);
      return response;
    } catch (err) {
      console.error('Error fetching search history:', err);
      return { success: false, error: 'Failed to fetch search history' };
    }
  }, []);

  // Initialize user data on mount
  useEffect(() => {
    syncUserData();
  }, [syncUserData]);

  // Listen for auth state changes
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const cognitoUser = await getCurrentUser();
        if (!cognitoUser) {
          // User is not authenticated, clear data
          setUser(null);
          setPreferences(null);
          setStats(null);
          setLoading(false);
        }
      } catch (err) {
        // User is not authenticated
        setUser(null);
        setPreferences(null);
        setStats(null);
        setLoading(false);
      }
    };

    // Check auth state periodically
    const interval = setInterval(checkAuthState, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return {
    user,
    preferences,
    stats,
    loading,
    error,
    syncUserData,
    updateProfile,
    updatePreferences,
    saveSearchQuery,
    getSearchHistory,
    isAuthenticated: !!user,
  };
}
