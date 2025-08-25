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
] as const;

const Sidebar: React.FC = () => {
  const activeApis = useSelector((state: RootState) => state.apiSelection.activeApis);
  const dispatch = useDispatch();

  return (
    <aside style={{ width: 220, background: '#f5f5f5', padding: 16, height: '100vh', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <h2>APIs</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {apiList.map(api => (
            <li key={api} style={{ marginBottom: 8 }}>
              <label style={{ cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={activeApis.includes(api)}
                  onChange={() => dispatch(toggleApi(api))}
                  style={{ marginRight: 8 }}
                />
                {api}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <button
        onClick={async () => { await signOut(); window.location.reload(); }}
        style={{ width: '100%', padding: 10, background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 4, marginTop: 16, cursor: 'pointer' }}
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
