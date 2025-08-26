import { inMemoryStorage, UserPreferences, SearchHistory } from '../config/database';

export class UserService {
  // Get user preferences
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    // For demo purposes, return default preferences
    // In a real app, this would fetch from database
    return {
      theme: 'light',
      defaultApis: ['Cat Facts', 'Weather'],
      notifications: true
    };
  }

  // Save user preferences
  static async saveUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<boolean> {
    try {
      // In a real app, this would save to database
      console.log('Saving preferences for user:', userId, preferences);
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  // Get search history
  static async getSearchHistory(userId: string): Promise<SearchHistory[]> {
    // For demo purposes, return mock data
    // In a real app, this would fetch from database
    return [
      { id: 1, query: 'get weather Berlin', timestamp: Date.now() - 3600000 },
      { id: 2, query: 'get cat fact', timestamp: Date.now() - 7200000 },
      { id: 3, query: 'search chuck kick', timestamp: Date.now() - 10800000 }
    ];
  }

  // Save search query
  static async saveSearchQuery(userId: string, query: string): Promise<SearchHistory> {
    try {
      const searchHistory: SearchHistory = {
        id: Date.now(),
        query,
        timestamp: Date.now()
      };
      
      // In a real app, this would save to database
      console.log('Saving search query for user:', userId, query);
      return searchHistory;
    } catch (error) {
      console.error('Error saving search query:', error);
      throw error;
    }
  }

  // Delete search from history
  static async deleteSearchFromHistory(userId: string, searchId: number): Promise<boolean> {
    try {
      // In a real app, this would delete from database
      console.log('Deleting search from history for user:', userId, 'searchId:', searchId);
      return true;
    } catch (error) {
      console.error('Error deleting search from history:', error);
      return false;
    }
  }
}
