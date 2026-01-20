import React from 'react';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ComposedChart,
    Line
} from 'recharts';
import { WeekData } from '../types/reportTypes';

interface WeekEvolutionChartProps {
    data: WeekData[];
}

/**
 * Gráfico de evolução por semana epidemiológica
 */
export const WeekEvolutionChart: React.FC<WeekEvolutionChartProps> = ({ data }) => {
    if (data.length === 0) {
        return (
            <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-3">show_chart</span>
                    <p className="text-slate-400 text-sm">Selecione semanas para visualizar a evolução</p>
                </div>
            </div>
        );
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-700 dark:text-white mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            <span className="font-semibold">{entry.name}:</span> {entry.value.toLocaleString('pt-BR')}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <h4 className="font-bold text-slate-700 dark:text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">trending_up</span>
                    Evolução por Semana Epidemiológica
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                    Dados consolidados das {data.length} semana{data.length > 1 ? 's' : ''} selecionada{data.length > 1 ? 's' : ''}
                </p>
            </div>

            {/* Chart */}
            <div className="p-4 overflow-x-auto">
                <div className="min-w-[600px] h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis
                                dataKey="semana"
                                tick={{ fontSize: 11, fill: '#64748b' }}
                                tickFormatter={(value) => value.replace('SE ', '')}
                            />
                            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                wrapperStyle={{ fontSize: '12px' }}
                                iconType="circle"
                            />
                            <Area
                                type="monotone"
                                dataKey="imoveis"
                                name="Imóveis"
                                stroke="#3b82f6"
                                fill="#3b82f6"
                                fillOpacity={0.1}
                                strokeWidth={2}
                            />
                            <Bar
                                dataKey="depositos"
                                name="Depósitos"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="eliminados"
                                name="Eliminados"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                            <Line
                                type="monotone"
                                dataKey="agentes"
                                name="Agentes"
                                stroke="#10b981"
                                strokeWidth={2}
                                dot={{ fill: '#10b981', r: 4 }}
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="px-4 pb-4">
                <div className="grid grid-cols-4 gap-2">
                    {[
                        { label: 'Média Imóveis/Semana', value: Math.round(data.reduce((a, b) => a + b.imoveis, 0) / data.length), color: 'text-blue-600' },
                        { label: 'Média Depósitos/Semana', value: Math.round(data.reduce((a, b) => a + b.depositos, 0) / data.length), color: 'text-amber-600' },
                        { label: 'Média Eliminados/Semana', value: Math.round(data.reduce((a, b) => a + b.eliminados, 0) / data.length), color: 'text-red-600' },
                        { label: 'Média Agentes/Semana', value: Math.round(data.reduce((a, b) => a + b.agentes, 0) / data.length), color: 'text-emerald-600' }
                    ].map(stat => (
                        <div key={stat.label} className="text-center p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <p className={`text-lg font-bold ${stat.color}`}>{stat.value.toLocaleString('pt-BR')}</p>
                            <p className="text-[9px] text-slate-400 font-semibold uppercase">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
