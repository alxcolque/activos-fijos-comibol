import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAssetStore } from '../store/assetStore';
import { useAuthStore } from '../store/authStore';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { QRBadge } from '../components/QRBadge';
import { AssetImage } from '../components/AssetImage';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { formatCurrency } from '../utils/currency';
import { formatDate, formatDateLong } from '../utils/assets';
import { HiOutlineArrowLeft, HiOutlinePencilSquare, HiOutlineCalendar } from 'react-icons/hi2';

export const AssetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const calculationDate = searchParams.get('calculationDate') || searchParams.get('date');

  const { selectedAsset, isLoading, error, fetchAssetById } = useAssetStore();
  const { user } = useAuthStore();
  const isGuest = user?.role === 'guest';

  useEffect(() => {
    if (id) {
      fetchAssetById(id, calculationDate || undefined);
    }
  }, [id, calculationDate, fetchAssetById]);

  if (isLoading) {
    return (
      <div className="py-20">
        <LoadingSpinner label="Cargando ficha técnica del activo fijo..." />
      </div>
    );
  }

  if (error || !selectedAsset) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-4">
        <p className="text-sm font-bold text-rose-700">
          {error || 'No se encontró la información del activo solicitado.'}
        </p>
        <button
          type="button"
          onClick={() => navigate('/activos')}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs hover:bg-slate-700 transition-colors"
        >
          Volver al Catálogo
        </button>
      </div>
    );
  }

  const asset = selectedAsset;
  const formattedDate = formatDateLong(asset.purchaseDate);

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
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-amber-600 font-mono font-bold">{asset.code}</span>
              {calculationDate && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
                  <HiOutlineCalendar className="text-xs text-amber-600" />
                  <span>Depreciación al: {formatDate(calculationDate)}</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {!isGuest && (
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
        )}
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
