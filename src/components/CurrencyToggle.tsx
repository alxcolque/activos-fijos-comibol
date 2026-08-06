import React, { useEffect } from 'react';
import { useCurrencyStore } from '../store/currencyStore';

// Icono Bandera de Bolivia (SVG)
const BoliviaFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="8" fill="#D80027" />
    <rect y="8" width="36" height="8" fill="#FFDA44" />
    <rect y="16" width="36" height="8" fill="#007A3D" />
  </svg>
);

// Icono Bandera de Estados Unidos (SVG)
const UsaFlagIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 36 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="24" fill="#D80027" />
    <rect y="2" width="36" height="2.5" fill="#FFFFFF" />
    <rect y="7" width="36" height="2.5" fill="#FFFFFF" />
    <rect y="12" width="36" height="2.5" fill="#FFFFFF" />
    <rect y="17" width="36" height="2.5" fill="#FFFFFF" />
    <rect width="16" height="13" fill="#00205B" />
    <circle cx="4" cy="3.5" r="1" fill="#FFFFFF" />
    <circle cx="12" cy="3.5" r="1" fill="#FFFFFF" />
    <circle cx="8" cy="6.5" r="1" fill="#FFFFFF" />
    <circle cx="4" cy="9.5" r="1" fill="#FFFFFF" />
    <circle cx="12" cy="9.5" r="1" fill="#FFFFFF" />
  </svg>
);

export const CurrencyToggle: React.FC = () => {
  const { currency, toggleCurrency, exchangeRate, fetchExchangeRate, isLoadingRate } = useCurrencyStore();

  useEffect(() => {
    fetchExchangeRate();
  }, [fetchExchangeRate]);

  const handleToggle = () => {
    toggleCurrency();
    window.location.reload();
  };

  return (
    <div className="relative group flex items-center">
      {/* Botón Switcher */}
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 p-1 bg-slate-100/90 hover:bg-slate-200/70 border border-slate-200 rounded-full transition-all cursor-pointer shadow-2xs select-none"
      >
        {/* Opción BOB */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-extrabold transition-all duration-200 ${currency === 'BOB'
            ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80 scale-[1.02]'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-black/10 shadow-2xs">
            <BoliviaFlagIcon className="w-full h-full object-cover" />
          </div>
          <span>BOB</span>
        </div>

        {/* Opción USD */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-extrabold transition-all duration-200 ${currency === 'USD'
            ? 'bg-white text-emerald-800 shadow-xs border border-slate-200/80 scale-[1.02]'
            : 'text-slate-500 hover:text-slate-700'
            }`}
        >
          <div className="w-3.5 h-3.5 rounded-full overflow-hidden shrink-0 border border-black/10 shadow-2xs">
            <UsaFlagIcon className="w-full h-full object-cover" />
          </div>
          <span>USD</span>
        </div>
      </button>

      {/* Tooltip con Tipo de Cambio oficial de DolarApi */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex flex-col items-center pointer-events-none z-40 animate-in fade-in slide-in-from-top-1 duration-150">
        <div className="w-2 h-2 border-t border-l border-slate-800 bg-slate-800 rotate-45 -mb-1"></div>
        <div className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-1.2 rounded-lg shadow-xl whitespace-nowrap flex items-center gap-1.5 border border-slate-700">
          <span>TC Dólar Oficial:</span>
          <span className="text-emerald-400 font-extrabold">1 USD = {exchangeRate.toFixed(2)} Bs.</span>
          {isLoadingRate && <span className="animate-spin text-[9px]">⌛</span>}
        </div>
      </div>
    </div>
  );
};
