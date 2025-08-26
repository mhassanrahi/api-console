// External API service for handling all third-party API calls

export interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class ApiService {
  // Cat Facts API
  static async getCatFact(): Promise<ApiResponse> {
    try {
      const response = await fetch('https://catfact.ninja/fact');
      const data = await response.json();
      return {
        success: true,
        data: data.fact || 'No fact found.'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch cat fact'
      };
    }
  }

  // Chuck Norris Jokes API
  static async getChuckJoke(): Promise<ApiResponse> {
    try {
      const response = await fetch('https://api.chucknorris.io/jokes/random');
      const data = await response.json();
      return {
        success: true,
        data: data.value || 'No joke found.'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch Chuck Norris joke'
      };
    }
  }

  static async searchChuckJokes(query: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`https://api.chucknorris.io/jokes/search?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.result && data.result.length > 0) {
        return {
          success: true,
          data: data.result[0].value
        };
      } else {
        return {
          success: false,
          error: `No Chuck Norris jokes found for "${query}".`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search Chuck Norris jokes'
      };
    }
  }

  // Bored API
  static async getActivity(): Promise<ApiResponse> {
    try {
      const response = await fetch('https://www.boredapi.com/api/activity/');
      const data = await response.json();
      
      if (data.activity) {
        return {
          success: true,
          data: `${data.activity} (Type: ${data.type}, Participants: ${data.participants})`
        };
      } else {
        return {
          success: false,
          error: 'No activity found.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch activity'
      };
    }
  }

  // GitHub Users API
  static async searchGitHubUsers(query: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`https://api.github.com/search/users?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.items && data.items.length > 0) {
        const user = data.items[0];
        return {
          success: true,
          data: `Found: ${user.login} (${user.type}) - ${user.html_url}`
        };
      } else {
        return {
          success: false,
          error: `No GitHub users found for "${query}".`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to search GitHub users'
      };
    }
  }

  // Dictionary API
  static async defineWord(word: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data[0]?.meanings?.[0]?.definitions?.[0]?.definition) {
          return {
            success: true,
            data: `${word}: ${data[0].meanings[0].definitions[0].definition}`
          };
        } else {
          return {
            success: false,
            error: `No definition found for "${word}".`
          };
        }
      } else {
        return {
          success: false,
          error: `No definition found for "${word}".`
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch word definition'
      };
    }
  }

  // Weather API
  static async getWeather(city: string): Promise<ApiResponse> {
    try {
      const cityCoords: Record<string, { lat: number; lon: number }> = {
        berlin: { lat: 52.52, lon: 13.41 },
        london: { lat: 51.51, lon: -0.13 },
        paris: { lat: 48.85, lon: 2.35 },
        tokyo: { lat: 35.68, lon: 139.76 },
      };
      
      const coords = cityCoords[city.toLowerCase()] || cityCoords['berlin'];
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.current_weather) {
        return {
          success: true,
          data: `Weather in ${city}: ${data.current_weather.temperature}°C, wind ${data.current_weather.windspeed} km/h`
        };
      } else {
        return {
          success: false,
          error: 'Weather data not found.'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Failed to fetch weather data'
      };
    }
  }
}
