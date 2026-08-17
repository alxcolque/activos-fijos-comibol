import React, { useEffect, useState, useMemo } from 'react';
import { useCategoryStore } from '../store/categoryStore';
import type { AssetCategory, CreateCategoryDTO } from '../interfaces/category.interface';
import { CategoryFormModal } from '../components/categories/CategoryFormModal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { SearchBar } from '../components/SearchBar';
import { HiPlus, HiPencilSquare, HiTrash, HiOutlineTag } from 'react-icons/hi2';

export const CategoriesPage: React.FC = () => {
  const { categories, isLoading, error, fetchCategories, createCategory, updateCategory, deleteCategory } =
    useCategoryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<AssetCategory | null>(null);

  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const term = searchTerm.toLowerCase();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(term) ||
        (cat.description && cat.description.toLowerCase().includes(term)),
    );
  }, [categories, searchTerm]);

  const handleOpenCreate = () => {
    setSelectedCategory(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category: AssetCategory) => {
    setSelectedCategory(category);
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateCategoryDTO) => {
    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory.id, data);
        showNotification('success', 'Categoría actualizada exitosamente.');
      } else {
        await createCategory(data);
        showNotification('success', 'Categoría registrada exitosamente.');
      }
    } catch (err: any) {
      showNotification('danger', err.message || 'Error al guardar la categoría.');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await deleteCategory(categoryToDelete.id);
      showNotification('success', 'Categoría eliminada correctamente.');
      setCategoryToDelete(null);
    } catch (err: any) {
      showNotification('danger', err.message || 'No se pudo eliminar la categoría.');
      setCategoryToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
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

      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Categorías de Activos Fijos</h1>
          <p className="text-xs text-slate-500 mt-1">
            Administración del catálogo patrimonial y familias de activos COMIBOL
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold text-xs rounded-xl shadow-sm transition-all shrink-0"
        >
          <HiPlus className="text-base" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="w-full sm:w-96">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Buscar por nombre o descripción..."
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total: <span className="font-bold text-slate-800">{filteredCategories.length}</span> categorías
        </div>
      </div>

      {/* Contenido Principal / Estado de Carga */}
      {isLoading && categories.length === 0 ? (
        <div className="py-16">
          <LoadingSpinner label="Cargando catálogo de categorías..." />
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-600 text-center">
          {error}
        </div>
      ) : filteredCategories.length === 0 ? (
        <EmptyState
          icon={<HiOutlineTag className="text-4xl text-slate-400" />}
          title="No se encontraron categorías"
          description={
            searchTerm
              ? 'No hay registros que coincidan con la búsqueda actual.'
              : 'Empieza registrando la primera categoría para organizar los activos.'
          }
          actionText={searchTerm ? 'Limpiar búsqueda' : 'Crear Categoría'}
          onAction={searchTerm ? () => setSearchTerm('') : handleOpenCreate}
        />
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3.5 w-16 text-center">N°</th>
                  <th className="px-6 py-3.5">Nombre de Categoría</th>
                  <th className="px-6 py-3.5 text-center">Vida Útil (Años)</th>
                  <th className="px-6 py-3.5">Descripción</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredCategories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-800">{cat.name}</td>
                    <td className="px-6 py-4 text-center font-bold text-slate-700">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/60">
                        {cat.usefulLife ?? 5} años
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-md truncate">{cat.description || '—'}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(cat)}
                          title="Editar categoría"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <HiPencilSquare className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCategoryToDelete(cat)}
                          title="Eliminar categoría"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
        </div>
      )}

      {/* Modal Formulario */}
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        category={selectedCategory}
        isLoading={isLoading}
      />

      {/* Modal Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onOpenChange={(open) => !open && setCategoryToDelete(null)}
        title="¿Eliminar categoría?"
        message={`¿Está seguro de eliminar la categoría "${categoryToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        color="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default CategoriesPage;
