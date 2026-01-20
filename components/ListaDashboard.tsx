import React, { useState, useEffect, useMemo } from 'react';
import { Report, ReportFiltersExtended } from '../types/reportTypes';
import { useDataConsolidation } from '../hooks/useDataConsolidation';
import { EpidemiologicalWeekRuler } from './EpidemiologicalWeekRuler';
import { ConsolidatedSummaryCards, DepositTypeCards } from './ConsolidatedSummaryCards';
import { WeekEvolutionChart } from './WeekEvolutionChart';
import { AnalyticsTable } from './AnalyticsTable';
import { LocalityRanking } from './LocalityRanking';
import { LocalityAccordionList } from './LocalityAccordionList';
import { LocalidadeSelect } from './ui/FilterSelects';
import { LOCALIDADES } from '../constants';

interface ListaDashboardProps {
    reports: Report[];
    filters: ReportFiltersExtended;
    onFiltersChange: (filters: ReportFiltersExtended) => void;
    onViewReport: (id: string) => void;
    onEditReport?: (id: string) => void;
    onDeleteReport: (id: string) => void;
}

/**
 * Dashboard principal da aba Lista com filtros, régua de semanas,
 * consolidação de dados, gráficos e tabelas
 */
export const ListaDashboard: React.FC<ListaDashboardProps> = ({
    reports,
    filters,
    onFiltersChange,
    onViewReport,
    onEditReport,
    onDeleteReport
}) => {
    // Estado local para semanas selecionadas na régua
    const [selectedWeeks, setSelectedWeeks] = useState<string[]>([]);
    const [selectedLocalidades, setSelectedLocalidades] = useState<string[]>([]);
    const [selectedCiclos, setSelectedCiclos] = useState<number[]>([]);
    const [showReportsList, setShowReportsList] = useState(false);
    const [activeSection, setActiveSection] = useState<'overview' | 'evolution' | 'table' | 'ranking'>('overview');

    // Filtrar relatórios localmente com base nos filtros selecionados
    const filteredReports = useMemo(() => {
        let result = reports;

        // Filtrar por semanas selecionadas
        if (selectedWeeks.length > 0) {
            result = result.filter(r => selectedWeeks.includes(r.semanaEpidemiologica));
        }

        // Filtrar por localidades selecionadas
        if (selectedLocalidades.length > 0) {
            result = result.filter(r => selectedLocalidades.includes(r.localidade));
        }

        // Filtrar por ciclos selecionados
        if (selectedCiclos.length > 0) {
            result = result.filter(r => selectedCiclos.includes(r.ciclo));
        }

        return result;
    }, [reports, selectedWeeks, selectedLocalidades, selectedCiclos]);

    // Dados consolidados usando o hook - agora usa filteredReports
    const { consolidated, weekData, weeksWithData, localityRanking, getGroupedData } = useDataConsolidation(filteredReports);

    // Semanas que possuem dados (de todos os reports, não apenas filtrados)
    const allWeeksWithData = useMemo(() => {
        return [...new Set(reports.map(r => r.semanaEpidemiologica))].sort((a: string, b: string) => {
            const numA = parseInt(a.replace('SE ', ''));
            const numB = parseInt(b.replace('SE ', ''));
            return numA - numB;
        });
    }, [reports]);

    // Ciclos disponíveis
    const availableCiclos = useMemo(() => {
        const ciclos = [...new Set(reports.map(r => r.ciclo))];
        return ciclos.sort((a: number, b: number) => a - b);
    }, [reports]);

    const handleCicloToggle = (ciclo: number) => {
        setSelectedCiclos(prev =>
            prev.includes(ciclo)
                ? prev.filter(c => c !== ciclo)
                : [...prev, ciclo]
        );
    };

    const handleClearAllFilters = () => {
        setSelectedWeeks([]);
        setSelectedLocalidades([]);
        setSelectedCiclos([]);
    };

    const hasActiveFilters = selectedWeeks.length > 0 || selectedLocalidades.length > 0 || selectedCiclos.length > 0;

    const sections = [
        { id: 'overview', label: 'Visão Geral', icon: 'dashboard' },
        { id: 'evolution', label: 'Evolução', icon: 'trending_up' },
        { id: 'table', label: 'Tabela', icon: 'table_chart' },
        { id: 'ranking', label: 'Ranking', icon: 'emoji_events' }
    ] as const;

    return (
        <div className="space-y-4">
            {/* Filtros Avançados */}
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/10 dark:to-purple-900/10 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2 text-sm">
                        <span className="material-symbols-outlined text-violet-500">tune</span>
                        Filtros Avançados
                    </h3>
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearAllFilters}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Limpar Todos
                        </button>
                    )}
                </div>

                <div className="p-4 space-y-4">
                    {/* Localidades e Ciclos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Localidades */}
                        <div>
                            <LocalidadeSelect
                                options={LOCALIDADES}
                                selected={selectedLocalidades}
                                onChange={setSelectedLocalidades}
                            />
                        </div>

                        {/* Ciclos */}
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                🔄 Ciclos de Trabalho
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5, 6].map(ciclo => {
                                    const isSelected = selectedCiclos.includes(ciclo);
                                    const hasData = availableCiclos.includes(ciclo);

                                    return (
                                        <button
                                            key={ciclo}
                                            onClick={() => handleCicloToggle(ciclo)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${isSelected
                                                ? 'bg-green-500 text-white border-green-500'
                                                : hasData
                                                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:border-green-400'
                                                    : 'bg-slate-50 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                                }`}
                                        >
                                            Ciclo {ciclo}
                                            {isSelected && <span className="ml-1">✓</span>}
                                            {hasData && !isSelected && (
                                                <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full inline-block"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Régua de Semanas Epidemiológicas */}
            <EpidemiologicalWeekRuler
                selectedWeeks={selectedWeeks}
                onSelectionChange={setSelectedWeeks}
                weeksWithData={allWeeksWithData}
            />

            {/* Navegação entre seções */}
            <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar">
                {sections.map(section => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeSection === section.id
                            ? 'bg-primary text-white shadow-lg'
                            : 'bg-white dark:bg-surface-dark text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-primary/30'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">{section.icon}</span>
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Conteúdo das seções */}
            {activeSection === 'overview' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Cards de Resumo Consolidado */}
                    <ConsolidatedSummaryCards data={consolidated} />

                    {/* Cards de Depósitos por Tipo */}
                    <DepositTypeCards depositos={consolidated.depositosPorTipo} />
                </div>
            )}

            {activeSection === 'evolution' && (
                <div className="animate-in fade-in duration-300">
                    <WeekEvolutionChart data={weekData} />
                </div>
            )}

            {activeSection === 'table' && (
                <div className="animate-in fade-in duration-300">
                    <AnalyticsTable getGroupedData={getGroupedData} />
                </div>
            )}

            {activeSection === 'ranking' && (
                <div className="animate-in fade-in duration-300">
                    <LocalityRanking data={localityRanking} maxItems={10} />
                </div>
            )}

            {/* Lista de Relatórios por Localidade (Accordion) */}
            {filteredReports.length > 0 && (
                <div className="mt-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">location_on</span>
                            Relatórios por Localidade
                            <span className="text-sm font-normal text-slate-400">
                                ({filteredReports.length} relatório{filteredReports.length > 1 ? 's' : ''})
                            </span>
                        </h3>
                        <button
                            onClick={() => setShowReportsList(!showReportsList)}
                            className="text-sm text-primary font-semibold hover:underline flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">
                                {showReportsList ? 'visibility_off' : 'visibility'}
                            </span>
                            {showReportsList ? 'Ocultar' : 'Mostrar'}
                        </button>
                    </div>

                    {showReportsList && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <LocalityAccordionList
                                reports={filteredReports}
                                onView={(report) => onViewReport(report.id)}
                                onEdit={(report) => onEditReport?.(report.id)}
                                onDelete={(id) => onDeleteReport(id)}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Estado vazio */}
            {filteredReports.length === 0 && reports.length > 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-slate-300">filter_alt_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
                        Nenhum relatório corresponde aos filtros
                    </h3>
                    <p className="text-sm text-slate-400 max-w-sm">
                        Tente ajustar os filtros para ver mais resultados.
                    </p>
                    <button
                        onClick={handleClearAllFilters}
                        className="mt-4 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors"
                    >
                        Limpar Filtros
                    </button>
                </div>
            )}

            {/* Estado vazio - sem dados */}
            {reports.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-slate-300">search_off</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300 mb-2">
                        Nenhum relatório encontrado
                    </h3>
                    <p className="text-sm text-slate-400 max-w-sm">
                        Não há relatórios cadastrados ainda.
                    </p>
                </div>
            )}
        </div>
    );
};
