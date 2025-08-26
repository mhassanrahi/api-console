import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

interface GlobalSearchProps {
  onSearch: (term: string) => void;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const messages = useSelector((state: RootState) => state.chat.messages);

  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const term = searchTerm.toLowerCase();
    return messages.filter(
      msg =>
        msg.command.toLowerCase().includes(term) ||
        msg.result.toLowerCase().includes(term)
    );
  }, [messages, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div className='bg-white border-b border-gray-200 shadow-sm'>
      <div className='px-6 py-4'>
        <form onSubmit={handleSearch} className='flex gap-3 items-center'>
          <div className='flex-1 relative'>
            <input
              type='text'
              placeholder='Search across all APIs...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 bg-gray-50 focus:bg-white'
            />
            <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
              <div className='text-gray-400'>🔍</div>
            </div>
          </div>
          <button
            type='submit'
            className='bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer'
          >
            Search
          </button>
          {searchTerm && (
            <button
              type='button'
              onClick={() => {
                setSearchTerm('');
                onSearch('');
              }}
              className='bg-gray-500 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md'
            >
              Clear
            </button>
          )}
        </form>
        {searchResults.length > 0 && (
          <div className='mt-3 text-sm text-gray-600 flex items-center gap-2'>
            <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
            Found {searchResults.length} result
            {searchResults.length !== 1 ? 's' : ''} across all APIs
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalSearch;
