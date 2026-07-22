import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Asset } from '../interfaces';
import { AssetImage } from './AssetImage';
import { StatusBadge } from './StatusBadge';
import { useAssetStore } from '../store/assetStore';

interface AssetCardProps {
  asset: Asset;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset }) => {
  const navigate = useNavigate();
  const { categories, locations } = useAssetStore();

  const category = categories.find(c => c.id === asset.categoryId);
  const location = locations.find(l => l.id === asset.locationId);

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(asset.value);

  return (
    <div 
      onClick={() => navigate(`/assets/${asset.id}`)}
      className="border border-slate-200/60 bg-white hover:-translate-y-1 hover:shadow-md transition-all duration-200 rounded-xl cursor-pointer overflow-hidden flex flex-col shadow-sm"
    >
      <div className="flex flex-col h-44 overflow-hidden relative shrink-0 animate-in fade-in duration-300">
        <AssetImage 
          src={asset.image} 
          alt={asset.name} 
          categoryId={asset.categoryId}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2.5 right-2.5 z-10">
          <StatusBadge status={asset.status} />
        </div>
      </div>
      <hr className="border-t border-slate-100" />
      <div className="p-4 flex-1 flex flex-col justify-between gap-2 bg-white">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">{asset.code}</span>
          <h4 className="text-sm font-bold text-slate-800 tracking-tight mt-0.5 line-clamp-1">{asset.name}</h4>
          <span className="text-xs text-slate-500 font-semibold mt-1 truncate">
            {category?.name || 'Sin Categoría'}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium truncate">
            📍 {location?.name || 'Sin Ubicación'}
          </span>
          <span className="text-sm font-bold text-amber-600 shrink-0">
            {formattedValue}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetCard;
