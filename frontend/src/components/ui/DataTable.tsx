import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Filter } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, string>) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No data available',
  searchable = true,
  searchPlaceholder = 'Search...',
  sortable = true,
  filterable = false,
  pagination = true,
  pageSize = 10,
  onRowClick,
  onSort,
  onFilter,
  className
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter data based on search term and filters
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = getNestedValue(row, column.key as string);
          return String(value).toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row => {
          const cellValue = getNestedValue(row, key);
          return String(cellValue).toLowerCase().includes(value.toLowerCase());
        });
      }
    });

    return filtered;
  }, [data, searchTerm, filters, columns]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortKey);
      const bValue = getNestedValue(b, sortKey);

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (key: string) => {
    if (!sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  const handleFilter = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter?.(newFilters);
  };

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  const renderCell = (column: Column<T>, row: T) => {
    const value = getNestedValue(row, column.key as string);
    
    if (column.render) {
      return column.render(value, row);
    }
    
    return value;
  };

  if (loading) {
    return (
      <div className="bg-niyama-white border-2 border-niyama-black shadow-brutal">
        <div className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-niyama-black border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-niyama-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-niyama-white border-2 border-niyama-black shadow-brutal', className)}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="p-4 border-b-2 border-niyama-black bg-niyama-gray-50">
          <div className="flex flex-col sm:flex-row gap-4">
            {searchable && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-niyama-gray-500" />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-niyama-black bg-niyama-white focus:outline-none focus:ring-2 focus:ring-niyama-accent"
                />
              </div>
            )}
            
            {filterable && (
              <div className="flex gap-2">
                {columns
                  .filter(col => col.filterable)
                  .map(column => (
                    <div key={String(column.key)} className="relative">
                      <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-niyama-gray-500" />
                      <input
                        type="text"
                        placeholder={`Filter ${column.title}`}
                        value={filters[String(column.key)] || ''}
                        onChange={(e) => handleFilter(String(column.key), e.target.value)}
                        className="pl-8 pr-4 py-2 border border-niyama-black bg-niyama-white focus:outline-none focus:ring-2 focus:ring-niyama-accent w-40"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-niyama-black bg-niyama-gray-100">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'px-4 py-3 text-left font-bold text-niyama-black',
                    column.sortable && 'cursor-pointer hover:bg-niyama-gray-200 select-none',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sortable && sortKey === String(column.key) && (
                      sortDirection === 'asc' ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-niyama-gray-600">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className={cn(
                    'border-b border-niyama-gray-300 hover:bg-niyama-gray-50 transition-colors',
                    onRowClick && 'cursor-pointer'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'px-4 py-3',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {renderCell(column, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="p-4 border-t-2 border-niyama-black bg-niyama-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-niyama-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'px-3 py-1 text-sm border border-niyama-black transition-colors',
                        currentPage === page
                          ? 'bg-niyama-accent text-niyama-black'
                          : 'bg-niyama-white hover:bg-niyama-gray-100'
                      )}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="btn-secondary btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
