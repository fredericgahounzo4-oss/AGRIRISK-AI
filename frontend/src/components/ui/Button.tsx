import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants = {
  primary:   'bg-[#1a5c2a] text-white hover:bg-[#0f3d1a] active:scale-[0.98]',
  secondary: 'bg-[#e8f5e9] text-[#1a5c2a] hover:bg-[#d4edda]',
  outline:   'border border-[#1a5c2a] text-[#1a5c2a] bg-transparent hover:bg-[#e8f5e9]',
  ghost:     'text-[#6b7c6e] hover:bg-[#f0f4f0] bg-transparent',
  danger:    'bg-[#e53935] text-white hover:bg-[#c62828]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:ring-2 focus-visible:ring-[#4caf50] focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
