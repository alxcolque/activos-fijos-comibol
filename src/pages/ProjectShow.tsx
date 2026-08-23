import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios.instance';
import type { Project } from '../interfaces/project.interface';
import type { AssetModel } from '../interfaces/asset.interface';
import { ProjectStatusBadge } from '../components/projects/ProjectStatusBadge';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import {
  HiArrowLeft,
  HiOutlineMapPin,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineCube,
  HiOutlinePlus,
  HiOutlineMagnifyingGlass,
  HiOutlineExclamationTriangle,
  HiOutlineCheckCircle,
  HiOutlineArrowPathRoundedSquare,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineLockOpen,
  HiOutlineArrowDownTray,
  HiXMark,
} from 'react-icons/hi2';

interface AssetAssignmentItem {
  id: string;
  assetId: string;
  projectId: string;
  quantity: number;
  assignedAt: string;
  releasedAt: string | null;
  observations: string | null;
  asset?: {
    id: string;
    code: string;
    name: string;
    brand?: string;
    model?: string;
    category?: { id: string; name: string };
    status?: { id: string; name: string };
  };
}

export const ProjectShowPage: React.FC = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados del Proyecto
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Estados de Asignaciones del Proyecto
  const [assignments, setAssignments] = useState<AssetAssignmentItem[]>([]);
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);

  // Catálogo completo de Activos
  const [assetsCatalog, setAssetsCatalog] = useState<AssetModel[]>([]);

  // Modal "Asignar activo"
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [searchAsset, setSearchAsset] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [assignQuantity, setAssignQuantity] = useState<number>(1);
  const [assignObservations, setAssignObservations] = useState('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);
  const [assignValidationWarning, setAssignValidationWarning] = useState<string | null>(null);

  // Modal "Liberar activo"
  const [releaseItem, setReleaseItem] = useState<AssetAssignmentItem | null>(null);
  const [releaseQuantity, setReleaseQuantity] = useState<number>(1);
  const [releaseObservations, setReleaseObservations] = useState('');
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseValidationWarning, setReleaseValidationWarning] = useState<string | null>(null);

  // Modal "Eliminar asignación"
  const [deleteItem, setDeleteItem] = useState<AssetAssignmentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal "Reporte Word"
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState<'carta' | 'a4' | 'oficio'>('carta');
  const [orientation, setOrientation] = useState<'vertical' | 'horizontal'>('horizontal');
  const [isDownloadingWord, setIsDownloadingWord] = useState(false);

  // Notificaciones Toast
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDownloadWordReport = async () => {
    if (!projectId) return;
    setIsDownloadingWord(true);
    try {
      const response = await api.get(`/projects/${projectId}/report-word`, {
        params: { pageSize, orientation },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (project?.name || 'Proyecto').replace(/[^a-zA-Z0-9_-]/g, '_');
      link.setAttribute('download', `Informe_Inventario_${safeName}.docx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setIsWordModalOpen(false);
      showNotification('success', 'Informe Word generado y descargado exitosamente.');
    } catch (err: any) {
      console.error('Error al descargar reporte Word:', err);
      showNotification('danger', 'No se pudo generar el informe Word.');
    } finally {
      setIsDownloadingWord(false);
    }
  };

  // Cargar datos del proyecto, asignaciones y catálogo
  useEffect(() => {
    if (!projectId) return;
    loadProjectData();
    loadAssignments();
    loadAssetsCatalog();
  }, [projectId]);

  const loadProjectData = async () => {
    setIsLoadingProject(true);
    setProjectError(null);
    try {
      const res = await api.get<{ success: boolean; data: Project }>(`/projects/${projectId}`);
      if (res.data?.data) {
        setProject(res.data.data);
      }
    } catch (err: any) {
      setProjectError(err.response?.data?.message || 'Error al cargar el proyecto.');
    } finally {
      setIsLoadingProject(false);
    }
  };

  const loadAssignments = async () => {
    setIsLoadingAssignments(true);
    try {
      const res = await api.get<{ success: boolean; data: AssetAssignmentItem[] }>(
        `/asset-projects/project/${projectId}`,
      );
      if (res.data?.data) {
        setAssignments(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar asignaciones del proyecto:', err);
    } finally {
      setIsLoadingAssignments(false);
    }
  };

  const loadAssetsCatalog = async () => {
    try {
      const res = await api.get<{ success: boolean; data: AssetModel[] }>('/assets', {
        params: { limit: 300 },
      });
      if (res.data?.data) {
        setAssetsCatalog(res.data.data);
      }
    } catch (err) {
      console.error('Error al cargar catálogo de activos:', err);
    }
  };

  // Cálculo de disponibilidad de un activo
  const getAssetStockInfo = (asset: AssetModel) => {
    const total = Number(asset.quantity || 1);
    const out = Number(asset.quantityOut || 0);
    const available = Math.max(0, total - out);
    return {
      total,
      out,
      available,
      isOutOfStock: available <= 0,
    };
  };

  const selectedAsset = assetsCatalog.find((a) => a.id === selectedAssetId);
  const selectedAssetStock = selectedAsset ? getAssetStockInfo(selectedAsset) : null;

  // Manejo de Modal de Asignación
  const handleOpenAssignModal = () => {
    setSelectedAssetId('');
    setSearchAsset('');
    setAssignQuantity(1);
    setAssignObservations('');
    setAssignValidationWarning(null);
    setIsAssignModalOpen(true);
  };

  const handleSelectAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setAssignValidationWarning(null);

    const target = assetsCatalog.find((a) => a.id === assetId);
    if (!target) return;

    const stock = getAssetStockInfo(target);
    if (stock.isOutOfStock) {
      setAssignQuantity(0);
      setAssignValidationWarning('⚠️ No existen unidades disponibles en almacén para asignar este activo.');
    } else {
      setAssignQuantity(1);
    }
  };

  const handleAssignQuantityChange = (valStr: string) => {
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val <= 0) {
      setAssignQuantity(isNaN(val) ? 0 : val);
      setAssignValidationWarning('⚠️ La cantidad a asignar debe ser mayor a cero.');
      return;
    }

    setAssignQuantity(val);

    if (!selectedAsset) return;
    const stock = getAssetStockInfo(selectedAsset);

    if (val > stock.available) {
      setAssignValidationWarning(
        `⚠️ La cantidad ingresada (${val}) supera las unidades disponibles (${stock.available} de ${stock.total} totales).`,
      );
    } else {
      setAssignValidationWarning(null);
    }
  };

  const handleAssignAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedAssetId || !selectedAsset) return;

    const stock = getAssetStockInfo(selectedAsset);
    if (assignQuantity <= 0 || assignQuantity > stock.available) {
      setAssignValidationWarning(`Ingrese una cantidad válida entre 1 y ${stock.available}.`);
      return;
    }

    setIsSubmittingAssign(true);
    try {
      await api.post('/asset-projects/assign', {
        projectId,
        assetId: selectedAssetId,
        quantity: assignQuantity,
        observations: assignObservations.trim() || undefined,
      });

      showNotification('success', 'Activo asignado al proyecto exitosamente.');
      setIsAssignModalOpen(false);

      await Promise.all([loadAssignments(), loadAssetsCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al asignar el activo.');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  // Manejo de Modal de Liberación
  const handleOpenReleaseModal = (item: AssetAssignmentItem) => {
    setReleaseItem(item);
    setReleaseQuantity(item.quantity);
    setReleaseObservations('');
    setReleaseValidationWarning(null);
  };

  const handleReleaseQuantityChange = (valStr: string) => {
    if (!releaseItem) return;
    const val = parseInt(valStr, 10);
    if (isNaN(val) || val <= 0) {
      setReleaseQuantity(isNaN(val) ? 0 : val);
      setReleaseValidationWarning('⚠️ La cantidad a liberar debe ser mayor a cero.');
      return;
    }

    setReleaseQuantity(val);

    if (val > releaseItem.quantity) {
      setReleaseValidationWarning(
        `⚠️ No es posible liberar más de las ${releaseItem.quantity} unidades asignadas a este proyecto.`,
      );
    } else {
      setReleaseValidationWarning(null);
    }
  };

  const handleConfirmReleaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!releaseItem || !projectId) return;

    if (releaseQuantity <= 0 || releaseQuantity > releaseItem.quantity) {
      setReleaseValidationWarning(`La cantidad debe ser entre 1 y ${releaseItem.quantity}.`);
      return;
    }

    setIsReleasing(true);
    try {
      await api.post('/asset-projects/release', {
        assignmentId: releaseItem.id,
        assetId: releaseItem.assetId,
        projectId,
        quantityToRelease: releaseQuantity,
        observations: releaseObservations.trim() || undefined,
      });

      showNotification('success', 'Activo liberado del proyecto correctamente.');
      setReleaseItem(null);

      await Promise.all([loadAssignments(), loadAssetsCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al liberar el activo.');
    } finally {
      setIsReleasing(false);
    }
  };

  // Confirmar Eliminación Física de Asignación
  const handleConfirmDelete = async () => {
    if (!deleteItem) return;

    setIsDeleting(true);
    try {
      await api.delete(`/asset-projects/${deleteItem.id}`);

      showNotification('success', 'Asignación eliminada del proyecto correctamente.');
      setDeleteItem(null);

      await Promise.all([loadAssignments(), loadAssetsCatalog(), loadProjectData()]);
    } catch (err: any) {
      showNotification('danger', err.response?.data?.message || 'Error al eliminar la asignación.');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateVal?: string | Date | null) => {
    if (!dateVal) return '—';
    try {
      const d = new Date(dateVal);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleDateString('es-BO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC',
      });
    } catch {
      return '—';
    }
  };

  const filteredAssets = assetsCatalog.filter((a) => {
    const q = searchAsset.toLowerCase();
    return a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
  });

  const activeAssignmentsCount = assignments.filter((a) => !a.releasedAt).length;

  if (isLoadingProject && !project) {
    return (
      <div className="py-20">
        <LoadingSpinner label="Cargando información del proyecto..." />
      </div>
    );
  }

  if (projectError || !project) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate('/proyectos')}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
        >
          <HiArrowLeft />
          <span>Volver a Proyectos</span>
        </button>
        <div className="p-8 bg-rose-50 border border-rose-200 rounded-3xl text-center text-rose-700 text-sm font-semibold">
          {projectError || 'El proyecto solicitado no fue encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-5 right-5 z-[99999] p-4 rounded-2xl shadow-2xl border text-xs font-bold animate-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMessage.text}
        </div>
      )}

      {/* Botón Volver y Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <button
            onClick={() => navigate('/proyectos')}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors mb-1"
          >
            <HiArrowLeft className="text-sm" />
            <span>Volver a Proyectos Mineros e Institucionales</span>
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            onClick={() => setIsWordModalOpen(true)}
            title="Descargar Informe de Inventario en documento Word (.docx)"
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all shrink-0 border border-blue-800"
          >
            <HiOutlineArrowDownTray className="text-base text-amber-400" />
            <span>Reporte Word</span>
          </button>

          <button
            onClick={handleOpenAssignModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all shrink-0"
          >
            <HiOutlinePlus className="text-base" />
            <span>Asignar activo</span>
          </button>

          <button
            onClick={() => {
              loadProjectData();
              loadAssignments();
              loadAssetsCatalog();
            }}
            title="Actualizar datos"
            className="flex items-center gap-2 px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs rounded-xl shadow-2xs transition-all"
          >
            <HiOutlineArrowPathRoundedSquare className="text-base text-amber-500" />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {/* Tarjeta Información General del Proyecto */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <HiOutlineMapPin className="text-amber-500 text-sm" />
              <span>Dirección / Ubicación</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{project.address || 'Sin dirección registrada'}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <HiOutlineUser className="text-amber-500 text-sm" />
              <span>Responsable</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{project.responsible || 'Sin responsable asignado'}</p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <HiOutlineCalendar className="text-amber-500 text-sm" />
              <span>Vigencia del Proyecto</span>
            </div>
            <p className="text-sm font-semibold text-slate-800">
              {formatDate(project.startDate)} - {formatDate(project.endDate)}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <HiOutlineCube className="text-amber-500 text-sm" />
              <span>Activos Asignados</span>
            </div>
            <p className="text-sm font-extrabold text-blue-950">
              {activeAssignmentsCount} vigentes <span className="text-xs font-normal text-slate-400">({assignments.length} historial)</span>
            </p>
          </div>
        </div>

        {project.description && (
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2">
            <HiOutlineDocumentText className="text-slate-400 text-base shrink-0 mt-0.5" />
            <p className="text-xs text-slate-600 font-medium leading-relaxed">{project.description}</p>
          </div>
        )}
      </div>

      {/* Tabla Activos Asignados al Proyecto */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xs overflow-hidden space-y-4">
        <div className="p-6 pb-2 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Activos Asignados al Proyecto</h3>
            <p className="text-xs text-slate-500">Historial y estado de los activos vinculados a este proyecto.</p>
          </div>
          <button
            onClick={handleOpenAssignModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition-all"
          >
            <HiOutlinePlus className="text-sm" />
            <span>Asignar activo</span>
          </button>
        </div>

        {isLoadingAssignments ? (
          <div className="py-12">
            <LoadingSpinner label="Cargando activos del proyecto..." />
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs font-medium space-y-3">
            <p>No se han asignado activos fijos a este proyecto.</p>
            <button
              onClick={handleOpenAssignModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 text-blue-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-all"
            >
              <HiOutlinePlus className="text-sm" />
              <span>Asignar activo ahora</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Código</th>
                  <th className="px-6 py-3.5">Activo Fijo</th>
                  <th className="px-6 py-3.5 text-center">Cantidad</th>
                  <th className="px-6 py-3.5 text-center">Asignado El</th>
                  <th className="px-6 py-3.5 text-center">Estado / Liberación</th>
                  <th className="px-6 py-3.5">Observaciones</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {assignments.map((item) => {
                  const isReleased = !!item.releasedAt;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-blue-950">{item.asset?.code || 'S/C'}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800">{item.asset?.name || 'Activo Fijo'}</span>
                          <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-400 font-medium">
                            {item.asset?.category?.name && (
                              <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-semibold">
                                {item.asset.category.name}
                              </span>
                            )}
                            {item.asset?.brand && <span>• {item.asset.brand}</span>}
                            {item.asset?.model && <span>({item.asset.model})</span>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-950 border border-blue-200">
                          {item.quantity} unidades
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600 font-medium">
                        {formatDate(item.assignedAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isReleased ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            Liberado: {formatDate(item.releasedAt)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Vigente en Proyecto
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-normal">
                        {item.observations || 'Sin observaciones'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isReleased && (
                            <button
                              type="button"
                              onClick={() => handleOpenReleaseModal(item)}
                              title="Liberar activo del proyecto"
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 font-bold text-[11px] transition-colors border border-amber-200"
                            >
                              <HiOutlineLockOpen className="text-sm" />
                              <span>Liberar</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setDeleteItem(item)}
                            title="Eliminar asignación"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <HiOutlineTrash className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Asignar Activo al Proyecto */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
                  <HiOutlinePlus className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Asignar Activo al Proyecto</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Seleccione un activo del inventario e indique la cantidad a asignar.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleAssignAssetSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Buscar y Seleccionar Activo Fijo <span className="text-rose-500">*</span>
                </label>
                <div className="relative mb-2">
                  <HiOutlineMagnifyingGlass className="absolute left-3 top-3 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={searchAsset}
                    onChange={(e) => setSearchAsset(e.target.value)}
                    placeholder="Filtrar por código o nombre..."
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
                  />
                </div>

                <select
                  value={selectedAssetId}
                  onChange={(e) => handleSelectAsset(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
                >
                  <option value="">-- Seleccionar Activo Fijo ({filteredAssets.length} disponibles) --</option>
                  {filteredAssets.map((asset) => {
                    const stock = getAssetStockInfo(asset);
                    return (
                      <option
                        key={asset.id}
                        value={asset.id}
                        disabled={stock.isOutOfStock}
                        className={stock.isOutOfStock ? 'text-slate-400 bg-slate-50' : 'text-slate-900'}
                      >
                        [{asset.code}] {asset.name} — Disponibles: {stock.available} de {stock.total}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cantidad a Asignar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedAssetStock ? selectedAssetStock.available : 9999}
                  value={assignQuantity}
                  onChange={(e) => handleAssignQuantityChange(e.target.value)}
                  disabled={!selectedAssetId || (selectedAssetStock?.isOutOfStock ?? false)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500 disabled:bg-slate-100 disabled:text-slate-400 transition-all shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Observaciones de Asignación (Opcional)
                </label>
                <input
                  type="text"
                  value={assignObservations}
                  onChange={(e) => setAssignObservations(e.target.value)}
                  placeholder="Ej: Asignado para operación en mina / frente de trabajo..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
                />
              </div>

              {selectedAsset && selectedAssetStock && (
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold flex items-center justify-between border ${
                    selectedAssetStock.isOutOfStock
                      ? 'bg-rose-50 border-rose-200 text-rose-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedAssetStock.isOutOfStock ? (
                      <HiOutlineExclamationTriangle className="text-base text-rose-500 shrink-0" />
                    ) : (
                      <HiOutlineCheckCircle className="text-base text-emerald-600 shrink-0" />
                    )}
                    <span>
                      <strong>{selectedAsset.name}</strong> ({selectedAsset.code}):{' '}
                      {selectedAssetStock.isOutOfStock
                        ? 'Sin unidades disponibles en almacén'
                        : `Disponibles: ${selectedAssetStock.available} de ${selectedAssetStock.total} unidades totales`}
                    </span>
                  </div>
                </div>
              )}

              {assignValidationWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-800 flex items-center gap-2">
                  <HiOutlineExclamationTriangle className="text-base shrink-0 text-amber-600" />
                  <span>{assignValidationWarning}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    !selectedAssetId ||
                    assignQuantity <= 0 ||
                    (selectedAssetStock?.isOutOfStock ?? true) ||
                    assignQuantity > (selectedAssetStock?.available ?? 0) ||
                    isSubmittingAssign
                  }
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <HiOutlinePlus className="text-base" />
                  <span>{isSubmittingAssign ? 'Asignando...' : 'Asignar Activo'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Liberar Activo del Proyecto (con Cantidad y Motivo) */}
      {releaseItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 bg-amber-50/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-2xl">
                  <HiOutlineLockOpen className="text-xl" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Liberar Activo del Proyecto</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Regresar unidades del activo al stock general disponible.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReleaseItem(null)}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
              >
                <HiXMark className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleConfirmReleaseSubmit} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-slate-800">
                  Activo: {releaseItem.asset?.name} ({releaseItem.asset?.code || 'S/C'})
                </div>
                <div className="text-slate-600">
                  Actualmente asignados en este proyecto: <strong className="text-blue-950">{releaseItem.quantity} unidades</strong>.
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cantidad a Liberar <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={releaseItem.quantity}
                  value={releaseQuantity}
                  onChange={(e) => handleReleaseQuantityChange(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-bold focus:outline-none focus:border-amber-500 transition-all shadow-2xs"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Máximo a liberar: {releaseItem.quantity} unidades.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Motivo / Observaciones de Liberación <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={releaseObservations}
                  onChange={(e) => setReleaseObservations(e.target.value)}
                  placeholder="Ingrese el motivo de devolución (ej: Finalización de fase, mantenimiento, retorno a almacén)..."
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs resize-none"
                />
              </div>

              {releaseValidationWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-semibold text-amber-800 flex items-center gap-2">
                  <HiOutlineExclamationTriangle className="text-base shrink-0 text-amber-600" />
                  <span>{releaseValidationWarning}</span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReleaseItem(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    releaseQuantity <= 0 ||
                    releaseQuantity > releaseItem.quantity ||
                    !releaseObservations.trim() ||
                    isReleasing
                  }
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <HiOutlineLockOpen className="text-base" />
                  <span>{isReleasing ? 'Liberando...' : 'Confirmar Liberación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Confirmación de Eliminación Física */}
      <ConfirmDialog
        isOpen={!!deleteItem}
        onOpenChange={(open) => !open && setDeleteItem(null)}
        title="¿Eliminar Asignación?"
        message={`¿Está seguro de eliminar físicamente el registro de asignación de "${deleteItem?.asset?.name}" (${deleteItem?.quantity} unidades)? ${
          !deleteItem?.releasedAt
            ? 'Las unidades se devolverán automáticamente al stock disponible en el almacén de activos.'
            : ''
        }`}
        confirmText={isDeleting ? 'Eliminando...' : 'Sí, Eliminar Registro'}
        color="danger"
        onConfirm={handleConfirmDelete}
      />

      {/* MODAL 4: Configuración Reporte Word */}
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
                <h3 className="text-base font-bold">Configurar Informe Word (.docx)</h3>
              </div>
              <p className="text-xs text-slate-500">
                Seleccione el formato y la orientación de página para exportar el inventario de activos del proyecto.
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
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                        pageSize === item.id
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
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-0.5 ${
                        orientation === item.id
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
                ℹ️ El documento se generará con margen <strong>Estrecho</strong> e incluirá el logo institucional de COMIBOL y la tabla de activos asignados.
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

export default ProjectShowPage;
