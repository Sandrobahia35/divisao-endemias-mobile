import React from 'react';
import { Report } from '../types/reportTypes';

interface LocalidadeCardProps {
    report: Report;
    onView: (id: string) => void;
    onEdit?: (id: string) => void;
    onDelete: (id: string) => void;
}

export const LocalidadeCard: React.FC<LocalidadeCardProps> = ({ report, onView, onEdit, onDelete }) => {
    const data = report.data;

    const totalImoveis = (
        data.imoveis.residencias +
        data.imoveis.comercios +
        data.imoveis.terrenos +
        data.imoveis.pontos +
        data.imoveis.outros
    );

    const totalDepositos = (Object.values(data.depositos) as number[]).reduce((a, b) => a + b, 0);

    const formatDate = (isoString: string) => {
        if (!isoString) return '--';
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Excluir relatório de ${report.localidade}?`)) {
            onDelete(report.id);
        }
    };

    const handleEdit = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onEdit) {
            onEdit(report.id);
        }
    };

    return (
        <div
            onClick={() => onView(report.id)}
            className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.99] overflow-hidden"
        >
            {/* Header com localidade */}
            <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${data.categoriaLocalidade === '1'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                }`}>
                                {data.categoriaLocalidade === '1' ? 'BRR' : 'POV'}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${report.concluido
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                }`}>
                                {report.concluido ? '✓ Concluído' : '○ Aberto'}
                            </span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                            {report.localidade}
                        </h3>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            Ciclo {data.ciclo} • {report.semanaEpidemiologica} • {formatDate(report.createdAt || '')}
                        </p>
                    </div>

                    <span className="material-symbols-outlined text-primary text-lg group-hover:translate-x-1 transition-transform">
                        chevron_right
                    </span>
                </div>
            </div>

            {/* Métricas resumidas */}
            <div className="grid grid-cols-4 gap-px bg-slate-100 dark:bg-slate-800">
                <div className="bg-white dark:bg-surface-dark p-2 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Imóveis</p>
                    <p className="text-sm font-black text-slate-700 dark:text-slate-200">{totalImoveis}</p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-2 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Depósitos</p>
                    <p className="text-sm font-black text-blue-600 dark:text-blue-400">{totalDepositos}</p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-2 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Eliminados</p>
                    <p className="text-sm font-black text-red-600 dark:text-red-400">{data.eliminados}</p>
                </div>
                <div className="bg-white dark:bg-surface-dark p-2 text-center">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Agentes</p>
                    <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{data.agentes}</p>
                </div>
            </div>

            {/* Footer com ações */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    <span className="material-symbols-outlined text-sm">schedule</span>
                    <span>{data.tipoAtividade?.join(', ') || 'LI'}</span>
                </div>

                {/* Botões de ação */}
                <div className="flex items-center gap-1">
                    {onEdit && (
                        <button
                            onClick={handleEdit}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Editar relatório"
                        >
                            <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                    )}
                    <button
                        onClick={handleDelete}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Excluir relatório"
                    >
                        <span className="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
