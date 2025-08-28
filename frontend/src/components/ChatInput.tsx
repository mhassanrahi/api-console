import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSocket } from '../utils/useSocket';
import { useDispatch } from 'react-redux';
import { addMessage, clearMessages } from '../features/chatSlice';
import type { ChatMessage } from '../features/chatSlice';
import CommandHistory from './CommandHistory';
import CommandAutoComplete from './CommandAutoComplete';
import { PROCESSING_MESSAGES, UI_TEXT } from '../constants';

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
      let index = 0;
      setProcessingMessage(PROCESSING_MESSAGES[0]);

      const interval = setInterval(() => {
        index = (index + 1) % PROCESSING_MESSAGES.length;
        setProcessingMessage(PROCESSING_MESSAGES[index]);
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
            id: data.id,
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
    <div className='bg-white border-t border-gray-200 shadow-lg'>
      <div className='px-6 py-4'>
        <form onSubmit={handleSubmit} className='flex gap-3 items-center'>
          <div className='flex-1 relative'>
            <input
              ref={inputRef}
              type='text'
              placeholder={
                isProcessing
                  ? `${UI_TEXT.PLACEHOLDERS.PROCESSING}${getTypingIndicator()}`
                  : UI_TEXT.PLACEHOLDERS.COMMAND_INPUT
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
              className={`w-full px-4 py-3 pl-12 pr-4 rounded-lg border transition-all duration-200 placeholder-gray-400 ${
                isProcessing
                  ? 'border-yellow-300 bg-yellow-50 opacity-70'
                  : 'border-gray-300 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20'
              }`}
            />
            <div className='absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none'>
              <div
                className={`text-lg ${isProcessing ? 'text-yellow-500' : 'text-gray-400'}`}
              >
                💬
              </div>
            </div>
            <CommandAutoComplete
              inputValue={input}
              onSelectSuggestion={handleAutoCompleteSelect}
              isVisible={showAutoComplete && !isProcessing}
            />

            {/* Command history indicator */}
            {historyIndex >= 0 && (
              <div className='absolute right-3 top-1/2 transform -translate-y-1/2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium'>
                {historyIndex + 1}/{commandHistory.length}
              </div>
            )}
          </div>

          <div className='flex gap-3 items-center'>
            <button
              type='submit'
              disabled={isProcessing}
              className={`font-medium py-3 px-6 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm ${
                isProcessing
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer'
              }`}
            >
              {isProcessing ? (
                <>
                  <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                  {UI_TEXT.BUTTONS.PROCESSING}
                </>
              ) : (
                <>
                  <span className='text-lg'>📤</span>
                  {UI_TEXT.BUTTONS.SEND}
                </>
              )}
            </button>

            <CommandHistory onSelectCommand={handleSelectCommand} />
          </div>
        </form>

        {/* Enhanced processing indicator */}
        {isProcessing && (
          <div className='mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg'>
            <div className='flex items-center gap-3'>
              <div className='w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
              <div>
                <div className='text-blue-700 font-medium text-sm'>
                  {processingMessage}
                  {getTypingIndicator()}
                </div>
                <div className='text-blue-600 text-xs'>
                  {UI_TEXT.MESSAGES.PROCESSING.TITLE}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Keyboard shortcuts help */}
        <div className='mt-3 text-center text-xs text-gray-500'>
          💡 <strong>{UI_TEXT.SHORTCUTS.HISTORY_NAVIGATION}</strong> •{' '}
          <strong>{UI_TEXT.SHORTCUTS.CLEAR}</strong>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
