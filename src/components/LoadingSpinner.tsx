import React from 'react';

interface LoadingSpinnerProps {
  label?: string;
  fullPage?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  label = "Cargando datos...", 
  fullPage = false 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${
      fullPage ? 'w-screen h-screen fixed inset-0 bg-slate-50/80 backdrop-blur-sm z-50' : 'w-full py-12'
    }`}>
      <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin shrink-0" />
      <span className="text-sm font-semibold text-slate-500 tracking-wide">{label}</span>
    </div>
  );
};

export default LoadingSpinner;
