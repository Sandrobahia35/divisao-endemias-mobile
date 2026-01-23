import React from 'react';
import { LocalityRankingItem } from '../types/reportTypes';

interface LocalityRankingProps {
    data: LocalityRankingItem[];
    maxItems?: number;
}

/**
 * Ranking visual de localidades por menor índice de pendência
 */
export const LocalityRanking: React.FC<LocalityRankingProps> = ({ data, maxItems = 10 }) => {
    const topItems = data.slice(0, maxItems);
    // Para a barra, usamos a maior pendência como referência invertida
    // O primeiro item (menor pendência) terá a barra mais cheia
    const maxPendencia = topItems.length > 0
        ? Math.max(...topItems.map(i => i.pendencia), 0.01) // Evita divisão por zero
        : 1;

    if (topItems.length === 0) {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">emoji_events</span>
                    <p className="text-slate-400 text-sm">Selecione filtros para ver o ranking</p>
                </div>
            </div>
        );
    }

    const getMedalIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <span className="text-2xl">🥇</span>;
            case 2:
                return <span className="text-2xl">🥈</span>;
            case 3:
                return <span className="text-2xl">🥉</span>;
            default:
                return (
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500">
                        {rank}
                    </span>
                );
        }
    };

    const getBarColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'from-emerald-400 to-green-500';
            case 2:
                return 'from-emerald-300 to-green-400';
            case 3:
                return 'from-teal-400 to-emerald-500';
            default:
                return 'from-green-400 to-teal-500';
        }
    };

    const getPendenciaColor = (pendencia: number) => {
        if (pendencia <= 5) return 'text-emerald-600 dark:text-emerald-400';
        if (pendencia <= 15) return 'text-amber-600 dark:text-amber-400';
        return 'text-red-600 dark:text-red-400';
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/10 dark:to-green-900/10 border-b border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-500">emoji_events</span>
                    Ranking de Localidades
                    <span className="text-xs font-normal text-slate-400 ml-2">(menor pendência)</span>
                </h4>
            </div>

            {/* Ranking List */}
            <div className="p-4 space-y-3">
                {topItems.map((item, index) => {
                    // Barra invertida: menor pendência = barra mais cheia
                    const percentage = maxPendencia > 0
                        ? Math.max(0, 100 - (item.pendencia / maxPendencia) * 100 + 20)
                        : 100;

                    return (
                        <div
                            key={item.localidade}
                            className={`
                                relative rounded-xl p-3 transition-all duration-300
                                ${item.rank <= 3 ? 'bg-gradient-to-r from-emerald-50/50 to-transparent dark:from-emerald-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
                            `}
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-3">
                                {/* Medal/Rank */}
                                <div className="flex-shrink-0 w-10 flex justify-center">
                                    {getMedalIcon(item.rank)}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h5 className="font-bold text-slate-700 dark:text-white truncate text-sm">
                                            {item.localidade}
                                        </h5>
                                        <span className={`text-lg font-black ml-2 ${getPendenciaColor(item.pendencia)}`}>
                                            {item.pendencia.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${getBarColor(item.rank)} rounded-full transition-all duration-500`}
                                            style={{ width: `${Math.min(percentage, 100)}%` }}
                                        ></div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-blue-500">home</span>
                                            {item.informados.toLocaleString('pt-BR')} informados
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-amber-500">lock</span>
                                            {item.fechados.toLocaleString('pt-BR')} fechados
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-emerald-500">refresh</span>
                                            {item.recuperados.toLocaleString('pt-BR')} recup.
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            {data.length > maxItems && (
                <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-400">
                        Exibindo top {maxItems} de {data.length} localidades
                    </p>
                </div>
            )}
        </div>
    );
};
