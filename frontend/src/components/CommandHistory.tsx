import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface CommandHistoryProps {
  onSelectCommand: (command: string) => void;
}

interface CommandWithTimestamp {
  command: string;
  timestamp: number;
  api: string;
}

const CommandHistory: React.FC<CommandHistoryProps> = ({ onSelectCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'recent' | 'common' | 'help'>(
    'recent'
  );
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});
  const messages = useSelector((state: RootState) => state.chat.messages);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Get unique commands from recent messages with timestamps
  const recentCommands = useMemo(() => {
    const commandMap = new Map<string, CommandWithTimestamp>();

    messages.slice(-20).forEach(msg => {
      if (!commandMap.has(msg.command)) {
        commandMap.set(msg.command, {
          command: msg.command,
          timestamp: msg.timestamp,
          api: msg.api,
        });
      }
    });

    return Array.from(commandMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 10);
  }, [messages]);

  const commonCommands = [
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

  const helpContent = [
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

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Fun: '#ff6b6b',
      Weather: '#45b7d1',
      Development: '#4ecdc4',
      Reference: '#96ceb4',
      User: '#feca57',
      System: '#ff9ff3',
    };
    return colors[category] || '#95a5a6';
  };

  // Handle click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const popupElement = document.querySelector(
        '[data-popup="command-history"]'
      );

      if (
        buttonRef.current &&
        !buttonRef.current.contains(target) &&
        popupElement &&
        !popupElement.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Calculate popup position to prevent cropping
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      // Add a longer delay to ensure DOM is fully rendered, especially on page reload
      const timeoutId = setTimeout(() => {
        const buttonRect = buttonRef.current?.getBoundingClientRect();
        if (!buttonRect) return;

        // Double-check that we have valid coordinates
        if (buttonRect.top === 0 && buttonRect.left === 0) {
          // Button position not ready yet, try again
          setTimeout(() => {
            const retryRect = buttonRef.current?.getBoundingClientRect();
            if (retryRect && retryRect.top > 0) {
              calculatePopupPosition(retryRect);
            }
          }, 100);
          return;
        }

        calculatePopupPosition(buttonRect);
      }, 100); // Increased delay for page reload scenarios

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  const calculatePopupPosition = (buttonRect: DOMRect) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = Math.min(400, viewportHeight * 0.6); // Responsive height
    const popupWidth = 320; // Fixed width
    const margin = 20; // Safety margin

    // Calculate horizontal position to prevent overflow
    let left = buttonRect.left;
    if (left + popupWidth > viewportWidth - margin) {
      left = viewportWidth - popupWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    // Calculate popup style
    const style: React.CSSProperties = {
      position: 'fixed',
      left: `${left}px`,
      background: '#fff',
      border: '1px solid #ddd',
      borderRadius: 8,
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      zIndex: 9999,
      height: popupHeight,
      overflow: 'hidden',
      width: popupWidth,
      pointerEvents: 'auto',
    };

    // Always position above the button to avoid overlapping the input field
    style.bottom = `${viewportHeight - buttonRect.top + 8}px`;

    setPopupStyle(style);
  };

  const handleTabClick = (tabKey: 'recent' | 'common' | 'help') => {
    setActiveTab(tabKey);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        style={{
          padding: '6px 12px',
          background: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          whiteSpace: 'nowrap',
        }}
      >
        📋 History & Help
        {recentCommands.length > 0 && (
          <span
            style={{
              background: '#007bff',
              color: 'white',
              borderRadius: '50%',
              width: 16,
              height: 16,
              fontSize: 10,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {recentCommands.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div style={popupStyle} data-popup='command-history'>
          {/* Tab Navigation */}
          <div
            style={{
              display: 'flex',
              borderBottom: '1px solid #eee',
              background: '#f8f9fa',
            }}
          >
            {[
              { key: 'recent', label: 'Recent', count: recentCommands.length },
              { key: 'common', label: 'Common', count: commonCommands.length },
              { key: 'help', label: 'Help', count: 0 },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabClick(tab.key as 'recent' | 'common' | 'help');
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: activeTab === tab.key ? '#fff' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: activeTab === tab.key ? 500 : 400,
                  color: activeTab === tab.key ? '#007bff' : '#666',
                  borderBottom:
                    activeTab === tab.key ? '2px solid #007bff' : 'none',
                  position: 'relative',
                  zIndex: 10000,
                  pointerEvents: 'auto',
                }}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    style={{
                      background: '#007bff',
                      color: 'white',
                      borderRadius: 10,
                      padding: '1px 6px',
                      fontSize: 10,
                      marginLeft: 4,
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div style={{ height: 'calc(100% - 40px)', overflow: 'auto' }}>
            {activeTab === 'recent' && (
              <div style={{ padding: 12 }}>
                {recentCommands.length > 0 ? (
                  <div
                    style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                  >
                    {recentCommands.map((cmd, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          onSelectCommand(cmd.command);
                          setIsOpen(false);
                        }}
                        style={{
                          padding: '8px 12px',
                          background: 'transparent',
                          border: '1px solid #e9ecef',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontSize: 12,
                          textAlign: 'left',
                          color: '#495057',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 500 }}>{cmd.command}</div>
                          <div style={{ fontSize: 10, color: '#6c757d' }}>
                            {cmd.api} • {formatTimestamp(cmd.timestamp)}
                          </div>
                        </div>
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: getCategoryColor(cmd.api),
                          }}
                        />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: 20,
                      color: '#6c757d',
                    }}
                  >
                    <div style={{ fontSize: 16, marginBottom: 8 }}>📝</div>
                    <div>No recent commands</div>
                    <div style={{ fontSize: 11, marginTop: 4 }}>
                      Start chatting to see your history
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'common' && (
              <div style={{ padding: 12 }}>
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 6 }}
                >
                  {commonCommands.map((cmd, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSelectCommand(cmd.command);
                        setIsOpen(false);
                      }}
                      style={{
                        padding: '8px 12px',
                        background: 'transparent',
                        border: '1px solid #e9ecef',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontSize: 12,
                        textAlign: 'left',
                        color: '#495057',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>{cmd.command}</div>
                        <div style={{ fontSize: 10, color: '#6c757d' }}>
                          {cmd.description}
                        </div>
                      </div>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: getCategoryColor(cmd.category),
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div style={{ padding: 12 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    marginBottom: 12,
                    color: '#333',
                  }}
                >
                  Available Commands
                </div>
                {helpContent.map((section, index) => (
                  <div key={index} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        color: getCategoryColor(section.category),
                        marginBottom: 6,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {section.category}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                      }}
                    >
                      {section.commands.map((cmd, cmdIndex) => (
                        <div
                          key={cmdIndex}
                          style={{
                            padding: '6px 8px',
                            background: '#f8f9fa',
                            borderRadius: 4,
                            fontSize: 11,
                          }}
                        >
                          <div style={{ fontWeight: 500, color: '#333' }}>
                            {cmd.cmd}
                          </div>
                          <div style={{ color: '#6c757d', fontSize: 10 }}>
                            {cmd.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandHistory;
