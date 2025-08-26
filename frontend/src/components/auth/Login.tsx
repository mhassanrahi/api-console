import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';
import { loginSchema, type LoginFormData } from '../../constants/validation';
import FormField from '../common/FormField';

const Login: React.FC<{
  setScreen: (s: AuthScreen) => void;
  setEmail: (e: string) => void;
}> = ({ setScreen, setEmail }) => {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

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

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setApiError('');

    try {
      await signIn({ username: data.email, password: data.password });
      window.location.reload();
    } catch (err: any) {
      setApiError(err.message || 'Login failed');
    } finally {
      setLoading(false);
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

      {/* Login Button */}
      <button
        type='submit'
        disabled={loading || !isValid}
        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
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
