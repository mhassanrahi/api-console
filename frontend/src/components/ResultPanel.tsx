import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface ResultPanelProps {
  apiName: string;
  children?: React.ReactNode;
}

const ResultPanel: React.FC<ResultPanelProps> = ({ apiName, children }) => {
  const messages = useSelector((state: RootState) =>
    state.chat.messages.filter(msg => msg.api === apiName)
  );
  return (
    <section style={{ flex: 1, margin: 8, padding: 16, background: '#fff', borderRadius: 8, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <h3>{apiName}</h3>
      <div style={{ minHeight: 40 }}>
        {messages.length > 0 ? (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {messages.map((msg, i) => (
              <li key={i} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 13, color: '#888' }}>{msg.command}</div>
                <div style={{ fontWeight: 500 }}>{msg.result}</div>
                <div style={{ fontSize: 11, color: '#bbb' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </li>
            ))}
          </ul>
        ) : (
          <span style={{ color: '#aaa' }}>No results yet.</span>
        )}
        {children}
      </div>
    </section>
  );
};

export default ResultPanel;
