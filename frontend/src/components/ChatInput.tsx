import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSocket } from '../utils/useSocket';
import { useDispatch } from 'react-redux';
import { addMessage, clearMessages } from '../features/chatSlice';
import type { ChatMessage } from '../features/chatSlice';
import CommandHistory from './CommandHistory';
import CommandAutoComplete from './CommandAutoComplete';

const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAutoComplete, setShowAutoComplete] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');
  const [typingDots, setTypingDots] = useState(0);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const dispatch = useDispatch();
  const inputRef = useRef<HTMLInputElement>(null);

  // Typing indicator animation
  useEffect(() => {
    if (isProcessing) {
      const interval = setInterval(() => {
        setTypingDots(prev => (prev + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setTypingDots(0);
    }
  }, [isProcessing]);

  // Processing message animation
  useEffect(() => {
    if (isProcessing) {
      const messages = [
        'Processing your command',
        'Fetching data from API',
        'Analyzing response',
        'Preparing results',
      ];
      let index = 0;
      setProcessingMessage(messages[0]);

      const interval = setInterval(() => {
        index = (index + 1) % messages.length;
        setProcessingMessage(messages[index]);
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setProcessingMessage('');
    }
  }, [isProcessing]);

  const socketRef = useSocket(
    useCallback(
      (socket: any) => {
        // Handle real-time responses
        socket.on('api_response', (data: any) => {
          console.log('Received api_response:', data);
          const message: ChatMessage = {
            command: data.command,
            result: data.result,
            api: data.api,
            timestamp: data.timestamp,
          };
          dispatch(addMessage(message));
          setIsProcessing(false);

          // Add to command history
          if (data.command && !commandHistory.includes(data.command)) {
            setCommandHistory(prev => [data.command, ...prev.slice(0, 9)]);
          }
        });

        socket.on('command_status', (data: any) => {
          if (data.status === 'processing') {
            setIsProcessing(true);
          } else if (data.status === 'error') {
            setIsProcessing(false);
            // Add error message to chat
            const errorMessage: ChatMessage = {
              command: 'Error',
              result: data.error || 'An error occurred',
              api: 'System',
              timestamp: Date.now(),
            };
            dispatch(addMessage(errorMessage));
          }
        });

        socket.on('clear_chat_history', () => {
          dispatch(clearMessages());
        });

        socket.on('typing_indicator', (data: any) => {
          setIsProcessing(data.isProcessing);
        });

        return () => {
          socket.off('api_response');
          socket.off('command_status');
          socket.off('clear_chat_history');
          socket.off('typing_indicator');
        };
      },
      [dispatch, commandHistory]
    )
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || isProcessing) return;

    const command = input.trim();

    // Add to command history
    if (!commandHistory.includes(command)) {
      setCommandHistory(prev => [command, ...prev.slice(0, 9)]);
    }

    socketRef.current.emit('chat_command', {
      command,
      timestamp: Date.now(),
    });

    setInput('');
    setHistoryIndex(-1);
    setShowAutoComplete(false);
  };

  const handleSelectCommand = (command: string) => {
    setInput(command);
    setHistoryIndex(-1);
    inputRef.current?.focus();
  };

  const handleAutoCompleteSelect = (command: string) => {
    if (command) {
      setInput(command);
    }
    setShowAutoComplete(false);
    setHistoryIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Escape') {
      setShowAutoComplete(false);
      setHistoryIndex(-1);
    }
  };

  const getTypingIndicator = () => {
    return '.'.repeat(typingDots);
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        borderTop: '1px solid #eee',
        background: '#fafafa',
        position: 'relative',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      <form
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'nowrap',
          minWidth: 0, // Allow flex items to shrink
        }}
        onSubmit={handleSubmit}
      >
        <div
          style={{
            flex: '1 1 auto',
            minWidth: 0, // Allow input to shrink
            position: 'relative',
          }}
        >
          <input
            ref={inputRef}
            type='text'
            placeholder={
              isProcessing
                ? `Processing${getTypingIndicator()}`
                : 'Type a command... (e.g., get cat fact, get weather Berlin)'
            }
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setShowAutoComplete(e.target.value.length > 0);
              setHistoryIndex(-1);
            }}
            onFocus={() => setShowAutoComplete(input.length > 0)}
            onBlur={() => setTimeout(() => setShowAutoComplete(false), 200)}
            onKeyDown={handleKeyDown}
            disabled={isProcessing}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: isProcessing ? '1px solid #ffc107' : '1px solid #ccc',
              opacity: isProcessing ? 0.7 : 1,
              fontSize: 14,
              transition: 'all 0.2s ease',
              background: isProcessing ? '#fff3cd' : '#fff',
              boxSizing: 'border-box',
            }}
          />
          <CommandAutoComplete
            inputValue={input}
            onSelectSuggestion={handleAutoCompleteSelect}
            isVisible={showAutoComplete && !isProcessing}
          />

          {/* Command history indicator */}
          {historyIndex >= 0 && (
            <div
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: 10,
                color: '#666',
                background: '#f8f9fa',
                padding: '2px 6px',
                borderRadius: 4,
              }}
            >
              {historyIndex + 1}/{commandHistory.length}
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            flexShrink: 0, // Prevent buttons from shrinking
            alignItems: 'center',
          }}
        >
          <button
            type='submit'
            disabled={isProcessing}
            style={{
              padding: '10px 16px',
              borderRadius: 8,
              background: isProcessing ? '#6c757d' : '#007bff',
              color: '#fff',
              border: 'none',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontSize: 14,
              fontWeight: 500,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              minWidth: 'fit-content',
            }}
          >
            {isProcessing ? (
              <>
                <div
                  style={{
                    width: 12,
                    height: 12,
                    border: '2px solid transparent',
                    borderTop: '2px solid #fff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                  }}
                />
                Processing
              </>
            ) : (
              <>
                <span>📤</span>
                Send
              </>
            )}
          </button>

          <CommandHistory onSelectCommand={handleSelectCommand} />
        </div>
      </form>

      {/* Enhanced processing indicator */}
      {isProcessing && (
        <div
          style={{
            marginTop: 8,
            padding: 10,
            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
            borderRadius: 8,
            fontSize: 13,
            color: '#1976d2',
            border: '1px solid #bbdefb',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              width: 14,
              height: 14,
              border: '2px solid #1976d2',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
            }}
          />
          <div>
            <div style={{ fontWeight: 500, marginBottom: 2 }}>
              {processingMessage}
              {getTypingIndicator()}
            </div>
            <div style={{ fontSize: 11, color: '#666' }}>
              This may take a few seconds...
            </div>
          </div>
        </div>
      )}

      {/* Keyboard shortcuts help */}
      <div
        style={{
          marginTop: 6,
          fontSize: 10,
          color: '#666',
          textAlign: 'center',
        }}
      >
        💡 <strong>Ctrl+↑/↓</strong> to navigate command history •{' '}
        <strong>Esc</strong> to clear
      </div>

      <style>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default ChatInput;
