import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { UserPreferences } from '../entities/UserPreferences';
import { SearchHistory } from '../entities/SearchHistory';
import { ChatMessage } from '../entities/ChatMessage';

// Interface for Cognito user data
export interface CognitoUserData {
  sub: string; // Cognito user ID
  email: string;
  email_verified?: boolean;
  phone_number?: string;
  phone_number_verified?: boolean;
  given_name?: string;
  family_name?: string;
  username?: string;
  [key: string]: any; // Additional Cognito attributes
}

export class UserService {
  // Get or create user by Cognito ID with full sync
  static async getOrCreateUser(
    cognitoId: string,
    cognitoData: CognitoUserData
  ): Promise<User> {
    const userRepository = AppDataSource.getRepository(User);

    let user = await userRepository.findOne({
      where: { cognitoId },
      relations: ['preferences'],
    });

    if (!user) {
      // Create new user
      user = await this.createUserFromCognito(cognitoId, cognitoData);
    } else {
      // Update existing user with latest Cognito data
      user = await this.syncUserWithCognito(user, cognitoData);
    }

    return user;
  }

  // Create new user from Cognito data
  private static async createUserFromCognito(
    cognitoId: string,
    cognitoData: CognitoUserData
  ): Promise<User> {
    const userRepository = AppDataSource.getRepository(User);
    const preferencesRepository = AppDataSource.getRepository(UserPreferences);

    // Create user entity
    const user = userRepository.create({
      cognitoId,
      cognitoUsername: cognitoData.username,
      email: cognitoData.email,
      username: cognitoData.username || cognitoData.email.split('@')[0],
      firstName: cognitoData.given_name,
      lastName: cognitoData.family_name,
      phoneNumber: cognitoData.phone_number,
      emailVerified: cognitoData.email_verified || false,
      phoneVerified: cognitoData.phone_number_verified || false,
      lastLogin: new Date(),
      loginCount: 1,
      cognitoAttributes: cognitoData,
      active: true,
      accountStatus: 'active',
      userType: 'standard',
    });

    await userRepository.save(user);
    console.log(`✅ User saved to database with ID: ${user.id}`);

    // Create default preferences
    const preferences = preferencesRepository.create({
      userId: user.id,
      theme: 'light',
      defaultApis: ['Cat Facts', 'Weather'],
      notifications: true,
      autoSaveSearch: true,
      maxSearchHistory: 100,
      preferredLanguage: 'en',
      timezone: 'UTC',
    });

    await preferencesRepository.save(preferences);
    console.log(`✅ Default preferences saved for user: ${user.id}`);
    user.preferences = preferences;

    console.log(
      `✅ Created new user: ${user.email} (${user.cognitoId}) with ID: ${user.id}`
    );
    return user;
  }

  // Sync existing user with Cognito data
  private static async syncUserWithCognito(
    user: User,
    cognitoData: CognitoUserData
  ): Promise<User> {
    const userRepository = AppDataSource.getRepository(User);

    // Update user with latest Cognito data
    const updates: Partial<User> = {
      email: cognitoData.email,
      firstName: cognitoData.given_name || user.firstName,
      lastName: cognitoData.family_name || user.lastName,
      phoneNumber: cognitoData.phone_number || user.phoneNumber,
      emailVerified: cognitoData.email_verified || user.emailVerified,
      phoneVerified: cognitoData.phone_number_verified || user.phoneVerified,
      lastLogin: new Date(),
      loginCount: user.loginCount + 1,
      cognitoAttributes: cognitoData,
      cognitoUsername: cognitoData.username || user.cognitoUsername,
    };

    // Update username if not set or if it's different
    if (!user.username || user.username === user.email.split('@')[0]) {
      updates.username =
        cognitoData.username || cognitoData.email.split('@')[0];
    }

    Object.assign(user, updates);
    await userRepository.save(user);

    console.log(`Synced user: ${user.email} (${user.cognitoId})`);
    return user;
  }

  // Get user by Cognito ID
  static async getUserByCognitoId(cognitoId: string): Promise<User | null> {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.findOne({
      where: { cognitoId },
      relations: ['preferences'],
    });
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const userRepository = AppDataSource.getRepository(User);
    return await userRepository.findOne({
      where: { email },
      relations: ['preferences'],
    });
  }

  // Update user profile (application-specific data)
  static async updateUserProfile(
    userId: string,
    profileData: Partial<User>
  ): Promise<User | null> {
    const userRepository = AppDataSource.getRepository(User);

    // Only allow updating application-specific fields
    const allowedFields = [
      'username',
      'bio',
      'website',
      'location',
      'company',
      'jobTitle',
      'avatarUrl',
      'timezone',
      'locale',
      'metadata',
    ];

    const updates: Partial<User> = {};
    for (const field of allowedFields) {
      const value = profileData[field as keyof User];
      if (value !== undefined) {
        (updates as any)[field] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return null;
    }

    await userRepository.update(userId, updates);
    return await userRepository.findOne({
      where: { id: userId },
      relations: ['preferences'],
    });
  }

  // Update user account status
  static async updateAccountStatus(
    userId: string,
    status: 'active' | 'suspended' | 'deleted'
  ): Promise<boolean> {
    const userRepository = AppDataSource.getRepository(User);
    const result = await userRepository.update(userId, {
      accountStatus: status,
    });
    return result.affected !== 0;
  }

  // Update user type
  static async updateUserType(
    userId: string,
    userType: 'standard' | 'premium' | 'admin'
  ): Promise<boolean> {
    const userRepository = AppDataSource.getRepository(User);
    const result = await userRepository.update(userId, { userType });
    return result.affected !== 0;
  }

  // Get user preferences
  static async getUserPreferences(userId: string): Promise<UserPreferences> {
    const preferencesRepository = AppDataSource.getRepository(UserPreferences);
    const userRepository = AppDataSource.getRepository(User);

    // First, verify the user exists
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      console.error(`❌ User not found for preferences: ${userId}`);
      throw new Error(`User not found: ${userId}`);
    }

    console.log(`✅ User found for preferences: ${userId} (${user.email})`);

    let preferences = await preferencesRepository.findOne({
      where: { userId },
    });

    if (!preferences) {
      console.log(`📝 Creating default preferences for user: ${userId}`);
      // Create default preferences if none exist
      preferences = preferencesRepository.create({
        userId,
        theme: 'light',
        defaultApis: ['Cat Facts', 'Weather'],
        notifications: true,
        autoSaveSearch: true,
        maxSearchHistory: 100,
        preferredLanguage: 'en',
        timezone: 'UTC',
      });

      await preferencesRepository.save(preferences);
      console.log(`✅ Default preferences created for user: ${userId}`);
    } else {
      console.log(`📋 Existing preferences found for user: ${userId}`);
    }

    return preferences;
  }

  // Save user preferences
  static async saveUserPreferences(
    userId: string,
    preferencesData: Partial<UserPreferences>
  ): Promise<boolean> {
    try {
      const preferencesRepository =
        AppDataSource.getRepository(UserPreferences);

      let preferences = await preferencesRepository.findOne({
        where: { userId },
      });

      console.log('userId:', userId);

      console.log('preferencesData', preferencesData);

      if (!preferences) {
        preferences = preferencesRepository.create({
          userId,
          ...preferencesData,
        });
      } else {
        Object.assign(preferences, preferencesData);
      }

      await preferencesRepository.save(preferences);
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }

  // Get search history
  static async getSearchHistory(
    userId: string,
    limit: number = 50
  ): Promise<SearchHistory[]> {
    const searchRepository = AppDataSource.getRepository(SearchHistory);

    return await searchRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  // Save search query
  static async saveSearchQuery(
    userId: string,
    query: string,
    api?: string,
    metadata?: Record<string, any>
  ): Promise<SearchHistory> {
    try {
      const searchRepository = AppDataSource.getRepository(SearchHistory);

      const searchHistory = searchRepository.create({
        userId,
        query,
        api,
        metadata,
        success: true,
      });

      await searchRepository.save(searchHistory);

      // Clean up old search history based on user preferences
      const preferences = await this.getUserPreferences(userId);
      if (preferences.maxSearchHistory > 0) {
        const oldSearches = await searchRepository.find({
          where: { userId },
          order: { createdAt: 'DESC' },
          skip: preferences.maxSearchHistory,
        });

        if (oldSearches.length > 0) {
          await searchRepository.remove(oldSearches);
        }
      }

      return searchHistory;
    } catch (error) {
      console.error('Error saving search query:', error);
      throw error;
    }
  }

  // Delete search from history
  static async deleteSearchFromHistory(
    userId: string,
    searchId: string
  ): Promise<boolean> {
    try {
      const searchRepository = AppDataSource.getRepository(SearchHistory);

      const search = await searchRepository.findOne({
        where: { id: searchId, userId },
      });

      if (!search) {
        return false;
      }

      await searchRepository.remove(search);
      return true;
    } catch (error) {
      console.error('Error deleting search from history:', error);
      return false;
    }
  }

  // Save chat message directly to user
  static async saveChatMessage(
    userId: string,
    messageData: {
      messageType: 'user' | 'system' | 'api_response' | 'error';
      content: string;
      command?: string;
      apiName?: string;
      responseStatus?: number;
      responseTime?: number;
      success?: boolean;
      errorMessage?: string;
      metadata?: Record<string, any>;
      apiResponse?: Record<string, any>;
    }
  ): Promise<ChatMessage> {
    const messageRepository = AppDataSource.getRepository(ChatMessage);

    const message = messageRepository.create({
      userId,
      ...messageData,
    });

    await messageRepository.save(message);
    console.log(
      `💬 Saved chat message for user ${userId}:`,
      messageData.command
    );

    return message;
  }

  // Get chat messages for a user
  static async getChatMessages(
    userId: string,
    limit: number = 100,
    messageType: 'user' | 'system' | 'api_response' | 'error' = 'api_response'
  ): Promise<ChatMessage[]> {
    const messageRepository = AppDataSource.getRepository(ChatMessage);

    const whereClause: {
      userId: string;
      messageType?: 'user' | 'system' | 'api_response' | 'error';
    } = { userId };

    if (messageType) {
      whereClause['messageType'] = messageType;
    }

    return await messageRepository.find({
      where: whereClause,
      order: { createdAt: 'ASC' },
      take: limit,
    });
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    totalSearches: number;
    totalChatSessions: number;
    totalMessages: number;
    lastActivity: Date | null;
  }> {
    const searchRepository = AppDataSource.getRepository(SearchHistory);
    const messageRepository = AppDataSource.getRepository(ChatMessage);

    const [totalSearches, totalMessages, lastMessage] = await Promise.all([
      searchRepository.count({ where: { userId } }),
      messageRepository.count({ where: { userId } }),
      messageRepository.findOne({
        where: { userId },
        order: { createdAt: 'DESC' },
      }),
    ]);

    return {
      totalSearches,
      totalChatSessions: 1, // Simplified: always 1 session per user
      totalMessages,
      lastActivity: lastMessage?.createdAt || null,
    };
  }

  // Toggle pin status of a chat message
  static async toggleMessagePin(
    userId: string,
    messageId: string
  ): Promise<{ success: boolean; pinned: boolean; error?: string }> {
    try {
      const messageRepository = AppDataSource.getRepository(ChatMessage);

      // Find the message and verify ownership
      const message = await messageRepository.findOne({
        where: { id: messageId, userId },
      });

      if (!message) {
        return { success: false, pinned: false, error: 'Message not found' };
      }

      // Toggle the pinned status
      message.pinned = !message.pinned;
      await messageRepository.save(message);

      console.log(
        ` ${message.pinned ? 'Pinned' : 'Unpinned'} message ${messageId} for user ${userId}`
      );

      return { success: true, pinned: message.pinned };
    } catch (error) {
      console.error('Error toggling message pin:', error);
      return { success: false, pinned: false, error: 'Failed to toggle pin' };
    }
  }

  // Get pinned messages for a user
  static async getPinnedMessages(userId: string): Promise<ChatMessage[]> {
    try {
      const messageRepository = AppDataSource.getRepository(ChatMessage);

      return await messageRepository.find({
        where: { userId, pinned: true },
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      console.error('Error getting pinned messages:', error);
      return [];
    }
  }
}
