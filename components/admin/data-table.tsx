"use client";
import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Search, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}

type SortDirection = "asc" | "desc" | null;

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = true,
  searchPlaceholder = "Search...",
  pageSize = 10,
  onRowClick,
  emptyMessage = "No data found",
  loading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);
  const [page, setPage] = useState(1);

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val ?? "").toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [data, search]);

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDir) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      const cmp = String(aVal ?? "") < String(bVal ?? "") ? -1 : 1;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortDir(null); setSortKey(null); }
      else setSortDir("asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const getNestedValue = (row: T, key: string): unknown => {
    return key.split(".").reduce((obj: unknown, k) => {
      if (obj && typeof obj === "object") return (obj as Record<string, unknown>)[k];
      return undefined;
    }, row);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
      {searchable && (
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-gray-900 dark:text-white placeholder:text-gray-400"
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap ${col.sortable ? "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200" : ""} ${col.className || ""}`}
                  onClick={() => col.sortable && handleSort(String(col.key))}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <span className="inline-flex flex-col">
                        {sortKey === String(col.key) ? (
                          sortDir === "asc" ? <ChevronUp size={14} className="text-orange-500" /> : <ChevronDown size={14} className="text-orange-500" />
                        ) : (
                          <ChevronsUpDown size={14} className="text-gray-300 dark:text-gray-600" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50">
                  {columns.map((col) => (
                    <td key={String(col.key)} className="px-4 py-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400 dark:text-gray-500 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-gray-50 dark:border-gray-700/50 transition-colors ${onRowClick ? "cursor-pointer hover:bg-orange-50/50 dark:hover:bg-orange-900/10" : "hover:bg-gray-50/50 dark:hover:bg-gray-700/30"}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((col) => {
                    const value = getNestedValue(row, String(col.key));
                    return (
                      <td key={String(col.key)} className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${col.className || ""}`}>
                        {col.render ? col.render(value, row) : String(value ?? "-")}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((page - 1) * pageSize) + 1}–{Math.min(page * pageSize, sortedData.length)} of {sortedData.length}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pageNum ? "bg-orange-500 text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
