import { cn } from '@/utils/cn';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightElement, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[#1a2e1d]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3 text-[#6b7c6e]">{leftIcon}</span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl border border-[#e2e8e4] bg-white px-4 py-2.5 text-sm text-[#1a2e1d] placeholder:text-[#9aab9e] transition-colors',
              'focus:border-[#1a5c2a] focus:ring-2 focus:ring-[#1a5c2a]/20',
              error && 'border-[#e53935] focus:border-[#e53935] focus:ring-[#e53935]/20',
              leftIcon && 'pl-10',
              rightElement && 'pr-10',
              className
            )}
            {...props}
          />
          {rightElement && (
            <span className="absolute right-3">{rightElement}</span>
          )}
        </div>
        {error && <p className="text-xs text-[#e53935]">{error}</p>}
        {hint && !error && <p className="text-xs text-[#6b7c6e]">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
