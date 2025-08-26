import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPassword } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';
import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from '../../constants/validation';
import FormField from '../common/FormField';

const ForgotPassword: React.FC<{
  setScreen: (s: AuthScreen) => void;
  email: string;
  setEmail: (email: string) => void;
}> = ({ setScreen, email, setEmail }) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: email,
    },
  });

  const watchedEmail = watch('email');

  // Update parent email state when email changes
  React.useEffect(() => {
    if (watchedEmail) {
      setEmail(watchedEmail);
    }
  }, [watchedEmail, setEmail]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setLoading(true);
    setApiError('');

    try {
      await resetPassword({ username: data.email });
      setSent(true);
      // Navigate to reset password screen after 2 seconds
      setTimeout(() => setScreen('reset'), 2000);
    } catch (err: any) {
      setApiError(err.message || 'Failed to send reset code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Header Text */}
      <div className='text-center'>
        <p className='text-sm text-gray-600'>
          Enter your email address and we'll send you a verification code to
          reset your password.
        </p>
      </div>

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

      {/* API Error Message */}
      {apiError && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
          <p className='text-red-600 text-sm'>{apiError}</p>
        </div>
      )}

      {/* Success Message */}
      {sent && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
          <p className='text-green-600 text-sm'>
            Verification code sent! Check your email and redirecting to reset
            password...
          </p>
        </div>
      )}

      {/* Send Reset Button */}
      <button
        type='submit'
        disabled={loading || sent || !isValid}
        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
            Sending...
          </div>
        ) : sent ? (
          'Code sent!'
        ) : (
          'Send verification code'
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
