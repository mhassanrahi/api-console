import React, { useState } from 'react';
import { confirmSignUp } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';

const VerifyEmail: React.FC<{
  setScreen: (s: AuthScreen) => void;
  email: string;
}> = ({ setScreen, email }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await confirmSignUp({ username: email, confirmationCode: code });
      setSuccess(true);
      setTimeout(() => setScreen('login'), 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleVerify} className='space-y-6'>
      {/* Email Display */}
      <div className='text-center'>
        <p className='text-sm text-gray-600 mb-2'>
          We sent a verification code to:
        </p>
        <p className='font-medium text-gray-900'>{email}</p>
      </div>

      {/* Verification Code Input */}
      <div>
        <label
          htmlFor='verification-code'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Verification code
        </label>
        <input
          id='verification-code'
          type='text'
          placeholder='Enter 6-digit code'
          value={code}
          onChange={e => setCode(e.target.value)}
          required
          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400 text-center text-lg tracking-widest'
          maxLength={6}
        />
        <p className='mt-2 text-xs text-gray-500'>
          Check your email for the verification code
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
          <p className='text-green-600 text-sm'>
            Email verified successfully! Redirecting to login...
          </p>
        </div>
      )}

      {/* Verify Button */}
      <button
        type='submit'
        disabled={loading || success}
        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
            Verifying...
          </div>
        ) : success ? (
          'Verified!'
        ) : (
          'Verify email'
        )}
      </button>

      {/* Back to Login */}
      <div className='text-center'>
        <button
          type='button'
          onClick={() => setScreen('login')}
          className='text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 cursor-pointer'
        >
          Back to sign in
        </button>
      </div>
    </form>
  );
};

export default VerifyEmail;
