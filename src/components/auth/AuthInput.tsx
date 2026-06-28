import React, { useState } from 'react';
import { Eye, EyeOff, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
}

export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, icon: Icon, error, hint, type, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="space-y-1.5 w-full group">
        <label className="text-xs font-black uppercase tracking-widest text-gray-400 ms-1 transition-colors group-focus-within:text-[#4178EF]">
          {label}
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#4178EF] transition-colors">
            <Icon size={18} />
          </div>
          
          <input
            ref={ref}
            type={inputType}
            className={cn(
              "w-full h-14 bg-gray-50 border-2 border-transparent rounded-2xl px-12 font-bold text-gray-700 transition-all outline-none",
              "placeholder:text-gray-300 placeholder:font-medium",
              "focus:bg-white focus:border-[#4178EF]/20 focus:ring-4 focus:ring-[#4178EF]/5",
              error && "border-red-100 bg-red-50/30 focus:border-red-200 focus:ring-red-100/50",
              className
            )}
            {...props}
          />

          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {hint && !error && (
          <p className="text-[10px] font-bold text-gray-400 ms-2">{hint}</p>
        )}
        
        {error && (
          <p className="text-[10px] font-black uppercase tracking-wider text-red-500 ms-2 animate-in fade-in slide-in-from-top-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = 'AuthInput';
