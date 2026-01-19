import React from 'react';
import { ReportsSummary } from '../types/reportTypes';

interface SummaryCardsProps {
    summary: ReportsSummary;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Total de Relatórios */}
            <div className="bg-gradient-to-br from-primary to-blue-600 rounded-xl p-4 text-white shadow-lg">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-white/80 text-lg">description</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Total</p>
                </div>
                <p className="text-3xl font-black">{summary.total}</p>
                <p className="text-xs text-white/70 mt-1">relatórios registrados</p>
            </div>

            {/* Status */}
            <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                    <span className="material-symbols-outlined text-emerald-500 text-lg">task_alt</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Concluídos</p>
                </div>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{summary.concluidos}</p>
                    {summary.emAberto > 0 && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold">
                            +{summary.emAberto} abertos
                        </span>
                    )}
                </div>
            </div>

            {/* Última Semana */}
            {summary.ultimaSemana && (
                <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-purple-500 text-lg">event_note</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Última SE</p>
                    </div>
                    <p className="text-xl font-black text-slate-900 dark:text-white">{summary.ultimaSemana}</p>
                </div>
            )}

            {/* Localidade Mais Frequente */}
            {summary.localidadeMaisFrequente && (
                <div className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-orange-500 text-lg">location_on</span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Mais Ativa</p>
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{summary.localidadeMaisFrequente}</p>
                </div>
            )}
        </div>
    );
};
