import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios.instance';
import type { AcquisitionItem, CreateAcquisitionDTO } from '../interfaces/acquisition.interface';
import type { User } from '../interfaces/user.interface';
import type { Project } from '../interfaces/project.interface';
import type { SupplyProjectItem } from '../interfaces/supply.interface';
import type { Asset } from '../interfaces/asset.interface';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { formatDate } from '../utils/assets';
import { useAuthStore } from '../store/authStore';
import {
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiUserGroup,
  HiXMark,
  HiEye,
  HiUser,
  HiArchiveBox,
  HiCube,
  HiCheck,
} from 'react-icons/hi2';

interface SelectedDetailItem {
  supplyId?: string;
  assetId?: string;
  name: string;
  code?: string;
  unit: string;
  maxAvailable: number;
  quantity: number;
}

export const PersonalList: React.FC = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'admin';
  const isGuest = currentUser?.role === 'guest';

  // Estados Principales
  const [acquisitions, setAcquisitions] = useState<AcquisitionItem[]>([]);
  const [totalAcquisitions, setTotalAcquisitions] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Catálogos para selectores
  const [usersList, setUsersList] = useState<User[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  // Modales
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [acquisitionToDelete, setAcquisitionToDelete] = useState<AcquisitionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Campos del Formulario de Creación
  const [typeTab, setTypeTab] = useState<'SUPPLY' | 'ASSET'>('SUPPLY');
  const [userId, setUserId] = useState(currentUser?.id || '');
  const [checkoutUserId, setCheckoutUserId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de ítems disponibles según proyecto y tipo
  const [availableSupplies, setAvailableSupplies] = useState<SupplyProjectItem[]>([]);
  const [availableAssets, setAvailableAssets] = useState<Asset[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<SelectedDetailItem[]>([]);

  useEffect(() => {
    fetchAcquisitions();
    loadSupportCatalog();
  }, [page, search]);

  // Carga dinámica de ítems disponibles cuando se selecciona un proyecto o cambia la pestaña de tipo
  useEffect(() => {
    if (!isFormModalOpen) return;
    setSelectedDetails([]);

    if (!selectedProjectId) {
      setAvailableSupplies([]);
      setAvailableAssets([]);
      return;
    }

    const loadAvailableItems = async () => {
      setIsLoadingItems(true);
      try {
        if (typeTab === 'SUPPLY') {
          const res = await api.get<{ success: boolean; data: SupplyProjectItem[] }>(
            `/supply-projects/project/${selectedProjectId}`
          );
          if (res.data?.data) {
            const filtered = res.data.data.filter(
              (sp) => sp.quantity - (sp.outputQuantity || 0) > 0
            );
            setAvailableSupplies(filtered);
          } else {
            setAvailableSupplies([]);
          }
        } else {
          const res = await api.get<{ success: boolean; data: Asset[] }>('/assets', {
            params: { limit: 200 },
          });
          if (res.data?.data) {
            const filtered = res.data.data.filter(
              (a) => a.quantity - (a.quantityOut || 0) > 0
            );
            setAvailableAssets(filtered);
          } else {
            setAvailableAssets([]);
          }
        }
      } catch (err) {
        console.error('Error al cargar ítems disponibles:', err);
      } finally {
        setIsLoadingItems(false);
      }
    };

    loadAvailableItems();
  }, [selectedProjectId, typeTab, isFormModalOpen]);

  const fetchAcquisitions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{
        success: boolean;
        data: AcquisitionItem[];
        pagination: { total: number; page: number; limit: number; totalPages: number };
      }>('/acquisitions', {
        params: {
          page,
          limit: 10,
          search: search || undefined,
        },
      });

      if (res.data?.data) {
        setAcquisitions(res.data.data);
        setTotalAcquisitions(res.data.pagination.total);
        setTotalPages(res.data.pagination.totalPages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener los registros de personal.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupportCatalog = async () => {
    try {
      const [resUsers, resProjects] = await Promise.all([
        api.get('/users?limit=100'),
        api.get('/projects?limit=100'),
      ]);
      if (resUsers.data?.data) setUsersList(resUsers.data.data);
      if (resProjects.data?.data) setProjectsList(resProjects.data.data);
    } catch (err) {
      console.error('Error cargando catálogos de soporte:', err);
    }
  };

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setTypeTab('SUPPLY');
    setUserId(currentUser?.id || '');
    setCheckoutUserId('');
    setDepartureDate(new Date().toISOString().split('T')[0]); // Fecha actual por defecto
    setSelectedProjectId('');
    setSelectedDetails([]);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleToggleSupplyItem = (sp: SupplyProjectItem, qty: number, checked: boolean) => {
    const available = sp.quantity - (sp.outputQuantity || 0);
    const validQty = Math.max(1, Math.min(qty, available));

    if (!checked) {
      setSelectedDetails((prev) => prev.filter((d) => d.supplyId !== sp.supplyId));
    } else {
      setSelectedDetails((prev) => {
        const exists = prev.some((d) => d.supplyId === sp.supplyId);
        if (exists) {
          return prev.map((d) => (d.supplyId === sp.supplyId ? { ...d, quantity: validQty } : d));
        }
        return [
          ...prev,
          {
            supplyId: sp.supplyId,
            name: sp.supply?.name || 'Suministro',
            unit: sp.supply?.unit || 'PZA',
            maxAvailable: available,
            quantity: validQty,
          },
        ];
      });
    }
  };

  const handleToggleAssetItem = (asset: Asset, checked: boolean) => {
    if (!checked) {
      setSelectedDetails((prev) => prev.filter((d) => d.assetId !== asset.id));
    } else {
      const available = asset.quantity - (asset.quantityOut || 0);
      setSelectedDetails((prev) => [
        ...prev.filter((d) => d.assetId !== asset.id),
        {
          assetId: asset.id,
          name: asset.name,
          code: asset.code,
          unit: 'PZA',
          maxAvailable: available,
          quantity: 1,
        },
      ]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const finalUserId = isAdmin ? userId : (currentUser?.id || '');
    if (!finalUserId) {
      setFormError('Debe seleccionar la persona que entrega el material.');
      return;
    }

    if (!selectedProjectId) {
      setFormError('Debe seleccionar el proyecto asignado.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: CreateAcquisitionDTO = {
        userId: finalUserId,
        projectId: selectedProjectId,
        checkoutUserId: checkoutUserId || null,
        departureDate: departureDate || null,
        type: typeTab,
        details: selectedDetails.map((item) => ({
          supplyId: item.supplyId || null,
          assetId: item.assetId || null,
          unit: item.unit,
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/acquisitions', payload);
      showNotification('success', 'Nuevo registro de personal registrado correctamente.');
      setIsFormModalOpen(false);
      fetchAcquisitions();

      if (res.data?.data?.id) {
        navigate(`/personal/${res.data.data.id}`);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Error al guardar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!acquisitionToDelete) return;
    try {
      await api.delete(`/acquisitions/${acquisitionToDelete.id}`);
      showNotification('success', 'El registro de personal fue eliminado exitosamente.');
      setAcquisitionToDelete(null);
      fetchAcquisitions();
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al eliminar el registro.');
      setAcquisitionToDelete(null);
    }
  };

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

      {/* Header Página */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <span>Fichas de Entrega a Personal</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de entrega de materiales, insumos y asignación de activos fijos al personal de COMIBOL
          </p>
        </div>

        {!isGuest && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
          >
            <HiPlus className="text-base" />
            <span>Nuevo Registro de Personal</span>
          </button>
        )}
      </div>

      {/* Buscador y Contadores */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-96">
          <SearchBar
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Buscar por personal, proyecto..."
          />
        </div>

        <div className="text-xs font-semibold text-slate-500">
          Total de registros: <span className="font-bold text-slate-900">{totalAcquisitions}</span>
        </div>
      </div>

      {/* Tabla Principal */}
      {isLoading ? (
        <div className="py-16">
          <LoadingSpinner label="Cargando catálogo de registros de personal..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
          {error}
        </div>
      ) : acquisitions.length === 0 ? (
        <EmptyState
          icon={<HiUserGroup className="text-4xl text-slate-400" />}
          title="Sin registros de personal"
          description={
            search
              ? 'No se encontraron registros que coincidan con la búsqueda.'
              : 'Presione "Nuevo Registro de Personal" para crear la primera ficha de entrega.'
          }
          actionText={search ? 'Limpiar búsqueda' : 'Nuevo Registro'}
          onAction={search ? () => setSearch('') : handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-12 text-center">N°</th>
                  <th className="px-6 py-3.5 text-center">Tipo</th>
                  <th className="px-6 py-3.5">Entregado Por (Admin/Op)</th>
                  <th className="px-6 py-3.5">Retirado Por (Personal)</th>
                  <th className="px-6 py-3.5">Proyecto</th>
                  <th className="px-6 py-3.5 text-center">Fecha Salida</th>
                  <th className="px-6 py-3.5 text-center">Ítems Detalle</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {acquisitions.map((item, index) => {
                  const isSupply = item.type === 'SUPPLY';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 text-center font-bold text-slate-400">
                        {(page - 1) * 10 + index + 1}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                            isSupply
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                          }`}
                        >
                          {isSupply ? 'SUMINISTRO' : 'ACTIVO'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800">
                        <div className="flex items-center gap-2">
                          <HiUser className="text-slate-400 text-sm" />
                          <span>{item.user?.fullName || 'No especificado'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {item.checkoutUser ? item.checkoutUser.fullName : <span className="text-slate-400 font-normal">Sin asignar</span>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {item.project?.name || <span className="text-slate-400 font-normal">Sin proyecto</span>}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">
                        {item.departureDate ? formatDate(item.departureDate) : '—'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-slate-100 text-slate-700">
                          {item.details?.length || 0} ítems
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/personal/${item.id}`)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Ver Ficha Completa / Agregar Detalle"
                          >
                            <HiEye className="text-base" />
                          </button>
                          {!isGuest && (
                            <button
                              type="button"
                              onClick={() => setAcquisitionToDelete(item)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar Registro"
                            >
                              <HiTrash className="text-base" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Paginador */}
      {totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalAcquisitions}
          itemsPerPage={10}
          onPageChange={(p) => setPage(p)}
        />
      )}

      {/* Modal Crear Registro de Personal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 max-h-[90vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="text-base font-bold text-slate-800">
                Nuevo Registro de Personal
              </h3>
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            {/* Selector TAB de Tipo (Suministro vs Activo) */}
            <div className="p-4 bg-slate-100/50 border-b border-slate-100 shrink-0">
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Tipo de Registro de Personal <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-200/60 p-1 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setTypeTab('SUPPLY')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                    typeTab === 'SUPPLY'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <HiArchiveBox className="text-base text-emerald-600" />
                  <span>SUMINISTRO</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTypeTab('ASSET')}
                  className={`py-2 px-4 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all ${
                    typeTab === 'ASSET'
                      ? 'bg-white text-purple-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  <HiCube className="text-base text-purple-600" />
                  <span>ACTIVO</span>
                </button>
              </div>
            </div>

            {/* Formulario Body */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                  {formError}
                </div>
              )}

              {/* 1. Persona que Entrega */}
              {isAdmin ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Persona que Entrega Material (Insumos) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                  >
                    <option value="">-- Seleccionar Persona que Entrega --</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <input type="hidden" value={currentUser?.id || ''} />
              )}

              {/* 2. Persona que Retira */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Persona que Retira Material (Insumos)
                </label>
                <select
                  value={checkoutUserId}
                  onChange={(e) => setCheckoutUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="">-- Seleccionar Persona que Retira (Opcional) --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} ({u.profession || 'Sin cargo'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Fecha de Salida (Fecha Actual por defecto) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha de Salida
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              {/* 4. Proyecto Asignado */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Proyecto Asignado <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white cursor-pointer"
                >
                  <option value="">-- Seleccionar Proyecto --</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Sección Dinámica de Lista de Disponibles (SUMINISTROS vs ACTIVOS) */}
              <div className="pt-2">
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/40">
                  <div className="px-4 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                      {typeTab === 'SUPPLY' ? (
                        <HiArchiveBox className="text-emerald-600 text-base" />
                      ) : (
                        <HiCube className="text-purple-600 text-base" />
                      )}
                      <span>
                        {typeTab === 'SUPPLY'
                          ? 'Suministros Disponibles en el Proyecto'
                          : 'Activos Fijos Disponibles en Sistema'}
                      </span>
                    </span>
                    {selectedDetails.length > 0 && (
                      <span className="text-[11px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                        {selectedDetails.length} seleccionados
                      </span>
                    )}
                  </div>

                  <div className="p-3 max-h-56 overflow-y-auto space-y-2">
                    {!selectedProjectId ? (
                      <p className="text-xs text-slate-400 italic text-center py-4">
                        Seleccione un proyecto en el campo superior para consultar la disponibilidad de {typeTab === 'SUPPLY' ? 'suministros' : 'activos'}.
                      </p>
                    ) : isLoadingItems ? (
                      <div className="py-4">
                        <LoadingSpinner label="Consultando disponibilidad..." />
                      </div>
                    ) : typeTab === 'SUPPLY' ? (
                      availableSupplies.length === 0 ? (
                        <p className="text-xs text-rose-500 font-semibold text-center py-4">
                          No hay suministros asignados o con saldo disponible en el proyecto seleccionado.
                        </p>
                      ) : (
                        availableSupplies.map((sp) => {
                          const available = sp.quantity - (sp.outputQuantity || 0);
                          const isSelected = selectedDetails.some((d) => d.supplyId === sp.supplyId);
                          const currentQty = selectedDetails.find((d) => d.supplyId === sp.supplyId)?.quantity || 1;

                          return (
                            <div
                              key={sp.id}
                              className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-emerald-50/80 border-emerald-300'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={(e) => handleToggleSupplyItem(sp, currentQty, e.target.checked)}
                                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                />
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-slate-800 truncate">
                                    {sp.supply?.name || 'Suministro'}
                                  </p>
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    Disponibles en proyecto: <span className="font-extrabold text-emerald-700">{available} {sp.supply?.unit || 'PZA'}</span>
                                  </p>
                                </div>
                              </div>

                              {isSelected && (
                                <div className="flex items-center gap-2 shrink-0">
                                  <label className="text-[11px] font-bold text-slate-600">Cant:</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max={available}
                                    value={currentQty}
                                    onChange={(e) =>
                                      handleToggleSupplyItem(sp, Number(e.target.value), true)
                                    }
                                    className="w-16 px-2 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-800 text-center focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })
                      )
                    ) : availableAssets.length === 0 ? (
                      <p className="text-xs text-rose-500 font-semibold text-center py-4">
                        No hay activos fijos con saldo disponible en el sistema.
                      </p>
                    ) : (
                      availableAssets.map((asset) => {
                        const available = asset.quantity - (asset.quantityOut || 0);
                        const isSelected = selectedDetails.some((d) => d.assetId === asset.id);

                        return (
                          <div
                            key={asset.id}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'bg-purple-50/80 border-purple-300'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleToggleAssetItem(asset, e.target.checked)}
                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">
                                  <span className="font-mono text-[10px] bg-purple-100 text-purple-800 font-extrabold px-1.5 py-0.5 rounded mr-1.5">
                                    {asset.code}
                                  </span>
                                  {asset.name}
                                </p>
                                <p className="text-[11px] text-slate-500 font-medium">
                                  Disponibles: <span className="font-extrabold text-purple-700">{available} PZA</span> (Total: {asset.quantity})
                                </p>
                              </div>
                            </div>

                            {isSelected && (
                              <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded-lg text-[10px] font-extrabold flex items-center gap-1">
                                <HiCheck /> Asignado (1 UN)
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Footer Modal */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-blue-900 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : 'Crear e Ir a Detalle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmación Eliminar Registro */}
      <ConfirmDialog
        isOpen={!!acquisitionToDelete}
        onOpenChange={(open) => { if (!open) setAcquisitionToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Registro de Personal"
        message="¿Está seguro de eliminar este registro de personal y todas sus asignaciones asociadas?"
        confirmText="Sí, eliminar registro"
        color="danger"
      />
    </div>
  );
};

export default PersonalList;
