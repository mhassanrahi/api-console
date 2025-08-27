import React, { useState, useEffect } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import Login from './Login';
import SignUp from './SignUp';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import VerifyEmail from './VerifyEmail';
import { useUserData } from '../../hooks/useUserData';

export type AuthScreen = 'login' | 'signup' | 'forgot' | 'reset' | 'verify';

const AuthContainer: React.FC = () => {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [email, setEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(true);
  const { user, loading: userDataLoading, syncUserData } = useUserData();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const cognitoUser = await getCurrentUser();
        if (cognitoUser) {
          // User is authenticated, sync their data
          await syncUserData();
        }
      } catch (error) {
        // User is not authenticated
        console.log('User not authenticated');
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [syncUserData]);

  // Redirect to main app if user is authenticated
  useEffect(() => {
    if (!authLoading && !userDataLoading && user) {
      // User is authenticated and data is loaded, redirect to main app
      window.location.href = '/';
    }
  }, [authLoading, userDataLoading, user]);

  const getHeaderText = (screen: AuthScreen) => {
    switch (screen) {
      case 'login':
        return 'Welcome back';
      case 'signup':
        return 'Create your account';
      case 'forgot':
        return 'Reset your password';
      case 'reset':
        return 'Set new password';
      case 'verify':
        return 'Verify your email';
      default:
        return 'Welcome';
    }
  };

  // Show loading state while checking authentication
  if (authLoading || userDataLoading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
        <div className='w-full max-w-md'>
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6'>
              <div className='text-center'>
                <h1 className='text-2xl font-bold text-white mb-2'>Knowlix</h1>
                <p className='text-blue-100 text-sm'>Loading...</p>
              </div>
            </div>
            <div className='px-8 py-8'>
              <div className='flex items-center justify-center'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
                <span className='ml-3 text-gray-600'>
                  Checking authentication...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
          {/* Header with gradient */}
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6'>
            <div className='text-center'>
              <h1 className='text-2xl font-bold text-white mb-2'>Knowlix</h1>
              <p className='text-blue-100 text-sm'>{getHeaderText(screen)}</p>
            </div>
          </div>

          {/* Form content */}
          <div className='px-8 py-8'>
            {screen === 'login' && (
              <Login setScreen={setScreen} setEmail={setEmail} />
            )}
            {screen === 'signup' && (
              <SignUp setScreen={setScreen} setEmail={setEmail} />
            )}
            {screen === 'forgot' && (
              <ForgotPassword
                setScreen={setScreen}
                email={email}
                setEmail={setEmail}
              />
            )}
            {screen === 'reset' && (
              <ResetPassword setScreen={setScreen} email={email} />
            )}
            {screen === 'verify' && (
              <VerifyEmail setScreen={setScreen} email={email} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthContainer;
