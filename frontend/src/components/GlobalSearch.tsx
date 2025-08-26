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
    return messages.filter(msg => 
      msg.command.toLowerCase().includes(term) || 
      msg.result.toLowerCase().includes(term)
    );
  }, [messages, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  return (
    <div style={{ 
      padding: 16, 
      borderBottom: '1px solid #eee', 
      background: '#fff',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search across all APIs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: 6,
            fontSize: 14
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Search
        </button>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              onSearch('');
            }}
            style={{
              padding: '8px 12px',
              background: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        )}
      </form>
      {searchResults.length > 0 && (
        <div style={{ marginTop: 12, fontSize: 12, color: '#666' }}>
          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} across all APIs
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
