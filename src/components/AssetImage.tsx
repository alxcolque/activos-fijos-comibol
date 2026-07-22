import React, { useState } from 'react';
import { 
  HiOutlineComputerDesktop, 
  HiOutlineTruck, 
  HiOutlineBriefcase, 
  HiOutlineArchiveBox 
} from 'react-icons/hi2';
import { GiMining } from 'react-icons/gi';

interface AssetImageProps {
  src?: string;
  alt: string;
  categoryId?: string;
  className?: string;
}

export const AssetImage: React.FC<AssetImageProps> = ({ 
  src, 
  alt, 
  categoryId, 
  className = "w-full h-full object-cover" 
}) => {
  const [error, setError] = useState(false);

  const getFallbackIcon = () => {
    switch (categoryId) {
      case 'cat-01': // Maquinaria Pesada
        return <GiMining className="text-5xl text-amber-600" />;
      case 'cat-02': // Equipos de Computación
        return <HiOutlineComputerDesktop className="text-5xl text-blue-600" />;
      case 'cat-03': // Vehículos
        return <HiOutlineTruck className="text-5xl text-emerald-600" />;
      case 'cat-04': // Muebles y Enseres
        return <HiOutlineArchiveBox className="text-5xl text-slate-600" />;
      default:
        return <HiOutlineBriefcase className="text-5xl text-slate-500" />;
    }
  };

  const getFallbackBg = () => {
    switch (categoryId) {
      case 'cat-01':
        return 'from-amber-50 to-amber-100/60 border-amber-200';
      case 'cat-02':
        return 'from-blue-50 to-blue-100/60 border-blue-200';
      case 'cat-03':
        return 'from-emerald-50 to-emerald-100/60 border-emerald-200';
      case 'cat-04':
        return 'from-slate-50 to-slate-100/60 border-slate-200';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200';
    }
  };

  if (!src || error) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${getFallbackBg()} border border-dashed rounded-xl gap-2 ${className}`}>
        {getFallbackIcon()}
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider px-2 text-center truncate w-full">
          Sin Imagen
        </span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={alt} 
      className={`rounded-xl border border-slate-200/50 ${className}`} 
      onError={() => setError(true)}
      loading="lazy"
    />
  );
};

export default AssetImage;
