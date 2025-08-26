
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
  const activeApis = useSelector((state: RootState) => state.apiSelection.activeApis);
  const { user, loading } = useAuthUser();
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  if (loading) return null;
  if (!user) return <AuthContainer />;

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f0f2f5' }}>
      <Sidebar />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <GlobalSearch onSearch={setGlobalSearchTerm} />
        <div style={{ flex: 1, display: 'flex', gap: 8, overflow: 'auto', padding: 8 }}>
          {activeApis.map((api) => (
            <ResultPanel 
              key={api} 
              apiName={api} 
              globalSearchTerm={globalSearchTerm}
            />
          ))}
        </div>
        <ChatInput />
      </main>
    </div>
  );
};

export default App;