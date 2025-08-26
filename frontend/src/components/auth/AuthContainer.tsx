import React, { useState } from 'react';
import Login from './Login.tsx';
import SignUp from './SignUp.tsx';
import ForgotPassword from './ForgotPassword.tsx';
import VerifyEmail from './VerifyEmail.tsx';

export type AuthScreen = 'login' | 'signup' | 'forgot' | 'verify';

const AuthContainer: React.FC = () => {
  const [screen, setScreen] = useState<AuthScreen>('login');
  const [email, setEmail] = useState('');

  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
          {/* Header with gradient */}
          <div className='bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6'>
            <div className='text-center'>
              <h1 className='text-2xl font-bold text-white mb-2'>Knowlix</h1>
              <p className='text-blue-100 text-sm'>
                {screen === 'login' && 'Welcome back'}
                {screen === 'signup' && 'Create your account'}
                {screen === 'forgot' && 'Reset your password'}
                {screen === 'verify' && 'Verify your email'}
              </p>
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
              <ForgotPassword setScreen={setScreen} email={email} />
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
