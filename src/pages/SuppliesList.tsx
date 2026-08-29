import React, { useEffect, useState } from 'react';
import { useSupplyStore } from '../store/supplyStore';
import type { SupplyItem, CreateSupplyDTO, UpdateSupplyDTO } from '../interfaces/supply.interface';
import type { AssetCategory } from '../interfaces/category.interface';
import type { LocationNode } from '../interfaces/location.interface';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { formatDate } from '../utils/assets';
import api from '../api/axios.instance';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiCube,
  HiXMark,
  HiFunnel,
  HiArrowDownTray,
  HiArrowUpTray,
  HiEye,
} from 'react-icons/hi2';

export const SuppliesList: React.FC = () => {
  const {
    supplies,
    totalSupplies,
    page,
    totalPages,
    search,
    isLoading,
    error,
    setSearch,
    setPage,
    fetchSupplies,
    createSupply,
    updateSupply,
    deleteSupply,
  } = useSupplyStore();

  // Estados de Modal y Toasts
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<SupplyItem | null>(null);
  const [supplyToDelete, setSupplyToDelete] = useState<SupplyItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Catalogos de Apoyo (Categorías de Suministro y Ubicaciones)
  const [supplyCategories, setSupplyCategories] = useState<AssetCategory[]>([]);
  const [locationsList, setLocationsList] = useState<LocationNode[]>([]);

  // Estados del Formulario
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [unit, setUnit] = useState('PZA');
  const [inputQuantity, setInputQuantity] = useState<number | ''>(0);
  const [outputQuantity, setOutputQuantity] = useState<number | ''>(0);
  const [entryDate, setEntryDate] = useState('');
  const [observations, setObservations] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Opciones de ocultar columnas
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    category: true,
    location: true,
    unit: true,
    stock: true,
    inputQuantity: true,
    outputQuantity: true,
    entryDate: true,
    observations: true,
  });
  const [isColumnFilterOpen, setIsColumnFilterOpen] = useState(false);

  useEffect(() => {
    fetchSupplies();
    loadSupportData();
  }, [page, search, fetchSupplies]);

  const loadSupportData = async () => {
    try {
      const [catRes, locRes] = await Promise.all([
        api.get<{ success: boolean; data: AssetCategory[] }>('/categories?type=SUPPLY'),
        api.get<{ success: boolean; data: LocationNode[] }>('/locations?limit=300'),
      ]);
      setSupplyCategories(catRes.data.data || []);
      setLocationsList(locRes.data.data || []);
    } catch (err) {
      console.error('Error al cargar catálogo de categorías de suministros/ubicaciones', err);
    }
  };

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setSelectedSupply(null);
    setName('');
    setCategoryId(supplyCategories[0]?.id || '');
    setLocationId(locationsList[0]?.id || '');
    setUnit('caja');
    setInputQuantity(10);
    setOutputQuantity(0);
    setEntryDate(new Date().toISOString().split('T')[0]);
    setObservations('');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: SupplyItem) => {
    setSelectedSupply(item);
    setName(item.name || '');
    setCategoryId(item.categoryId || item.category?.id || '');
    setLocationId(item.locationId || item.location?.id || '');
    setUnit(item.unit || 'PZA');
    setInputQuantity(item.inputQuantity);
    setOutputQuantity(item.outputQuantity);
    setEntryDate(item.entryDate ? new Date(item.entryDate).toISOString().split('T')[0] : '');
    setObservations(item.observations || '');
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('El nombre del material/suministro es obligatorio.');
      return;
    }

    try {
      const payload: CreateSupplyDTO = {
        name: name.trim(),
        categoryId: categoryId || null,
        locationId: locationId || null,
        unit: unit.trim() || 'PZA',
        inputQuantity: Number(inputQuantity || 0),
        outputQuantity: Number(outputQuantity || 0),
        entryDate: entryDate ? entryDate : null,
        observations: observations.trim() || null,
      };

      if (selectedSupply) {
        await updateSupply(selectedSupply.id, payload as UpdateSupplyDTO);
        showNotification('success', 'Material/Suministro actualizado correctamente.');
      } else {
        await createSupply(payload);
        showNotification('success', 'Material/Suministro registrado correctamente.');
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Error al guardar el material.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!supplyToDelete) return;
    try {
      await deleteSupply(supplyToDelete.id);
      showNotification('success', `El material "${supplyToDelete.name}" fue eliminado.`);
      setSupplyToDelete(null);
    } catch (err: any) {
      showNotification('danger', err.message || 'No se pudo eliminar el material.');
      setSupplyToDelete(null);
    }
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Cálculo de estadísticas rápidas
  const totalInputs = supplies.reduce((acc, curr) => acc + curr.inputQuantity, 0);
  const totalOutputs = supplies.reduce((acc, curr) => acc + curr.outputQuantity, 0);
  const totalStockAvailable = supplies.reduce((acc, curr) => acc + Math.max(0, curr.inputQuantity - curr.outputQuantity), 0);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-5 duration-200 ${toastMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
        >
          {toastMessage.type === 'success' ? <HiCheckCircle className="text-lg text-emerald-600" /> : <HiXCircle className="text-lg text-rose-600" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Control de Suministros y Materiales</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de inventario de insumos, clasificación por categoría, ubicación física y stock disponible COMIBOL.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-2xl text-xs shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <HiPlus className="text-base" />
          <span>Nuevo Material / Suministro</span>
        </button>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <HiCube />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Ítems</p>
            <p className="text-xl font-extrabold text-slate-800">{totalSupplies}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <HiArrowDownTray />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Entradas Totales</p>
            <p className="text-xl font-extrabold text-emerald-700">{totalInputs}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl shrink-0">
            <HiArrowUpTray />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salidas Totales</p>
            <p className="text-xl font-extrabold text-rose-700">{totalOutputs}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            <HiEye />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Stock Saldo Disponible</p>
            <p className="text-xl font-extrabold text-blue-900">{totalStockAvailable}</p>
          </div>
        </div>
      </div>

      {/* Controles de Filtro y Búsqueda */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar suministro por nombre, categoría, ubicación u observaciones..."
          />
        </div>

        {/* Popover Ocultar / Mostrar Columnas */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setIsColumnFilterOpen(!isColumnFilterOpen)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-all cursor-pointer"
          >
            <HiFunnel className="text-slate-500" />
            <span>Columnas</span>
          </button>

          {isColumnFilterOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-30 space-y-2 text-xs font-semibold text-slate-700">
              <p className="text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100 pb-1 mb-1">
                Visibilidad de Columnas
              </p>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.category}
                  onChange={() => toggleColumn('category')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Categoría de Suministro</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.location}
                  onChange={() => toggleColumn('location')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Ubicación</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.unit}
                  onChange={() => toggleColumn('unit')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Unidad de Medida</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.stock}
                  onChange={() => toggleColumn('stock')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Stock Saldo</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.inputQuantity}
                  onChange={() => toggleColumn('inputQuantity')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Cant. Entrada</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.outputQuantity}
                  onChange={() => toggleColumn('outputQuantity')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Cant. Salida</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.entryDate}
                  onChange={() => toggleColumn('entryDate')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Fecha de Ingreso</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.observations}
                  onChange={() => toggleColumn('observations')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Observaciones</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Contenido / Estado de Carga */}
      {isLoading && supplies.length === 0 ? (
        <div className="py-16">
          <LoadingSpinner label="Cargando inventario de suministros..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
          {error}
        </div>
      ) : supplies.length === 0 ? (
        <EmptyState
          icon={<HiCube className="text-4xl text-slate-400" />}
          title="No se encontraron materiales o suministros"
          description={
            search
              ? 'No hay insumos que coincidan con el término de búsqueda especificado.'
              : 'Comience registrando los suministros o materiales entregados a almacén.'
          }
          actionText={search ? 'Limpiar Búsqueda' : 'Nuevo Material'}
          onAction={search ? () => setSearch('') : handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[750px]">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">N°</th>
                  <th className="px-5 py-3.5">Nombre Material / Insumo</th>
                  {visibleColumns.category && <th className="px-5 py-3.5">Categoría</th>}
                  {visibleColumns.location && <th className="px-5 py-3.5">Ubicación</th>}
                  {visibleColumns.unit && <th className="px-5 py-3.5">Unidad</th>}
                  {visibleColumns.stock && <th className="px-5 py-3.5 text-center">Saldo Stock</th>}
                  {visibleColumns.inputQuantity && <th className="px-5 py-3.5 text-center">Entrada</th>}
                  {visibleColumns.outputQuantity && <th className="px-5 py-3.5 text-center">Salida</th>}
                  {visibleColumns.entryDate && <th className="px-5 py-3.5">Fecha Ingreso</th>}
                  {visibleColumns.observations && <th className="px-5 py-3.5">Observaciones</th>}
                  <th className="px-5 py-3.5 text-right sticky right-0 bg-slate-50 shadow-xs z-20">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {supplies.map((item, index) => {
                  const stockAvailable = Math.max(0, item.inputQuantity - item.outputQuantity);
                  const isOutOfStock = stockAvailable <= 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 text-center text-slate-400 font-bold">
                        {(page - 1) * 10 + index + 1}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-800">{item.name}</td>
                      {visibleColumns.category && (
                        <td className="px-5 py-4 text-slate-600">
                          {item.category?.name ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                              {item.category.name}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                      {visibleColumns.location && (
                        <td className="px-5 py-4 text-slate-600">
                          {item.location?.name ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                              {item.location.name}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                      )}
                      {visibleColumns.unit && (
                        <td className="px-5 py-4 text-slate-600 font-semibold">{item.unit}</td>
                      )}
                      {visibleColumns.stock && (
                        <td className="px-5 py-4 text-center font-bold">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${isOutOfStock
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                          >
                            {stockAvailable} {item.unit}
                          </span>
                        </td>
                      )}
                      {visibleColumns.inputQuantity && (
                        <td className="px-5 py-4 text-center font-bold text-emerald-600">
                          {item.inputQuantity}
                        </td>
                      )}
                      {visibleColumns.outputQuantity && (
                        <td className="px-5 py-4 text-center font-bold text-rose-600">
                          {item.outputQuantity}
                        </td>
                      )}
                      {visibleColumns.entryDate && (
                        <td className="px-5 py-4 text-slate-500 whitespace-nowrap">
                          {item.entryDate ? formatDate(item.entryDate) : '—'}
                        </td>
                      )}
                      {visibleColumns.observations && (
                        <td className="px-5 py-4 text-slate-500 max-w-xs truncate">
                          {item.observations || '—'}
                        </td>
                      )}
                      <td className="px-5 py-4 text-right sticky right-0 bg-white shadow-xs z-10">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            title="Editar Suministro"
                            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                          >
                            <HiPencilSquare className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSupplyToDelete(item)}
                            title="Eliminar Suministro"
                            className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            <HiTrash className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalSupplies}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Material */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {selectedSupply ? 'Editar Material / Suministro' : 'Registrar Nuevo Suministro'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            {/* Formulario */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Material / Suministro <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Lápiz, Papel Bond A4, etc."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Categoría y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Categoría de Suministro
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">-- Sin Categoría --</option>
                    {supplyCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ubicación Almacén
                  </label>
                  <select
                    value={locationId}
                    onChange={(e) => setLocationId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">-- Sin Ubicación --</option>
                    {locationsList.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unidad de Medida
                  </label>
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="caja, paquete, PZA"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cantidad Entrada
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={inputQuantity}
                    onChange={(e) => setInputQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>

                {/* <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cantidad Salida
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={outputQuantity}
                    onChange={(e) => setOutputQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div> */}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha de Ingreso
                </label>
                <input
                  type="date"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones
                </label>
                <textarea
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  placeholder="Detalles sobre empaque, lote o entrega (Ej: De 50 unidades)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 text-xs font-bold text-blue-900 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Guardando...' : selectedSupply ? 'Guardar Cambios' : 'Registrar Suministro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={!!supplyToDelete}
        onOpenChange={(open) => { if (!open) setSupplyToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Suministro"
        message={`¿Está seguro de eliminar el material "${supplyToDelete?.name}"? Esta acción eliminará el registro permanentemente.`}
        confirmText="Sí, eliminar"
        color="danger"
      />
    </div>
  );
};

export default SuppliesList;
