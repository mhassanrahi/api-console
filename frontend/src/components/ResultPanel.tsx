import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ResultPanelProps {
  apiName: string;
  globalSearchTerm?: string;
  children?: React.ReactNode;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ apiName, globalSearchTerm = '', children }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const messages = useSelector((state: RootState) =>
    state.chat.messages.filter(msg => msg.api === apiName)
  );

  const filteredMessages = useMemo(() => {
    const localTerm = searchTerm.toLowerCase();
    const globalTerm = globalSearchTerm.toLowerCase();
    
    return messages.filter(msg => {
      const matchesLocal = !localTerm || 
        msg.command.toLowerCase().includes(localTerm) || 
        msg.result.toLowerCase().includes(localTerm);
      
      const matchesGlobal = !globalTerm || 
        msg.command.toLowerCase().includes(globalTerm) || 
        msg.result.toLowerCase().includes(globalTerm);
      
      return matchesLocal && matchesGlobal;
    });
  }, [messages, searchTerm, globalSearchTerm]);
  return (
    <section style={{ flex: 1, margin: 8, padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>{apiName}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="text"
            placeholder="Search in results..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              width: 150
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                padding: '2px 6px',
                fontSize: 10,
                background: '#f8f9fa',
                border: '1px solid #ddd',
                borderRadius: 3,
                cursor: 'pointer'
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>
      <div style={{ minHeight: 40 }}>
        {filteredMessages.length > 0 ? (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {filteredMessages.map((msg, i) => (
              <li key={`${msg.api}-${msg.timestamp}-${i}`} style={{ 
                marginBottom: 8, 
                padding: 8, 
                borderRadius: 4,
                background: (searchTerm && (msg.command.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  msg.result.toLowerCase().includes(searchTerm.toLowerCase()))) || 
                  (globalSearchTerm && (msg.command.toLowerCase().includes(globalSearchTerm.toLowerCase()) || 
                  msg.result.toLowerCase().includes(globalSearchTerm.toLowerCase()))) ? '#fff3cd' : 'transparent'
              }}>
                <div style={{ fontSize: 13, color: '#888' }}>{msg.command}</div>
                <div style={{ fontWeight: 500 }}>{msg.result}</div>
                <div style={{ fontSize: 11, color: '#bbb' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </li>
            ))}
          </ul>
        ) : messages.length > 0 ? (
          <span style={{ color: '#aaa' }}>No results match your search.</span>
        ) : (
          <span style={{ color: '#aaa' }}>No results yet.</span>
        )}
        {children}
      </div>
    </section>
  );
};

export default ResultPanel;
