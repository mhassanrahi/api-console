import React from 'react';
import type { FieldError } from 'react-hook-form';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'tel';
  placeholder?: string;
  error?: FieldError;
  required?: boolean;
  maxLength?: number;
  className?: string;
  inputClassName?: string;
  children?: React.ReactNode;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = 'text',
  placeholder,
  error,
  required = false,
  maxLength,
  className = '',
  inputClassName = '',
  children,
}) => {
  return (
    <div className={className}>
      <label
        htmlFor={name}
        className='block text-sm font-medium text-gray-700 mb-2'
      >
        {label}
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      {children || (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 placeholder-gray-400 ${
            error
              ? 'border-red-300 bg-red-50 focus:ring-red-500'
              : 'border-gray-300 bg-white'
          } ${inputClassName}`}
        />
      )}

      {error && (
        <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
          <span className='text-red-500'>⚠</span>
          {error.message}
        </p>
      )}
    </div>
  );
};

export default FormField;
