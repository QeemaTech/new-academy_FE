import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { hasPermission } from '../../lib/permissions';

interface CanProps {
  operation: string;
  resource?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Access Control Wrapper Component.
 * Intelligently checks user permissions (Matrix + Role Bypass).
 */
export const Can: React.FC<CanProps> = ({ 
  operation, 
  resource, 
  children, 
  fallback = null 
}) => {
  const user = useAuthStore((s) => s.user);

  if (hasPermission(user, operation, resource)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

export default Can;
