import React from 'react';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  message?: string;
  className?: string;
}

export const FormError: React.FC<FormErrorProps> = ({ message, className }) => {
  if (!message) return null;
  
  return (
    <div className={cn("form-error", className)}>
      <p className="flex items-center">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor" 
          className="w-4 h-4 mr-2"
        >
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" 
            clipRule="evenodd" 
          />
        </svg>
        {message}
      </p>
    </div>
  );
};

interface ErrorTextProps {
  children: React.ReactNode;
  className?: string;
}

export const ErrorText: React.FC<ErrorTextProps> = ({ children, className }) => {
  if (!children) return null;
  
  return (
    <p className={cn("error-text", className)}>
      {children}
    </p>
  );
}; 