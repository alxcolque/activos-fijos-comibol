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
import { useCurrencyStore } from '../store/currencyStore';
import { formatCurrency } from '../utils/currency';
import { getTodayDateString, formatDate } from '../utils/assets';
import api from '../api/axios.instance';
import {
  HiOutlineEye,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineSquares2X2,
  HiOutlineListBullet,
  HiOutlineArrowPath,
  HiOutlineArrowDownTray,
  HiOutlineAdjustmentsHorizontal,
  HiPlus,
} from 'react-icons/hi2';

interface ColumnDef {
  key: string;
  label: string;
}

const ALL_COLUMNS: ColumnDef[] = [
  { key: 'code', label: 'Código' },
  { key: 'qrCode', label: 'Código QR' },
  { key: 'name', label: 'Nombre del Activo' },
  { key: 'quantity', label: 'Cantidad' },
  { key: 'quantityOut', label: 'Salidas' },
  { key: 'available', label: 'Disponibles' },
  { key: 'unit', label: 'Unidad' },
  { key: 'status', label: 'Estado' },
  { key: 'purchaseDate', label: 'Fecha Adquisición' },
  { key: 'purchaseValue', label: 'Valor Original' },
  { key: 'dep', label: 'Depreciación (%)' },
  { key: 'depac', label: 'Dep. Acumulada' },
  { key: 'balance', label: 'Saldo / Valor Neto' },
];

export const AssetsList: React.FC = () => {
  const navigate = useNavigate();
  const { currency, exchangeRate } = useCurrencyStore();
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

  // Column visibility state
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    code: true,
    qrCode: true,
    name: true,
    quantity: true,
    quantityOut: true,
    available: true,
    unit: true,
    status: true,
    purchaseDate: true,
    purchaseValue: true,
    dep: true,
    depac: true,
    balance: true,
  });

  const toggleColumn = (key: string) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showAllColumns = () => {
    const reset: Record<string, boolean> = {};
    ALL_COLUMNS.forEach((col) => (reset[col.key] = true));
    setVisibleColumns(reset);
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<AssetModel | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Excel Report Download & Depreciation calculation date
  const [calculationDate, setCalculationDate] = useState<string>(getTodayDateString());
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);

  const handleDownloadExcelReport = async () => {
    setIsDownloadingExcel(true);
    try {
      const response = await api.get('/assets/report-excel', {
        params: {
          search: search || undefined,
          category: selectedCategory || undefined,
          status: selectedStatus || undefined,
          location: selectedLocation || undefined,
          calculationDate: calculationDate || undefined,
          currency: currency || 'BOB',
          exchangeRate: exchangeRate || 11.86,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Reporte_Activos_Fijos_COMIBOL.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showNotification('success', 'Reporte Excel de activos generado exitosamente.');
    } catch (err: any) {
      console.error('Error al descargar reporte Excel:', err);
      showNotification('danger', 'No se pudo generar el reporte Excel de activos.');
    } finally {
      setIsDownloadingExcel(false);
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
      calculationDate: calculationDate || undefined,
    });
  }, [currentPage, search, selectedCategory, selectedStatus, selectedLocation, calculationDate]);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedLocation('');
    setCalculationDate(getTodayDateString());
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-100 pt-3 gap-3">
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

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
            {/* Selector de Fecha para Cálculo de Depreciación */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl shadow-2xs text-xs"
              title="Calcular depreciación al:"
            >
              <span className="font-bold text-slate-600 whitespace-nowrap">Depreciación al:</span>
              <input
                type="date"
                value={calculationDate}
                onChange={(e) => {
                  setCalculationDate(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer text-xs"
              />
            </div>

            {/* Menú de Configuración de Columnas */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setColumnMenuOpen(!columnMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-2xs transition-all shrink-0"
                title="Mostrar u ocultar columnas de la tabla"
              >
                <HiOutlineAdjustmentsHorizontal className="text-base text-slate-600" />
                <span>Columnas</span>
              </button>

              {columnMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setColumnMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-slate-200 rounded-2xl shadow-xl z-40 p-3 text-xs space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <span className="font-bold text-slate-800">Columnas Visibles</span>
                      <button
                        type="button"
                        onClick={showAllColumns}
                        className="text-[11px] font-bold text-amber-600 hover:underline"
                      >
                        Mostrar Todas
                      </button>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1">
                      {ALL_COLUMNS.map((col) => (
                        <label
                          key={col.key}
                          className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 font-medium select-none"
                        >
                          <span>{col.label}</span>
                          <input
                            type="checkbox"
                            checked={visibleColumns[col.key] ?? true}
                            onChange={() => toggleColumn(col.key)}
                            className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Descargar Reporte Excel */}
            <button
              type="button"
              onClick={handleDownloadExcelReport}
              disabled={isDownloadingExcel}
              title="Descargar Reporte en Excel (.xlsx) de activos según los filtros aplicados"
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-all shrink-0 border border-emerald-800 disabled:opacity-50"
            >
              <HiOutlineArrowDownTray className="text-sm text-emerald-200" />
              <span>{isDownloadingExcel ? 'Excel...' : 'Reporte Excel'}</span>
            </button>

            {/* Selector de Vista (Tabla / Tarjetas) */}
            <div className="flex items-center border border-slate-200 rounded-xl p-1 bg-slate-50">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                title="Vista de Tabla"
                className={`p-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'table' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
              >
                <HiOutlineListBullet className="text-base" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                title="Vista de Tarjetas"
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
          {/* Contenedor con Scroll Doble (Horizontal & Vertical) y Encabezado Fijo */}
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-270px)] min-h-[350px] relative scrollbar-thin">
            <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1200px]">
              <thead className="bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider sticky top-0 z-20">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center bg-slate-50">N°</th>
                  {visibleColumns.code && <th className="px-4 py-3.5 bg-slate-50">Código</th>}
                  {visibleColumns.qrCode && <th className="px-4 py-3.5 text-center bg-slate-50">QR</th>}
                  {visibleColumns.name && <th className="px-4 py-3.5 bg-slate-50">Nombre del Activo</th>}
                  {visibleColumns.quantity && <th className="px-4 py-3.5 text-center bg-slate-50">Cant.</th>}
                  {visibleColumns.quantityOut && <th className="px-4 py-3.5 text-center bg-slate-50">Salidas</th>}
                  {visibleColumns.available && <th className="px-4 py-3.5 text-center bg-slate-50">Disponibles</th>}
                  {visibleColumns.unit && <th className="px-4 py-3.5 text-center bg-slate-50">Unidad</th>}
                  {visibleColumns.status && <th className="px-4 py-3.5 text-center bg-slate-50">Estado</th>}
                  {visibleColumns.purchaseDate && <th className="px-4 py-3.5 text-center bg-slate-50">Fecha Adquisición</th>}
                  {visibleColumns.purchaseValue && <th className="px-4 py-3.5 text-right bg-slate-50">Valor Original</th>}
                  {visibleColumns.dep && <th className="px-4 py-3.5 text-right bg-slate-50">Depreciación</th>}
                  {visibleColumns.depac && <th className="px-4 py-3.5 text-right bg-slate-50">Dep. Acumulada</th>}
                  {visibleColumns.balance && <th className="px-4 py-3.5 text-right bg-slate-50">Saldo</th>}
                  {/* Sticky Actions Header */}
                  <th className="px-4 py-3.5 text-right sticky right-0 top-0 z-30 bg-slate-100/95 backdrop-blur-xs shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] border-l border-slate-200/80">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {assets.map((item, index) => (
                  <tr key={item.id} className="group hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                    {visibleColumns.code && (
                      <td className="px-4 py-4 font-mono font-bold text-amber-600">{item.code}</td>
                    )}
                    {visibleColumns.qrCode && (
                      <td className="px-4 py-4 text-center">
                        <QRBadge value={item.qrCode || item.code} size={36} />
                      </td>
                    )}
                    {visibleColumns.name && (
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
                    )}
                    {visibleColumns.quantity && (
                      <td className="px-4 py-4 text-center font-bold text-slate-700">{item.quantity}</td>
                    )}
                    {visibleColumns.quantityOut && (
                      <td className="px-4 py-4 text-center font-bold text-rose-600">{item.quantityOut || 0}</td>
                    )}
                    {visibleColumns.available && (
                      <td className="px-4 py-4 text-center font-bold text-emerald-600">
                        {Math.max(0, item.quantity - (item.quantityOut || 0))}
                      </td>
                    )}
                    {visibleColumns.unit && (
                      <td className="px-4 py-4 text-center font-semibold text-slate-500">{item.unit || 'PZA'}</td>
                    )}
                    {visibleColumns.status && (
                      <td className="px-4 py-4 text-center">
                        <StatusBadge status={item.status?.name || 'Desconocido'} />
                      </td>
                    )}
                    {visibleColumns.purchaseDate && (
                      <td className="px-4 py-4 text-center text-slate-600 font-medium">
                        {formatDate(item.purchaseDate)}
                      </td>
                    )}
                    {visibleColumns.purchaseValue && (
                      <td className="px-4 py-4 text-right font-bold text-slate-800">
                        {formatCurrency(item.purchaseValue)}
                      </td>
                    )}
                    {visibleColumns.dep && (
                      <td className="px-4 py-4 text-right font-semibold text-slate-600">
                        {item.dep != null ? `${item.dep}%` : '—'}
                      </td>
                    )}
                    {visibleColumns.depac && (
                      <td className="px-4 py-4 text-right font-semibold text-amber-700">
                        {formatCurrency(item.depac)}
                      </td>
                    )}
                    {visibleColumns.balance && (
                      <td className="px-4 py-4 text-right font-bold text-emerald-700">
                        {formatCurrency(item.balance)}
                      </td>
                    )}
                    {/* Sticky Actions Cell */}
                    <td className="px-4 py-4 text-right sticky right-0 z-10 bg-white group-hover:bg-slate-50/90 backdrop-blur-xs shadow-[-4px_0_8px_-2px_rgba(0,0,0,0.06)] border-l border-slate-200/80">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigate(`/activos/${item.id}?calculationDate=${calculationDate}`)}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {assets.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset as any}
              calculationDate={calculationDate}
              onDelete={(a) => {
                setAssetToDelete(a);
                setDeleteConfirmOpen(true);
              }}
            />
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
    </div>
  );
};

export default AssetsList;
