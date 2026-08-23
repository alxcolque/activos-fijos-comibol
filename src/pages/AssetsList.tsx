import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssetStore } from '../store/assetStore';
import type { AssetModel } from '../interfaces/asset.interface';
import { PageTitle } from '../components/PageTitle';
import { StatusBadge } from '../components/StatusBadge';
import { QRBadge } from '../components/QRBadge';
import { AssetCard } from '../components/AssetCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { formatCurrency } from '../utils/currency';
import api from '../api/axios.instance';
import {
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineSquares2X2,
  HiOutlineListBullet,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineDocumentText,
  HiXMark,
  HiPlus,
} from 'react-icons/hi2';

export const AssetsList: React.FC = () => {
  const navigate = useNavigate();
  const {
    assets,
    categories,
    statuses,
    locations,
    pagination,
    isLoading,
    error,
    fetchAssets,
    fetchInitialData,
    deleteAsset,
  } = useAssetStore();

  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<AssetModel | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Modal "Reporte Word"
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState<'carta' | 'a4' | 'oficio'>('carta');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal');
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);

  const handleDownloadWordReport = async () => {
    setIsDownloadingWord(true);
    try {
      const response = await api.get('/assets/report-word', {
        params: {
          search: search || undefined,
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          location: selectedLocation || undefined,
          pageSize,
          orientation,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Activos_Fijos_COMIBOL.docx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsWordModalOpen(false);
      showNotification('success', 'Reporte Word de activos generado exitosamente.');
    } catch (err: any) {
      console.error('Error al descargar reporte Word:', err);
      showNotification('danger', 'No se pudo generar el reporte Word de activos.');
    } finally {
      setIsDownloadingWord(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchAssets({
      page: currentPage,
      limit: 10,
      search: search || undefined,
      categoryId: selectedCategory || undefined,
      statusId: selectedStatus || undefined,
      locationId: selectedLocation || undefined,
    });
  }, [currentPage, search, selectedCategory, selectedStatus, selectedLocation]);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedLocation('');
  };

  const handleDeleteRequest = (asset: AssetModel, e: React.MouseEvent) => {
    e.stopPropagation();
    setAssetToDelete(asset);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!assetToDelete) return;
    try {
      await deleteAsset(assetToDelete.id);
      showNotification('success', 'Activo fijo eliminado correctamente.');
      setAssetToDelete(null);
    } catch (err: any) {
      showNotification('danger', err.message || 'No se pudo eliminar el activo.');
      setAssetToDelete(null);
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '—';
    const datePart = dateStr.split('T')[0];
    const parts = datePart.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return new Date(dateStr).toLocaleDateString('es-BO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'UTC',
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-[99999] p-4 rounded-2xl shadow-2xl border text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          {toastMessage.text}
        </div>
      )}

      <PageTitle
        title="Control de Activos Fijos"
        subtitle="Catálogo institucional y registro de activos fijos patrimoniales de COMIBOL"
        action={
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 rounded-xl font-bold text-xs shadow-sm transition-all shrink-0"
            onClick={() => navigate('/activos/nuevo')}
          >
            <HiPlus className="text-base" />
            <span>Nuevo Activo</span>
          </button>
        }
      />

      {/* Contenedor de Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Buscador */}
          <div className="lg:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Buscar por código, nombre, marca o modelo..."
            />
          </div>

          {/* Categoría */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-xs bg-slate-50 transition-colors"
          >
            <option value="">-- Todas las Categorías --</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Estado */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-xs bg-slate-50 transition-colors"
          >
            <option value="">-- Todos los Estados --</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name}
              </option>
            ))}
          </select>

          {/* Ubicación */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 font-semibold text-xs bg-slate-50 transition-colors"
          >
            <option value="">-- Todas las Ubicaciones --</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Bar de Acciones y Cambio de Vista */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <div className="flex items-center gap-3">
            {(search || selectedCategory || selectedStatus || selectedLocation) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
              >
                <HiOutlineArrowPath className="text-xs" />
                <span>Limpiar Filtros</span>
              </button>
            )}
            <span className="text-xs font-semibold text-slate-500">
              Total: <span className="font-bold text-slate-800">{assets.length}</span> activo(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsWordModalOpen(true)}
              title="Descargar Informe en Word (.docx) de activos según los filtros aplicados"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all shrink-0 border border-blue-800"
            >
              <HiOutlineArrowDownTray className="text-sm text-amber-400" />
              <span>Reporte Word</span>
            </button>

            {/* Selector de Vista */}
            <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <HiOutlineListBullet className="text-base" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'cards' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <HiOutlineSquares2X2 className="text-base" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Carga o Contenido */}
      {isLoading && assets.length === 0 ? (
        <div className="py-16">
          <LoadingSpinner label="Cargando inventario de activos fijos..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
          {error}
        </div>
      ) : assets.length === 0 ? (
        <EmptyState
          title="Sin activos encontrados"
          description="Intente modificar sus criterios de búsqueda o filtros para encontrar el activo que busca."
          actionText="Limpiar filtros"
          onAction={handleClearFilters}
        />
      ) : viewMode === 'table' ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-4 py-3.5 w-12 text-center">N°</th>
                  <th className="px-4 py-3.5">Código</th>
                  <th className="px-4 py-3.5 text-center">QR</th>
                  <th className="px-4 py-3.5 text-center">Cant.</th>
                  <th className="px-4 py-3.5 text-center">Salidas</th>
                  <th className="px-4 py-3.5 text-center">Disponibles</th>
                  <th className="px-4 py-3.5 text-center">Unidad</th>
                  <th className="px-4 py-3.5">Nombre del Activo</th>
                  <th className="px-4 py-3.5 text-center">Estado</th>
                  <th className="px-4 py-3.5 text-center">Fecha Adquisición</th>
                  <th className="px-4 py-3.5 text-right">Valor Original</th>
                  <th className="px-4 py-3.5 text-right">Depreciación</th>
                  <th className="px-4 py-3.5 text-right">Dep. Acumulada</th>
                  <th className="px-4 py-3.5 text-right">Saldo</th>
                  <th className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {assets.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/activos/${item.id}`)}
                          title="Ver Ficha Técnica"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        >
                          <HiOutlineEye className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate(`/activos/${item.id}/editar`)}
                          title="Editar Activo"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <HiOutlinePencilSquare className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteRequest(item, e)}
                          title="Eliminar Activo"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <HiOutlineTrash className="text-base" />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono font-bold text-amber-600">{item.code}</td>
                    <td className="px-4 py-4 text-center">
                      <QRBadge value={item.qrCode || item.code} size={36} />
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-slate-700">{item.quantity}</td>
                    <td className="px-4 py-4 text-center font-bold text-rose-600">{item.quantityOut || 0}</td>
                    <td className="px-4 py-4 text-center font-bold text-emerald-600">
                      {Math.max(0, item.quantity - (item.quantityOut || 0))}
                    </td>
                    <td className="px-4 py-4 text-center font-semibold text-slate-500">{item.unit || 'PZA'}</td>
                    <td className="px-4 py-4 font-bold text-slate-800">
                      <div className="flex flex-col">
                        <span>{item.name}</span>
                        {(item.brand || item.model) && (
                          <span className="text-[11px] font-normal text-slate-400">
                            {item.brand} {item.model ? `- ${item.model}` : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <StatusBadge status={item.status?.name || 'Desconocido'} />
                    </td>
                    <td className="px-4 py-4 text-center text-slate-600 font-medium">
                      {formatDate(item.purchaseDate)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-800">
                      {formatCurrency(item.purchaseValue)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-600">
                      {item.dep != null ? `${item.dep}%` : '—'}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-amber-700">
                      {formatCurrency(item.depac)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-emerald-700">
                      {formatCurrency(item.balance)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset as any} />
          ))}
        </div>
      )}

      {/* Control de Paginación */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={10}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}

      {/* Modal Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Activo Fijo?"
        message={`¿Está seguro de eliminar el activo "${assetToDelete?.name}" (${assetToDelete?.code})? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        color="danger"
      />

      {/* Modal Configuración Reporte Word de Activos Fijos */}
      {isWordModalOpen && (
        <div className="fixed inset-0 z-[9990] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full space-y-5 relative">
            <button
              onClick={() => setIsWordModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <HiXMark className="text-lg" />
            </button>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-900">
                <HiOutlineDocumentText className="text-xl text-amber-500" />
                <h3 className="text-base font-bold">Configurar Reporte Word (.docx)</h3>
              </div>
              <p className="text-xs text-slate-500">
                Exportar catálogo de activos fijos según los filtros seleccionados (búsqueda, categoría, estado y ubicación).
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-700">
              {/* Tamaño de Hoja */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Tamaño de Hoja</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'carta', label: 'Carta', sub: '8.5" x 11"' },
                    { id: 'a4', label: 'A4', sub: '210 x 297 mm' },
                    { id: 'oficio', label: 'Oficio', sub: '8.5" x 14"' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setPageSize(item.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${pageSize === item.id
                          ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 font-medium'
                        }`}
                    >
                      <span className="capitalize">{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Orientación */}
              <div className="space-y-1.5">
                <label className="block text-slate-700 font-bold">Orientación de Página</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'vertical', label: 'Vertical', desc: 'Retrato' },
                    { id: 'horizontal', label: 'Horizontal', desc: 'Apaisado' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setOrientation(item.id as any)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${orientation === item.id
                          ? 'border-blue-900 bg-blue-50/70 text-blue-950 font-bold shadow-xs'
                          : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 font-medium'
                        }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({item.desc})</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-[11px] text-amber-900 font-medium leading-relaxed">
                ℹ️ El documento se generará con formato oficial de la <strong>Dirección de Proyectos y Geología (COMIBOL)</strong>, margen <strong>Estrecho</strong> y secciones de firma.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsWordModalOpen(false)}
                disabled={isDownloadingWord}
                className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDownloadWordReport}
                disabled={isDownloadingWord}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-50"
              >
                {isDownloadingWord ? (
                  <span>Generando Word...</span>
                ) : (
                  <>
                    <HiOutlineArrowDownTray className="text-base" />
                    <span>Descargar Reporte (.docx)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetsList;
