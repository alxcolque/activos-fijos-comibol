import React from 'react';

interface QRBadgeProps {
  value: string;
  size?: number;
}

export const QRBadge: React.FC<QRBadgeProps> = ({ value, size = 100 }) => {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&color=1e293b`;

  return (
    <div className="flex flex-col items-center gap-1.5 select-none shrink-0">
      <div className="border border-slate-200/80 shadow-sm p-2 bg-white max-w-fit rounded-lg flex items-center justify-center">
        <img 
          src={qrUrl} 
          alt={`Código QR para ${value}`} 
          style={{ width: size, height: size }}
          className="rounded"
          loading="lazy"
        />
      </div>
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">{value}</span>
    </div>
  );
};

export default QRBadge;
