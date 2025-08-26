import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { toggleApi } from '../features/apiSelectionSlice';
import { signOut } from 'aws-amplify/auth';

const apiList = [
  'Cat Facts',
  'Chuck Norris Jokes',
  'Bored API',
  'GitHub Users',
  'Weather',
  'Custom Backend',
  'Dictionary',
] as const;

const Sidebar: React.FC = () => {
  const activeApis = useSelector(
    (state: RootState) => state.apiSelection.activeApis
  );
  const dispatch = useDispatch();

  return (
    <aside
      style={{
        width: 220,
        background: '#f5f5f5',
        height: '100vh',
        borderRight: '1px solid #ddd',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevent scrolling
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 16px 12px 16px',
          borderBottom: '1px solid #ddd',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#333' }}>
          APIs
        </h2>
      </div>

      {/* API List - Scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 16px',
        }}
      >
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {apiList.map(api => (
            <li key={api} style={{ marginBottom: 6 }}>
              <label
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 8px',
                  borderRadius: 4,
                  transition: 'background-color 0.2s ease',
                  fontSize: 14,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <input
                  type='checkbox'
                  checked={activeApis.includes(api)}
                  onChange={() => dispatch(toggleApi(api))}
                  style={{
                    marginRight: 10,
                    cursor: 'pointer',
                    transform: 'scale(1.1)',
                  }}
                />
                <span style={{ color: '#333', fontWeight: 500 }}>{api}</span>
                {activeApis.includes(api) && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: 12,
                      color: '#007bff',
                      fontWeight: 600,
                    }}
                  >
                    ✓
                  </span>
                )}
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer with Logout - Always visible */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #ddd',
          background: '#fff',
          flexShrink: 0,
        }}
      >
        <button
          onClick={async () => {
            await signOut();
            window.location.reload();
          }}
          style={{
            width: '100%',
            padding: '10px 12px',
            background: '#e74c3c',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 500,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#c0392b';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#e74c3c';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <span>🚪</span>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
