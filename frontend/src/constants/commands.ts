export interface CommandSuggestion {
  command: string;
  description: string;
  category: string;
}

export interface CommonCommand {
  command: string;
  category: string;
  description: string;
}

export interface HelpSection {
  category: string;
  commands: {
    cmd: string;
    desc: string;
  }[];
}

export const COMMAND_SUGGESTIONS: CommandSuggestion[] = [
  {
    command: 'get cat fact',
    description: 'Get a random cat fact',
    category: 'Fun',
  },
  {
    command: 'get chuck joke',
    description: 'Get a Chuck Norris joke',
    category: 'Fun',
  },
  {
    command: 'search chuck',
    description: 'Search Chuck Norris jokes',
    category: 'Fun',
  },
  {
    command: 'get activity',
    description: 'Get a random activity suggestion',
    category: 'Fun',
  },
  {
    command: 'search github',
    description: 'Search GitHub users',
    category: 'Development',
  },
  {
    command: 'get weather',
    description: 'Get weather for a city',
    category: 'Weather',
  },
  {
    command: 'define',
    description: 'Get word definition',
    category: 'Reference',
  },
  {
    command: 'get my preferences',
    description: 'Get user preferences',
    category: 'User',
  },
  {
    command: 'save search',
    description: 'Save a search query',
    category: 'User',
  },
  {
    command: 'get search history',
    description: 'Get search history',
    category: 'User',
  },
  { command: 'clear', description: 'Clear chat history', category: 'System' },
  {
    command: 'help',
    description: 'Show available commands',
    category: 'System',
  },
];

export const COMMON_COMMANDS: CommonCommand[] = [
  {
    command: 'get cat fact',
    category: 'Fun',
    description: 'Get a random cat fact',
  },
  {
    command: 'get chuck joke',
    category: 'Fun',
    description: 'Get a Chuck Norris joke',
  },
  {
    command: 'get activity',
    category: 'Fun',
    description: 'Get a random activity',
  },
  {
    command: 'get weather Berlin',
    category: 'Weather',
    description: 'Get weather for Berlin',
  },
  {
    command: 'search github john',
    category: 'Development',
    description: 'Search GitHub users',
  },
  {
    command: 'define hello',
    category: 'Reference',
    description: 'Get word definition',
  },
  {
    command: 'get my preferences',
    category: 'User',
    description: 'Get user preferences',
  },
  {
    command: 'get search history',
    category: 'User',
    description: 'Get search history',
  },
  { command: 'clear', category: 'System', description: 'Clear chat history' },
  {
    command: 'help',
    category: 'System',
    description: 'Show available commands',
  },
];

export const HELP_CONTENT: HelpSection[] = [
  {
    category: 'Weather Commands',
    commands: [
      { cmd: 'get weather [city]', desc: 'Get weather for a specific city' },
      { cmd: 'get weather Berlin', desc: 'Get weather for Berlin' },
    ],
  },
  {
    category: 'Fun & Entertainment',
    commands: [
      { cmd: 'get cat fact', desc: 'Get a random cat fact' },
      { cmd: 'get chuck joke', desc: 'Get a Chuck Norris joke' },
      { cmd: 'search chuck [term]', desc: 'Search Chuck Norris jokes' },
      { cmd: 'get activity', desc: 'Get a random activity suggestion' },
    ],
  },
  {
    category: 'Development & Search',
    commands: [
      { cmd: 'search github [username]', desc: 'Search GitHub users' },
      { cmd: 'define [word]', desc: 'Get word definition' },
    ],
  },
  {
    category: 'User & System',
    commands: [
      { cmd: 'get my preferences', desc: 'Get user preferences' },
      { cmd: 'save search [query]', desc: 'Save a search query' },
      { cmd: 'get search history', desc: 'Get search history' },
      { cmd: 'clear', desc: 'Clear chat history' },
      { cmd: 'help', desc: 'Show this help' },
    ],
  },
];

export const CATEGORY_COLORS: Record<string, string> = {
  Fun: '#ff6b6b',
  Weather: '#45b7d1',
  Development: '#4ecdc4',
  Reference: '#96ceb4',
  User: '#feca57',
  System: '#ff9ff3',
};

export const getCategoryColor = (category: string): string => {
  return CATEGORY_COLORS[category] || '#95a5a6';
};
