import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import ResultPanel from './components/ResultPanel';
import GlobalSearch from './components/GlobalSearch';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import AuthContainer from './components/auth/AuthContainer';
import { useAuthUser } from './utils/useAuthUser';

const App: React.FC = () => {
  const activeApis = useSelector(
    (state: RootState) => state.apiSelection.activeApis
  );
  const { user, loading } = useAuthUser();
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  if (loading) return null;
  if (!user) return <AuthContainer />;

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: '#f0f2f5',
        overflow: 'hidden', // Prevent body overflow
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0, // Allow main to shrink
          overflow: 'hidden', // Prevent main overflow
        }}
      >
        <GlobalSearch onSearch={setGlobalSearchTerm} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            gap: 8,
            overflow: 'auto',
            padding: 8,
            minHeight: 0, // Allow flex item to shrink
          }}
        >
          {activeApis.length > 0 ? (
            activeApis.map(api => (
              <ResultPanel
                key={api}
                apiName={api}
                globalSearchTerm={globalSearchTerm}
              />
            ))
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#666',
                fontSize: 16,
                textAlign: 'center',
                padding: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
                <div style={{ marginBottom: 8 }}>
                  <strong>No APIs Selected</strong>
                </div>
                <div style={{ fontSize: 14 }}>
                  Select APIs from the sidebar to start using the application
                </div>
              </div>
            </div>
          )}
        </div>
        <ChatInput />
      </main>
    </div>
  );
};

export default App;
