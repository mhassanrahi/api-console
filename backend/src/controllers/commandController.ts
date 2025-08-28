import { AuthenticatedSocket, getCurrentDbUser } from '../middleware/auth';
import { ApiService } from '../services/apiService';
import { UserService } from '../services/userService';

export interface CommandResult {
  api: string;
  result: string;
}

export class CommandController {
  static async processCommand(
    command: string,
    socket: AuthenticatedSocket
  ): Promise<CommandResult> {
    const cmd = command.trim().toLowerCase();

    // Cat Facts
    if (cmd === 'get cat fact') {
      const response = await ApiService.getCatFact();
      return {
        api: 'Cat Facts',
        result: response.success
          ? response.data
          : response.error || 'Failed to fetch cat fact',
      };
    }

    // Chuck Norris Jokes
    if (cmd === 'get chuck joke' || cmd === 'get joke') {
      const response = await ApiService.getChuckJoke();
      return {
        api: 'Chuck Norris Jokes',
        result: response.success
          ? response.data
          : response.error || 'Failed to fetch joke',
      };
    }

    if (cmd.startsWith('search chuck ')) {
      const query = cmd.replace('search chuck ', '').trim();
      if (!query) {
        return {
          api: 'Chuck Norris Jokes',
          result: 'Please provide a search term for Chuck Norris jokes.',
        };
      }
      const response = await ApiService.searchChuckJokes(query);
      return {
        api: 'Chuck Norris Jokes',
        result: response.success
          ? response.data
          : response.error || 'Failed to search jokes',
      };
    }

    // Bored API
    if (cmd === 'get activity') {
      const response = await ApiService.getActivity();
      return {
        api: 'Bored API',
        result: response.success
          ? response.data
          : response.error || 'Failed to fetch activity',
      };
    }

    // GitHub Users
    if (cmd.startsWith('search github ')) {
      const query = cmd.replace('search github ', '').trim();
      if (!query) {
        return {
          api: 'GitHub Users',
          result: 'Please provide a username to search.',
        };
      }
      const response = await ApiService.searchGitHubUsers(query);
      return {
        api: 'GitHub Users',
        result: response.success
          ? response.data
          : response.error || 'Failed to search users',
      };
    }

    // Dictionary
    if (cmd.startsWith('define ')) {
      const word = cmd.replace('define ', '').trim();
      if (!word) {
        return {
          api: 'Dictionary',
          result: 'Please provide a word to define.',
        };
      }
      const response = await ApiService.defineWord(word);
      return {
        api: 'Dictionary',
        result: response.success
          ? response.data
          : response.error || 'Failed to fetch definition',
      };
    }

    // Weather
    if (cmd.startsWith('get weather')) {
      const city = cmd.replace('get weather', '').trim() || 'Berlin';
      const response = await ApiService.getWeather(city);
      return {
        api: 'Weather',
        result: response.success
          ? response.data
          : response.error || 'Failed to fetch weather',
      };
    }

    // Custom Backend - User Preferences
    if (cmd === 'get my preferences') {
      try {
        const dbUser = getCurrentDbUser(socket);
        if (!dbUser) {
          return {
            api: 'Custom Backend',
            result: 'User not found. Please log in again.',
          };
        }

        const preferences = await UserService.getUserPreferences(dbUser.id);
        return {
          api: 'Custom Backend',
          result: `Your preferences: Theme: ${
            preferences.theme
          }, Default APIs: ${preferences.defaultApis.join(
            ', '
          )}, Notifications: ${preferences.notifications}`,
        };
      } catch (error) {
        console.error('Error getting preferences:', error);
        return {
          api: 'Custom Backend',
          result: 'Failed to fetch preferences.',
        };
      }
    }

    // Custom Backend - Save Search
    if (cmd.startsWith('save search ')) {
      const query = cmd.replace('save search ', '').trim();
      if (!query) {
        return {
          api: 'Custom Backend',
          result: 'Please provide a search query to save.',
        };
      }
      try {
        const dbUser = getCurrentDbUser(socket);
        if (!dbUser) {
          return {
            api: 'Custom Backend',
            result: 'User not found. Please log in again.',
          };
        }

        await UserService.saveSearchQuery(dbUser.id, query);
        return {
          api: 'Custom Backend',
          result: `Search "${query}" saved successfully.`,
        };
      } catch (error) {
        console.error('Error saving search:', error);
        return {
          api: 'Custom Backend',
          result: 'Failed to save search.',
        };
      }
    }

    // Custom Backend - Get Search History
    if (cmd === 'get search history') {
      try {
        const dbUser = getCurrentDbUser(socket);
        if (!dbUser) {
          return {
            api: 'Custom Backend',
            result: 'User not found. Please log in again.',
          };
        }

        const history = await UserService.getSearchHistory(dbUser.id);
        if (history.length > 0) {
          return {
            api: 'Custom Backend',
            result: `Recent searches: ${history
              .slice(0, 3)
              .map(s => s.query)
              .join(', ')}`,
          };
        } else {
          return {
            api: 'Custom Backend',
            result: 'No search history found.',
          };
        }
      } catch (error) {
        console.error('Error getting search history:', error);
        return {
          api: 'Custom Backend',
          result: 'Failed to fetch search history.',
        };
      }
    }

    // Custom Backend - Clear Search History
    if (cmd === 'clear search history') {
      try {
        const dbUser = getCurrentDbUser(socket);
        if (!dbUser) {
          return {
            api: 'Custom Backend',
            result: 'User not found. Please log in again.',
          };
        }

        await UserService.clearSearchHistory(dbUser.id);
        return {
          api: 'Custom Backend',
          result: 'Search history cleared successfully.',
        };
      } catch (error) {
        console.error('Error clearing search history:', error);
        return {
          api: 'Custom Backend',
          result: 'Failed to clear search history.',
        };
      }
    }

    // System Commands
    if (cmd === 'clear') {
      try {
        const dbUser = getCurrentDbUser(socket);
        if (!dbUser) {
          return {
            api: 'System',
            result: 'User not found. Please log in again.',
          };
        }

        // Clear chat messages from database
        await UserService.clearChatMessages(dbUser.id);
        return {
          api: 'System',
          result: 'Chat history cleared from database.',
        };
      } catch (error) {
        console.error('Error clearing chat history:', error);
        return {
          api: 'System',
          result: 'Failed to clear chat history.',
        };
      }
    }

    if (cmd === 'help') {
      return {
        api: 'System',
        result: `Available commands:
• get cat fact - Get a random cat fact
• get chuck joke - Get a Chuck Norris joke
• search chuck [term] - Search Chuck Norris jokes
• get activity - Get a random activity suggestion
• search github [username] - Search GitHub users
• get weather [city] - Get weather for a city
• define [word] - Get word definition
• get my preferences - Get user preferences
• save search [query] - Save a search query
• get search history - Get search history
• clear search history - Clear search history
• clear - Clear chat history
• help - Show this help message`,
      };
    }

    // Unknown command
    return {
      api: 'General',
      result: `Unknown command: ${command}. Type 'help' for available commands.`,
    };
  }
}
