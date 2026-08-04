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
    blue: 'bg-sky-500/10 backdrop-blur-3xl border-sky-300/30 text-white shadow-[0_20px_45px_rgba(0,0,0,0.2),0_0_30px_rgba(14,165,233,0.15)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.25),0_0_45px_rgba(56,189,248,0.25)] hover:bg-sky-500/15 hover:border-sky-300/50',
    default: 'bg-white/10 backdrop-blur-3xl border-white/25 text-white shadow-[0_20px_45px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.2),0_0_40px_rgba(56,189,248,0.15)] hover:bg-white/15 hover:border-white/40',
    emerald: 'bg-emerald-500/10 backdrop-blur-3xl border-emerald-300/30 text-white shadow-[0_20px_45px_rgba(0,0,0,0.2),0_0_30px_rgba(16,185,129,0.15)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.25),0_0_45px_rgba(16,185,129,0.25)] hover:bg-emerald-500/15 hover:border-emerald-300/50',
    amber: 'bg-amber-500/10 backdrop-blur-3xl border-amber-300/30 text-white shadow-[0_20px_45px_rgba(0,0,0,0.2),0_0_30px_rgba(245,158,11,0.15)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.25),0_0_45px_rgba(245,158,11,0.25)] hover:bg-amber-500/15 hover:border-amber-300/50',
    rose: 'bg-rose-500/10 backdrop-blur-3xl border-rose-300/30 text-white shadow-[0_20px_45px_rgba(0,0,0,0.2),0_0_30px_rgba(244,63,94,0.15)] hover:shadow-[0_25px_55px_rgba(0,0,0,0.25),0_0_45px_rgba(244,63,94,0.25)] hover:bg-rose-500/15 hover:border-rose-300/50',
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
