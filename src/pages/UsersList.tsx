import React, { useEffect, useState } from 'react';
import { useUserStore } from '../store/userStore';
import type { UserItem, CreateUserDTO, UpdateUserDTO } from '../interfaces/user.interface';
import { UserFormModal } from '../components/users/UserFormModal';
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
  HiOutlineUserGroup,
} from 'react-icons/hi2';

export const UsersList: React.FC = () => {
  const {
    users,
    totalUsers,
    page,
    totalPages,
    search,
    isLoading,
    error,
    setSearch,
    setPage,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUserStore();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [page, search, fetchUsers]);

  const showNotification = (type: 'success' | 'danger', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenCreateModal = () => {
    setSelectedUser(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: UserItem) => {
    setSelectedUser(user);
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (data: CreateUserDTO | UpdateUserDTO) => {
    try {
      if (selectedUser) {
        await updateUser(selectedUser.id, data);
        showNotification('success', 'Usuario actualizado exitosamente.');
      } else {
        await createUser(data as CreateUserDTO);
        showNotification('success', 'Nuevo usuario registrado exitosamente.');
      }
    } catch (err: any) {
      showNotification('danger', err.message || 'Error al procesar la solicitud.');
      throw err;
    }
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      await deleteUser(userToDelete.id);
      showNotification('success', `El usuario "${userToDelete.fullName}" ha sido eliminado.`);
      setUserToDelete(null);
    } catch (err: any) {
      showNotification('danger', err.message || 'No se pudo eliminar el usuario.');
      setUserToDelete(null);
    }
  };

  const renderRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Administrador
          </span>
        );
      case 'operador':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Operador
          </span>
        );
      case 'guest':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Invitado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            Administrador
          </span>
        );
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

      {/* Encabezado y Acciones */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Administración de Usuarios</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestión de accesos y cuentas de usuarios del sistema institucional COMIBOL.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-blue-950 font-bold rounded-2xl text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
        >
          <HiPlus className="text-base" />
          <span>Nuevo Usuario</span>
        </button>
      </div>

      {/* Barra de Búsqueda */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Buscar usuario por nombre o correo electrónico..."
        />
      </div>

      {/* Contenido Principal / Tabla */}
      {isLoading && users.length === 0 ? (
        <div className="py-20">
          <LoadingSpinner label="Cargando catálogo de usuarios..." />
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-center text-xs font-semibold text-rose-700">
          {error}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<HiOutlineUserGroup className="text-4xl text-slate-400" />}
          title="No se encontraron usuarios"
          description={search ? `No hay resultados para "${search}".` : 'Aún no hay usuarios registrados en el sistema.'}
          actionText={search ? 'Limpiar Búsqueda' : 'Crear Primer Usuario'}
          onAction={search ? () => setSearch('') : handleOpenCreateModal}
        />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-6 py-4">Usuario</th>
                  <th className="px-6 py-4">Correo Electrónico</th>
                  <th className="px-6 py-4 text-center">Rol</th>
                  <th className="px-6 py-4 text-center">Estado</th>
                  <th className="px-6 py-4 text-center">Último Acceso</th>
                  <th className="px-6 py-4 text-center">Fecha Registro</th>
                  <th className="px-6 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center text-xs shrink-0">
                          {u.fullName ? u.fullName.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <span className="font-bold text-slate-800">{u.fullName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-600">{u.email}</td>
                    <td className="px-6 py-4 text-center">{renderRoleBadge(u.role)}</td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 font-medium">
                      {u.lastLogin ? formatDate(u.lastLogin) : 'Nunca'}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-500 font-medium">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Editar usuario"
                        >
                          <HiPencilSquare className="text-base" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setUserToDelete(u)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Eliminar usuario"
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

          {/* Paginación */}
          <div className="p-4 border-t border-slate-100">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              totalItems={totalUsers}
            />
          </div>
        </div>
      )}

      {/* Modal Formulario Usuario */}
      <UserFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        user={selectedUser}
        isLoading={isLoading}
      />

      {/* Diálogo Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={!!userToDelete}
        onOpenChange={(open) => { if (!open) setUserToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        message={`¿Está seguro de eliminar la cuenta del usuario "${userToDelete?.fullName}" (${userToDelete?.email})? Esta acción no se puede deshacer.`}
        confirmText="Sí, eliminar usuario"
        color="danger"
      />
    </div>
  );
};

export default UsersList;
