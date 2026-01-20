import React from 'react';
import { ConsolidatedData } from '../types/reportTypes';

interface ConsolidatedSummaryCardsProps {
    data: ConsolidatedData;
}

/**
 * Cards de resumo consolidado com design moderno
 */
export const ConsolidatedSummaryCards: React.FC<ConsolidatedSummaryCardsProps> = ({ data }) => {
    const cards = [
        {
            title: 'Total Imóveis',
            value: data.totalImoveis,
            icon: 'home',
            color: 'from-blue-500 to-blue-600',
            bgLight: 'bg-blue-50',
            textColor: 'text-blue-600',
            iconBg: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            title: 'Fechados',
            value: data.totalFechados,
            icon: 'door_front',
            color: 'from-slate-500 to-slate-600',
            bgLight: 'bg-slate-50',
            textColor: 'text-slate-600',
            iconBg: 'bg-slate-100 dark:bg-slate-900/30'
        },
        {
            title: 'Recuperados',
            value: data.totalRecuperados,
            icon: 'refresh',
            color: 'from-emerald-500 to-green-500',
            bgLight: 'bg-emerald-50',
            textColor: 'text-emerald-600',
            iconBg: 'bg-emerald-100 dark:bg-emerald-900/30'
        },
        {
            title: 'Pendência',
            value: data.pendenciaPercent,
            suffix: '%',
            icon: 'pending_actions',
            color: 'from-amber-500 to-orange-500',
            bgLight: 'bg-amber-50',
            textColor: 'text-amber-600',
            iconBg: 'bg-amber-100 dark:bg-amber-900/30'
        },
        {
            title: 'Focal',
            value: data.totalTratamentos.focal,
            icon: 'target',
            color: 'from-cyan-500 to-teal-500',
            bgLight: 'bg-cyan-50',
            textColor: 'text-cyan-600',
            iconBg: 'bg-cyan-100 dark:bg-cyan-900/30'
        },
        {
            title: 'Eliminados',
            value: data.totalEliminados,
            icon: 'delete_sweep',
            color: 'from-red-500 to-rose-500',
            bgLight: 'bg-red-50',
            textColor: 'text-red-600',
            iconBg: 'bg-red-100 dark:bg-red-900/30'
        },
        {
            title: 'Qtd (g)',
            value: data.totalLarvicida.quantidade,
            icon: 'science',
            color: 'from-violet-500 to-purple-500',
            bgLight: 'bg-violet-50',
            textColor: 'text-violet-600',
            iconBg: 'bg-violet-100 dark:bg-violet-900/30'
        },
        {
            title: 'Dep. Tratados',
            value: data.totalLarvicida.depTratados,
            icon: 'inventory_2',
            color: 'from-indigo-500 to-blue-500',
            bgLight: 'bg-indigo-50',
            textColor: 'text-indigo-600',
            iconBg: 'bg-indigo-100 dark:bg-indigo-900/30'
        },
        {
            title: 'Agentes (ACE)',
            value: data.totalAgentes,
            icon: 'groups',
            color: 'from-pink-500 to-rose-400',
            bgLight: 'bg-pink-50',
            textColor: 'text-pink-600',
            iconBg: 'bg-pink-100 dark:bg-pink-900/30'
        },
        {
            title: 'Dias Trabalhados',
            value: data.totalDiasTrabalhados,
            icon: 'calendar_month',
            color: 'from-teal-500 to-cyan-500',
            bgLight: 'bg-teal-50',
            textColor: 'text-teal-600',
            iconBg: 'bg-teal-100 dark:bg-teal-900/30'
        }
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {cards.map((card, index) => (
                <div
                    key={card.title}
                    className={`
                        relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800
                        bg-white dark:bg-surface-dark p-4 shadow-sm
                        hover:shadow-md transition-all duration-300 group
                        animate-in fade-in slide-in-from-bottom-2
                    `}
                    style={{ animationDelay: `${index * 50}ms` }}
                >
                    {/* Gradient accent */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>

                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
                        <span className={`material-symbols-outlined ${card.textColor}`}>
                            {card.icon}
                        </span>
                    </div>

                    {/* Value */}
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                            {card.value.toLocaleString('pt-BR')}
                        </span>
                        {card.suffix && (
                            <span className="text-sm font-bold text-slate-400">
                                {card.suffix}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
                        {card.title}
                    </p>

                    {/* Subtle indicator */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.color} opacity-50`}></div>
                </div>
            ))}
        </div>
    );
};

/**
 * Cards compactos de depósitos por tipo
 */
export const DepositTypeCards: React.FC<{ depositos: ConsolidatedData['depositosPorTipo'] }> = ({ depositos }) => {
    const types = [
        { key: 'A1', label: 'A1', desc: 'Caixa d\'água', color: 'bg-blue-500' },
        { key: 'A2', label: 'A2', desc: 'Depósitos móveis', color: 'bg-cyan-500' },
        { key: 'B', label: 'B', desc: 'Pequenos depósitos', color: 'bg-emerald-500' },
        { key: 'C', label: 'C', desc: 'Fixos', color: 'bg-amber-500' },
        { key: 'D1', label: 'D1', desc: 'Pneus', color: 'bg-orange-500' },
        { key: 'D2', label: 'D2', desc: 'Outros removíveis', color: 'bg-red-500' },
        { key: 'E', label: 'E', desc: 'Naturais', color: 'bg-violet-500' }
    ];

    const total = (Object.values(depositos) as number[]).reduce((a, b) => a + b, 0);

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <h4 className="text-sm font-bold text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500">inventory_2</span>
                Depósitos por Tipo
            </h4>
            <div className="grid grid-cols-7 gap-2">
                {types.map(type => {
                    const value = depositos[type.key as keyof typeof depositos];
                    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

                    return (
                        <div key={type.key} className="text-center group" title={type.desc}>
                            <div className={`w-full h-1 rounded-full bg-slate-200 dark:bg-slate-700 mb-2 overflow-hidden`}>
                                <div
                                    className={`h-full ${type.color} transition-all duration-500`}
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                            <span className="text-lg font-black text-slate-700 dark:text-white">
                                {value}
                            </span>
                            <p className="text-[9px] font-bold text-slate-400">{type.label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
