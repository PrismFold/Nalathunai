import React from 'react';

export const Card = ({ children, className = '', hover = false, onClick }) => {
  const hoverClass = hover
    ? 'transition-all duration-200 hover:border-[#C8BFB0] hover:bg-[#FAF6EE] cursor-pointer hover:shadow-xs'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-[#FAF7F2] border border-[#E5DDD0] rounded-xl p-5 shadow-[0_1px_3px_rgba(47,45,41,0.03)] ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
};

