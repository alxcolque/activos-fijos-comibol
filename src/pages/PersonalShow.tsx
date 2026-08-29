import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.instance';
import type { AcquisitionItem, AcquisitionDetailItem } from '../interfaces/acquisition.interface';
import type { SupplyProjectItem } from '../interfaces/supply.interface';
import type { Asset } from '../interfaces/asset.interface';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatDate } from '../utils/assets';
import {
  HiArrowLeft,
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiCube,
  HiArchiveBox,
  HiUser,
  HiBuildingOffice,
  HiCalendar,
  HiXMark,
  HiArrowPath,
} from 'react-icons/hi2';

export const PersonalShowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [acquisition, setAcquisition] = useState<AcquisitionItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Modales
  const [isAddSupplyModalOpen, setIsAddSupplyModalOpen] = useState(false);
  const [isAddAssetModalOpen, setIsAddAssetModalOpen] = useState(false);
  const [detailToDelete, setDetailToDelete] = useState<AcquisitionDetailItem | null>(null);
  const [detailToRelease, setDetailToRelease] = useState<AcquisitionDetailItem | null>(null);

  // Datos para modal de Suministros
  const [projectSupplies, setProjectSupplies] = useState<SupplyProjectItem[]>([]);
  const [selectedSupplyProject, setSelectedSupplyProject] = useState<SupplyProjectItem | null>(null);
  const [supplyQuantity, setSupplyQuantity] = useState<number | ''>(1);
  const [isSubmittingDetail, setIsSubmittingDetail] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Datos para modal de Activos
  const [assetsList, setAssetsList] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    if (id) {
      fetchAcquisitionDetails();
    }
  }, [id]);

  const fetchAcquisitionDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<{ success: boolean; data: AcquisitionItem }>(`/acquisitions/${id}`);
      if (res.data?.data) {
        setAcquisition(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al obtener la información del registro de personal.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar suministros del proyecto
  const openAddSupplyModal = async () => {
    if (!acquisition?.projectId) {
      showNotification('danger', 'Este registro no tiene un proyecto asignado para requerir suministros.');
      return;
    }
    setModalError(null);
    setSelectedSupplyProject(null);
    setSupplyQuantity(1);
    setIsAddSupplyModalOpen(true);

    try {
      const res = await api.get(`/projects/${acquisition.projectId}`);
      if (res.data?.data?.supplyProjects) {
        setProjectSupplies(res.data.data.supplyProjects);
      } else {
        setProjectSupplies([]);
      }
    } catch (err: any) {
      setModalError('No se pudieron cargar los suministros asignados a este proyecto.');
    }
  };

  // Cargar catálogo de activos
  const openAddAssetModal = async () => {
    setModalError(null);
    setSelectedAssetId('');
    setIsAddAssetModalOpen(true);

    try {
      const res = await api.get('/assets', { params: { limit: 100 } });
      if (res.data?.data) {
        setAssetsList(res.data.data);
      }
    } catch (err: any) {
      setModalError('No se pudieron cargar los activos disponibles.');
    }
  };

  const handleAddSupplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedSupplyProject) {
      setModalError('Debe seleccionar un suministro.');
      return;
    }

    const qty = Number(supplyQuantity);
    if (!qty || qty <= 0) {
      setModalError('Ingrese una cantidad válida mayor a 0.');
      return;
    }

    const stockAvailable = selectedSupplyProject.quantity - (selectedSupplyProject.outputQuantity || 0);
    if (qty > stockAvailable) {
      setModalError(`La cantidad ingresada (${qty}) excede el stock disponible en el proyecto (${stockAvailable}).`);
      return;
    }

    setIsSubmittingDetail(true);
    try {
      await api.post(`/acquisitions/${id}/details`, {
        supplyId: selectedSupplyProject.supplyId,
        unit: selectedSupplyProject.supply?.unit || 'PZA',
        quantity: qty,
      });

      showNotification('success', 'Suministro asignado correctamente al registro de personal.');
      setIsAddSupplyModalOpen(false);
      fetchAcquisitionDetails();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error al agregar el suministro.');
    } finally {
      setIsSubmittingDetail(false);
    }
  };

  const handleAddAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!selectedAssetId) {
      setModalError('Debe seleccionar un activo.');
      return;
    }

    setIsSubmittingDetail(true);
    try {
      await api.post(`/acquisitions/${id}/details`, {
        assetId: selectedAssetId,
        unit: 'PZA',
        quantity: 1,
      });

      showNotification('success', 'Activo asignado correctamente al registro de personal.');
      setIsAddAssetModalOpen(false);
      fetchAcquisitionDetails();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error al agregar el activo.');
    } finally {
      setIsSubmittingDetail(false);
    }
  };

  const handleDeleteDetailConfirm = async () => {
    if (!detailToDelete) return;
    try {
      await api.delete(`/acquisitions/details/${detailToDelete.id}`);
      showNotification('success', 'El registro de detalle ha sido eliminado.');
      setDetailToDelete(null);
      fetchAcquisitionDetails();
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al eliminar el detalle.');
      setDetailToDelete(null);
    }
  };

  const handleReleaseDetailConfirm = async () => {
    if (!detailToRelease) return;
    try {
      await api.delete(`/acquisitions/details/${detailToRelease.id}`);
      showNotification('success', 'El activo ha sido liberado correctamente.');
      setDetailToRelease(null);
      fetchAcquisitionDetails();
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al liberar el activo.');
      setDetailToRelease(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24">
        <LoadingSpinner label="Cargando detalle de registro de personal..." />
      </div>
    );
  }

  if (error || !acquisition) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/personal')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900"
        >
          <HiArrowLeft /> Volver a Personal
        </button>
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center text-xs font-bold text-rose-700">
          {error || 'No se encontró el registro especificado.'}
        </div>
      </div>
    );
  }

  const isSupplyType = acquisition.type === 'SUPPLY';

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

      {/* Botón Volver y Título */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/personal')}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs transition-all"
        >
          <HiArrowLeft className="text-base" />
          <span>Volver al Catálogo de Personal</span>
        </button>
        <div className="flex items-center gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide border ${
              isSupplyType
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-purple-50 text-purple-700 border-purple-200'
            }`}
          >
            Tipo: {isSupplyType ? 'SUMINISTRO / INSUMO' : 'ACTIVO FIJO'}
          </span>
        </div>
      </div>

      {/* Tarjeta Ejecutiva de Resumen del Registro */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
              <span>Ficha de Entrega de Personal</span>
              <span className="text-xs font-bold font-mono px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg">
                #{acquisition.id.substring(0, 8)}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Registro detallado de asignaciones y salida de materiales o activos fijos.
            </p>
          </div>
          <div>
            {isSupplyType ? (
              <button
                type="button"
                onClick={openAddSupplyModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl text-xs shadow-sm transition-all hover:scale-105"
              >
                <HiPlus className="text-base" />
                <span>+ Agregar Suministro</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openAddAssetModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl text-xs shadow-sm transition-all hover:scale-105"
              >
                <HiPlus className="text-base" />
                <span>+ Agregar Activo</span>
              </button>
            )}
          </div>
        </div>

        {/* Malla de Datos Relevantes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <HiUser className="text-amber-500 text-base" />
              <span>Persona que Entrega</span>
            </div>
            <p className="text-xs font-extrabold text-slate-800">
              {acquisition.user?.fullName || 'No registrada'}
            </p>
            <p className="text-[11px] text-slate-500">{acquisition.user?.email}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <HiUser className="text-blue-500 text-base" />
              <span>Persona que Retira</span>
            </div>
            <p className="text-xs font-extrabold text-slate-800">
              {acquisition.checkoutUser?.fullName || <span className="text-slate-400 font-normal">Sin especificar</span>}
            </p>
            <p className="text-[11px] text-slate-500">{acquisition.checkoutUser?.email || '-'}</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <HiBuildingOffice className="text-purple-500 text-base" />
              <span>Proyecto Asignado</span>
            </div>
            <p className="text-xs font-extrabold text-slate-800">
              {acquisition.project?.name || <span className="text-slate-400 font-normal">Sin proyecto</span>}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 mb-1">
              <HiCalendar className="text-emerald-500 text-base" />
              <span>Fecha de Salida</span>
            </div>
            <p className="text-xs font-extrabold text-slate-800">
              {acquisition.departureDate ? formatDate(acquisition.departureDate) : 'No especificada'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabla de Detalle (Acquisition Details) */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            {isSupplyType ? <HiArchiveBox className="text-emerald-600 text-lg" /> : <HiCube className="text-purple-600 text-lg" />}
            <span>{isSupplyType ? 'Detalle de Suministros e Insumos Entregados' : 'Detalle de Activos Fijos Entregados'}</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">
            {acquisition.details?.length || 0} ítems registrados
          </span>
        </div>

        {!acquisition.details || acquisition.details.length === 0 ? (
          <EmptyState
            icon={isSupplyType ? <HiArchiveBox className="text-4xl text-slate-400" /> : <HiCube className="text-4xl text-slate-400" />}
            title="Sin ítems registrados en el detalle"
            description={isSupplyType ? 'Presione "+ Agregar Suministro" para incorporar insumos del proyecto.' : 'Presione "+ Agregar Activo" para incorporar activos fijos.'}
            actionText={isSupplyType ? '+ Agregar Suministro' : '+ Agregar Activo'}
            onAction={isSupplyType ? openAddSupplyModal : openAddAssetModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">{isSupplyType ? 'Suministro / Material' : 'Activo Fijo'}</th>
                  <th className="px-6 py-4 text-center">Unidad</th>
                  <th className="px-6 py-4 text-center">Cantidad</th>
                  <th className="px-6 py-4 text-center">Fecha Asignación</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {acquisition.details.map((detail, index) => (
                  <tr key={detail.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {isSupplyType ? (
                        detail.supply ? (
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span>{detail.supply.name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Suministro no especificado</span>
                        )
                      ) : detail.asset ? (
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded border border-purple-200">
                            {detail.asset.code}
                          </span>
                          <span>{detail.asset.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Activo no especificado</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-slate-600">
                      {detail.unit || (detail.supply?.unit ?? 'PZA')}
                    </td>
                    <td className="px-6 py-4 text-center font-extrabold text-slate-800">
                      {detail.quantity}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 font-medium">
                      {detail.createdAt ? formatDate(detail.createdAt) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {!isSupplyType && (
                          <button
                            type="button"
                            onClick={() => setDetailToRelease(detail)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 font-bold text-[10px] transition-colors"
                            title="Liberar activo fijo"
                          >
                            <HiArrowPath className="text-xs" />
                            <span>Liberar</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setDetailToDelete(detail)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar registro"
                        >
                          <HiTrash className="text-base" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Agregar Suministro */}
      {isAddSupplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <HiArchiveBox className="text-emerald-600" />
                <span>+ Agregar Suministro al Registro</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddSupplyModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddSupplySubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seleccionar Suministro Asignado al Proyecto <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedSupplyProject?.id || ''}
                  onChange={(e) => {
                    const sp = projectSupplies.find((s) => s.id === e.target.value) || null;
                    setSelectedSupplyProject(sp);
                  }}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="">-- Seleccionar Suministro --</option>
                  {projectSupplies.map((sp) => {
                    const stock = sp.quantity - (sp.outputQuantity || 0);
                    return (
                      <option key={sp.id} value={sp.id} disabled={stock <= 0}>
                        {sp.supply?.name || 'Suministro'} (Disponibles en Proyecto: {stock} {sp.supply?.unit || 'PZA'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {selectedSupplyProject && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800">Stock Asignado al Proyecto:</span>
                    <span className="font-extrabold text-emerald-900">{selectedSupplyProject.quantity} {selectedSupplyProject.supply?.unit || 'PZA'}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-800">Saldo Disponible en Proyecto:</span>
                    <span className="font-extrabold text-emerald-900">
                      {selectedSupplyProject.quantity - (selectedSupplyProject.outputQuantity || 0)} {selectedSupplyProject.supply?.unit || 'PZA'}
                    </span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad a Entregar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={supplyQuantity}
                  onChange={(e) => setSupplyQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddSupplyModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDetail || !selectedSupplyProject}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmittingDetail ? 'Guardando...' : 'Asignar Suministro'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Agregar Activo */}
      {isAddAssetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <HiCube className="text-purple-600" />
                <span>+ Agregar Activo Fijo al Registro</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddAssetModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAddAssetSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                  {modalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Seleccionar Activo Fijo <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedAssetId}
                  onChange={(e) => setSelectedAssetId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white"
                >
                  <option value="">-- Seleccionar Activo Fijo --</option>
                  {assetsList.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      [{asset.code}] - {asset.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 font-semibold">
                La cantidad asignada para activos fijos es de 1 unidad por defecto.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddAssetModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDetail || !selectedAssetId}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-xl shadow-sm disabled:opacity-50"
                >
                  {isSubmittingDetail ? 'Guardando...' : 'Asignar Activo Fijo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación Eliminar Detalle */}
      <ConfirmDialog
        isOpen={!!detailToDelete}
        onOpenChange={(open) => { if (!open) setDetailToDelete(null); }}
        onConfirm={handleDeleteDetailConfirm}
        title="Eliminar Registro de Detalle"
        message="¿Está seguro de eliminar este ítem del detalle de personal? Esta acción desasociará el registro."
        confirmText="Sí, eliminar"
        color="danger"
      />

      {/* Modal Confirmación Liberar Activo */}
      <ConfirmDialog
        isOpen={!!detailToRelease}
        onOpenChange={(open) => { if (!open) setDetailToRelease(null); }}
        onConfirm={handleReleaseDetailConfirm}
        title="Liberar Activo Fijo"
        message="¿Está seguro de liberar este activo fijo asignado al personal?"
        confirmText="Sí, liberar activo"
        color="warning"
      />
    </div>
  );
};

export default PersonalShowPage;
