import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { confirmResetPassword } from 'aws-amplify/auth';
import type { AuthScreen } from './AuthContainer';
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from '../../constants/validation';
import FormField from '../common/FormField';
import PasswordStrengthIndicator from '../common/PasswordStrengthIndicator';

const ResetPassword: React.FC<{
  setScreen: (s: AuthScreen) => void;
  email: string;
}> = ({ setScreen, email }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const watchedPassword = watch('password');

  const onSubmit = async (data: ResetPasswordFormData) => {
    setLoading(true);
    setApiError('');

    // Validate that email is available
    if (!email) {
      setApiError('Email address is required. Please go back and try again.');
      setLoading(false);
      return;
    }

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: data.code,
        newPassword: data.password,
      });
      setSuccess(true);
      setTimeout(() => setScreen('login'), 2000);
    } catch (err: any) {
      console.error('Reset password error:', err);
      setApiError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
      {/* Header Text */}
      <div className='text-center'>
        <p className='text-sm text-gray-600 mb-2'>
          Enter the verification code sent to:
        </p>
        <p className='font-medium text-gray-900'>{email}</p>
      </div>

      {/* Verification Code Input */}
      <FormField
        label='Verification code'
        name='code'
        placeholder='Enter 6-digit code'
        error={errors.code}
        required
        maxLength={6}
      >
        <input
          {...register('code')}
          type='text'
          placeholder='Enter 6-digit code'
          maxLength={6}
          className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400 text-center text-lg tracking-widest'
        />
      </FormField>

      {/* New Password Input */}
      <FormField
        label='New Password'
        name='password'
        type='password'
        placeholder='Create a new password'
        error={errors.password}
        required
      >
        <input
          {...register('password')}
          type='password'
          placeholder='Create a new password'
          className='w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400'
        />
      </FormField>

      {/* Password Strength Indicator */}
      <PasswordStrengthIndicator password={watchedPassword || ''} />

      {/* Confirm Password Input */}
      <FormField
        label='Confirm New Password'
        name='confirmPassword'
        type='password'
        placeholder='Confirm your new password'
        error={errors.confirmPassword}
        required
      >
        <input
          {...register('confirmPassword')}
          type='password'
          placeholder='Confirm your new password'
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
      {success && (
        <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
          <p className='text-green-600 text-sm'>
            Password reset successfully! Redirecting to login...
          </p>
        </div>
      )}

      {/* Reset Password Button */}
      <button
        type='submit'
        disabled={loading || success || !isValid}
        className='w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {loading ? (
          <div className='flex items-center justify-center'>
            <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
            Resetting password...
          </div>
        ) : success ? (
          'Password Reset!'
        ) : (
          'Reset Password'
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

export default ResetPassword;
