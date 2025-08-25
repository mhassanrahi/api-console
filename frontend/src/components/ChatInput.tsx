import React from 'react';

const ChatInput: React.FC = () => {
  return (
    <div style={{ padding: 16, borderTop: '1px solid #eee', background: '#fafafa' }}>
      <form style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Type a command..."
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
