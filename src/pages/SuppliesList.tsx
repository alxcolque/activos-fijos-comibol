import React, { useEffect, useState } from 'react';
import { useSupplyStore } from '../store/supplyStore';
import type { SupplyItem, CreateSupplyDTO, UpdateSupplyDTO } from '../interfaces/supply.interface';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { formatDate } from '../utils/assets';
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

  // Estados del Formulario
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('PZA');
  const [inputQuantity, setInputQuantity] = useState<number | ''>(0);
  const [outputQuantity, setOutputQuantity] = useState<number | ''>(0);
  const [entryDate, setEntryDate] = useState('');
  const [observations, setObservations] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Opciones de ocultar columnas
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
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
  }, [page, search, fetchSupplies]);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setSelectedSupply(null);
    setName('');
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
          className={`fixed top-5 right-5 z-50 p-4 rounded-2xl shadow-xl border text-xs font-bold flex items-center gap-3 animate-in slide-in-from-top-5 duration-200 ${
            toastMessage.type === 'success'
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
            Gestión de inventario de insumos, stock disponible, entradas y salidas institucionales.
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
            placeholder="Buscar suministro por nombre, unidad o observaciones..."
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
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-30 space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">Visibilidad de Columnas</p>
              <div className="space-y-1 text-xs">
                {Object.entries({
                  name: 'Nombre Suministro',
                  unit: 'Unidad de Medida',
                  stock: 'Saldo en Stock',
                  inputQuantity: 'Cant. Entrada',
                  outputQuantity: 'Cant. Salida',
                  entryDate: 'Fecha de Ingreso',
                  observations: 'Observaciones',
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2.5 px-2 py-1.5 hover:bg-slate-50 rounded-xl cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={visibleColumns[key as keyof typeof visibleColumns]}
                      onChange={() => toggleColumn(key as keyof typeof visibleColumns)}
                      className="w-4 h-4 text-amber-500 border-slate-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-slate-700 font-semibold">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contenido Principal: Tabla Dinámica Scrollable */}
      {isLoading && supplies.length === 0 ? (
        <div className="py-20">
          <LoadingSpinner label="Cargando catálogo de suministros..." />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs font-semibold text-rose-700">
          {error}
        </div>
      ) : supplies.length === 0 ? (
        <EmptyState
          icon={<HiCube className="text-4xl text-slate-400" />}
          title="No se encontraron suministros"
          description={search ? `No hay coincidencias para "${search}".` : 'Aún no se ha registrado ningún suministro o material.'}
          actionText={search ? 'Limpiar Búsqueda' : 'Crear Primer Suministro'}
          onAction={search ? () => setSearch('') : handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  {visibleColumns.name && <th className="px-6 py-4">Suministro / Material</th>}
                  {visibleColumns.unit && <th className="px-6 py-4 text-center">Unidad</th>}
                  {visibleColumns.stock && <th className="px-6 py-4 text-center">Stock Disponible</th>}
                  {visibleColumns.inputQuantity && <th className="px-6 py-4 text-center">Cant. Entrada</th>}
                  {visibleColumns.outputQuantity && <th className="px-6 py-4 text-center">Cant. Salida</th>}
                  {visibleColumns.entryDate && <th className="px-6 py-4 text-center">Fecha Ingreso</th>}
                  {visibleColumns.observations && <th className="px-6 py-4">Observaciones</th>}
                  <th className="px-6 py-4 text-right sticky right-0 bg-slate-50 z-10 border-l border-slate-100 shadow-xs">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {supplies.map((item) => {
                  const stock = Math.max(0, item.inputQuantity - item.outputQuantity);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {visibleColumns.name && (
                        <td className="px-6 py-4 font-bold text-slate-800">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 font-bold flex items-center justify-center text-xs shrink-0">
                              {item.name.charAt(0).toUpperCase()}
                            </div>
                            <span>{item.name}</span>
                          </div>
                        </td>
                      )}
                      {visibleColumns.unit && (
                        <td className="px-6 py-4 text-center font-semibold text-slate-600">
                          <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold uppercase">
                            {item.unit}
                          </span>
                        </td>
                      )}
                      {visibleColumns.stock && (
                        <td className="px-6 py-4 text-center font-extrabold">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs ${
                            stock > 5 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {stock}
                          </span>
                        </td>
                      )}
                      {visibleColumns.inputQuantity && (
                        <td className="px-6 py-4 text-center font-semibold text-emerald-600">
                          {item.inputQuantity}
                        </td>
                      )}
                      {visibleColumns.outputQuantity && (
                        <td className="px-6 py-4 text-center font-semibold text-rose-600">
                          {item.outputQuantity}
                        </td>
                      )}
                      {visibleColumns.entryDate && (
                        <td className="px-6 py-4 text-center text-slate-500 font-medium">
                          {item.entryDate ? formatDate(item.entryDate) : 'S/F'}
                        </td>
                      )}
                      {visibleColumns.observations && (
                        <td className="px-6 py-4 text-slate-600">
                          {item.observations || <span className="text-slate-300 italic">Sin observaciones</span>}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right sticky right-0 bg-white z-10 border-l border-slate-100 shadow-xs">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(item)}
                            className="p-2 rounded-xl text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all cursor-pointer"
                            title="Editar material"
                          >
                            <HiPencilSquare className="text-base" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setSupplyToDelete(item)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Eliminar material"
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
              onPageChange={setPage}
              totalItems={totalSupplies}
            />
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Material */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {selectedSupply ? 'Editar Suministro / Material' : 'Nuevo Suministro / Material'}
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-600">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Suministro / Material <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Lápiz, Papel Bond A4, Tinta para impresora"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

                <div>
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
                </div>
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
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
