import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#A7AA91]/60 disabled:opacity-45 disabled:cursor-not-allowed select-none';

  const variants = {
    primary:   'bg-[#2F2D29] hover:bg-[#1E1D1A] text-[#F7F3EA] border border-[#2F2D29] shadow-xs active:translate-y-px',
    secondary: 'bg-[#FAF7F2] hover:bg-[#EFEAE0] text-[#2F2D29] border border-[#DED2C0] shadow-xs active:translate-y-px',
    outline:   'bg-transparent border border-[#DED2C0] text-[#4B4A3F] hover:bg-[#FAF7F2] hover:border-[#C8BFB0]',
    danger:    'bg-[#A84236] hover:bg-[#8F352A] text-white border border-transparent shadow-xs',
    ghost:     'text-[#5A574E] hover:bg-[#EFEAE0]/70 hover:text-[#2F2D29] border border-transparent',
    sage:      'bg-[#5F6753] hover:bg-[#4E5544] text-[#F7F3EA] border border-[#5F6753] shadow-xs',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 15} strokeWidth={1.75} />}
      {children}
    </button>
  );
};

