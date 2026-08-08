import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glossyHeader?: boolean;
  hoverEffect?: boolean;
  variant?: 'blue' | 'default' | 'emerald' | 'amber' | 'rose';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glossyHeader = true,
  hoverEffect = true,
  variant = 'blue',
  ...props
}) => {
  const variantStyles = {
    blue: 'bg-white/95 backdrop-blur-md border-sky-200/90 text-slate-900 shadow-sm hover:shadow-md hover:border-sky-300 hover:bg-white',
    default: 'bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-900 shadow-sm hover:shadow-md hover:border-slate-300 hover:bg-white',
    emerald: 'bg-white/95 backdrop-blur-md border-emerald-200/90 text-slate-900 shadow-sm hover:shadow-md hover:border-emerald-300 hover:bg-white',
    amber: 'bg-white/95 backdrop-blur-md border-amber-200/90 text-slate-900 shadow-sm hover:shadow-md hover:border-amber-300 hover:bg-white',
    rose: 'bg-white/95 backdrop-blur-md border-rose-200/90 text-slate-900 shadow-sm hover:shadow-md hover:border-rose-300 hover:bg-white',
  };

  const selectedVariant = variantStyles[variant] || variantStyles.blue;

  return (
    <div
      className={`relative border rounded-[24px] p-5 sm:p-6 ${selectedVariant} ${
        hoverEffect ? 'hover:-translate-y-1 transition-all duration-300' : ''
      } overflow-hidden ${className}`}
      {...props}
    >
      {glossyHeader && (
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-sky-300/25 via-white/5 to-transparent rounded-t-[24px] pointer-events-none z-0" />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
