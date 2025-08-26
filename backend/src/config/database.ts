// Database configuration for future use
export const dbConfig = {
  // Add database configuration here when needed
  // For now, we're using in-memory storage
};

export interface UserPreferences {
  theme: string;
  defaultApis: string[];
  notifications: boolean;
}

export interface SearchHistory {
  id: number;
  query: string;
  timestamp: number;
}

// In-memory storage for demo purposes
export const inMemoryStorage = {
  preferences: new Map<string, UserPreferences>(),
  searchHistory: new Map<string, SearchHistory[]>(),
};
