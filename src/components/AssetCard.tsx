import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { AssetModel } from '../interfaces/asset.interface';
import { AssetImage } from './AssetImage';
import { StatusBadge } from './StatusBadge';

import { formatCurrency } from '../utils/currency';

interface AssetCardProps {
  asset: AssetModel;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const navigate = useNavigate();

  const formattedValue = formatCurrency(asset.purchaseValue);

  return (
    <div
      onClick={() => navigate(`/assets/${asset.id}`)}
      className="border border-slate-200/80 bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-200 rounded-2xl cursor-pointer overflow-hidden flex flex-col shadow-xs"
    >
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
      <div className="p-4 flex-1 flex flex-col justify-between gap-2 bg-white">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono font-bold text-amber-600 uppercase">{asset.code}</span>
          <h4 className="text-sm font-bold text-slate-800 tracking-tight mt-0.5 line-clamp-1">{asset.name}</h4>
          <span className="text-xs text-slate-500 font-semibold mt-1 truncate">
            {asset.category?.name || 'Sin Categoría'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-500 font-medium truncate">
            📍 {asset.location?.name || 'Sin Ubicación'}
          </span>
          <span className="text-xs font-bold text-slate-800 shrink-0">
            {formattedValue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
