import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-bold rounded-full transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
          // Variants
          variant === 'primary' && 'bg-spotify-green hover:bg-spotify-green-bright text-black hover:scale-105 active:scale-100',
          variant === 'secondary' && 'bg-white text-black hover:scale-105',
          variant === 'outline' && 'border border-white/30 text-white hover:border-white hover:scale-105 bg-transparent',
          variant === 'ghost' && 'text-spotify-muted hover:text-white bg-transparent',
          variant === 'danger' && 'bg-red-600 hover:bg-red-500 text-white hover:scale-105',
          // Sizes
          size === 'sm' && 'text-xs px-4 py-1.5',
          size === 'md' && 'text-sm px-6 py-2.5',
          size === 'lg' && 'text-base px-8 py-3',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
