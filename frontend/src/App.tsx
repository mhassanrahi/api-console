import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatInput from './components/ChatInput';
import ResultPanel from './components/ResultPanel';
import GlobalSearch from './components/GlobalSearch';
import { useSelector } from 'react-redux';
import type { RootState } from './store';
import AuthContainer from './components/auth/AuthContainer';
import { useAuthUser } from './utils/useAuthUser';
import { useChatMessages } from './hooks/useChatMessages';
import { UI_TEXT } from './constants';

const App: React.FC = () => {
  const activeApis = useSelector(
    (state: RootState) => state.apiSelection.activeApis
  );
  const { user, loading } = useAuthUser();
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Load chat messages from database when app starts
  useChatMessages();

  if (loading) return null;
  if (!user) return <AuthContainer />;

  return (
    <div className='h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex overflow-hidden'>
      <Sidebar />
      <main className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        <GlobalSearch onSearch={setGlobalSearchTerm} />
        <div className='flex-1 flex gap-4 p-4 min-h-0 overflow-x-auto overflow-y-hidden'>
          {activeApis.length > 0 ? (
            <div className='flex gap-4 min-w-max pr-4 h-full'>
              {activeApis.map(api => (
                <ResultPanel
                  key={api}
                  apiName={api}
                  globalSearchTerm={globalSearchTerm}
                />
              ))}
            </div>
          ) : (
            <div className='flex-1 flex items-center justify-center'>
              <div className='text-center max-w-md'>
                <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center'>
                  <div className='text-4xl'>🔧</div>
                </div>
                <h3 className='text-xl font-semibold text-gray-800 mb-2'>
                  {UI_TEXT.MESSAGES.NO_APIS_SELECTED.TITLE}
                </h3>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  {UI_TEXT.MESSAGES.NO_APIS_SELECTED.DESCRIPTION}
                </p>
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
