import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  variant?: 'default' | 'search';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, variant = 'default', id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-semibold text-white mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-spotify-card text-white placeholder:text-spotify-muted/60 transition-all duration-200 focus:outline-none',
            variant === 'default' &&
              'rounded-md px-4 py-3 border border-spotify-border focus:border-spotify-green focus:ring-1 focus:ring-spotify-green',
            variant === 'search' &&
              'rounded-full px-12 py-3 bg-spotify-card/80 border-0 focus:bg-spotify-hover',
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
