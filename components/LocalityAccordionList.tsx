import React, { useState } from 'react';
import { Report } from '../types/reportTypes';

interface LocalityAccordionListProps {
    reports: Report[];
    onView: (report: Report) => void;
    onEdit: (report: Report) => void;
    onDelete: (id: string) => void;
}

interface GroupedLocality {
    localidade: string;
    reports: Report[];
    totals: {
        imoveis: number;
        fechados: number;
        recuperados: number;
        informados: number;
        pendencia: number;
        depositos: number;
        eliminados: number;
        agentes: number;
    };
}

/**
 * Lista expansível de localidades em formato accordion
 * Agrupa relatórios por localidade e permite expandir para ver detalhes
 */
export const LocalityAccordionList: React.FC<LocalityAccordionListProps> = ({
    reports,
    onView,
    onEdit,
    onDelete
}) => {
    const [expandedLocality, setExpandedLocality] = useState<string | null>(null);

    // Agrupar por localidade
    const groupedData: GroupedLocality[] = React.useMemo(() => {
        const groups: Record<string, GroupedLocality> = {};

        reports.forEach(report => {
            const key = report.localidade;
            if (!groups[key]) {
                groups[key] = {
                    localidade: key,
                    reports: [],
                    totals: {
                        imoveis: 0,
                        fechados: 0,
                        recuperados: 0,
                        informados: 0,
                        pendencia: 0,
                        depositos: 0,
                        eliminados: 0,
                        agentes: 0
                    }
                };
            }

            groups[key].reports.push(report);

            const data = report.data;
            const imoveis = data.imoveis;
            const depositos = data.depositos;

            groups[key].totals.imoveis += (imoveis.residencias || 0) + (imoveis.comercios || 0) +
                (imoveis.terrenos || 0) + (imoveis.pontos || 0) + (imoveis.outros || 0);
            groups[key].totals.fechados += imoveis.fechados || 0;
            groups[key].totals.recuperados += imoveis.recuperados || 0;
            groups[key].totals.informados += imoveis.informados || 0;
            groups[key].totals.depositos += (depositos.A1 || 0) + (depositos.A2 || 0) + (depositos.B || 0) +
                (depositos.C || 0) + (depositos.D1 || 0) + (depositos.D2 || 0) + (depositos.E || 0);
            groups[key].totals.eliminados += data.eliminados || 0;
            groups[key].totals.agentes += data.agentes || 0;
        });

        // Calcular pendência para cada grupo
        Object.values(groups).forEach(group => {
            group.totals.pendencia = group.totals.informados > 0
                ? Math.round(((group.totals.fechados - group.totals.recuperados) * 100 / group.totals.informados) * 100) / 100
                : 0;
        });

        return Object.values(groups).sort((a, b) => a.localidade.localeCompare(b.localidade));
    }, [reports]);

    const toggleExpand = (localidade: string) => {
        setExpandedLocality(prev => prev === localidade ? null : localidade);
    };

    if (groupedData.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            {groupedData.map((group) => {
                const isExpanded = expandedLocality === group.localidade;

                return (
                    <div
                        key={group.localidade}
                        className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-all duration-300"
                    >
                        {/* Header - Clicável para expandir */}
                        <button
                            onClick={() => toggleExpand(group.localidade)}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                                <div className="text-left">
                                    <h4 className="font-bold text-slate-700 dark:text-white">
                                        {group.localidade}
                                    </h4>
                                    <p className="text-xs text-slate-400">
                                        {group.reports.length} relatório{group.reports.length > 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>

                            {/* Stats resumidos */}
                            <div className="hidden md:flex items-center gap-6 text-sm">
                                <div className="text-center">
                                    <span className="font-bold text-blue-600">{group.totals.imoveis}</span>
                                    <p className="text-[10px] text-slate-400">Imóveis</p>
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-slate-600">{group.totals.fechados}</span>
                                    <p className="text-[10px] text-slate-400">Fechados</p>
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-emerald-600">{group.totals.recuperados}</span>
                                    <p className="text-[10px] text-slate-400">Recuperados</p>
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-amber-600">{group.totals.pendencia.toFixed(2)}%</span>
                                    <p className="text-[10px] text-slate-400">Pendência</p>
                                </div>
                                <div className="text-center">
                                    <span className="font-bold text-red-600">{group.totals.eliminados}</span>
                                    <p className="text-[10px] text-slate-400">Eliminados</p>
                                </div>
                            </div>
                        </button>

                        {/* Conteúdo expandido */}
                        {isExpanded && (
                            <div className="border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
                                {/* Stats mobile (aparece quando expandido) */}
                                <div className="md:hidden px-4 py-3 bg-slate-50 dark:bg-slate-800/30 grid grid-cols-5 gap-2 text-center">
                                    <div>
                                        <span className="font-bold text-blue-600 text-sm">{group.totals.imoveis}</span>
                                        <p className="text-[9px] text-slate-400">Imóveis</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-slate-600 text-sm">{group.totals.fechados}</span>
                                        <p className="text-[9px] text-slate-400">Fechados</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-emerald-600 text-sm">{group.totals.recuperados}</span>
                                        <p className="text-[9px] text-slate-400">Recuperados</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-amber-600 text-sm">{group.totals.pendencia.toFixed(2)}%</span>
                                        <p className="text-[9px] text-slate-400">Pendência</p>
                                    </div>
                                    <div>
                                        <span className="font-bold text-red-600 text-sm">{group.totals.eliminados}</span>
                                        <p className="text-[9px] text-slate-400">Eliminados</p>
                                    </div>
                                </div>

                                {/* Lista de relatórios */}
                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {group.reports.map(report => {
                                        const data = report.data;
                                        const imoveis = data.imoveis;
                                        const totalImoveis = (imoveis.residencias || 0) + (imoveis.comercios || 0) +
                                            (imoveis.terrenos || 0) + (imoveis.pontos || 0) + (imoveis.outros || 0);
                                        const pendencia = imoveis.informados > 0
                                            ? ((imoveis.fechados - imoveis.recuperados) * 100 / imoveis.informados)
                                            : 0;

                                        return (
                                            <div
                                                key={report.id}
                                                className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-xs font-semibold text-primary">
                                                                {report.semanaEpidemiologica}
                                                            </span>
                                                            <span className="text-xs text-slate-400">•</span>
                                                            <span className="text-xs text-slate-500">
                                                                Ciclo {report.ciclo}
                                                            </span>
                                                            {report.concluido && (
                                                                <span className="px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 text-[10px] font-bold">
                                                                    Concluído
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Stats do relatório */}
                                                        <div className="flex items-center gap-4 text-xs">
                                                            <span className="text-blue-600">
                                                                <strong>{totalImoveis}</strong> imóveis
                                                            </span>
                                                            <span className="text-slate-500">
                                                                <strong>{imoveis.fechados || 0}</strong> fechados
                                                            </span>
                                                            <span className="text-emerald-600">
                                                                <strong>{imoveis.recuperados || 0}</strong> recup.
                                                            </span>
                                                            <span className="text-amber-600">
                                                                <strong>{pendencia.toFixed(2)}%</strong> pend.
                                                            </span>
                                                            <span className="text-red-600">
                                                                <strong>{data.eliminados || 0}</strong> elim.
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Ações */}
                                                    <div className="flex items-center gap-1 ml-4">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onView(report);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                                                            title="Visualizar"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">visibility</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onEdit(report);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                                                            title="Editar"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">edit</span>
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onDelete(report.id);
                                                            }}
                                                            className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                                            title="Excluir"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">delete</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};
