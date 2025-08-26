import React from 'react';
import { getPasswordStrength } from '../../constants/validation';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
  className = '',
}) => {
  if (!password) return null;

  const strength = getPasswordStrength(password);
  const progressPercentage = (strength.score / 5) * 100;

  const getProgressColor = (score: number) => {
    if (score <= 1) return 'bg-red-500';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-green-500';
    return 'bg-green-600';
  };

  return (
    <div className={`mt-2 ${className}`}>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-xs text-gray-600'>Password strength:</span>
        <span className={`text-xs font-medium ${strength.color}`}>
          {strength.label}
        </span>
      </div>

      <div className='w-full bg-gray-200 rounded-full h-2'>
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
            strength.score
          )}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className='mt-2 text-xs text-gray-500'>
        <p>Password must contain:</p>
        <ul className='mt-1 space-y-1'>
          <li
            className={`flex items-center gap-1 ${
              password.length >= 8 ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span>{password.length >= 8 ? '✓' : '○'}</span>
            At least 8 characters
          </li>
          <li
            className={`flex items-center gap-1 ${
              /[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span>{/[a-z]/.test(password) ? '✓' : '○'}</span>
            One lowercase letter
          </li>
          <li
            className={`flex items-center gap-1 ${
              /[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span>{/[A-Z]/.test(password) ? '✓' : '○'}</span>
            One uppercase letter
          </li>
          <li
            className={`flex items-center gap-1 ${
              /\d/.test(password) ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span>{/\d/.test(password) ? '✓' : '○'}</span>
            One number
          </li>
          <li
            className={`flex items-center gap-1 ${
              /[@$!%*?&]/.test(password) ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <span>{/[@$!%*?&]/.test(password) ? '✓' : '○'}</span>
            One special character (@$!%*?&)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
