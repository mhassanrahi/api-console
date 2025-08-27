import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';
import { loginSchema, type LoginFormData } from '../../constants/validation';
import FormField from '../common/FormField';
import apiService from '../../services/apiService';

const Login: React.FC<{
  setScreen: (s: AuthScreen) => void;
  setEmail: (e: string) => void;
}> = ({ setScreen, setEmail }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [syncStatus, setSyncStatus] = useState<
    'idle' | 'syncing' | 'success' | 'error'
  >('idle');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
  });

  const watchedEmail = watch('email');

  // Update parent email state when email changes
  React.useEffect(() => {
    if (watchedEmail) {
      setEmail(watchedEmail);
    }
  }, [watchedEmail, setEmail]);

  // Sync user data with backend after successful login
  const syncUserData = async () => {
    try {
      setSyncStatus('syncing');

      // Wait a moment for Cognito session to be fully established
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Sync user data with backend
      const syncResponse = await apiService.syncUserData();

      if (syncResponse.success) {
        setSyncStatus('success');
        console.log('✅ User data synced successfully');
      } else {
        console.warn('⚠️ User data sync failed:', syncResponse.error);
        setSyncStatus('error');
      }
    } catch (error) {
      console.error('❌ Error syncing user data:', error);
      setSyncStatus('error');
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setApiError('');
    setSyncStatus('idle');

    try {
      // Step 1: Authenticate with Cognito
      await signIn({ username: data.email, password: data.password });

      // Step 2: Sync user data with backend
      await syncUserData();

      // Step 3: Reload the page to update the app state
      window.location.reload();
    } catch (err: any) {
      setApiError(err.message || 'Login failed');
      setSyncStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const getSyncStatusMessage = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing user data...';
      case 'success':
        return 'User data synced successfully!';
      case 'error':
        return 'Login successful, but data sync failed. You can continue.';
      default:
        return '';
    }
  };

  const getSyncStatusClass = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-yellow-600';
      default:
        return '';
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Email Input */}
      <FormField
        label='Email address'
        name='email'
        type='email'
        placeholder='Enter your email'
        error={errors.email}
        required
      >
        <input
          {...register('email')}
          type='email'
          placeholder='Enter your email'
          className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400'
        />
      </FormField>

      {/* Password Input */}
      <FormField
        label='Password'
        name='password'
        type='password'
        placeholder='Enter your password'
        error={errors.password}
        required
      >
        <input
          {...register('password')}
          type='password'
          placeholder='Enter your password'
          className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400'
        />
      </FormField>

      {/* API Error Message */}
      {apiError && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
          <p className='text-red-600 text-sm'>{apiError}</p>
        </div>
      )}

      {/* Sync Status Message */}
      {syncStatus !== 'idle' && (
        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
          <div className='flex items-center'>
            {syncStatus === 'syncing' && (
              <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2'></div>
            )}
            {syncStatus === 'success' && (
              <svg
                className='w-4 h-4 text-green-600 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                  clipRule='evenodd'
                />
              </svg>
            )}
            {syncStatus === 'error' && (
              <svg
                className='w-4 h-4 text-yellow-600 mr-2'
                fill='currentColor'
                viewBox='0 0 20 20'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            )}
            <p className={`text-sm ${getSyncStatusClass()}`}>
              {getSyncStatusMessage()}
            </p>
          </div>
        </div>
      )}

      {/* Login Button */}
      <button
        type='submit'
        disabled={loading || !isValid}
        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
            {syncStatus === 'syncing' ? 'Syncing...' : 'Signing in...'}
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
