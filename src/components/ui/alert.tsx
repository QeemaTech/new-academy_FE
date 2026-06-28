import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/cn';

const alertVariants = cva(
  'relative w-full rounded-2xl border px-4 py-3 text-sm [&_svg]:absolute [&_svg]:start-4 [&_svg]:top-3.5 [&_svg~*]:ps-8',
  {
    variants: {
      variant: {
        default: 'border-slate-200 bg-white text-slate-900',
        destructive: 'border-rose-200 bg-rose-50 text-rose-950 [&_svg]:text-rose-600',
        warning: 'border-amber-200 bg-amber-50 text-amber-950 [&_svg]:text-amber-600',
        success: 'border-emerald-200 bg-emerald-50 text-emerald-950 [&_svg]:text-emerald-600',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={cn('mb-1 font-black leading-none tracking-tight', className)} {...props} />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm font-medium opacity-90 [&_p]:leading-relaxed', className)} {...props} />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };
