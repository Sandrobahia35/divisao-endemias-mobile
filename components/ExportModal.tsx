import React, { useState } from 'react';
import { Report, ExportConfig, ExportFormat, ExportGrouping } from '../types/reportTypes';
import { ExportService } from '../services/exportService';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reports: Report[];
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, reports }) => {
    const [config, setConfig] = useState<ExportConfig>({
        formato: 'excel',
        tipoAgrupamento: 'detalhado',
        filtros: {},
        incluirResumo: true
    });
    const [isExporting, setIsExporting] = useState(false);

    if (!isOpen) return null;

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await ExportService.export(reports, config);
            onClose();
        } catch (error) {
            console.error('Erro ao exportar:', error);
            alert('Erro ao exportar relatório');
        } finally {
            setIsExporting(false);
        }
    };

    const formatOptions: { value: ExportFormat; label: string; icon: string }[] = [
        { value: 'pdf', label: 'PDF', icon: 'picture_as_pdf' },
        { value: 'excel', label: 'Excel', icon: 'table_view' },
        { value: 'csv', label: 'CSV', icon: 'csv' },
        { value: 'json', label: 'JSON', icon: 'code' }
    ];

    const groupingOptions: { value: ExportGrouping; label: string; description: string }[] = [
        { value: 'detalhado', label: 'Detalhado', description: 'Todos os campos de cada relatório' },
        { value: 'localidade', label: 'Por Localidade', description: 'Agrupado por local' },
        { value: 'ciclo', label: 'Por Ciclo', description: 'Agrupado por ciclo de trabalho' },
        { value: 'semana', label: 'Por Semana', description: 'Agrupado por semana epidemiológica' }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary to-blue-600 text-white px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">download</span>
                        <h2 className="text-lg font-bold">Exportar Relatórios</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-5 space-y-5">
                    {/* Info */}
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                        <span className="material-symbols-outlined text-primary">info</span>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                            <strong>{reports.length}</strong> relatórios serão exportados
                        </p>
                    </div>

                    {/* Formato */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Formato
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {formatOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setConfig({ ...config, formato: opt.value })}
                                    className={`flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all ${config.formato === opt.value
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                        }`}
                                >
                                    <span className="material-symbols-outlined">{opt.icon}</span>
                                    <span className="text-xs font-semibold">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Agrupamento */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Agrupamento
                        </label>
                        <div className="space-y-2">
                            {groupingOptions.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => setConfig({ ...config, tipoAgrupamento: opt.value })}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${config.tipoAgrupamento === opt.value
                                            ? 'border-primary bg-primary/10'
                                            : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${config.tipoAgrupamento === opt.value
                                            ? 'border-primary bg-primary'
                                            : 'border-slate-300'
                                        }`}>
                                        {config.tipoAgrupamento === opt.value && (
                                            <span className="material-symbols-outlined text-white text-sm">check</span>
                                        )}
                                    </div>
                                    <div>
                                        <p className={`font-semibold text-sm ${config.tipoAgrupamento === opt.value ? 'text-primary' : 'text-slate-700 dark:text-slate-200'
                                            }`}>
                                            {opt.label}
                                        </p>
                                        <p className="text-xs text-slate-400">{opt.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Opções */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                            Opções
                        </label>
                        <button
                            onClick={() => setConfig({ ...config, incluirResumo: !config.incluirResumo })}
                            className="flex items-center gap-3 p-3 w-full rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${config.incluirResumo ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                                }`}>
                                {config.incluirResumo && (
                                    <span className="material-symbols-outlined text-white text-sm">check</span>
                                )}
                            </div>
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                Incluir resumo estatístico
                            </span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isExporting ? (
                            <>
                                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                Exportando...
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined">download</span>
                                Exportar
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
