import React, { useState, useMemo } from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

interface Column {
  key: string;
  label: string;
}

interface DataTableProps<T> {
  columns: Column[];
  items: T[];
  renderCell: (item: T, columnKey: React.Key) => React.ReactNode;
  loading?: boolean;
  rowsPerPage?: number;
  emptyContent?: React.ReactNode;
}

export function DataTable<T extends { id: string | number }>({
  columns,
  items,
  renderCell,
  loading = false,
  rowsPerPage = 10,
  emptyContent = "No se encontraron registros"
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);

  const pages = Math.ceil(items.length / rowsPerPage);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return items.slice(start, end);
  }, [page, items, rowsPerPage]);

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full overflow-x-auto border border-slate-200/80 bg-white rounded-xl shadow-sm">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200/80">
              {columns.map((column) => (
                <th 
                  key={column.key} 
                  className="px-4 py-3 text-slate-500 text-xs font-bold uppercase tracking-wider select-none"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-semibold text-slate-500">Cargando...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-slate-400 font-semibold text-sm">
                  {emptyContent}
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors"
                >
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3.5 align-middle">
                      {renderCell(item, column.key)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border border-slate-200/80 bg-white rounded-xl shadow-sm">
          <span className="text-xs font-semibold text-slate-500">
            Página {page} de {pages} ({items.length} elementos)
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shrink-0"
            >
              <HiOutlineChevronLeft className="text-base" />
            </button>
            
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  page === p 
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/10' 
                    : 'text-slate-600 hover:bg-slate-50 border border-transparent'
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors shrink-0"
            >
              <HiOutlineChevronRight className="text-base" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
