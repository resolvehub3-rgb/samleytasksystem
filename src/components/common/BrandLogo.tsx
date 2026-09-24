import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '' }) => {
  const iconSizes = {
    sm: 'w-7 h-7 text-sm',
    md: 'w-9 h-9 text-base',
    lg: 'w-11 h-11 text-xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Visual Anchor: Deep Green #0B5D3B with subtle Deep Yellow #D9A400 accent */}
      <div
        className={`${iconSizes[size]} rounded-lg bg-[#0B5D3B] text-white flex items-center justify-center font-bold tracking-wider shadow-sm shrink-0 relative overflow-hidden`}
      >
        <span className="relative z-10 font-bold">SE</span>
        <div className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-[#D9A400] rounded-full opacity-90" />
      </div>

      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-bold tracking-tight text-neutral-900 dark:text-white leading-tight`}>
          Sync<span className="text-[#0B5D3B] dark:text-[#28A76B]">Edge</span>
          <span className="text-[#D9A400] text-xs font-semibold ml-1 uppercase tracking-widest align-super">Pro</span>
        </span>
      </div>
    </div>
  );
};
