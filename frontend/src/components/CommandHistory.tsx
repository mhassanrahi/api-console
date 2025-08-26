import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface CommandHistoryProps {
  onSelectCommand: (command: string) => void;
}

const CommandHistory: React.FC<CommandHistoryProps> = ({ onSelectCommand }) => {
  const [isOpen, setIsOpen] = useState(false);
  const messages = useSelector((state: RootState) => state.chat.messages);

  // Get unique commands from recent messages
  const recentCommands = Array.from(
    new Set(messages.slice(-10).map(msg => msg.command))
  ).reverse();

  const commonCommands = [
    'get cat fact',
    'get chuck joke',
    'get activity',
    'get weather Berlin',
    'search github john',
    'define hello',
    'get my preferences',
    'get search history'
  ];

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '6px 12px',
          background: '#f8f9fa',
          border: '1px solid #ddd',
          borderRadius: 4,
          cursor: 'pointer',
          fontSize: 12
        }}
      >
        📋 History & Help
      </button>
      
      {isOpen && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: 0,
          right: 0,
          background: '#fff',
          border: '1px solid #ddd',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: 300,
          overflow: 'auto',
          marginBottom: 8
        }}>
          <div style={{ padding: 12, borderBottom: '1px solid #eee' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Recent Commands</h4>
            {recentCommands.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {recentCommands.map((command, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onSelectCommand(command);
                      setIsOpen(false);
                    }}
                    style={{
                      padding: '4px 8px',
                      background: 'transparent',
                      border: '1px solid #e9ecef',
                      borderRadius: 4,
                      cursor: 'pointer',
                      fontSize: 12,
                      textAlign: 'left',
                      color: '#495057'
                    }}
                  >
                    {command}
                  </button>
                ))}
              </div>
            ) : (
              <span style={{ color: '#6c757d', fontSize: 12 }}>No recent commands</span>
            )}
          </div>
          
          <div style={{ padding: 12 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 14 }}>Common Commands</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {commonCommands.map((command, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onSelectCommand(command);
                    setIsOpen(false);
                  }}
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: '1px solid #e9ecef',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 12,
                    textAlign: 'left',
                    color: '#495057'
                  }}
                >
                  {command}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommandHistory;
