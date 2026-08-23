import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAssetStore } from '../store/assetStore';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { QRBadge } from '../components/QRBadge';
import { AssetImage } from '../components/AssetImage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/currency';
import { HiOutlineArrowLeft, HiOutlinePencilSquare } from 'react-icons/hi2';

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedAsset, isLoading, error, fetchAssetById } = useAssetStore();

  useEffect(() => {
    if (id) {
      fetchAssetById(id);
    }
  }, [id]);

  if (isLoading && !selectedAsset) {
    return (
      <div className="py-20">
        <LoadingSpinner label="Cargando ficha técnica del activo..." />
      </div>
    );
  }

  if (error || !selectedAsset) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Activo no encontrado</h2>
        <p className="text-xs text-slate-500">{error || `El activo con ID "${id}" no está registrado.`}</p>
        <button
          type="button"
          className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-xl text-xs transition-all"
          onClick={() => navigate('/activos')}
        >
          Volver al listado
        </button>
      </div>
    );
  }

  const asset = selectedAsset;

  const formattedDate = asset.purchaseDate
    ? new Date(asset.purchaseDate).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    })
    : 'No especificada';

  return (
    <div className="space-y-6">

      {/* Botón de retroceso y título */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/activos')}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors shrink-0"
          >
            <HiOutlineArrowLeft className="text-xl" />
          </button>
          <div className="flex flex-col">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{asset.name}</h1>
              <StatusBadge status={asset.status?.name || 'Operativo'} size="sm" />
            </div>
            <span className="text-xs text-amber-600 font-mono font-bold mt-0.5">{asset.code}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-xl shadow-xs transition-all text-xs shrink-0"
            onClick={() => navigate(`/activos/${asset.id}/editar`)}
          >
            <HiOutlinePencilSquare className="text-base" />
            <span>Editar Activo</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Ficha Visual (Imagen + QR) */}
        <div className="md:col-span-1 flex flex-col gap-6">
          <SectionCard title="Imagen del Activo" bodyClassName="p-4 flex flex-col items-center">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-xs bg-slate-100 shrink-0">
              <AssetImage
                src={asset.photo || undefined}
                alt={asset.name}
                categoryId={asset.categoryId}
                className="w-full h-full object-cover"
              />
            </div>
          </SectionCard>

          <SectionCard title="Código QR Único" bodyClassName="p-5 flex flex-col items-center justify-center">
            <QRBadge value={asset.qrCode || asset.code} size={140} />
            <span className="text-[11px] font-mono text-slate-400 mt-2">{asset.qrCode || asset.code}</span>
          </SectionCard>
        </div>

        {/* Detalles Técnicos e Institucionales */}
        <div className="md:col-span-2 space-y-6">
          <SectionCard title="Especificaciones Técnicas">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Código Patrimonial</span>
                <span className="text-sm font-mono font-bold text-amber-600 mt-1 block">{asset.code}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Nombre del Activo</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{asset.name}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Categoría</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{asset.category?.name || 'Sin Categoría'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Ubicación Física</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{asset.location?.name || 'Sin Ubicación'}</span>
              </div>
            </div>

            <hr className="my-6 border-t border-slate-100" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Marca</span>
                <span className="text-sm font-bold text-slate-700 mt-1 block">{asset.brand || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Modelo</span>
                <span className="text-sm font-bold text-slate-700 mt-1 block">{asset.model || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Número de Serie</span>
                <span className="text-sm font-mono font-bold text-slate-700 mt-1 block">{asset.serialNumber || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Unidad de Medida</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{asset.unit || 'PZA'}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Cantidad Total</span>
                <span className="text-sm font-bold text-slate-700 mt-1 block">{asset.quantity}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Salidas a Proyectos</span>
                <span className="text-sm font-bold text-rose-600 mt-1 block">{asset.quantityOut || 0}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Stock Disponible</span>
                <span className="text-sm font-bold text-emerald-600 mt-1 block">
                  {Math.max(0, asset.quantity - (asset.quantityOut || 0))}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Fecha Adquisición</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{formattedDate}</span>
              </div>
            </div>

            <hr className="my-6 border-t border-slate-100" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-5 gap-x-6">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Valor de Compra</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{formatCurrency(asset.purchaseValue)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Vida Útil (Años)</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{asset.category?.usefulLife ? `${asset.category.usefulLife} años` : '—'}</span>
              </div>
              {/* <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Valor Residual</span>
                <span className="text-sm font-bold text-slate-800 mt-1 block">{formatCurrency(asset.residualValue)}</span>
              </div> */}
              {/* <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Depreciación Anual</span>
                <span className="text-sm font-semibold text-slate-700 mt-1 block">{asset.dep != null ? `${asset.dep}%` : '—'}</span>
              </div>*/}
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Depreciación Acumulada</span>
                <span className="text-sm font-bold text-amber-700 mt-1 block">{formatCurrency(asset.depac)}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Saldo (Valor Neto)</span>
                <span className="text-sm font-bold text-emerald-700 mt-1 block">{formatCurrency(asset.balance)}</span>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Observaciones">
            <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {asset.observations || asset.description || 'Sin observaciones registradas para este activo fijo.'}
            </p>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default AssetDetail;
