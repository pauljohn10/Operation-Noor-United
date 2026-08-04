import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glossyHeader?: boolean;
  hoverEffect?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  glossyHeader = true,
  hoverEffect = true,
  ...props
}) => {
  return (
    <div
      className={`relative bg-white/10 backdrop-blur-3xl border border-white/25 rounded-[24px] p-5 sm:p-6 shadow-[0_20px_45px_rgba(0,0,0,0.15),0_0_30px_rgba(255,255,255,0.05)] ${
        hoverEffect
          ? 'hover:shadow-[0_25px_55px_rgba(0,0,0,0.2),0_0_40px_rgba(56,189,248,0.15)] hover:bg-white/15 hover:border-white/40 hover:-translate-y-1 transition-all duration-300'
          : ''
      } overflow-hidden ${className}`}
      {...props}
    >
      {glossyHeader && (
        <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-white/30 via-white/5 to-transparent rounded-t-[24px] pointer-events-none z-0" />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
};
