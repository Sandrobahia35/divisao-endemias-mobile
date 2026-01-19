import React, { useState, useEffect, useMemo } from 'react';
import { ReportService } from '../services/reportService';
import { Report } from '../types/reportTypes';
import { LocalidadeSelect, SemanaSelect } from './ui/FilterSelects';
import { LOCALIDADES } from '../constants';

interface AnalyticsDashboardProps {
    reports: Report[];
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ reports: allReports }) => {
    const [filterOptions, setFilterOptions] = useState<{
        semanas: string[];
        localidades: string[];
    }>({ semanas: [], localidades: [] });

    // Estados dos filtros
    const [selectedSemanas, setSelectedSemanas] = useState<string[]>([]);
    const [selectedLocalidades, setSelectedLocalidades] = useState<string[]>([]);

    useEffect(() => {
        // Gera semanas de 01 a 52
        const semanas = Array.from({ length: 52 }, (_, i) => {
            const num = (i + 1).toString().padStart(2, '0');
            return `SE ${num}`;
        });

        setFilterOptions({
            semanas,
            localidades: LOCALIDADES
        });
    }, []);

    // Relatórios filtrados
    const filteredReports = useMemo(() => {
        let result = allReports;

        if (selectedSemanas.length > 0) {
            result = result.filter(r => selectedSemanas.includes(r.semanaEpidemiologica));
        }

        if (selectedLocalidades.length > 0) {
            result = result.filter(r => selectedLocalidades.includes(r.localidade));
        }

        return result;
    }, [allReports, selectedSemanas, selectedLocalidades]);

    // Resumo por Semana
    const dataByWeek = useMemo(() => {
        const grouped: Record<string, { total: number; concluidos: number }> = {};

        filteredReports.forEach(r => {
            if (!grouped[r.semanaEpidemiologica]) {
                grouped[r.semanaEpidemiologica] = { total: 0, concluidos: 0 };
            }
            grouped[r.semanaEpidemiologica].total += 1;
            if (r.concluido) grouped[r.semanaEpidemiologica].concluidos += 1;
        });

        return Object.entries(grouped)
            .map(([semana, data]) => ({ semana, ...data }))
            .sort((a, b) => {
                const numA = parseInt(a.semana.replace('SE ', ''));
                const numB = parseInt(b.semana.replace('SE ', ''));
                return numA - numB;
            });
    }, [filteredReports]);

    // Resumo por Ciclo
    const dataByCycle = useMemo(() => {
        const grouped: Record<number, { total: number; concluidos: number }> = {};

        filteredReports.forEach(r => {
            if (!grouped[r.ciclo]) {
                grouped[r.ciclo] = { total: 0, concluidos: 0 };
            }
            grouped[r.ciclo].total += 1;
            if (r.concluido) grouped[r.ciclo].concluidos += 1;
        });

        return Object.entries(grouped)
            .map(([ciclo, data]) => ({ ciclo: Number(ciclo), ...data }))
            .sort((a, b) => a.ciclo - b.ciclo);
    }, [filteredReports]);

    const handleClearFilters = () => {
        setSelectedSemanas([]);
        setSelectedLocalidades([]);
    };

    if (allReports.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">analytics</span>
                <h3 className="text-lg font-bold text-slate-500 mb-2">Sem dados para análise</h3>
                <p className="text-sm text-slate-400">Cadastre relatórios para visualizar as análises.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filtros em Cards */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">filter_alt</span>
                        Filtros de Dados
                    </h3>
                    {(selectedSemanas.length > 0 || selectedLocalidades.length > 0) && (
                        <button
                            onClick={handleClearFilters}
                            className="text-xs font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-md"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Limpar Filtros
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <LocalidadeSelect
                        options={filterOptions.localidades}
                        selected={selectedLocalidades}
                        onChange={setSelectedLocalidades}
                    />
                    <SemanaSelect
                        options={filterOptions.semanas}
                        selected={selectedSemanas}
                        onChange={setSelectedSemanas}
                    />
                </div>
            </div>

            {/* Informações Gerais - Tabelas de Resumo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resumo por Semana */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                    <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500">calendar_month</span>
                            Resumo por Semana
                        </h4>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/30">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Semana</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Concluídos</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {dataByWeek.length > 0 ? (
                                    dataByWeek.map(item => (
                                        <tr key={item.semana} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">{item.semana}</td>
                                            <td className="px-5 py-3 text-center font-bold text-slate-600 dark:text-slate-300">{item.total}</td>
                                            <td className="px-5 py-3 text-center text-slate-500">{item.concluidos}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.total > 0 && item.concluidos === item.total
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {item.total > 0 ? Math.round((item.concluidos / item.total) * 100) : 0}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-8 text-center text-slate-400 italic">
                                            Nenhum dado para exibir
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Resumo por Ciclo */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
                    <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-500">sync</span>
                            Resumo por Ciclo
                        </h4>
                    </div>
                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-800/30">
                                <tr>
                                    <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase">Ciclo</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Total</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">Concluídos</th>
                                    <th className="text-center px-5 py-3 text-xs font-bold text-slate-500 uppercase">%</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {dataByCycle.length > 0 ? (
                                    dataByCycle.map(item => (
                                        <tr key={item.ciclo} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-slate-700 dark:text-slate-200">Ciclo {item.ciclo}</td>
                                            <td className="px-5 py-3 text-center font-bold text-slate-600 dark:text-slate-300">{item.total}</td>
                                            <td className="px-5 py-3 text-center text-slate-500">{item.concluidos}</td>
                                            <td className="px-5 py-3 text-center">
                                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${item.total > 0 && item.concluidos === item.total
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-600'
                                                    }`}>
                                                    {item.total > 0 ? Math.round((item.concluidos / item.total) * 100) : 0}%
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-5 py-8 text-center text-slate-400 italic">
                                            Nenhum dado para exibir
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
