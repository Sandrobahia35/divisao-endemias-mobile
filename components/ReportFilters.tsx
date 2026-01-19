import React, { useState, useEffect } from 'react';
import { ReportService } from '../services/reportService';
import { ReportFiltersExtended } from '../types/reportTypes';

interface ReportFiltersProps {
    filters: ReportFiltersExtended;
    onFiltersChange: (filters: ReportFiltersExtended) => void;
}

import { LocalidadeSelect, SemanaSelect } from './ui/FilterSelects';

interface ReportFiltersProps {
    filters: ReportFiltersExtended;
    onFiltersChange: (filters: ReportFiltersExtended) => void;
}

export const ReportFilters: React.FC<ReportFiltersProps> = ({ filters, onFiltersChange }) => {
    const [filterOptions, setFilterOptions] = useState<{
        semanas: string[];
        localidades: string[];
        ciclos: number[];
    }>({ semanas: [], localidades: [], ciclos: [] });

    useEffect(() => {
        const fetchcustomOptions = async () => {
            try {
                const options = await ReportService.getFilterOptions();
                setFilterOptions(options);
            } catch (error) {
                console.error("Failed to load filter options", error);
            }
        };
        fetchcustomOptions();
    }, []);

    const handleLocalidadeChange = (updated: string[]) => {
        onFiltersChange({ ...filters, localidades: updated.length > 0 ? updated : undefined });
    };

    const handleSemanaChange = (updated: string[]) => {
        onFiltersChange({ ...filters, semanasEpidemiologicas: updated.length > 0 ? updated : undefined });
    };

    const handleCicloChange = (ciclo: number) => {
        const current = filters.ciclos || [];
        const updated = current.includes(ciclo)
            ? current.filter(c => c !== ciclo)
            : [...current, ciclo];
        onFiltersChange({ ...filters, ciclos: updated.length > 0 ? updated : undefined });
    };

    const handleClearAll = () => {
        onFiltersChange({});
    };

    const hasActiveFilters =
        (filters.localidades?.length || 0) > 0 ||
        (filters.semanasEpidemiologicas?.length || 0) > 0 ||
        (filters.ciclos?.length || 0) > 0;

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">filter_list</span>
                    Filtros de Análise
                </h3>
                {hasActiveFilters && (
                    <button
                        onClick={handleClearAll}
                        className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Limpar
                    </button>
                )}
            </div>

            <div className="p-4 space-y-6">
                {/* Localidades */}
                <div>
                    <LocalidadeSelect
                        options={filterOptions.localidades}
                        selected={filters.localidades || []}
                        onChange={handleLocalidadeChange}
                    />
                </div>

                {/* Semanas Epidemiológicas */}
                <div>
                    <SemanaSelect
                        options={filterOptions.semanas}
                        selected={filters.semanasEpidemiologicas || []}
                        onChange={handleSemanaChange}
                    />
                </div>

                {/* Ciclos */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        🔄 Ciclos de Trabalho
                    </label>
                    {filterOptions.ciclos.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {filterOptions.ciclos.map(ciclo => {
                                const isSelected = filters.ciclos?.includes(ciclo);
                                return (
                                    <button
                                        key={ciclo}
                                        onClick={() => handleCicloChange(ciclo)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isSelected
                                            ? 'bg-green-500 text-white border-green-500'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-green-400'
                                            }`}
                                    >
                                        Ciclo {ciclo}
                                        {isSelected && (
                                            <span className="ml-1">✓</span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">Nenhum ciclo cadastrado</p>
                    )}
                </div>

                {/* Resumo dos filtros */}
                {hasActiveFilters && (
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                        <p className="text-xs text-slate-500">
                            <strong>Filtros ativos:</strong>{' '}
                            {filters.localidades?.length ? `${filters.localidades.length} localidade(s)` : ''}
                            {filters.localidades?.length && (filters.semanasEpidemiologicas?.length || filters.ciclos?.length) ? ' • ' : ''}
                            {filters.semanasEpidemiologicas?.length ? `${filters.semanasEpidemiologicas.length} semana(s)` : ''}
                            {filters.semanasEpidemiologicas?.length && filters.ciclos?.length ? ' • ' : ''}
                            {filters.ciclos?.length ? `${filters.ciclos.length} ciclo(s)` : ''}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
