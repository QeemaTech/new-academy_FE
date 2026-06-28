import { ReactNode, ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'success' | 'white';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  icon?: string;
  iconPosition?: 'left' | 'right';
}

export function PrimaryButton({ children, icon, iconPosition = 'right', size = 'md', className = '', ...props }: Props) {
  const sizeClass = size === 'sm' ? 'btn-sm-na' : size === 'lg' ? 'btn-lg-na' : '';
  return (
    <button className={`btn btn-na-primary ${sizeClass} ${className}`} {...props}>
      {icon && iconPosition === 'left' && <i className={`bi ${icon}`}></i>}
      {children}
      {icon && iconPosition === 'right' && <i className={`bi ${icon}`}></i>}
    </button>
  );
}

export function OutlineButton({ children, icon, iconPosition = 'right', size = 'md', className = '', ...props }: Props) {
  const sizeClass = size === 'sm' ? 'btn-sm-na' : size === 'lg' ? 'btn-lg-na' : '';
  return (
    <button className={`btn btn-na-outline ${sizeClass} ${className}`} {...props}>
      {icon && iconPosition === 'left' && <i className={`bi ${icon}`}></i>}
      {children}
      {icon && iconPosition === 'right' && <i className={`bi ${icon}`}></i>}
    </button>
  );
}

export function SuccessButton({ children, icon, iconPosition = 'right', size = 'md', className = '', ...props }: Props) {
  const sizeClass = size === 'sm' ? 'btn-sm-na' : size === 'lg' ? 'btn-lg-na' : '';
  return (
    <button className={`btn btn-na-success ${sizeClass} ${className}`} {...props}>
      {icon && iconPosition === 'left' && <i className={`bi ${icon}`}></i>}
      {children}
      {icon && iconPosition === 'right' && <i className={`bi ${icon}`}></i>}
    </button>
  );
}

