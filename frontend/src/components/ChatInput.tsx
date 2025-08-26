import React, { useState, useCallback } from 'react';
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
  const dispatch = useDispatch();
  
  const socketRef = useSocket(
    useCallback((socket: any) => {
      // Handle real-time responses
      socket.on('api_response', (data: any) => {
        console.log('Received api_response:', data);
        const message: ChatMessage = {
          command: data.command,
          result: data.result,
          api: data.api,
          timestamp: data.timestamp
        };
        dispatch(addMessage(message));
        setIsProcessing(false);
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
            timestamp: Date.now()
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
    }, [dispatch])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current || isProcessing) return;
    
    socketRef.current.emit('chat_command', { command: input, timestamp: Date.now() });
    setInput('');
  };

  const handleSelectCommand = (command: string) => {
    setInput(command);
  };

  const handleAutoCompleteSelect = (command: string) => {
    if (command) {
      setInput(command);
    }
    setShowAutoComplete(false);
  };

  return (
    <div style={{ padding: 16, borderTop: '1px solid #eee', background: '#fafafa', position: 'relative' }}>
      <form style={{ display: 'flex', gap: 8, alignItems: 'center' }} onSubmit={handleSubmit}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="text"
            placeholder={isProcessing ? "Processing..." : "Type a command... (e.g., get cat fact, get weather Berlin)"}
            value={input}
            onChange={e => {
              setInput(e.target.value);
              setShowAutoComplete(e.target.value.length > 0);
            }}
            onFocus={() => setShowAutoComplete(input.length > 0)}
            onBlur={() => setTimeout(() => setShowAutoComplete(false), 200)}
            disabled={isProcessing}
            style={{ 
              width: '100%',
              padding: 8, 
              borderRadius: 4, 
              border: '1px solid #ccc',
              opacity: isProcessing ? 0.6 : 1
            }}
          />
          <CommandAutoComplete
            inputValue={input}
            onSelectSuggestion={handleAutoCompleteSelect}
            isVisible={showAutoComplete && !isProcessing}
          />
        </div>
        <button 
          type="submit" 
          disabled={isProcessing}
          style={{ 
            padding: '8px 16px', 
            borderRadius: 4, 
            background: isProcessing ? '#6c757d' : '#007bff', 
            color: '#fff', 
            border: 'none',
            cursor: isProcessing ? 'not-allowed' : 'pointer'
          }}
        >
          {isProcessing ? 'Processing...' : 'Send'}
        </button>
        <CommandHistory onSelectCommand={handleSelectCommand} />
      </form>
      {isProcessing && (
        <div style={{ 
          marginTop: 8, 
          padding: 8, 
          background: '#e3f2fd', 
          borderRadius: 4, 
          fontSize: 14,
          color: '#1976d2'
        }}>
          ⏳ Processing your command...
        </div>
      )}
    </div>
  );
};

export default ChatInput;
