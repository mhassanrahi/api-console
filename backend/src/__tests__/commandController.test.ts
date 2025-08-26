import { CommandController } from '../controllers/commandController';
import { ApiService } from '../services/apiService';
import { UserService } from '../services/userService';

// Mock the services
jest.mock('../services/apiService');
jest.mock('../services/userService');

const mockSocket = {
  data: {
    user: {
      sub: 'test-user-id',
      email: 'test@example.com',
    },
  },
} as any;

describe('CommandController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Cat Facts Commands', () => {
    it('should handle get cat fact command', async () => {
      const mockResponse = {
        success: true,
        data: 'Cats have 230 bones in their body.',
      };
      (ApiService.getCatFact as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CommandController.processCommand(
        'get cat fact',
        mockSocket
      );

      expect(ApiService.getCatFact).toHaveBeenCalled();
      expect(result.api).toBe('Cat Facts');
      expect(result.result).toBe('Cats have 230 bones in their body.');
    });

    it('should handle cat fact API error', async () => {
      const mockResponse = {
        success: false,
        error: 'Failed to fetch cat fact',
      };
      (ApiService.getCatFact as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CommandController.processCommand(
        'get cat fact',
        mockSocket
      );

      expect(result.api).toBe('Cat Facts');
      expect(result.result).toBe('Failed to fetch cat fact');
    });
  });

  describe('Chuck Norris Jokes Commands', () => {
    it('should handle get chuck joke command', async () => {
      const mockResponse = {
        success: true,
        data: 'Chuck Norris can divide by zero.',
      };
      (ApiService.getChuckJoke as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CommandController.processCommand(
        'get chuck joke',
        mockSocket
      );

      expect(ApiService.getChuckJoke).toHaveBeenCalled();
      expect(result.api).toBe('Chuck Norris Jokes');
      expect(result.result).toBe('Chuck Norris can divide by zero.');
    });

    it('should handle search chuck jokes command', async () => {
      const mockResponse = {
        success: true,
        data: 'Chuck Norris kicked the sun.',
      };
      (ApiService.searchChuckJokes as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const result = await CommandController.processCommand(
        'search chuck kick',
        mockSocket
      );

      expect(ApiService.searchChuckJokes).toHaveBeenCalledWith('kick');
      expect(result.api).toBe('Chuck Norris Jokes');
      expect(result.result).toBe('Chuck Norris kicked the sun.');
    });

    it('should handle empty search term', async () => {
      const result = await CommandController.processCommand(
        'search chuck',
        mockSocket
      );

      expect(result.api).toBe('General');
      expect(result.result).toContain('Unknown command');
    });
  });

  describe('Weather Commands', () => {
    it('should handle get weather command', async () => {
      const mockResponse = {
        success: true,
        data: 'Weather in Berlin: 15°C, wind 10 km/h',
      };
      (ApiService.getWeather as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CommandController.processCommand(
        'get weather Berlin',
        mockSocket
      );

      expect(ApiService.getWeather).toHaveBeenCalledWith('berlin');
      expect(result.api).toBe('Weather');
      expect(result.result).toBe('Weather in Berlin: 15°C, wind 10 km/h');
    });

    it('should use default city when no city specified', async () => {
      const mockResponse = {
        success: true,
        data: 'Weather in Berlin: 15°C, wind 10 km/h',
      };
      (ApiService.getWeather as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CommandController.processCommand(
        'get weather',
        mockSocket
      );

      expect(ApiService.getWeather).toHaveBeenCalledWith('Berlin');
      expect(result.api).toBe('Weather');
    });
  });

  describe('GitHub Commands', () => {
    it('should handle search github command', async () => {
      const mockResponse = {
        success: true,
        data: 'Found: john (User) - https://github.com/john',
      };
      (ApiService.searchGitHubUsers as jest.Mock).mockResolvedValue(
        mockResponse
      );

      const result = await CommandController.processCommand(
        'search github john',
        mockSocket
      );

      expect(ApiService.searchGitHubUsers).toHaveBeenCalledWith('john');
      expect(result.api).toBe('GitHub Users');
      expect(result.result).toBe(
        'Found: john (User) - https://github.com/john'
      );
    });

    it('should handle empty search term', async () => {
      const result = await CommandController.processCommand(
        'search github',
        mockSocket
      );

      expect(result.api).toBe('General');
      expect(result.result).toContain('Unknown command');
    });
  });

  describe('Dictionary Commands', () => {
    it('should handle define word command', async () => {
      const mockResponse = {
        success: true,
        data: 'hello: Used as a greeting or to begin a phone conversation.',
      };
      (ApiService.defineWord as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CommandController.processCommand(
        'define hello',
        mockSocket
      );

      expect(ApiService.defineWord).toHaveBeenCalledWith('hello');
      expect(result.api).toBe('Dictionary');
      expect(result.result).toBe(
        'hello: Used as a greeting or to begin a phone conversation.'
      );
    });

    it('should handle empty word', async () => {
      const result = await CommandController.processCommand(
        'define',
        mockSocket
      );

      expect(result.api).toBe('General');
      expect(result.result).toContain('Unknown command');
    });
  });

  describe('Bored API Commands', () => {
    it('should handle get activity command', async () => {
      const mockResponse = {
        success: true,
        data: 'Learn a new programming language (Type: education, Participants: 1)',
      };
      (ApiService.getActivity as jest.Mock).mockResolvedValue(mockResponse);

      const result = await CommandController.processCommand(
        'get activity',
        mockSocket
      );

      expect(ApiService.getActivity).toHaveBeenCalled();
      expect(result.api).toBe('Bored API');
      expect(result.result).toBe(
        'Learn a new programming language (Type: education, Participants: 1)'
      );
    });
  });

  describe('User Preferences Commands', () => {
    it('should handle get my preferences command', async () => {
      const mockPreferences = {
        theme: 'dark',
        defaultApis: ['Cat Facts', 'Weather'],
        notifications: true,
      };
      (UserService.getUserPreferences as jest.Mock).mockResolvedValue(
        mockPreferences
      );

      const result = await CommandController.processCommand(
        'get my preferences',
        mockSocket
      );

      expect(UserService.getUserPreferences).toHaveBeenCalledWith(
        'test-user-id'
      );
      expect(result.api).toBe('Custom Backend');
      expect(result.result).toContain('Theme: dark');
      expect(result.result).toContain('Default APIs: Cat Facts, Weather');
    });

    it('should handle save search command', async () => {
      const mockSearchHistory = {
        id: 1234567890,
        query: 'get weather Berlin',
        timestamp: Date.now(),
      };
      (UserService.saveSearchQuery as jest.Mock).mockResolvedValue(
        mockSearchHistory
      );

      const result = await CommandController.processCommand(
        'save search get weather Berlin',
        mockSocket
      );

      expect(UserService.saveSearchQuery).toHaveBeenCalledWith(
        'test-user-id',
        'get weather berlin'
      );
      expect(result.api).toBe('Custom Backend');
      expect(result.result).toBe(
        'Search "get weather berlin" saved successfully.'
      );
    });

    it('should handle empty search query', async () => {
      const result = await CommandController.processCommand(
        'save search',
        mockSocket
      );

      expect(result.api).toBe('General');
      expect(result.result).toContain('Unknown command');
    });

    it('should handle get search history command', async () => {
      const mockHistory = [
        { id: 1, query: 'get weather Berlin', timestamp: Date.now() - 3600000 },
        { id: 2, query: 'get cat fact', timestamp: Date.now() - 7200000 },
      ];
      (UserService.getSearchHistory as jest.Mock).mockResolvedValue(
        mockHistory
      );

      const result = await CommandController.processCommand(
        'get search history',
        mockSocket
      );

      expect(UserService.getSearchHistory).toHaveBeenCalledWith('test-user-id');
      expect(result.api).toBe('Custom Backend');
      expect(result.result).toContain('get weather Berlin');
      expect(result.result).toContain('get cat fact');
    });
  });

  describe('System Commands', () => {
    it('should handle clear command', async () => {
      const result = await CommandController.processCommand(
        'clear',
        mockSocket
      );

      expect(result.api).toBe('System');
      expect(result.result).toBe('Chat history cleared.');
    });

    it('should handle help command', async () => {
      const result = await CommandController.processCommand('help', mockSocket);

      expect(result.api).toBe('System');
      expect(result.result).toContain('get cat fact');
      expect(result.result).toContain('get chuck joke');
      expect(result.result).toContain('get activity');
      expect(result.result).toContain('search github');
      expect(result.result).toContain('get weather');
      expect(result.result).toContain('define');
      expect(result.result).toContain('get my preferences');
      expect(result.result).toContain('save search');
      expect(result.result).toContain('get search history');
      expect(result.result).toContain('clear');
      expect(result.result).toContain('help');
    });
  });

  describe('Unknown Commands', () => {
    it('should handle unknown commands', async () => {
      const result = await CommandController.processCommand(
        'unknown command',
        mockSocket
      );

      expect(result.api).toBe('General');
      expect(result.result).toContain('Unknown command: unknown command');
      expect(result.result).toContain("Type 'help' for available commands");
    });
  });

  describe('Error Handling', () => {
    it('should handle API service errors gracefully', async () => {
      (ApiService.getCatFact as jest.Mock).mockResolvedValue({
        success: false,
        error: 'Failed to fetch cat fact',
      });

      const result = await CommandController.processCommand(
        'get cat fact',
        mockSocket
      );

      expect(result.api).toBe('Cat Facts');
      expect(result.result).toBe('Failed to fetch cat fact');
    });

    it('should handle user service errors gracefully', async () => {
      (UserService.getUserPreferences as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      const result = await CommandController.processCommand(
        'get my preferences',
        mockSocket
      );

      expect(result.api).toBe('Custom Backend');
      expect(result.result).toBe('Failed to fetch preferences.');
    });
  });
});
