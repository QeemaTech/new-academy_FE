import { ReactNode, CSSProperties, HTMLAttributes } from 'react';

interface Props extends Pick<HTMLAttributes<HTMLDivElement>, 'onMouseEnter' | 'onMouseLeave'> {
  children: ReactNode;
  className?: string;
  flat?: boolean;
  hover?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
}

export default function AppCard({
  children,
  className = '',
  flat,
  hover = true,
  style,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  const baseClasses = "bg-white rounded-2xl p-6 transition-all duration-300 border";
  const flatClasses = flat ? "shadow-none border-custom-border" : "shadow-card border-transparent";
  const hoverClasses = hover && !flat ? "hover:shadow-card-hover hover:-translate-y-1" : "";
  const cursorClass = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${flatClasses} ${hoverClasses} ${cursorClass} ${className}`}
      style={style}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
    </div>
  );
}




