import { ReactNode, useEffect } from 'react';

interface Props {
  show: boolean;
  onHide: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: ReactNode;
}

export default function AppModal({ show, onHide, title, children, size = 'md', footer }: Props) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1060,
        animation: 'fadeIn 0.2s ease',
      }}
      onClick={onHide}
    >
      <div
        className={`bg-white rounded-na shadow-lg`}
        style={{
          width: size === 'sm' ? '400px' : size === 'md' ? '500px' : size === 'lg' ? '700px' : '900px',
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'fadeInUp 0.3s ease',
        }}
        onClick={e => e.stopPropagation()}
      >
        {title && (
          <div
            className="d-flex align-items-center justify-content-between p-4 border-bottom"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            <h5 className="mb-0 fw-bold">{title}</h5>
            <button
              className="btn p-0"
              onClick={onHide}
              style={{ width: 32, height: 32, fontSize: 20, color: 'var(--muted-text)' }}
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
        )}
        <div className="p-4">{children}</div>
        {footer && (
          <div
            className="d-flex align-items-center justify-content-end gap-2 p-4 border-top"
            style={{ borderColor: 'var(--border-soft)' }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
