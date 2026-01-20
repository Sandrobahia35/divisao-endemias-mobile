import React from 'react';
import { LocalityRankingItem } from '../types/reportTypes';

interface LocalityRankingProps {
    data: LocalityRankingItem[];
    maxItems?: number;
}

/**
 * Ranking visual de localidades por eliminados
 */
export const LocalityRanking: React.FC<LocalityRankingProps> = ({ data, maxItems = 10 }) => {
    const topItems = data.slice(0, maxItems);
    const maxValue = topItems.length > 0 ? topItems[0].eliminados : 1;

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
                return 'from-amber-400 to-yellow-500';
            case 2:
                return 'from-slate-300 to-slate-400';
            case 3:
                return 'from-amber-600 to-orange-600';
            default:
                return 'from-blue-400 to-blue-500';
        }
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-b border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-amber-500">emoji_events</span>
                    Ranking de Localidades
                    <span className="text-xs font-normal text-slate-400 ml-2">(por focos eliminados)</span>
                </h4>
            </div>

            {/* Ranking List */}
            <div className="p-4 space-y-3">
                {topItems.map((item, index) => {
                    const percentage = maxValue > 0 ? (item.eliminados / maxValue) * 100 : 0;

                    return (
                        <div
                            key={item.localidade}
                            className={`
                                relative rounded-xl p-3 transition-all duration-300
                                ${item.rank <= 3 ? 'bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}
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
                                        <span className="text-lg font-black text-red-600 dark:text-red-400 ml-2">
                                            {item.eliminados.toLocaleString('pt-BR')}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full bg-gradient-to-r ${getBarColor(item.rank)} rounded-full transition-all duration-500`}
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-blue-500">home</span>
                                            {item.imoveis.toLocaleString('pt-BR')} imóveis
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-amber-500">inventory_2</span>
                                            {item.depositos.toLocaleString('pt-BR')} depósitos
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-xs text-emerald-500">groups</span>
                                            {item.agentes} agentes
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
