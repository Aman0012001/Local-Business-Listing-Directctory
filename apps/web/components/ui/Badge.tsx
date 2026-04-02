import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
}

export const Badge = ({ children, className = "", variant = 'default' }: BadgeProps) => {
  const variants = {
    default: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    outline: 'border-gray-800 text-gray-400',
    secondary: 'bg-gray-800 text-gray-300 border-gray-700',
    destructive: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border transition-colors ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};
