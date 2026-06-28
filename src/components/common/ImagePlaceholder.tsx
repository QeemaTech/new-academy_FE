import { CSSProperties } from 'react';

interface Props {
  width?: number | string;
  height?: number | string;
  icon?: string;
  text?: string;
  gradient?: string;
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
}

export default function ImagePlaceholder({
  width = '100%',
  height = 300,
  icon = 'bi-image',
  text,
  gradient,
  className = '',
  style,
  children,
}: Props) {
  const defaultGradient = gradient || 'linear-gradient(135deg, var(--primary-blue-light) 0%, var(--sky-bg) 100%)';

  return (
    <div
      className={`d-flex align-items-center justify-content-center rounded-na position-relative overflow-hidden ${className}`}
      style={{
        width,
        height,
        background: defaultGradient,
        ...style,
      }}
    >
      {children || (
        <>
          <i className={`bi ${icon}`} style={{ fontSize: 64, color: 'var(--primary-blue)', opacity: 0.3 }}></i>
          {text && (
            <div
              className="position-absolute bottom-0 start-0 end-0 text-center p-3"
              style={{
                background: 'rgba(255,255,255,0.9)',
                fontSize: 14,
                color: 'var(--muted-text)',
              }}
            >
              {text}
            </div>
          )}
        </>
      )}
    </div>
  );
}

