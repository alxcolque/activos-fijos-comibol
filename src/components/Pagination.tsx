import React from 'react';
import { HiOutlineChevronLeft, HiOutlineChevronRight } from 'react-icons/hi2';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems || totalPages * itemsPerPage);

  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 bg-white border border-slate-200/80 rounded-2xl shadow-2xs text-xs font-semibold text-slate-600">
      <div>
        {totalItems > 0 ? (
          <>
            Mostrando <span className="font-bold text-slate-900">{startItem}</span> a{' '}
            <span className="font-bold text-slate-900">{endItem}</span> de{' '}
            <span className="font-bold text-slate-900">{totalItems}</span> registros
          </>
        ) : (
          <>
            Página <span className="font-bold text-slate-900">{currentPage}</span> de{' '}
            <span className="font-bold text-slate-900">{totalPages}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all font-bold"
        >
          <HiOutlineChevronLeft className="text-sm" />
          <span>Anterior</span>
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-xl font-bold transition-all ${
                currentPage === p
                  ? 'bg-amber-500 text-blue-950 shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 border border-transparent'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-xl text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all font-bold"
        >
          <span>Siguiente</span>
          <HiOutlineChevronRight className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
