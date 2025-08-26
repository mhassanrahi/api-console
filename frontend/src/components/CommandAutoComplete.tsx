import React, { useState, useEffect, useRef } from 'react';

interface CommandSuggestion {
  command: string;
  description: string;
  category: string;
}

interface CommandAutoCompleteProps {
  inputValue: string;
  onSelectSuggestion: (command: string) => void;
  isVisible: boolean;
}

const COMMAND_SUGGESTIONS: CommandSuggestion[] = [
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

const CommandAutoComplete: React.FC<CommandAutoCompleteProps> = ({
  inputValue,
  onSelectSuggestion,
  isVisible,
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    CommandSuggestion[]
  >([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!inputValue.trim() || !isVisible) {
      setFilteredSuggestions([]);
      setSelectedIndex(0);
      return;
    }

    const filtered = COMMAND_SUGGESTIONS.filter(
      suggestion =>
        suggestion.command.toLowerCase().includes(inputValue.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(inputValue.toLowerCase())
    );

    setFilteredSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
    setSelectedIndex(0);
  }, [inputValue, isVisible]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isVisible || filteredSuggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredSuggestions[selectedIndex]) {
            onSelectSuggestion(filteredSuggestions[selectedIndex].command);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onSelectSuggestion('');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, filteredSuggestions, selectedIndex, onSelectSuggestion]);

  if (!isVisible || filteredSuggestions.length === 0) {
    return null;
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Fun: '#ff6b6b',
      Development: '#4ecdc4',
      Weather: '#45b7d1',
      Reference: '#96ceb4',
      User: '#feca57',
      System: '#ff9ff3',
    };
    return colors[category] || '#95a5a6';
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        bottom: '100%',
        left: 0,
        right: 0,
        background: '#fff',
        border: '1px solid #ddd',
        borderRadius: 8,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxHeight: 300,
        overflow: 'auto',
        zIndex: 1000,
        marginBottom: 8,
      }}
    >
      <div style={{ padding: 8, borderBottom: '1px solid #eee' }}>
        <div style={{ fontSize: 12, color: '#666', fontWeight: 500 }}>
          💡 Command Suggestions ({filteredSuggestions.length})
        </div>
      </div>

      <div>
        {filteredSuggestions.map((suggestion, index) => (
          <div
            key={suggestion.command}
            onClick={() => onSelectSuggestion(suggestion.command)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              background: index === selectedIndex ? '#f8f9fa' : 'transparent',
              borderBottom: '1px solid #f1f3f4',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: getCategoryColor(suggestion.category),
                flexShrink: 0,
              }}
            />

            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#333',
                  marginBottom: 2,
                }}
              >
                {suggestion.command}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#666',
                }}
              >
                {suggestion.description}
              </div>
            </div>

            <div
              style={{
                fontSize: 10,
                color: '#999',
                background: '#f8f9fa',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {suggestion.category}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          padding: 8,
          borderTop: '1px solid #eee',
          fontSize: 11,
          color: '#666',
          textAlign: 'center',
        }}
      >
        Use ↑↓ to navigate, Enter to select, Esc to close
      </div>
    </div>
  );
};

export default CommandAutoComplete;
