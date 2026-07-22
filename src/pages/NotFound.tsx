import React from 'react';
import { useNavigate } from 'react-router-dom';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <span className="text-6xl mb-4 select-none">⛏️</span>
      <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">404</h1>
      <h2 className="text-lg font-bold text-slate-700 mt-2">Página no encontrada</h2>
      <p className="text-slate-500 max-w-sm mt-2 text-sm leading-relaxed font-semibold">
        La sección a la que intenta ingresar no existe o no tiene los permisos suficientes en este momento.
      </p>
      <button 
        type="button"
        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 mt-6 active:scale-[0.98] transition-all text-sm"
        onClick={() => navigate('/')}
      >
        Ir al Dashboard
      </button>
    </div>
  );
};

export default NotFound;
