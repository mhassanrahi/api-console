import React, { useState } from 'react';
import { resetPassword } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';

const ForgotPassword: React.FC<{
  setScreen: (s: AuthScreen) => void;
  email: string;
}> = ({ setScreen, email }) => {
  const [emailInput, setEmailInput] = useState(email);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await resetPassword({ username: emailInput });
      setSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleForgot} className='space-y-6'>
      {/* Header Text */}
      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          Enter your email address and we'll send you a link to reset your
          password.
        </p>
      </div>

      {/* Email Input */}
      <div>
        <label
          htmlFor='reset-email'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Email address
        </label>
        <input
          id='reset-email'
          type='email'
          placeholder='Enter your email'
          value={emailInput}
          onChange={e => setEmailInput(e.target.value)}
          required
          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400'
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      )}

      {/* Success Message */}
      {sent && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
          <p className='text-green-600 text-sm'>
            Reset code sent! Check your email for instructions.
          </p>
        </div>
      )}

      {/* Send Reset Button */}
      <button
        type='submit'
        disabled={loading || sent}
        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
            Sending...
          </div>
        ) : sent ? (
          'Reset code sent!'
        ) : (
          'Send reset code'
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

export default ForgotPassword;
