# Frontend Integration with Backend APIs

This document explains how the frontend integrates with the backend APIs to store and manage user data.

## 🎯 Overview

The frontend now seamlessly integrates with our PostgreSQL database through the backend APIs, providing:

- **Automatic User Data Sync** - User data is synced from Cognito to PostgreSQL on login
- **Real-time Data Management** - User preferences, search history, and chat sessions are persisted
- **Rich User Profiles** - Display comprehensive user information and statistics
- **Seamless Authentication Flow** - Integrated login process with data synchronization

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   Backend API   │    │   PostgreSQL    │
│   (Frontend)    │    │   (Express)     │    │   (Database)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │ 1. Login with Cognito │                       │
         │──────────────────────▶│                       │
         │                       │                       │
         │ 2. JWT Token          │                       │
         │◀──────────────────────│                       │
         │                       │                       │
         │ 3. Sync User Data     │                       │
         │──────────────────────▶│                       │
         │                       │ 4. Create/Update User │
         │                       │──────────────────────▶│
         │                       │                       │
         │ 5. User Data Response │                       │
         │◀──────────────────────│                       │
         │                       │                       │
         │ 6. Fetch Preferences  │                       │
         │──────────────────────▶│                       │
         │                       │ 7. Query Database     │
         │                       │──────────────────────▶│
         │                       │                       │
         │ 8. Preferences Data   │                       │
         │◀──────────────────────│                       │
```

## 📁 File Structure

```
frontend/src/
├── services/
│   └── apiService.ts          # API communication layer
├── hooks/
│   └── useUserData.ts         # User data management hook
├── components/
│   ├── auth/
│   │   ├── Login.tsx          # Enhanced login with sync
│   │   └── AuthContainer.tsx  # Auth flow management
│   └── UserProfile.tsx        # User profile display
└── utils/
    └── useAuthUser.ts         # Basic auth state management
```

## 🔧 Implementation Details

### **1. API Service Layer** (`apiService.ts`)

The API service handles all communication with the backend:

```typescript
class ApiService {
  // Automatic JWT token handling
  private async getAuthHeaders(): Promise<HeadersInit> {
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken?.toString();

    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // User data endpoints
  async syncUserData(): Promise<ApiResponse>;
  async getUserProfile(): Promise<ApiResponse>;
  async updateUserProfile(profileData: any): Promise<ApiResponse>;
  async getUserPreferences(): Promise<ApiResponse>;
  async updateUserPreferences(preferences: any): Promise<ApiResponse>;
  async getUserStats(): Promise<ApiResponse>;

  // Search history endpoints
  async getSearchHistory(limit?: number): Promise<ApiResponse>;
  async saveSearchQuery(
    query: string,
    api?: string,
    metadata?: any
  ): Promise<ApiResponse>;
  async deleteSearchQuery(searchId: string): Promise<ApiResponse>;

  // Chat session endpoints
  async getChatSessions(): Promise<ApiResponse>;
  async getChatMessages(
    sessionId: string,
    limit?: number
  ): Promise<ApiResponse>;
}
```

### **2. User Data Hook** (`useUserData.ts`)

A comprehensive hook for managing user data:

```typescript
export function useUserData() {
  const [user, setUser] = useState<UserData | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Core functions
  const syncUserData = useCallback(async () => {
    /* ... */
  }, []);
  const updateProfile = useCallback(async (profileData: Partial<UserData>) => {
    /* ... */
  }, []);
  const updatePreferences = useCallback(
    async (preferencesData: Partial<UserPreferences>) => {
      /* ... */
    },
    []
  );
  const saveSearchQuery = useCallback(
    async (query: string, api?: string, metadata?: any) => {
      /* ... */
    },
    []
  );
  const getSearchHistory = useCallback(async (limit?: number) => {
    /* ... */
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
```

### **3. Enhanced Login Flow** (`Login.tsx`)

The login component now includes data synchronization:

```typescript
const onSubmit = async (data: LoginFormData) => {
  setLoading(true);
  setApiError('');
  setSyncStatus('idle');

  try {
    // Step 1: Authenticate with Cognito
    await signIn({ username: data.email, password: data.password });

    // Step 2: Sync user data with backend
    await syncUserData();

    // Step 3: Reload the page to update the app state
    window.location.reload();
  } catch (err: any) {
    setApiError(err.message || 'Login failed');
    setSyncStatus('error');
  } finally {
    setLoading(false);
  }
};
```

### **4. User Profile Component** (`UserProfile.tsx`)

A comprehensive profile display component:

```typescript
const UserProfile: React.FC = () => {
  const { user, preferences, stats, loading, error } = useUserData();

  // Displays:
  // - Basic user information
  // - User preferences
  // - Activity statistics
  // - Additional profile data
  // - Sync status
};
```

## 🔄 Data Flow

### **Login Process:**

1. **User Authentication** - User logs in with Cognito
2. **Token Generation** - Cognito returns JWT token
3. **Data Sync** - Frontend calls backend to sync user data
4. **Database Update** - Backend creates/updates user in PostgreSQL
5. **Profile Loading** - Frontend fetches user profile and preferences
6. **App Initialization** - User is redirected to main app

### **Data Synchronization:**

```typescript
// 1. Check authentication
const cognitoUser = await getCurrentUser();
if (!cognitoUser) return;

// 2. Get auth session
const session = await fetchAuthSession();
if (!session.tokens?.idToken) return;

// 3. Sync with backend
const syncResponse = await apiService.syncUserData();

// 4. Fetch user data
const profileResponse = await apiService.getUserProfile();
const preferencesResponse = await apiService.getUserPreferences();
const statsResponse = await apiService.getUserStats();
```

## 📊 Data Types

### **User Data Interface:**

```typescript
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
```

### **User Preferences Interface:**

```typescript
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
```

### **User Statistics Interface:**

```typescript
interface UserStats {
  totalSearches: number;
  totalChatSessions: number;
  totalMessages: number;
  lastActivity: string | null;
}
```

## 🎨 UI Components

### **Login Status Indicators:**

- **Loading State** - Spinner during authentication
- **Sync Status** - Real-time sync progress indicators
- **Error Handling** - Clear error messages for failed operations
- **Success Feedback** - Confirmation of successful operations

### **User Profile Display:**

- **Basic Information** - Email, username, name, account status
- **Preferences Panel** - Theme, language, notifications, etc.
- **Statistics Dashboard** - Activity metrics and usage data
- **Additional Info** - Bio, website, location, company details
- **Sync Status** - Database synchronization status

## 🔐 Security Features

### **JWT Token Management:**

- Automatic token extraction from Cognito session
- Token inclusion in all API requests
- Secure token handling with proper headers

### **Error Handling:**

- Comprehensive error catching and display
- Graceful degradation for failed operations
- User-friendly error messages

### **Data Validation:**

- Type-safe interfaces for all data structures
- Input validation on forms
- API response validation

## 🚀 Usage Examples

### **Using the User Data Hook:**

```typescript
import { useUserData } from '../hooks/useUserData';

function MyComponent() {
  const { user, preferences, stats, loading, updateProfile } = useUserData();

  if (loading) return <div>Loading...</div>;

  const handleProfileUpdate = async () => {
    const result = await updateProfile({
      bio: 'Updated bio',
      website: 'https://example.com'
    });

    if (result.success) {
      console.log('Profile updated successfully');
    }
  };

  return (
    <div>
      <h1>Welcome, {user?.firstName}!</h1>
      <p>Theme: {preferences?.theme}</p>
      <p>Total searches: {stats?.totalSearches}</p>
      <button onClick={handleProfileUpdate}>Update Profile</button>
    </div>
  );
}
```

### **Saving Search Queries:**

```typescript
import { useUserData } from '../hooks/useUserData';

function SearchComponent() {
  const { saveSearchQuery } = useUserData();

  const handleSearch = async (query: string) => {
    // Perform search
    const results = await performSearch(query);

    // Save to history
    await saveSearchQuery(query, 'weather-api', {
      resultCount: results.length,
      timestamp: Date.now(),
    });
  };
}
```

## 🔮 Future Enhancements

1. **Real-time Updates** - WebSocket integration for live data updates
2. **Offline Support** - Local storage for offline functionality
3. **Data Caching** - Intelligent caching for better performance
4. **Bulk Operations** - Batch operations for multiple data updates
5. **Advanced Analytics** - Detailed user behavior tracking
6. **Profile Editing** - Inline profile editing capabilities

## 📝 Best Practices

1. **Always handle loading states** - Show appropriate loading indicators
2. **Implement error boundaries** - Catch and handle errors gracefully
3. **Use TypeScript interfaces** - Ensure type safety across the application
4. **Optimize API calls** - Minimize unnecessary requests
5. **Provide user feedback** - Clear status messages for all operations
6. **Handle edge cases** - Account for network failures and timeouts
7. **Test thoroughly** - Comprehensive testing of all data flows
8. **Document APIs** - Clear documentation for all endpoints and data structures
