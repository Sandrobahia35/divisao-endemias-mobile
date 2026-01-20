import React, { useState, useMemo } from 'react';
import { GroupedAnalyticsData } from '../types/reportTypes';

type GroupBy = 'localidade' | 'semana' | 'ciclo';
type SortField = 'label' | 'imoveis' | 'fechados' | 'recuperados' | 'informados' | 'pendencias' | 'cargaLarvicida';
type SortDirection = 'asc' | 'desc';

interface AnalyticsTableProps {
    getGroupedData: (groupBy: GroupBy) => GroupedAnalyticsData[];
}

/**
 * Tabela analítica dinâmica com agrupamento e ordenação
 */
export const AnalyticsTable: React.FC<AnalyticsTableProps> = ({ getGroupedData }) => {
    const [groupBy, setGroupBy] = useState<GroupBy>('localidade');
    const [sortField, setSortField] = useState<SortField>('label');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const data = useMemo(() => {
        const grouped = getGroupedData(groupBy);

        return [...grouped].sort((a, b) => {
            let comparison = 0;
            if (sortField === 'label') {
                comparison = a.label.localeCompare(b.label);
            } else {
                comparison = (a[sortField] as number) - (b[sortField] as number);
            }
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [getGroupedData, groupBy, sortField, sortDirection]);

    const totals = useMemo(() => {
        const sums = data.reduce((acc, row) => ({
            imoveis: acc.imoveis + row.imoveis,
            fechados: acc.fechados + row.fechados,
            recuperados: acc.recuperados + row.recuperados,
            informados: acc.informados + row.informados,
            cargaLarvicida: acc.cargaLarvicida + row.cargaLarvicida
        }), { imoveis: 0, fechados: 0, recuperados: 0, informados: 0, cargaLarvicida: 0 });

        // Calcular pendência total com a fórmula
        const pendenciasTotal = sums.informados > 0
            ? Math.round(((sums.fechados - sums.recuperados) * 100 / sums.informados) * 100) / 100
            : 0;

        return { ...sums, pendencias: pendenciasTotal };
    }, [data]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <span className="material-symbols-outlined text-sm opacity-30">unfold_more</span>;
        return (
            <span className="material-symbols-outlined text-sm text-primary">
                {sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward'}
            </span>
        );
    };

    const groupByOptions: { value: GroupBy; label: string; icon: string }[] = [
        { value: 'localidade', label: 'Localidade', icon: 'location_on' },
        { value: 'semana', label: 'Semana', icon: 'calendar_month' },
        { value: 'ciclo', label: 'Ciclo', icon: 'sync' }
    ];

    const columns: { field: SortField; label: string; color: string }[] = [
        { field: 'imoveis', label: 'Imóveis', color: 'blue' },
        { field: 'fechados', label: 'Fechados', color: 'slate' },
        { field: 'recuperados', label: 'Recuperados', color: 'emerald' },
        { field: 'informados', label: 'Informados', color: 'cyan' },
        { field: 'pendencias', label: '% Pendência', color: 'amber' },
        { field: 'cargaLarvicida', label: 'Carga Larvicida', color: 'violet' }
    ];

    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">table_chart</span>
                    <p className="text-slate-400 text-sm">Selecione filtros para visualizar a tabela analítica</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">table_chart</span>
                        Tabela Analítica
                    </h4>

                    {/* Group By Toggle */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-semibold">Agrupar por:</span>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            {groupByOptions.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setGroupBy(option.value)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${groupBy === option.value
                                        ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    <span className="material-symbols-outlined text-sm">{option.icon}</span>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800/30">
                        <tr>
                            <th
                                onClick={() => handleSort('label')}
                                className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div className="flex items-center gap-1">
                                    {groupBy === 'localidade' ? 'Localidade' : groupBy === 'semana' ? 'Semana' : 'Ciclo'}
                                    <SortIcon field="label" />
                                </div>
                            </th>
                            {columns.map(col => (
                                <th
                                    key={col.field}
                                    onClick={() => handleSort(col.field)}
                                    className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        {col.label}
                                        <SortIcon field={col.field} />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.map(row => (
                            <tr key={row.key} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">
                                    {row.label}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-blue-600 dark:text-blue-400">
                                    {row.imoveis.toLocaleString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-slate-600 dark:text-slate-400">
                                    {row.fechados.toLocaleString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                                    {row.recuperados.toLocaleString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-cyan-600 dark:text-cyan-400">
                                    {row.informados.toLocaleString('pt-BR')}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-amber-600 dark:text-amber-400">
                                    {row.pendencias.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-violet-600 dark:text-violet-400">
                                    {row.cargaLarvicida.toLocaleString('pt-BR')}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {/* Footer Totals */}
                    <tfoot className="bg-slate-100 dark:bg-slate-800/50 border-t-2 border-slate-200 dark:border-slate-700">
                        <tr className="font-bold">
                            <td className="px-5 py-3 text-slate-700 dark:text-white">
                                TOTAL ({data.length})
                            </td>
                            <td className="px-4 py-3 text-center text-blue-700 dark:text-blue-300">
                                {totals.imoveis.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                                {totals.fechados.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-center text-emerald-700 dark:text-emerald-300">
                                {totals.recuperados.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-center text-cyan-700 dark:text-cyan-300">
                                {totals.informados.toLocaleString('pt-BR')}
                            </td>
                            <td className="px-4 py-3 text-center text-amber-700 dark:text-amber-300">
                                {totals.pendencias.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                            </td>
                            <td className="px-4 py-3 text-center text-violet-700 dark:text-violet-300">
                                {totals.cargaLarvicida.toLocaleString('pt-BR')}
                            </td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    );
};
