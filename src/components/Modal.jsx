import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2F2D29]/40 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className={`bg-[#FAF7F2] rounded-2xl shadow-2xl border border-[#E5DDD0] w-full ${sizeClasses[size]} overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-[#EAE3D5]">
          <h3 className="text-lg font-serif font-semibold text-[#2F2D29] tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-[#787469] hover:text-[#2F2D29] hover:bg-[#EFEAE0] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-[#4B4A3F]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#EAE3D5] bg-[#F4EFE6] flex items-center justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
