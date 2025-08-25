
import React from 'react';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import ResultPanel from './components/ResultPanel';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import AuthContainer from './components/auth/AuthContainer';
import { useAuthUser } from './utils/useAuthUser';


const App: React.FC = () => {
  const activeApis = useSelector((state: RootState) => state.apiSelection.activeApis);
  const { user, loading } = useAuthUser();

  if (loading) return null;
  if (!user) return <AuthContainer />;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, display: 'flex', gap: 8, overflow: 'auto', padding: 8 }}>
          {activeApis.map((api) => (
            <ResultPanel key={api} apiName={api} />
          ))}
        </div>
        <ChatInput />
      </main>
    </div>
  );
};

export default App;