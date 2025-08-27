import { UserService, CognitoUserData } from '../services/userService';
import { AppDataSource } from '../config/database';

// Mock the database connection for testing
jest.mock('../config/database', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

describe('UserService', () => {
  let mockUserRepository: any;
  let mockPreferencesRepository: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mock repositories
    mockUserRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    };

    mockPreferencesRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    (AppDataSource.getRepository as jest.Mock)
      .mockReturnValueOnce(mockUserRepository)
      .mockReturnValueOnce(mockPreferencesRepository);
  });

  describe('getOrCreateUser', () => {
    const mockCognitoData: CognitoUserData = {
      sub: 'test-cognito-id-123',
      email: 'test@example.com',
      email_verified: true,
      given_name: 'John',
      family_name: 'Doe',
      username: 'johndoe',
    };

    it('should create new user when user does not exist', async () => {
      // Mock: User not found
      mockUserRepository.findOne.mockResolvedValue(null);

      // Mock: User creation
      const mockUser = {
        id: 'user-uuid-123',
        cognitoId: mockCognitoData.sub,
        email: mockCognitoData.email,
        username: mockCognitoData.username,
        firstName: mockCognitoData.given_name,
        lastName: mockCognitoData.family_name,
        emailVerified: mockCognitoData.email_verified,
        active: true,
        accountStatus: 'active',
        userType: 'standard',
        loginCount: 1,
        lastLogin: expect.any(Date),
        cognitoAttributes: mockCognitoData,
      };

      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      // Mock: Preferences creation
      const mockPreferences = {
        id: 'pref-uuid-123',
        userId: mockUser.id,
        theme: 'light',
        defaultApis: ['Cat Facts', 'Weather'],
        notifications: true,
        autoSaveSearch: true,
        maxSearchHistory: 100,
        preferredLanguage: 'en',
        timezone: 'UTC',
      };

      mockPreferencesRepository.create.mockReturnValue(mockPreferences);
      mockPreferencesRepository.save.mockResolvedValue(mockPreferences);

      // Execute
      const result = await UserService.getOrCreateUser(
        mockCognitoData.sub,
        mockCognitoData
      );

      // Assert
      expect(result).toEqual({
        ...mockUser,
        preferences: mockPreferences,
      });

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { cognitoId: mockCognitoData.sub },
        relations: ['preferences'],
      });

      expect(mockUserRepository.create).toHaveBeenCalledWith({
        cognitoId: mockCognitoData.sub,
        cognitoUsername: mockCognitoData.username,
        email: mockCognitoData.email,
        username: mockCognitoData.username,
        firstName: mockCognitoData.given_name,
        lastName: mockCognitoData.family_name,
        phoneNumber: undefined,
        emailVerified: mockCognitoData.email_verified,
        phoneVerified: false,
        lastLogin: expect.any(Date),
        loginCount: 1,
        cognitoAttributes: mockCognitoData,
        active: true,
        accountStatus: 'active',
        userType: 'standard',
      });

      expect(mockPreferencesRepository.create).toHaveBeenCalledWith({
        userId: mockUser.id,
        theme: 'light',
        defaultApis: ['Cat Facts', 'Weather'],
        notifications: true,
        autoSaveSearch: true,
        maxSearchHistory: 100,
        preferredLanguage: 'en',
        timezone: 'UTC',
      });
    });

    it('should sync existing user with latest Cognito data', async () => {
      // Mock: Existing user found
      const existingUser = {
        id: 'user-uuid-123',
        cognitoId: mockCognitoData.sub,
        email: 'old@example.com',
        username: 'oldusername',
        firstName: 'Old',
        lastName: 'Name',
        emailVerified: false,
        loginCount: 5,
        lastLogin: new Date('2023-01-01'),
        active: true,
        accountStatus: 'active',
        userType: 'standard',
      };

      mockUserRepository.findOne.mockResolvedValue(existingUser);

      // Mock: Updated user
      const updatedUser = {
        ...existingUser,
        email: mockCognitoData.email,
        firstName: mockCognitoData.given_name,
        lastName: mockCognitoData.family_name,
        emailVerified: mockCognitoData.email_verified,
        loginCount: 6,
        lastLogin: expect.any(Date),
        cognitoAttributes: mockCognitoData,
        cognitoUsername: mockCognitoData.username,
      };

      mockUserRepository.save.mockResolvedValue(updatedUser);

      // Execute
      const result = await UserService.getOrCreateUser(
        mockCognitoData.sub,
        mockCognitoData
      );

      // Assert
      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.save).toHaveBeenCalledWith(updatedUser);
    });
  });

  describe('getUserByCognitoId', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-uuid-123',
        cognitoId: 'test-cognito-id',
        email: 'test@example.com',
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const result = await UserService.getUserByCognitoId('test-cognito-id');

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { cognitoId: 'test-cognito-id' },
        relations: ['preferences'],
      });
    });

    it('should return null when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      const result = await UserService.getUserByCognitoId('non-existent-id');

      expect(result).toBeNull();
    });
  });

  describe('updateUserProfile', () => {
    it('should update allowed fields only', async () => {
      const userId = 'user-uuid-123';
      const profileData = {
        username: 'newusername',
        bio: 'New bio',
        website: 'https://example.com',
        // This should be ignored
        email: 'hacked@example.com',
        cognitoId: 'hacked-id',
      };

      const updatedUser = {
        id: userId,
        username: 'newusername',
        bio: 'New bio',
        website: 'https://example.com',
        email: 'original@example.com', // Should remain unchanged
      };

      mockUserRepository.update.mockResolvedValue({ affected: 1 });
      mockUserRepository.findOne.mockResolvedValue(updatedUser);

      const result = await UserService.updateUserProfile(userId, profileData);

      expect(result).toEqual(updatedUser);
      expect(mockUserRepository.update).toHaveBeenCalledWith(userId, {
        username: 'newusername',
        bio: 'New bio',
        website: 'https://example.com',
      });
    });

    it('should return null when no valid fields to update', async () => {
      const userId = 'user-uuid-123';
      const profileData = {
        email: 'hacked@example.com', // Not allowed
        cognitoId: 'hacked-id', // Not allowed
      };

      const result = await UserService.updateUserProfile(userId, profileData);

      expect(result).toBeNull();
      expect(mockUserRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      const userId = 'user-uuid-123';
      const mockSearchRepository = { count: jest.fn() };
      const mockSessionRepository = { count: jest.fn(), findOne: jest.fn() };
      const mockMessageRepository = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn(),
      };

      // Mock repository calls
      (AppDataSource.getRepository as jest.Mock)
        .mockReturnValueOnce(mockSearchRepository)
        .mockReturnValueOnce(mockSessionRepository)
        .mockReturnValueOnce(mockMessageRepository);

      mockSearchRepository.count.mockResolvedValue(10);
      mockSessionRepository.count.mockResolvedValue(5);
      mockMessageRepository.getCount.mockResolvedValue(25);
      mockSessionRepository.findOne.mockResolvedValue({
        lastActivity: new Date('2023-12-01'),
      });

      const result = await UserService.getUserStats(userId);

      expect(result).toEqual({
        totalSearches: 10,
        totalChatSessions: 5,
        totalMessages: 25,
        lastActivity: new Date('2023-12-01'),
      });
    });
  });
});
