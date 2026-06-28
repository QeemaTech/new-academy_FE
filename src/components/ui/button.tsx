import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center gap-2 whitespace-nowrap',
    'rounded-[var(--radius-sm)] text-sm font-semibold',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-primary)] focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'ring-offset-[color:var(--color-background)]',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-[color:var(--color-foreground)] text-white hover:opacity-95',
        primary:
          'bg-[color:var(--color-primary)] text-white hover:bg-[color:var(--color-primary-hover)]',
        outline:
          'border border-[color:var(--color-border)] bg-transparent text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)]',
        ghost:
          'bg-transparent text-[color:var(--color-foreground)] hover:bg-[color:var(--color-muted)]',
        destructive:
          'bg-[color:var(--color-destructive)] text-white hover:opacity-95',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-[15px]',
        icon: 'h-10 w-10 p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        type={type ?? (asChild ? undefined : 'button')}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { buttonVariants };

