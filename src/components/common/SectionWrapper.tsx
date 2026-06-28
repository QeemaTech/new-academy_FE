import { ReactNode, forwardRef } from 'react';

interface Props {
  title?: string;
  subtitle?: string;
  background?: 'white' | 'sky' | 'sky-2';
  children: ReactNode;
  className?: string;
  id?: string;
}

const SectionWrapper = forwardRef<HTMLElement, Props>(
  ({ title, subtitle, background = 'white', children, className = '', id }, ref) => {
    const bgClass = background === 'sky' ? 'bg-sky-bg' : background === 'sky-2' ? 'bg-sky-bg2' : 'bg-white';

    return (
      <section ref={ref} id={id} className={`py-16 lg:py-24 relative ${bgClass} ${className}`}>
        {/* Background pattern overlay */}
        {background === 'sky' && (
          <div className="absolute inset-0 w-full h-full bg-pattern-dots pointer-events-none" />
        )}
        <div className="container mx-auto px-4 relative z-10">
          {(title || subtitle) && (
            <div className="text-center mb-12">
              {title && (
                <h2 className="mb-4 relative inline-block pb-2 font-bold text-3xl lg:text-4xl text-custom-text">
                  {title}
                  <span className="absolute bottom-0 inset-x-1/4 h-1 bg-primary rounded-sm" />
                </h2>
              )}
              {subtitle && (
                <p className="mx-auto animate-fade-in max-w-[600px] text-[17px] text-custom-muted">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </section>
    );
  }
);

SectionWrapper.displayName = 'SectionWrapper';

export default SectionWrapper;

