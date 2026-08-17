import React, { useState, useEffect } from 'react';
import type { Project, CreateProjectDTO, ProjectStatus } from '../../interfaces/project.interface';
import {
  HiXMark,
  HiOutlineExclamationTriangle,
  HiOutlineBriefcase,
} from 'react-icons/hi2';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectDTO) => Promise<void>;
  projectItem?: Project | null;
  isLoading?: boolean;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectItem,
  isLoading = false,
}) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [responsible, setResponsible] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('ACTIVE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setError(null);

    if (projectItem) {
      setName(projectItem.name || '');
      setAddress(projectItem.address || '');
      setResponsible(projectItem.responsible || '');
      setStatus(projectItem.status || 'ACTIVE');
      setStartDate(projectItem.startDate ? projectItem.startDate.split('T')[0] : '');
      setEndDate(projectItem.endDate ? projectItem.endDate.split('T')[0] : '');
      setDescription(projectItem.description || '');
    } else {
      setName('');
      setAddress('');
      setResponsible('');
      setStatus('ACTIVE');
      setStartDate('');
      setEndDate('');
      setDescription('');
    }
  }, [projectItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('El nombre del proyecto es obligatorio.');
      return;
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setError('La fecha de inicio no puede ser posterior a la fecha de finalización.');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        address: address.trim() || undefined,
        responsible: responsible.trim() || undefined,
        status,
        startDate: startDate || null,
        endDate: endDate || null,
        description: description.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error al guardar el proyecto.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header del Modal */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 text-amber-600 rounded-2xl">
              <HiOutlineBriefcase className="text-xl" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                {projectItem ? 'Editar Datos del Proyecto' : 'Nuevo Proyecto Minero e Institucional'}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {projectItem
                  ? 'Modifique la información general del proyecto.'
                  : 'Registre la información general para iniciar un nuevo centro de costos o proyecto.'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        {/* Mensaje de Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <HiOutlineExclamationTriangle className="text-base shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Contenido del Formulario */}
        <form id="project-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Nombre del Proyecto <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="EJ: Proyecto Planta Hidrometalúrgica Mesa Verde"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Dirección / Ubicación
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="EJ: Av. 6 de Octubre #1234, Oruro"
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Responsable del Proyecto
              </label>
              <input
                type="text"
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                placeholder="EJ: Ing. Juan Pérez Morales"
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Estado Operativo
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
              >
                <option value="ACTIVE">Activo</option>
                <option value="FINISHED">Finalizado</option>
                <option value="SUSPENDED">Suspendido</option>
                <option value="CANCELLED">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Fecha de Finalización
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Descripción / Objetivos del Proyecto
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa brevemente el alcance u observaciones del proyecto..."
              className="w-full px-3.5 py-2.5 bg-slate-50/80 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-amber-500 focus:bg-white transition-all resize-none shadow-2xs"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="project-form"
            disabled={isLoading}
            className="flex items-center justify-center px-5 py-2.5 text-xs font-bold text-blue-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-xs transition-all disabled:opacity-50"
          >
            <span>{isLoading ? 'Guardando...' : projectItem ? 'Guardar Cambios' : 'Registrar Proyecto'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
