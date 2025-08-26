import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signUp } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';
import { signUpSchema, type SignUpFormData } from '../../constants/validation';
import FormField from '../common/FormField';
import PasswordStrengthIndicator from '../common/PasswordStrengthIndicator';

const SignUp: React.FC<{
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
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Update parent email state when email changes
  React.useEffect(() => {
    if (watchedEmail) {
      setEmail(watchedEmail);
    }
  }, [watchedEmail, setEmail]);

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true);
    setApiError('');

    try {
      await signUp({
        username: data.email,
        password: data.password,
        options: { userAttributes: { email: data.email } },
      });
      setEmail(data.email);
      setScreen('verify');
    } catch (err: any) {
      setApiError(err.message || 'Sign up failed');
      console.log(err);
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
        placeholder='Create a password'
        error={errors.password}
        required
      >
        <input
          {...register('password')}
          type='password'
          placeholder='Create a password'
          className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400'
        />
      </FormField>

      {/* Password Strength Indicator */}
      <PasswordStrengthIndicator password={watchedPassword || ''} />

      {/* Confirm Password Input */}
      <FormField
        label='Confirm Password'
        name='confirmPassword'
        type='password'
        placeholder='Confirm your password'
        error={errors.confirmPassword}
        required
      >
        <input
          {...register('confirmPassword')}
          type='password'
          placeholder='Confirm your password'
          className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400'
        />
      </FormField>

      {/* API Error Message */}
      {apiError && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
          <p className='text-red-600 text-sm'>{apiError}</p>
        </div>
      )}

      {/* Sign Up Button */}
      <button
        type='submit'
        disabled={loading || !isValid}
        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
            Creating account...
          </div>
        ) : (
          'Create account'
        )}
      </button>

      {/* Divider */}
      <div className='relative'>
        <div className='absolute inset-0 flex items-center'>
          <div className='w-full border-t border-gray-200'></div>
        </div>
        <div className='relative flex justify-center text-sm'>
          <span className='px-2 bg-white text-gray-500'>
            Already have an account?
          </span>
        </div>
      </div>

      {/* Login Link */}
      <div className='text-center'>
        <button
          type='button'
          onClick={() => setScreen('login')}
          className='text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 cursor-pointer'
        >
          Sign in instead
        </button>
      </div>
    </form>
  );
};

export default SignUp;
