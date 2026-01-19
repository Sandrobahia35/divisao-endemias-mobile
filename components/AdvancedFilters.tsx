import React, { useState, useEffect } from 'react';
import { ReportService } from '../services/reportService';
import { ReportFiltersExtended } from '../types/reportTypes';

interface AdvancedFiltersProps {
    onApplyFilters: (filters: ReportFiltersExtended) => void;
    initialFilters?: ReportFiltersExtended;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ onApplyFilters, initialFilters }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState<ReportFiltersExtended>(initialFilters || {});
    const [filterOptions, setFilterOptions] = useState<{
        semanas: string[];
        localidades: string[];
        ciclos: number[];
        anos: number[];
    }>({ semanas: [], localidades: [], ciclos: [], anos: [] });

    useEffect(() => {
        const options = ReportService.getFilterOptions();
        setFilterOptions(options);
    }, []);

    const handleToggleLocalidade = (loc: string) => {
        const current = filters.localidades || [];
        const updated = current.includes(loc)
            ? current.filter(l => l !== loc)
            : [...current, loc];
        setFilters({ ...filters, localidades: updated });
    };

    const handleToggleSemana = (semana: string) => {
        const current = filters.semanasEpidemiologicas || [];
        const updated = current.includes(semana)
            ? current.filter(s => s !== semana)
            : [...current, semana];
        setFilters({ ...filters, semanasEpidemiologicas: updated });
    };

    const handleToggleCiclo = (ciclo: number) => {
        const current = filters.ciclos || [];
        const updated = current.includes(ciclo)
            ? current.filter(c => c !== ciclo)
            : [...current, ciclo];
        setFilters({ ...filters, ciclos: updated });
    };

    const handleClearFilters = () => {
        setFilters({});
    };

    const handleApply = () => {
        onApplyFilters(filters);
        setIsOpen(false);
    };

    const activeFiltersCount =
        (filters.localidades?.length || 0) +
        (filters.semanasEpidemiologicas?.length || 0) +
        (filters.ciclos?.length || 0);

    return (
        <div className="relative">
            {/* Botão de Filtros */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${activeFiltersCount > 0
                        ? 'bg-primary/10 border-primary text-primary'
                        : 'bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
            >
                <span className="material-symbols-outlined text-lg">filter_list</span>
                <span className="font-semibold text-sm">Filtros</span>
                {activeFiltersCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                        {activeFiltersCount}
                    </span>
                )}
            </button>

            {/* Painel de Filtros */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 md:left-auto md:w-96 mt-2 z-50 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <h3 className="font-bold text-slate-800 dark:text-white">Filtros Avançados</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-500">close</span>
                        </button>
                    </div>

                    <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* Localidades */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Localidades
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.localidades.map(loc => (
                                    <button
                                        key={loc}
                                        onClick={() => handleToggleLocalidade(loc)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filters.localidades?.includes(loc)
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {loc}
                                    </button>
                                ))}
                                {filterOptions.localidades.length === 0 && (
                                    <p className="text-xs text-slate-400">Nenhuma localidade disponível</p>
                                )}
                            </div>
                        </div>

                        {/* Semanas */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Semanas Epidemiológicas
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.semanas.map(semana => (
                                    <button
                                        key={semana}
                                        onClick={() => handleToggleSemana(semana)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filters.semanasEpidemiologicas?.includes(semana)
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        {semana}
                                    </button>
                                ))}
                                {filterOptions.semanas.length === 0 && (
                                    <p className="text-xs text-slate-400">Nenhuma semana disponível</p>
                                )}
                            </div>
                        </div>

                        {/* Ciclos */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                Ciclos de Trabalho
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {filterOptions.ciclos.map(ciclo => (
                                    <button
                                        key={ciclo}
                                        onClick={() => handleToggleCiclo(ciclo)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${filters.ciclos?.includes(ciclo)
                                                ? 'bg-green-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        Ciclo {ciclo}
                                    </button>
                                ))}
                                {filterOptions.ciclos.length === 0 && (
                                    <p className="text-xs text-slate-400">Nenhum ciclo disponível</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex gap-3">
                        <button
                            onClick={handleClearFilters}
                            className="flex-1 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Limpar
                        </button>
                        <button
                            onClick={handleApply}
                            className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">check</span>
                            Aplicar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
