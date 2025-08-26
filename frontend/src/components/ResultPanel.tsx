import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { togglePinnedMessage } from '../features/chatSlice';

interface ResultPanelProps {
  apiName: string;
  globalSearchTerm?: string;
  children?: React.ReactNode;
}

const ResultPanel: React.FC<ResultPanelProps> = ({
  apiName,
  globalSearchTerm = '',
  children,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();

  const messages = useSelector((state: RootState) =>
    state.chat.messages.filter(msg => msg.api === apiName)
  );

  const filteredMessages = useMemo(() => {
    const localTerm = searchTerm.toLowerCase();
    const globalTerm = globalSearchTerm.toLowerCase();

    return messages.filter(msg => {
      const matchesLocal =
        !localTerm ||
        msg.command.toLowerCase().includes(localTerm) ||
        msg.result.toLowerCase().includes(localTerm);

      const matchesGlobal =
        !globalTerm ||
        msg.command.toLowerCase().includes(globalTerm) ||
        msg.result.toLowerCase().includes(globalTerm);

      return matchesLocal && matchesGlobal;
    });
  }, [messages, searchTerm, globalSearchTerm]);

  const pinnedMessages = messages.filter(msg => msg.pinned);
  const unpinnedMessages = filteredMessages.filter(msg => !msg.pinned);

  const handlePinMessage = (messageId: string) => {
    dispatch(togglePinnedMessage(messageId));
  };

  return (
    <section
      style={{
        flex: 1,
        margin: 8,
        padding: 16,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
        zIndex: isExpanded ? 10 : 1,
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <h3
          style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}
        >
          {apiName}
          {pinnedMessages.length > 0 && (
            <span
              style={{
                fontSize: 12,
                background: '#ffd700',
                color: '#333',
                padding: '2px 6px',
                borderRadius: 10,
                fontWeight: 'normal',
              }}
            >
              📌 {pinnedMessages.length}
            </span>
          )}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type='text'
            placeholder='Search in results...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              padding: '4px 8px',
              fontSize: 12,
              border: '1px solid #ddd',
              borderRadius: 4,
              width: 150,
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
                cursor: 'pointer',
              }}
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div style={{ minHeight: 40 }}>
        {/* Pinned Messages Section */}
        {pinnedMessages.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h4
              style={{
                fontSize: 12,
                color: '#666',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              📌 Pinned Messages
            </h4>
            <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
              {pinnedMessages.map((msg, i) => (
                <li
                  key={`pinned-${msg.api}-${msg.timestamp}-${i}`}
                  style={{
                    marginBottom: 8,
                    padding: 8,
                    borderRadius: 4,
                    background: '#fff3cd',
                    border: '1px solid #ffeaa7',
                    position: 'relative',
                    animation: 'slideIn 0.3s ease',
                  }}
                >
                  <div style={{ fontSize: 13, color: '#888' }}>
                    {msg.command}
                  </div>
                  <div style={{ fontWeight: 500 }}>{msg.result}</div>
                  <div style={{ fontSize: 11, color: '#bbb' }}>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  <button
                    onClick={() =>
                      handlePinMessage(`${msg.api}-${msg.timestamp}-${i}`)
                    }
                    style={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: '#ff6b6b',
                    }}
                    title='Unpin message'
                  >
                    📌
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Regular Messages Section */}
        {unpinnedMessages.length > 0 ? (
          <ul style={{ padding: 0, margin: 0, listStyle: 'none' }}>
            {unpinnedMessages.map((msg, i) => (
              <li
                key={`${msg.api}-${msg.timestamp}-${i}`}
                style={{
                  marginBottom: 8,
                  padding: 8,
                  borderRadius: 4,
                  background:
                    (searchTerm &&
                      (msg.command
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                        msg.result
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()))) ||
                    (globalSearchTerm &&
                      (msg.command
                        .toLowerCase()
                        .includes(globalSearchTerm.toLowerCase()) ||
                        msg.result
                          .toLowerCase()
                          .includes(globalSearchTerm.toLowerCase())))
                      ? '#fff3cd'
                      : 'transparent',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f8f9fa';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    (searchTerm &&
                      (msg.command
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                        msg.result
                          .toLowerCase()
                          .includes(searchTerm.toLowerCase()))) ||
                    (globalSearchTerm &&
                      (msg.command
                        .toLowerCase()
                        .includes(globalSearchTerm.toLowerCase()) ||
                        msg.result
                          .toLowerCase()
                          .includes(globalSearchTerm.toLowerCase())))
                      ? '#fff3cd'
                      : 'transparent';
                }}
              >
                <div style={{ fontSize: 13, color: '#888' }}>{msg.command}</div>
                <div style={{ fontWeight: 500 }}>{msg.result}</div>
                <div style={{ fontSize: 11, color: '#bbb' }}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <button
                  onClick={() =>
                    handlePinMessage(`${msg.api}-${msg.timestamp}-${i}`)
                  }
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 12,
                    color: '#ccc',
                    opacity: 0,
                    transition: 'opacity 0.2s ease',
                  }}
                  title='Pin message'
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = '#ffd700';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '0';
                    e.currentTarget.style.color = '#ccc';
                  }}
                >
                  📌
                </button>
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

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
};

export default ResultPanel;
