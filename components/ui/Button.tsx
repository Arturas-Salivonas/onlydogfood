import { forwardRef } from 'react';
import Link from 'next/link';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[30px] text-base font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[var(--color-trust)]',
  {
    variants: {
      variant: {
        default: 'bg-[var(--color-trust)] text-[var(--color-background-card)] shadow-[var(--shadow-medium)] hover:opacity-90',
        outline: 'border bg-[var(--color-background-card)] text-[var(--color-text-primary)] hover:bg-[var(--color-trust-bg)] border-[var(--color-border)]',
        secondary: 'bg-[var(--color-background-neutral)] text-[var(--color-text-primary)] hover:bg-[var(--color-trust-bg)]',
        ghost: 'hover:bg-[var(--color-trust-bg)]',
        link: 'text-[var(--color-trust)] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-[30px] px-3 text-sm',
        lg: 'h-11 rounded-[30px] px-8',
        xl: 'h-12 rounded-[30px] px-10 text-lg',
        icon: 'h-10 w-10',
        'icon-sm': 'h-9 w-9',
        'icon-lg': 'h-11 w-11',
      },
      fullWidth: {
        true: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  href?: string;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant,
    size,
    fullWidth,
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    href,
    asChild,
    ...props
  }, ref) => {
    const buttonContent = (
      <>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </>
    );

    const buttonClasses = cn(buttonVariants({ variant, size, fullWidth, className }));

    // If href is provided, render as Link
    if (href) {
      return (
        <Link href={href} className={buttonClasses}>
          {buttonContent}
        </Link>
      );
    }

    // If asChild is true, render as child component
    if (asChild) {
      return (
        <span className={buttonClasses}>
          {children}
        </span>
      );
    }

    return (
      <button
        className={buttonClasses}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {buttonContent}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
