import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-muted text-foreground',
        primary: 'border-transparent bg-primary/15 text-primary',
        success: 'border-transparent bg-[color:color-mix(in_srgb,var(--color-success)_18%,transparent)] text-[color:var(--color-success)]',
        warning: 'border-transparent bg-[color:color-mix(in_srgb,var(--color-warning)_22%,transparent)] text-foreground/80',
        destructive:
          'border-transparent bg-[color:color-mix(in_srgb,var(--color-destructive)_18%,transparent)] text-[color:var(--color-destructive)]',
        outline: 'border-border bg-transparent text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

