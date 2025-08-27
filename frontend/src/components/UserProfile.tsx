import React from 'react';
import { useUserData } from '../hooks/useUserData';

const UserProfile: React.FC = () => {
  const {
    user,
    preferences,
    stats,
    loading,
    error,
    // updateProfile,
    // updatePreferences,
  } = useUserData();

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
        <span className='ml-3 text-gray-600'>Loading user data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-red-50 border border-red-200 rounded-lg p-4 m-4'>
        <p className='text-red-600'>Error loading user data: {error}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4 m-4'>
        <p className='text-yellow-600'>No user data available</p>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      <div className='bg-white rounded-lg shadow-lg overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4'>
          <h1 className='text-2xl font-bold text-white'>User Profile</h1>
          <p className='text-blue-100'>
            Your account information and preferences
          </p>
        </div>

        <div className='p-6 space-y-8'>
          {/* Basic Information */}
          <div>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>
              Basic Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Email
                </label>
                <p className='mt-1 text-gray-900'>{user.email}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Username
                </label>
                <p className='mt-1 text-gray-900'>{user.username}</p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Full Name
                </label>
                <p className='mt-1 text-gray-900'>
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : 'Not provided'}
                </p>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Account Status
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.accountStatus === 'active'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.accountStatus}
                </span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  User Type
                </label>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.userType === 'premium'
                      ? 'bg-purple-100 text-purple-800'
                      : user.userType === 'admin'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {user.userType}
                </span>
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-600'>
                  Login Count
                </label>
                <p className='mt-1 text-gray-900'>{user.loginCount}</p>
              </div>
            </div>
          </div>

          {/* User Preferences */}
          {preferences && (
            <div>
              <h2 className='text-xl font-semibold text-gray-800 mb-4'>
                Preferences
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Theme
                  </label>
                  <p className='mt-1 text-gray-900 capitalize'>
                    {preferences.theme}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Language
                  </label>
                  <p className='mt-1 text-gray-900'>
                    {preferences.preferredLanguage}
                  </p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Timezone
                  </label>
                  <p className='mt-1 text-gray-900'>{preferences.timezone}</p>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Notifications
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      preferences.notifications
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {preferences.notifications ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Auto Save Search
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      preferences.autoSaveSearch
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {preferences.autoSaveSearch ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Max Search History
                  </label>
                  <p className='mt-1 text-gray-900'>
                    {preferences.maxSearchHistory} items
                  </p>
                </div>
              </div>

              {preferences.defaultApis &&
                preferences.defaultApis.length > 0 && (
                  <div className='mt-4'>
                    <label className='block text-sm font-medium text-gray-600 mb-2'>
                      Default APIs
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {preferences.defaultApis.map((api, index) => (
                        <span
                          key={index}
                          className='inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800'
                        >
                          {api}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}

          {/* User Statistics */}
          {stats && (
            <div>
              <h2 className='text-xl font-semibold text-gray-800 mb-4'>
                Activity Statistics
              </h2>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <div className='bg-blue-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-blue-600'>
                    {stats.totalSearches}
                  </div>
                  <div className='text-sm text-blue-600'>Total Searches</div>
                </div>
                <div className='bg-green-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-green-600'>
                    {stats.totalChatSessions}
                  </div>
                  <div className='text-sm text-green-600'>Chat Sessions</div>
                </div>
                <div className='bg-purple-50 rounded-lg p-4'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {stats.totalMessages}
                  </div>
                  <div className='text-sm text-purple-600'>Messages</div>
                </div>
                <div className='bg-orange-50 rounded-lg p-4'>
                  <div className='text-sm text-orange-600'>
                    {stats.lastActivity
                      ? new Date(stats.lastActivity).toLocaleDateString()
                      : 'Never'}
                  </div>
                  <div className='text-sm text-orange-600'>Last Activity</div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div>
            <h2 className='text-xl font-semibold text-gray-800 mb-4'>
              Additional Information
            </h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {user.bio && (
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Bio
                  </label>
                  <p className='mt-1 text-gray-900'>{user.bio}</p>
                </div>
              )}
              {user.website && (
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Website
                  </label>
                  <a
                    href={user.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='mt-1 text-blue-600 hover:text-blue-800'
                  >
                    {user.website}
                  </a>
                </div>
              )}
              {user.location && (
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Location
                  </label>
                  <p className='mt-1 text-gray-900'>{user.location}</p>
                </div>
              )}
              {user.company && (
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Company
                  </label>
                  <p className='mt-1 text-gray-900'>{user.company}</p>
                </div>
              )}
              {user.jobTitle && (
                <div>
                  <label className='block text-sm font-medium text-gray-600'>
                    Job Title
                  </label>
                  <p className='mt-1 text-gray-900'>{user.jobTitle}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sync Status */}
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
            <div className='flex items-center'>
              <svg
                className='w-5 h-5 text-blue-600 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
                  clipRule='evenodd'
                />
              </svg>
              <div>
                <h3 className='text-sm font-medium text-blue-800'>
                  Data Sync Status
                </h3>
                <p className='text-sm text-blue-600'>
                  Your data is synced with the backend database. Last updated:{' '}
                  {new Date(user.lastLogin).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
