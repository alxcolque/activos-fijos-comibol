import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssetStore } from '../store/assetStore';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { QRBadge } from '../components/QRBadge';
import { AssetImage } from '../components/AssetImage';
import { HiOutlineArrowLeft, HiOutlinePencilSquare } from 'react-icons/hi2';

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { assets, categories, locations, custodians } = useAssetStore();

  const asset = assets.find(a => a.id === id);

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Activo no encontrado</h2>
        <p className="text-slate-500">El activo con ID "{id}" no está registrado en el sistema.</p>
        <button 
          type="button"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all"
          onClick={() => navigate('/assets')}
        >
          Volver al listado
        </button>
      </div>
    );
  }

  const category = categories.find(c => c.id === asset.categoryId);
  const location = locations.find(l => l.id === asset.locationId);
  const custodian = custodians.find(c => c.id === asset.custodianId);

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(asset.value);

  const formattedDate = asset.purchaseDate 
    ? new Date(asset.purchaseDate).toLocaleDateString('es-BO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'No especificada';

  return (
    <div className="space-y-6">
      {/* Botón de retroceso y título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/assets')}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shrink-0"
          >
            <HiOutlineArrowLeft className="text-xl" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{asset.name}</h1>
              <StatusBadge status={asset.status} size="sm" />
            </div>
            <span className="text-xs text-slate-400 font-mono mt-0.5">{asset.code}</span>
          </div>
        </div>

        <button
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-amber-500/20 active:scale-[0.98] transition-all text-sm shrink-0"
          onClick={() => navigate(`/assets/${asset.id}/edit`)}
        >
          <HiOutlinePencilSquare className="text-lg" />
          Editar Activo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ficha Visual (Imagen + QR) */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <SectionCard title="Imagen del Activo" bodyClassName="p-4 flex flex-col items-center">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-sm bg-slate-100 shrink-0">
              <AssetImage 
                src={asset.image} 
                alt={asset.name} 
                categoryId={asset.categoryId} 
                className="w-full h-full object-cover"
              />
            </div>
          </SectionCard>

          <SectionCard title="Código QR Único" bodyClassName="p-5 flex justify-center">
            <QRBadge value={asset.code} size={130} />
          </SectionCard>
        </div>

        {/* Detalles Técnicos e Institucionales */}
        <div className="md:col-span-2 space-y-6">
          <SectionCard title="Información Detallada">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Código de Inventario</span>
                <span className="text-sm font-mono font-bold text-slate-700 mt-1 block">{asset.code}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Nombre del Activo</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{asset.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Categoría</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{category?.name || 'Cargando...'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ubicación física</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{location?.name || 'Cargando...'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Responsable Custodio</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{custodian?.name || 'Cargando...'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Cargo del Custodio</span>
                <span className="text-xs font-semibold text-slate-500 mt-1 block">{custodian?.position || 'Sin especificar'}</span>
              </div>
            </div>
            
            <hr className="my-6 border-t border-slate-100" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Marca</span>
                <span className="text-sm font-bold text-slate-700 mt-1 block">{asset.brand}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Modelo</span>
                <span className="text-sm font-bold text-slate-700 mt-1 block">{asset.model}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Número de Serie</span>
                <span className="text-sm font-mono font-bold text-slate-700 mt-1 block">{asset.serialNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Fecha de Adquisición</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{formattedDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Valor Adquisición</span>
                <span className="text-sm font-bold text-amber-600 mt-1 block">{formattedValue} USD</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Estado actual</span>
                <div className="mt-1"><StatusBadge status={asset.status} /></div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Observaciones e Historial Técnico">
            <p className="text-sm text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {asset.observations || 'Sin observaciones registradas para este activo fijo.'}
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
