import React, { useState, useEffect, useCallback } from 'react';
import { ReportService } from '../services/reportService';
import { Report, ReportFiltersExtended } from '../types/reportTypes';
import { LocalidadeCard } from '../components/LocalidadeCard';
import { ReportDetail } from '../components/ReportDetail';
import { ReportFilters } from '../components/ReportFilters';
import { AnalyticsDashboard } from '../components/AnalyticsDashboard';
import { ExportModal } from '../components/ExportModal';

interface ReportsPageProps {
    onNavigateToForm: () => void;
    onEditReport?: (id: string) => void;
}

type ViewType = 'lista' | 'analises';

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigateToForm, onEditReport }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [activeView, setActiveView] = useState<ViewType>('lista');
    const [filters, setFilters] = useState<ReportFiltersExtended>({});
    const [showExportModal, setShowExportModal] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | undefined>(undefined);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            // Se houver filtros, usa a busca avançada, senão busca todos
            const hasFilters =
                (filters.localidades?.length || 0) > 0 ||
                (filters.semanasEpidemiologicas?.length || 0) > 0 ||
                (filters.ciclos?.length || 0) > 0;

            let data: Report[];
            if (hasFilters) {
                // Mapeia os filtros do componente para o formato esperado pelo serviço
                data = await ReportService.getReportsByAdvancedFilter({
                    semanas: filters.semanasEpidemiologicas, // Compatibilidade com o tipo esperado
                    localidades: filters.localidades,
                    ciclos: filters.ciclos
                });
            } else {
                data = await ReportService.getAllReports();
            }
            setReports(data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Handle view details (fetch single if needed or find in list)
    useEffect(() => {
        const loadDetail = async () => {
            if (selectedReportId) {
                const rep = await ReportService.getReportById(selectedReportId);
                setSelectedReport(rep);
            } else {
                setSelectedReport(undefined);
            }
        };
        loadDetail();
    }, [selectedReportId]);


    const handleViewReport = (id: string) => {
        setSelectedReportId(id);
    };

    const handleDeleteReport = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
            await ReportService.deleteReport(id);
            setSelectedReportId(null);
            fetchReports();
        }
    };

    const handleBackFromDetail = () => {
        setSelectedReportId(null);
    };

    const activeFiltersCount =
        (filters.localidades?.length || 0) +
        (filters.semanasEpidemiologicas?.length || 0) +
        (filters.ciclos?.length || 0);

    if (selectedReportId && selectedReport) {
        return (
            <ReportDetail
                report={selectedReport}
                onBack={handleBackFromDetail}
                onDelete={handleDeleteReport}
            />
        );
    }

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-background-light dark:bg-background-dark animate-in fade-in duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center px-4 py-3 justify-between">
                    <button
                        onClick={onNavigateToForm}
                        className="text-primary hover:bg-primary/10 rounded-full p-2 flex items-center justify-center transition-colors"
                        title="Novo Relatório"
                    >
                        <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>add_circle</span>
                    </button>
                    <div className="text-center flex-1">
                        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                            Relatórios
                        </h2>
                        <p className="text-[10px] text-slate-400 font-semibold">
                            {loading ? 'Carregando...' : `${reports.length} registros encontrados`}
                        </p>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-full transition-colors ${showFilters ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-slate-100'
                            }`}
                    >
                        <span className="material-symbols-outlined">filter_list</span>
                        {activeFiltersCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                                {activeFiltersCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Toggle de visualização */}
                <div className="flex px-4 pb-3 gap-2">
                    <button
                        onClick={() => setActiveView('lista')}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeView === 'lista'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">list</span>
                        Lista
                    </button>
                    <button
                        onClick={() => setActiveView('analises')}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${activeView === 'analises'
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                    >
                        <span className="material-symbols-outlined text-lg">analytics</span>
                        Análises
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-4 no-scrollbar">

                {/* Filtros (visíveis/ocultos) */}
                {showFilters && (
                    <ReportFilters
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                )}

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 text-sm">Carregando dados...</p>
                    </div>
                ) : (
                    <>
                        {/* Estado vazio */}
                        {reports.length === 0 && !loading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                    <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">folder_open</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300 mb-2">
                                    Nenhum relatório encontrado
                                </h3>
                                <p className="text-sm text-slate-400 max-w-xs mb-8">
                                    {activeFiltersCount > 0
                                        ? "Tente ajustar os filtros para ver mais resultados."
                                        : "Crie um novo relatório para começar."}
                                </p>
                                {activeFiltersCount === 0 && (
                                    <button
                                        onClick={onNavigateToForm}
                                        className="px-8 py-4 rounded-xl bg-primary text-white font-bold shadow-lg hover:bg-primary-dark transition-all flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                        Criar Relatório
                                    </button>
                                )}
                            </div>
                        ) : (
                            <>
                                {/* Visualização: Lista */}
                                {activeView === 'lista' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                                        {reports.map(report => (
                                            <LocalidadeCard
                                                key={report.id}
                                                report={report}
                                                onView={handleViewReport}
                                                onEdit={onEditReport}
                                                onDelete={() => handleDeleteReport(report.id)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {/* Visualização: Análises */}
                                {activeView === 'analises' && (
                                    <>
                                        <AnalyticsDashboard reports={reports} />

                                        {/* Botão de Exportar */}
                                        {reports.length > 0 && (
                                            <button
                                                onClick={() => setShowExportModal(true)}
                                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white font-bold transition-all flex items-center justify-center gap-3 shadow-lg"
                                            >
                                                <span className="material-symbols-outlined">download</span>
                                                Exportar {reports.length} Relatórios
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>

            {/* FAB para novo relatório */}
            {reports.length > 0 && activeView === 'lista' && !loading && (
                <button
                    onClick={onNavigateToForm}
                    className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 w-14 h-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center hover:bg-primary-dark active:scale-95 transition-all"
                >
                    <span className="material-symbols-outlined text-2xl">add</span>
                </button>
            )}

            {/* Modal de Exportação */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                reports={reports}
            />
        </div>
    );
};
