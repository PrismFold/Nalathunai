import React from 'react';

const STATUS_STYLES = {
  Active:    'bg-[#EBF0E6] text-[#425938] border-[#CFDCB8]',
  Pending:   'bg-[#FBF1E2] text-[#865F1D] border-[#EAD7B0]',
  Expired:   'bg-[#EDE7DC] text-[#696356] border-[#DDD3C2]',
  Revoked:   'bg-[#F7EBE8] text-[#933D33] border-[#EEC4BD]',
  Available: 'bg-[#EAF1F0] text-[#305F63] border-[#BED5D7]',
  Denied:    'bg-[#F7EBE8] text-[#933D33] border-[#EEC4BD]',
};

export const StatusBadge = ({ status }) => {
  const style = STATUS_STYLES[status] || 'bg-[#EDE7DC] text-[#696356] border-[#DDD3C2]';
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border ${style}`}
    >
      {status}
    </span>
  );
};

