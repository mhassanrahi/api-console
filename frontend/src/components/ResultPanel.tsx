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
  const [isExpanded, setIsExpanded] = useState(false);
  const dispatch = useDispatch();

  const messages = useSelector((state: RootState) =>
    state.chat.messages.filter(msg => msg.api === apiName)
  );

  const filteredMessages = useMemo(() => {
    const globalTerm = globalSearchTerm.toLowerCase();

    return messages
      .filter(msg => {
        const matchesGlobal =
          !globalTerm ||
          msg.command.toLowerCase().includes(globalTerm) ||
          msg.result.toLowerCase().includes(globalTerm);

        return matchesGlobal;
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Sort by timestamp, newest first
  }, [messages, globalSearchTerm]);

  const pinnedMessages = messages
    .filter(msg => msg.pinned)
    .sort((a, b) => b.timestamp - a.timestamp); // Sort pinned messages by timestamp, newest first
  const unpinnedMessages = filteredMessages.filter(msg => !msg.pinned);

  const handlePinMessage = (messageId: string) => {
    dispatch(togglePinnedMessage(messageId));
  };

  return (
    <section
      style={{
        flex: 1,
        minWidth: 280, // Set minimum width for better readability
        maxWidth: 350, // Set maximum width to prevent overly wide panels
        margin: 8,
        padding: 16,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all 0.3s ease',
        transform: isExpanded ? 'scale(1.02)' : 'scale(1)',
        zIndex: isExpanded ? 10 : 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent content overflow
      }}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header with prominent API title */}
      <div
        style={{
          marginBottom: 16,
          flexShrink: 0,
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: 12,
        }}
      >
        <h3
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 18,
            fontWeight: 700,
            color: '#333',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}
        >
          {apiName}
          {pinnedMessages.length > 0 && (
            <span
              style={{
                fontSize: 11,
                background: '#ffd700',
                color: '#333',
                padding: '2px 6px',
                borderRadius: 10,
                fontWeight: 'normal',
                flexShrink: 0,
              }}
            >
              📌 {pinnedMessages.length}
            </span>
          )}
        </h3>

        {/* Message count indicator */}
        <div
          style={{
            fontSize: 12,
            color: '#666',
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
          {globalSearchTerm && (
            <span style={{ color: '#007bff' }}>
              • {filteredMessages.length} filtered
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          minHeight: 40,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Pinned Messages Section */}
        {pinnedMessages.length > 0 && (
          <div style={{ marginBottom: 16, flexShrink: 0 }}>
            <h4
              style={{
                fontSize: 12,
                color: '#666',
                margin: '0 0 8px 0',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
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
                    wordBreak: 'break-word',
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
                    globalSearchTerm &&
                    (msg.command
                      .toLowerCase()
                      .includes(globalSearchTerm.toLowerCase()) ||
                      msg.result
                        .toLowerCase()
                        .includes(globalSearchTerm.toLowerCase()))
                      ? '#fff3cd'
                      : 'transparent',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  wordBreak: 'break-word',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#f8f9fa';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background =
                    globalSearchTerm &&
                    (msg.command
                      .toLowerCase()
                      .includes(globalSearchTerm.toLowerCase()) ||
                      msg.result
                        .toLowerCase()
                        .includes(globalSearchTerm.toLowerCase()))
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
          <div
            style={{
              textAlign: 'center',
              padding: 20,
              color: '#666',
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>🔍</div>
            <div>No results match your search.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Try adjusting your search terms
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: 20,
              color: '#666',
              fontSize: 14,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>📝</div>
            <div>No results yet.</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>
              Start chatting to see results here
            </div>
          </div>
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
