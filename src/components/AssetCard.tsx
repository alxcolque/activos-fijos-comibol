import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AssetModel } from '../interfaces/asset.interface';
import { AssetImage } from './AssetImage';
import { StatusBadge } from './StatusBadge';
import { formatCurrency } from '../utils/currency';
import {
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from 'react-icons/hi2';

import { useAuthStore } from '../store/authStore';

interface AssetCardProps {
  asset: AssetModel;
  calculationDate?: string;
  onDelete?: (asset: AssetModel) => void;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, calculationDate, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isGuest = user?.role === 'guest';

  const formattedValue = formatCurrency(asset.purchaseValue);

  return (
    <div className="border border-slate-200/80 bg-white hover:shadow-md transition-all duration-200 rounded-2xl overflow-hidden flex flex-col shadow-xs">
      <div className="flex flex-col h-40 overflow-hidden relative shrink-0 bg-slate-100">
        <AssetImage
          src={asset.photo || undefined}
          alt={asset.name}
          categoryId={asset.categoryId}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2.5 right-2.5 z-10">
          <StatusBadge status={asset.status?.name || 'Operativo'} />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-3 bg-white">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">{asset.code}</span>
          <h4 className="text-sm font-bold text-slate-800 tracking-tight mt-0.5 line-clamp-1">{asset.name}</h4>
          <span className="text-xs text-slate-500 font-semibold mt-1 truncate">
            {asset.category?.name || 'Sin Categoría'}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium truncate">
            📍 {asset.location?.name || 'Sin Ubicación'}
          </span>
          <span className="font-bold text-slate-800 shrink-0">
            {formattedValue}
          </span>
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Acciones</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => navigate(`/activos/${asset.id}${calculationDate ? `?calculationDate=${calculationDate}` : ''}`)}
              title="Ver Ficha Técnica"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
            >
              <HiOutlineEye className="text-sm" />
              <span>Ver</span>
            </button>
            {!isGuest && (
              <>
                <button
                  type="button"
                  onClick={() => navigate(`/activos/${asset.id}/editar`)}
                  title="Editar Activo"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <HiOutlinePencilSquare className="text-sm" />
                  <span>Editar</span>
                </button>
                {onDelete && (
                  <button
                    type="button"
                    onClick={() => onDelete(asset)}
                    title="Eliminar Activo"
                    className="p-1.5 rounded-xl text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    <HiOutlineTrash className="text-sm" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
