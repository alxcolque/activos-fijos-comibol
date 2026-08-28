import React, { useEffect, useState } from 'react';
import api from '../api/axios.instance';
import type { AcquisitionItem, CreateAcquisitionDTO, UpdateAcquisitionDTO } from '../interfaces/acquisition.interface';
import type { User } from '../interfaces/user.interface';
import type { Project } from '../interfaces/project.interface';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { Pagination } from '../components/Pagination';
import { formatDate } from '../utils/assets';
import { useAuthStore } from '../store/authStore';
import {
  HiPlus,
  HiPencilSquare,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiUserGroup,
  HiXMark,
  HiFunnel,
  HiEye,
  HiCalendar,
  HiUser,
  HiFolder,
  HiBriefcase,
  HiArrowRightOnRectangle,
} from 'react-icons/hi2';

export const PersonalList: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const isGuest = currentUser?.role === 'guest';

  // Estados Principales
  const [acquisitions, setAcquisitions] = useState<AcquisitionItem[]>([]);
  const [totalAcquisitions, setTotalAcquisitions] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Catalogos para selectores (Usuarios y Proyectos)
  const [usersList, setUsersList] = useState<User[]>([]);
  const [projectsList, setProjectsList] = useState<Project[]>([]);

  // Estados de Modal Formulario y Detalle
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedAcquisition, setSelectedAcquisition] = useState<AcquisitionItem | null>(null);
  const [acquisitionToDelete, setAcquisitionToDelete] = useState<AcquisitionItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Campos del Formulario
  const [userId, setUserId] = useState('');
  const [projectUserId, setProjectUserId] = useState('');
  const [checkoutUserId, setCheckoutUserId] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [unit, setUnit] = useState('caja');
  const [quantity, setQuantity] = useState<number | ''>(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opciones de visibilidad de columnas
  const [visibleColumns, setVisibleColumns] = useState({
    user: true,
    projectUser: true,
    checkoutUser: true,
    departureDate: true,
    project: true,
    quantity: true,
  });
  const [isColumnFilterOpen, setIsColumnFilterOpen] = useState(false);

  useEffect(() => {
    fetchAcquisitions();
    loadSupportCatalog();
  }, [page, search]);

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
      console.error('Error al cargar lista de personal:', err);
      setError(err.response?.data?.message || 'No se pudo cargar la lista de personal.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadSupportCatalog = async () => {
    try {
      const [usersRes, projectsRes] = await Promise.all([
        api.get<{ success: boolean; data: User[] }>('/users?limit=300'),
        api.get<{ success: boolean; data: Project[] }>('/projects?limit=300'),
      ]);
      setUsersList(usersRes.data.data || []);
      setProjectsList(projectsRes.data.data || []);
    } catch (err) {
      console.error('Error al cargar catálogos de apoyo para personal:', err);
    }
  };

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setSelectedAcquisition(null);
    setUserId(usersList[0]?.id || '');
    setProjectUserId('');
    setCheckoutUserId('');
    setDepartureDate(new Date().toISOString().split('T')[0]);
    setSelectedProjectId('');
    setUnit('caja');
    setQuantity(1);
    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (item: AcquisitionItem) => {
    setSelectedAcquisition(item);
    setUserId(item.userId || '');
    setProjectUserId(item.projectUserId || '');
    setCheckoutUserId(item.checkoutUserId || '');
    setDepartureDate(item.departureDate ? new Date(item.departureDate).toISOString().split('T')[0] : '');

    const firstDetail = item.details && item.details.length > 0 ? item.details[0] : null;
    setSelectedProjectId(firstDetail?.projectId || '');
    setUnit(firstDetail?.unit || 'caja');
    setQuantity(firstDetail?.quantity || 1);

    setFormError(null);
    setIsFormModalOpen(true);
  };

  const handleOpenDetailModal = (item: AcquisitionItem) => {
    setSelectedAcquisition(item);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!userId) {
      setFormError('Debe seleccionar la persona que entrega el material.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateAcquisitionDTO = {
        userId,
        projectUserId: projectUserId || null,
        checkoutUserId: checkoutUserId || null,
        departureDate: departureDate ? departureDate : null,
        details: selectedProjectId
          ? [
              {
                projectId: selectedProjectId,
                unit: unit || 'caja',
                quantity: Number(quantity || 1),
              },
            ]
          : [],
      };

      if (selectedAcquisition) {
        await api.put(`/acquisitions/${selectedAcquisition.id}`, payload as UpdateAcquisitionDTO);
        showNotification('success', 'Registro de personal actualizado correctamente.');
      } else {
        await api.post('/acquisitions', payload);
        showNotification('success', 'Registro de personal creado exitosamente.');
      }

      setIsFormModalOpen(false);
      fetchAcquisitions();
    } catch (err: any) {
      setFormError(err.response?.data?.message || err.message || 'Error al guardar el registro.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!acquisitionToDelete) return;
    try {
      await api.delete(`/acquisitions/${acquisitionToDelete.id}`);
      showNotification('success', 'Registro de personal eliminado correctamente.');
      setAcquisitionToDelete(null);
      fetchAcquisitions();
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al eliminar el registro.');
      setAcquisitionToDelete(null);
    }
  };

  const toggleColumn = (key: keyof typeof visibleColumns) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Cálculo de estadísticas rápidas
  const totalWithDeparture = acquisitions.filter((a) => !!a.departureDate).length;
  const totalWithProjectUser = acquisitions.filter((a) => !!a.projectUser).length;
  const totalWithCheckoutUser = acquisitions.filter((a) => !!a.checkoutUser).length;

  return (
    <div className="space-y-6 pb-12">
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

      {/* Encabezado Principal (Estilo Proyectos) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Control de Personal y Entrega de Insumos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de asignaciones de personal, entregas de materiales, retiros y fechas de salida por proyectos.
          </p>
        </div>

        {!isGuest && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-2xl text-xs shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <HiPlus className="text-base" />
            <span>Nuevo Registro de Personal</span>
          </button>
        )}
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl shrink-0">
            <HiUserGroup />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registros</p>
            <p className="text-xl font-extrabold text-slate-800">{totalAcquisitions}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shrink-0">
            <HiUser />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal de Proyecto</p>
            <p className="text-xl font-extrabold text-blue-900">{totalWithProjectUser}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl shrink-0">
            <HiArrowRightOnRectangle />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Personal que Retira</p>
            <p className="text-xl font-extrabold text-emerald-700">{totalWithCheckoutUser}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl shrink-0">
            <HiCalendar />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Salidas Registradas</p>
            <p className="text-xl font-extrabold text-purple-900">{totalWithDeparture}</p>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Visibilidad de Columnas */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Buscar por nombre de personal, entrega, retiros o proyecto..."
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
                  checked={visibleColumns.user}
                  onChange={() => toggleColumn('user')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Persona que Entrega</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.projectUser}
                  onChange={() => toggleColumn('projectUser')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Personal de Proyecto</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.checkoutUser}
                  onChange={() => toggleColumn('checkoutUser')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Persona que Retira</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.departureDate}
                  onChange={() => toggleColumn('departureDate')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Fecha de Salida</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={visibleColumns.project}
                  onChange={() => toggleColumn('project')}
                  className="rounded text-amber-500 focus:ring-amber-400"
                />
                <span>Proyecto Asignado</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Contenido / Tabla de Personal */}
      {isLoading && acquisitions.length === 0 ? (
        <div className="py-16">
          <LoadingSpinner label="Cargando registros de personal..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
          {error}
        </div>
      ) : acquisitions.length === 0 ? (
        <EmptyState
          icon={<HiUserGroup className="text-4xl text-slate-400" />}
          title="No se encontraron registros de personal"
          description={
            search
              ? 'No hay registros que coincidan con la búsqueda especificada.'
              : 'Comience registrando el personal involucrado en entregas y retiros de insumos.'
          }
          actionText={search ? 'Limpiar Búsqueda' : 'Nuevo Registro'}
          onAction={search ? () => setSearch('') : handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="sticky top-0 bg-slate-50 z-10 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-12 text-center">N°</th>
                  {visibleColumns.user && <th className="px-5 py-3.5">Entrega (Materiales)</th>}
                  {visibleColumns.projectUser && <th className="px-5 py-3.5">Personal de Proyecto</th>}
                  {visibleColumns.checkoutUser && <th className="px-5 py-3.5">Persona que Retira</th>}
                  {visibleColumns.departureDate && <th className="px-5 py-3.5 text-center">Fecha Salida</th>}
                  {visibleColumns.project && <th className="px-5 py-3.5">Proyecto / Detalle</th>}
                  <th className="px-5 py-3.5 text-right sticky right-0 bg-slate-50 shadow-xs z-20">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {acquisitions.map((item, index) => {
                  const firstDetail = item.details && item.details.length > 0 ? item.details[0] : null;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 text-center text-slate-400 font-bold">
                        {(page - 1) * 10 + index + 1}
                      </td>

                      {visibleColumns.user && (
                        <td className="px-5 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800">{item.user?.fullName || '—'}</span>
                            <span className="text-[11px] text-slate-400">
                              {item.user?.profession ? `Prof: ${item.user.profession}` : item.user?.email}
                            </span>
                          </div>
                        </td>
                      )}

                      {visibleColumns.projectUser && (
                        <td className="px-5 py-4 text-slate-700">
                          {item.projectUser?.fullName ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-blue-950">{item.projectUser.fullName}</span>
                              <span className="text-[10px] text-slate-400">
                                {item.projectUser.profession || 'Personal asignado'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal">—</span>
                          )}
                        </td>
                      )}

                      {visibleColumns.checkoutUser && (
                        <td className="px-5 py-4 text-slate-700">
                          {item.checkoutUser?.fullName ? (
                            <div className="flex flex-col">
                              <span className="font-semibold text-emerald-900">{item.checkoutUser.fullName}</span>
                              <span className="text-[10px] text-slate-400">
                                {item.checkoutUser.profession || 'Retiro de insumos'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-normal">—</span>
                          )}
                        </td>
                      )}

                      {visibleColumns.departureDate && (
                        <td className="px-5 py-4 text-center">
                          {item.departureDate ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-900 border border-purple-200">
                              {formatDate(item.departureDate)}
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      {visibleColumns.project && (
                        <td className="px-5 py-4">
                          {firstDetail?.project?.name ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200/80">
                              {firstDetail.project.name} ({firstDetail.quantity || 1} {firstDetail.unit || 'caja'})
                            </span>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      )}

                      <td className="px-5 py-4 text-right sticky right-0 bg-white shadow-xs z-10">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetailModal(item)}
                            title="Ver Detalle de Personal"
                            className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all cursor-pointer"
                          >
                            <HiEye className="text-base" />
                          </button>
                          {!isGuest && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                title="Editar Registro"
                                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer"
                              >
                                <HiPencilSquare className="text-base" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setAcquisitionToDelete(item)}
                                title="Eliminar Registro"
                                className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                              >
                                <HiTrash className="text-base" />
                              </button>
                            </>
                          )}
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
            />
          </div>
        </div>
      )}

      {/* Modal Crear / Editar Registro de Personal */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800">
                {selectedAcquisition ? 'Editar Registro de Personal' : 'Nuevo Registro de Personal'}
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

              {/* Persona que entrega material */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Persona que Entrega Material (Insumos) <span className="text-rose-500">*</span>
                </label>
                <select
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="">-- Seleccionar Usuario Entregador --</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.fullName} {u.profession ? `(${u.profession})` : ''} - {u.email}
                    </option>
                  ))}
                </select>
              </div>

              {/* Personal de Proyecto y Persona que Retira */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Personal de Proyecto
                  </label>
                  <select
                    value={projectUserId}
                    onChange={(e) => setProjectUserId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">-- Sin Asignar --</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} {u.profession ? `(${u.profession})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Persona que Retira Materiales
                  </label>
                  <select
                    value={checkoutUserId}
                    onChange={(e) => setCheckoutUserId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all cursor-pointer"
                  >
                    <option value="">-- Sin Asignar --</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.fullName} {u.profession ? `(${u.profession})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fecha de Salida */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Fecha de Salida
                </label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Proyecto y Cantidades */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <p className="text-xs font-bold text-slate-700">Detalle del Proyecto Asignado</p>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Proyecto
                  </label>
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 transition-all cursor-pointer"
                  >
                    <option value="">-- Seleccionar Proyecto (Opcional) --</option>
                    {projectsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Unidad de Medida
                    </label>
                    <input
                      type="text"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      placeholder="caja, paquete, PZA"
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-center"
                    />
                  </div>
                </div>
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
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-xs font-bold text-blue-900 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : selectedAcquisition ? 'Guardar Cambios' : 'Registrar Personal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ver Detalle de Registro de Personal */}
      {isDetailModalOpen && selectedAcquisition && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-2xl">
                  <HiUserGroup className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Detalle de Registro de Personal</h3>
                  <p className="text-xs text-slate-400">ID: {selectedAcquisition.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-2 border border-slate-100">
                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Persona que Entrega Material</p>
                <p className="font-bold text-sm text-slate-800">{selectedAcquisition.user?.fullName || '—'}</p>
                <p className="text-slate-500">Correo: {selectedAcquisition.user?.email || '—'}</p>
                {selectedAcquisition.user?.profession && (
                  <p className="text-amber-800 font-semibold">Profesión: {selectedAcquisition.user.profession}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase text-blue-800 tracking-wider">Personal de Proyecto</p>
                  <p className="font-bold text-blue-950">{selectedAcquisition.projectUser?.fullName || '—'}</p>
                  {selectedAcquisition.projectUser?.profession && (
                    <p className="text-[11px] text-slate-600">{selectedAcquisition.projectUser.profession}</p>
                  )}
                </div>

                <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Persona que Retira</p>
                  <p className="font-bold text-emerald-950">{selectedAcquisition.checkoutUser?.fullName || '—'}</p>
                  {selectedAcquisition.checkoutUser?.profession && (
                    <p className="text-[11px] text-slate-600">{selectedAcquisition.checkoutUser.profession}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-purple-50/60 border border-purple-100 rounded-2xl font-bold">
                <span className="text-purple-900">Fecha de Salida:</span>
                <span className="text-purple-950">
                  {selectedAcquisition.departureDate ? formatDate(selectedAcquisition.departureDate) : 'Sin registrar'}
                </span>
              </div>

              {selectedAcquisition.details && selectedAcquisition.details.length > 0 && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1">
                  <p className="text-[10px] font-bold uppercase text-amber-900 tracking-wider">Proyecto Asignado</p>
                  <p className="font-bold text-slate-800">{selectedAcquisition.details[0].project?.name || '—'}</p>
                  <p className="text-[11px] text-slate-600">
                    Cantidad: {selectedAcquisition.details[0].quantity} {selectedAcquisition.details[0].unit || 'caja'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsDetailModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={!!acquisitionToDelete}
        onOpenChange={(open) => { if (!open) setAcquisitionToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Registro de Personal"
        message="¿Está seguro de eliminar este registro de personal? Esta acción eliminará permanentemente la entrega y asignación asociada."
        confirmText="Sí, eliminar"
        color="danger"
      />
    </div>
  );
};

export default PersonalList;
