export const PROCESSING_MESSAGES = [
  'Processing your command',
  'Fetching data from API',
  'Analyzing response',
  'Preparing results',
];

export const UI_TEXT = {
  PLACEHOLDERS: {
    SEARCH: 'Search across all APIs...',
    COMMAND_INPUT: 'Type a command... (e.g., get cat fact, get weather Berlin)',
    PROCESSING: 'Processing',
  },
  BUTTONS: {
    SEARCH: 'Search',
    CLEAR: 'Clear',
    SEND: 'Send',
    PROCESSING: 'Processing',
    LOGOUT: 'Logout',
    HISTORY_HELP: 'History & Help',
  },
  MESSAGES: {
    NO_APIS_SELECTED: {
      TITLE: 'No APIs Selected',
      DESCRIPTION:
        'Select APIs from the sidebar to start using the application and explore different data sources.',
    },
    NO_RESULTS: {
      TITLE: 'No results yet',
      DESCRIPTION: 'Start chatting to see results here',
    },
    NO_SEARCH_RESULTS: {
      TITLE: 'No results match your search',
      DESCRIPTION: 'Try adjusting your search terms',
    },
    NO_RECENT_COMMANDS: {
      TITLE: 'No recent commands',
      DESCRIPTION: 'Start chatting to see your history',
    },
    PROCESSING: {
      TITLE: 'This may take a few seconds...',
    },
  },
  SHORTCUTS: {
    HISTORY_NAVIGATION: 'Ctrl+↑/↓ to navigate command history',
    CLEAR: 'Esc to clear',
    AUTOCOMPLETE: 'Use ↑↓ to navigate, Enter to select, Esc to close',
  },
  LABELS: {
    APIS: 'APIs',
    SELECT_DATA_SOURCES: 'Select your data sources',
    PINNED_MESSAGES: 'Pinned Messages',
    COMMAND_SUGGESTIONS: 'Command Suggestions',
    AVAILABLE_COMMANDS: 'Available Commands',
  },
  TABS: {
    RECENT: 'Recent',
    COMMON: 'Common',
    HELP: 'Help',
  },
} as const;
