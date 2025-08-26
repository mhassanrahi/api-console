import React, { useState } from 'react';
import { signIn } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';

const Login: React.FC<{
  setScreen: (s: AuthScreen) => void;
  setEmail: (e: string) => void;
}> = ({ setScreen, setEmail }) => {
  const [email, setEmailLocal] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await signIn({ username: email, password });
      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin} className='space-y-6'>
      {/* Email Input */}
      <div>
        <label
          htmlFor='email'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Email address
        </label>
        <input
          id='email'
          type='email'
          placeholder='Enter your email'
          value={email}
          onChange={e => {
            setEmailLocal(e.target.value);
            setEmail(e.target.value);
          }}
          required
          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400'
        />
      </div>

      {/* Password Input */}
      <div>
        <label
          htmlFor='password'
          className='block text-sm font-medium text-gray-700 mb-2'
        >
          Password
        </label>
        <input
          id='password'
          type='password'
          placeholder='Enter your password'
          value={password}
          onChange={e => setPassword(e.target.value)}
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

      {/* Login Button */}
      <button
        type='submit'
        disabled={loading}
        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
            Signing in...
          </div>
        ) : (
          'Sign in'
        )}
      </button>

      {/* Forgot Password Link */}
      <div className='text-center'>
        <button
          type='button'
          onClick={() => setScreen('forgot')}
          className='text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200 cursor-pointer'
        >
          Forgot your password?
        </button>
      </div>

      {/* Divider */}
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-200'></div>
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-white text-gray-500'>New to Knowlix?</span>
        </div>
      </div>

      {/* Sign Up Link */}
      <div className='text-center'>
        <button
          type='button'
          onClick={() => setScreen('signup')}
          className='text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 cursor-pointer'
        >
          Create an account
        </button>
      </div>
    </form>
  );
};

export default Login;
