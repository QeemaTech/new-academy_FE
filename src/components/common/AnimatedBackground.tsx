import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  variant?: 'dots' | 'grid' | 'gradient' | 'waves';
}

export default function AnimatedBackground({ children, className = '', variant = 'dots' }: Props) {
  const getBackgroundStyle = () => {
    switch (variant) {
      case 'dots':
        return {
          backgroundImage: 'radial-gradient(circle, var(--primary-blue-light) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          opacity: 0.3,
        };
      case 'grid':
        return {
          backgroundImage: `
            linear-gradient(var(--border-soft) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-soft) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          opacity: 0.2,
        };
      case 'gradient':
        return {
          background: `
            radial-gradient(circle at 20% 50%, rgba(54,109,236,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(70,210,104,0.1) 0%, transparent 50%)
          `,
        };
      case 'waves':
        return {
          background: `
            linear-gradient(180deg, transparent 0%, rgba(54,109,236,0.05) 50%, transparent 100%)
          `,
        };
      default:
        return {};
    }
  };

  return (
    <div className={`position-relative ${className}`}>
      <div
        className="position-absolute w-100 h-100"
        style={{
          ...getBackgroundStyle(),
          top: 0,
          left: 0,
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div className="position-relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

