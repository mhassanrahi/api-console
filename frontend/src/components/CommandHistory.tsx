import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  COMMON_COMMANDS,
  HELP_CONTENT,
  getCategoryColor,
  UI_TEXT,
} from '../constants';

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
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    background: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    boxShadow:
      '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 9999,
    height: 400,
    overflow: 'hidden',
    width: 320,
    pointerEvents: 'auto',
  });
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

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
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

  // Calculate popup position
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      if (buttonRect && buttonRect.width > 0 && buttonRect.height > 0) {
        calculatePopupPosition(buttonRect);
      }
    }
  }, [isOpen]);

  const calculatePopupPosition = (buttonRect: DOMRect) => {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const popupHeight = Math.min(400, viewportHeight * 0.6); // Responsive height
    const popupWidth = 320; // Fixed width
    const margin = 20; // Safety margin

    // Calculate horizontal position relative to button center
    let left = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;

    // Ensure popup doesn't overflow viewport
    if (left + popupWidth > viewportWidth - margin) {
      left = viewportWidth - popupWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    // Calculate vertical position - always above the button
    const top = buttonRect.top - popupHeight - 8; // 8px gap above button

    const finalTop = top < margin ? buttonRect.bottom + 8 : top;

    // Calculate popup style
    const style: React.CSSProperties = {
      position: 'fixed',
      left: `${left}px`,
      top: `${finalTop}px`,
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      boxShadow:
        '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      zIndex: 9999,
      height: popupHeight,
      overflow: 'hidden',
      width: popupWidth,
      pointerEvents: 'auto',
    };

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
    <div className='relative'>
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        className='bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md cursor-pointer'
      >
        <span className='text-lg'>📋</span>
        <span className='text-sm'>{UI_TEXT.BUTTONS.HISTORY_HELP}</span>
        {recentCommands.length > 0 && (
          <span className='bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center'>
            {recentCommands.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={popupStyle}
          data-popup='command-history'
          className='bg-white rounded-xl shadow-2xl border border-gray-200'
        >
          {/* Tab Navigation */}
          <div className='bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200'>
            {[
              {
                key: 'recent',
                label: UI_TEXT.TABS.RECENT,
                count: recentCommands.length,
              },
              {
                key: 'common',
                label: UI_TEXT.TABS.COMMON,
                count: COMMON_COMMANDS.length,
              },
              { key: 'help', label: UI_TEXT.TABS.HELP, count: 0 },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleTabClick(tab.key as 'recent' | 'common' | 'help');
                }}
                className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.key
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className='flex items-center justify-center gap-2'>
                  {tab.label}
                  {tab.count > 0 && (
                    <span className='bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center'>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className='h-[calc(100%-48px)] overflow-auto'>
            {activeTab === 'recent' && (
              <div className='p-4'>
                {recentCommands.length > 0 ? (
                  <div className='space-y-2'>
                    {recentCommands.map((cmd, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          onSelectCommand(cmd.command);
                          setIsOpen(false);
                        }}
                        className='w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 text-left group cursor-pointer'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex-1'>
                            <div className='font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200'>
                              {cmd.command}
                            </div>
                            <div className='text-xs text-gray-500 mt-1'>
                              {cmd.api} • {formatTimestamp(cmd.timestamp)}
                            </div>
                          </div>
                          <div
                            className='w-3 h-3 rounded-full ml-2'
                            style={{
                              backgroundColor: getCategoryColor(cmd.api),
                            }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-8'>
                    <div className='w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center'>
                      <div className='text-xl'>📝</div>
                    </div>
                    <div className='text-gray-600 font-medium mb-1'>
                      {UI_TEXT.MESSAGES.NO_RECENT_COMMANDS.TITLE}
                    </div>
                    <div className='text-gray-500 text-sm'>
                      {UI_TEXT.MESSAGES.NO_RECENT_COMMANDS.DESCRIPTION}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'common' && (
              <div className='p-4'>
                <div className='space-y-2'>
                  {COMMON_COMMANDS.map((cmd, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        onSelectCommand(cmd.command);
                        setIsOpen(false);
                      }}
                      className='w-full p-3 bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-lg transition-all duration-200 text-left group cursor-pointer'
                    >
                      <div className='flex items-center justify-between'>
                        <div className='flex-1'>
                          <div className='font-medium text-gray-800 group-hover:text-blue-700 transition-colors duration-200'>
                            {cmd.command}
                          </div>
                          <div className='text-xs text-gray-500 mt-1'>
                            {cmd.description}
                          </div>
                        </div>
                        <div
                          className='w-3 h-3 rounded-full ml-2'
                          style={{
                            backgroundColor: getCategoryColor(cmd.category),
                          }}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'help' && (
              <div className='p-4'>
                <div className='text-sm font-semibold text-gray-800 mb-4'>
                  {UI_TEXT.LABELS.AVAILABLE_COMMANDS}
                </div>
                {HELP_CONTENT.map((section, index) => (
                  <div key={index} className='mb-6'>
                    <div
                      className='text-xs font-semibold mb-3 uppercase tracking-wide'
                      style={{ color: getCategoryColor(section.category) }}
                    >
                      {section.category}
                    </div>
                    <div className='space-y-2'>
                      {section.commands.map((cmd, cmdIndex) => (
                        <div
                          key={cmdIndex}
                          className='p-3 bg-gray-50 rounded-lg border border-gray-200'
                        >
                          <div className='font-medium text-gray-800 text-sm'>
                            {cmd.cmd}
                          </div>
                          <div className='text-gray-600 text-xs mt-1'>
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
