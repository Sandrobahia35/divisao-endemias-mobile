import React from 'react';
import { ReportFilters, FilterOptions } from '../types/reportTypes';

interface FilterBarProps {
    filters: ReportFilters;
    options: FilterOptions;
    onFilterChange: (filters: ReportFilters) => void;
    onClear: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    options,
    onFilterChange,
    onClear
}) => {
    const hasActiveFilters = filters.semanaEpidemiologica || filters.localidade || filters.ano;

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-lg">filter_alt</span>
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Filtros</h3>
                </div>
                {hasActiveFilters && (
                    <button
                        onClick={onClear}
                        className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Limpar
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-3">
                {/* Filtro por Semana */}
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Semana Epidemiológica
                    </label>
                    <select
                        value={filters.semanaEpidemiologica || ''}
                        onChange={(e) => onFilterChange({ ...filters, semanaEpidemiologica: e.target.value || undefined })}
                        className="w-full h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                    >
                        <option value="">Todas as semanas</option>
                        {options.semanas.map(se => (
                            <option key={se} value={se}>{se}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro por Localidade */}
                <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        Localidade
                    </label>
                    <select
                        value={filters.localidade || ''}
                        onChange={(e) => onFilterChange({ ...filters, localidade: e.target.value || undefined })}
                        className="w-full h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                    >
                        <option value="">Todas as localidades</option>
                        {options.localidades.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro por Ano */}
                {options.anos.length > 1 && (
                    <div className="col-span-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                            Ano
                        </label>
                        <select
                            value={filters.ano || ''}
                            onChange={(e) => onFilterChange({ ...filters, ano: e.target.value ? Number(e.target.value) : undefined })}
                            className="w-full h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                        >
                            <option value="">Todos os anos</option>
                            {options.anos.map(ano => (
                                <option key={ano} value={ano}>{ano}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};
