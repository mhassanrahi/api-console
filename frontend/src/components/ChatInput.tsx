import React, { useState, useCallback } from 'react';
import { useSocket } from '../utils/useSocket';


const ChatInput: React.FC = () => {
  const [input, setInput] = useState('');
  const socketRef = useSocket(
    useCallback((socket) => {
      // Optionally handle socket events here
    }, [])
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socketRef.current) return;
    socketRef.current.emit('chat_command', { command: input, timestamp: Date.now() });
    console.log('Sent command:', input);
    setInput('');
  };

  return (
    <div style={{ padding: 16, borderTop: '1px solid #eee', background: '#fafafa' }}>
      <form style={{ display: 'flex', gap: 8 }} onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Type a command..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: 4, background: '#007bff', color: '#fff', border: 'none' }}>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
