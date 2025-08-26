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
      className={`flex-1 min-w-[320px] max-w-[400px] bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 overflow-hidden flex flex-col h-full ${
        isExpanded ? 'scale-105 shadow-xl' : 'hover:shadow-xl'
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex-shrink-0'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-bold text-white uppercase tracking-wide'>
            {apiName}
          </h3>
          {pinnedMessages.length > 0 && (
            <span className='bg-yellow-400 text-gray-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1'>
              📌 {pinnedMessages.length}
            </span>
          )}
        </div>
        <div className='flex items-center gap-3 mt-2 text-blue-100 text-sm'>
          <span>
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </span>
          {globalSearchTerm && (
            <>
              <span>•</span>
              <span className='text-yellow-300'>
                {filteredMessages.length} filtered
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 overflow-y-auto p-4 space-y-4 min-h-0'>
        {/* Pinned Messages Section */}
        {pinnedMessages.length > 0 && (
          <div>
            <h4 className='text-xs font-semibold text-gray-600 mb-3 flex items-center gap-2 uppercase tracking-wide'>
              📌 Pinned Messages
            </h4>
            <div className='space-y-3'>
              {pinnedMessages.map(msg => (
                <div
                  key={msg.id}
                  className='bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-4 relative animate-pulse'
                >
                  <div className='text-sm text-gray-600 mb-2 font-medium'>
                    {msg.command}
                  </div>
                  <div className='text-gray-800 mb-2 leading-relaxed'>
                    {msg.result}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                  <button
                    onClick={() => handlePinMessage(msg.id!)}
                    className='absolute top-2 right-2 text-yellow-600 hover:text-red-500 transition-colors duration-200 cursor-pointer'
                    title='Unpin message'
                  >
                    📌
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regular Messages Section */}
        {unpinnedMessages.length > 0 ? (
          <div className='space-y-3'>
            {unpinnedMessages.map(msg => (
              <div
                key={msg.id}
                className={`p-4 rounded-lg border transition-all duration-200 group relative ${
                  globalSearchTerm &&
                  (msg.command
                    .toLowerCase()
                    .includes(globalSearchTerm.toLowerCase()) ||
                    msg.result
                      .toLowerCase()
                      .includes(globalSearchTerm.toLowerCase()))
                    ? 'bg-yellow-50 border-yellow-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:border-gray-300'
                }`}
              >
                <div className='text-sm text-gray-600 mb-2 font-medium'>
                  {msg.command}
                </div>
                <div className='text-gray-800 mb-2 leading-relaxed'>
                  {msg.result}
                </div>
                <div className='text-xs text-gray-500'>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                <button
                  onClick={() => handlePinMessage(msg.id!)}
                  className='absolute top-2 right-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-yellow-600 transition-all duration-200 cursor-pointer'
                  title='Pin message'
                >
                  📌
                </button>
              </div>
            ))}
          </div>
        ) : messages.length > 0 ? (
          <div className='text-center py-8'>
            <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <div className='text-2xl'>🔍</div>
            </div>
            <h4 className='text-gray-700 font-medium mb-2'>
              No results match your search
            </h4>
            <p className='text-gray-500 text-sm'>
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className='text-center py-8'>
            <div className='w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center'>
              <div className='text-2xl'>📝</div>
            </div>
            <h4 className='text-gray-700 font-medium mb-2'>No results yet</h4>
            <p className='text-gray-500 text-sm'>
              Start chatting to see results here
            </p>
          </div>
        )}
        {children}
      </div>
    </section>
  );
};

export default ResultPanel;
