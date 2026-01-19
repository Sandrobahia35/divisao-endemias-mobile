import React from 'react';
import { Report } from '../types/reportTypes';

interface ReportCardProps {
    report: Report;
    onView: (id: string) => void;
    onDelete: (id: string) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report, onView, onDelete }) => {
    const totalImoveis = (
        report.data.imoveis.residencias +
        report.data.imoveis.comercios +
        report.data.imoveis.terrenos +
        report.data.imoveis.pontos +
        report.data.imoveis.outros
    );

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(`Tem certeza que deseja excluir o relatório de ${report.localidade}?`)) {
            onDelete(report.id);
        }
    };

    return (
        <div
            onClick={() => onView(report.id)}
            className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
        >
            <div className="p-4">
                {/* Header com SE e Status */}
                <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 text-xs font-bold uppercase tracking-wide">
                        {report.semanaEpidemiologica}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${report.concluido
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                        {report.concluido ? 'CONCLUÍDO' : 'EM ABERTO'}
                    </span>
                </div>

                {/* Localidade */}
                <div className="mb-3">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                        {report.localidade}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {report.categoriaLocalidade === '1' ? 'Bairro (BRR)' : 'Povoado (POV)'} • Ciclo {report.ciclo}/{report.ano}
                    </p>
                </div>

                {/* Métricas resumidas */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-2 text-center">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Imóveis</p>
                        <p className="text-lg font-black text-slate-700 dark:text-slate-200">{totalImoveis}</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
                        <p className="text-[9px] font-bold text-blue-500 uppercase tracking-wider">Depósitos</p>
                        <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                            {Object.values(report.data.depositos).reduce((a, b) => a + b, 0)}
                        </p>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-2 text-center">
                        <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-wider">Agentes</p>
                        <p className="text-lg font-black text-emerald-600 dark:text-emerald-400">{report.data.agentes}</p>
                    </div>
                </div>

                {/* Footer com data e ações */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{formatDate(report.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleDelete}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                        <button
                            onClick={() => onView(report.id)}
                            className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
