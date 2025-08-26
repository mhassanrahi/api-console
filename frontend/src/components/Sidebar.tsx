import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../store';
import { toggleApi } from '../features/apiSelectionSlice';
import { signOut } from 'aws-amplify/auth';
import { API_LIST, UI_TEXT } from '../constants';

const Sidebar: React.FC = () => {
  const activeApis = useSelector(
    (state: RootState) => state.apiSelection.activeApis
  );
  const dispatch = useDispatch();

  return (
    <aside className='w-64 bg-white border-r border-gray-200 flex flex-col h-screen shadow-lg'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6'>
        <h2 className='text-xl font-bold text-white mb-1'>
          {UI_TEXT.LABELS.APIS}
        </h2>
        <p className='text-blue-100 text-sm'>
          {UI_TEXT.LABELS.SELECT_DATA_SOURCES}
        </p>
      </div>

      {/* API List - Scrollable */}
      <div className='flex-1 overflow-y-auto p-4'>
        <ul className='space-y-2'>
          {API_LIST.map(api => (
            <li key={api}>
              <label className='cursor-pointer group'>
                <div className='flex items-center p-3 rounded-lg transition-all duration-200 hover:bg-gray-50 group-hover:shadow-sm'>
                  <input
                    type='checkbox'
                    checked={activeApis.includes(api)}
                    onChange={() => dispatch(toggleApi(api))}
                    className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 transition-colors duration-200'
                  />
                  <span className='ml-3 text-gray-700 font-medium group-hover:text-gray-900 transition-colors duration-200'>
                    {api}
                  </span>
                  {activeApis.includes(api) && (
                    <span className='ml-auto text-blue-600 font-semibold text-sm'>
                      ✓
                    </span>
                  )}
                </div>
              </label>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer with Logout */}
      <div className='p-4 border-t border-gray-200 bg-gray-50'>
        <button
          onClick={async () => {
            await signOut();
            window.location.reload();
          }}
          className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 cursor-pointer'
        >
          <span className='text-lg'>🚪</span>
          {UI_TEXT.BUTTONS.LOGOUT}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
