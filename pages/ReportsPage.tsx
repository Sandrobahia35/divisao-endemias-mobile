import React, { useState, useEffect, useCallback } from 'react';
import { ReportService } from '../services/reportService';
import { Report, ReportFiltersExtended } from '../types/reportTypes';
import { ReportDetail } from '../components/ReportDetail';
import { ExportModal } from '../components/ExportModal';
import { ListaDashboard } from '../components/ListaDashboard';
import { useAuth } from '../contexts/AuthContext';

interface ReportsPageProps {
    onNavigateToForm: () => void;
    onEditReport?: (id: string) => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigateToForm, onEditReport }) => {
    const { profile } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [filters, setFilters] = useState<ReportFiltersExtended>({});
    const [showExportModal, setShowExportModal] = useState(false);
    const [showFilters, setShowFilters] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | undefined>(undefined);

    const fetchReports = useCallback(async () => {
        if (!profile) return;

        setLoading(true);
        try {
            const profileId = profile.id;
            const role = profile.role || 'user';

            console.log('[ReportsPage] Fetching reports for:', { profileId, role, profileName: profile.full_name });

            // Se houver filtros, usa a busca avançada, senão busca por acesso do usuário
            const hasFilters =
                (filters.localidades?.length || 0) > 0 ||
                (filters.semanasEpidemiologicas?.length || 0) > 0 ||
                (filters.ciclos?.length || 0) > 0;

            let data: Report[];
            if (hasFilters) {
                // Mapeia os filtros do componente para o formato esperado pelo serviço
                // Usa o método que respeita a hierarquia do usuário
                data = await ReportService.getReportsByAdvancedFilterWithAccess(
                    {
                        semanas: filters.semanasEpidemiologicas,
                        localidades: filters.localidades,
                        ciclos: filters.ciclos
                    },
                    profileId,
                    role
                );
            } else {
                // Busca relatórios baseado no acesso do usuário na hierarquia
                data = await ReportService.getReportsByUserAccess(profileId, role);
            }
            console.log('[ReportsPage] Reports fetched:', data.length);
            setReports(data);
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    }, [filters, profile]);

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
            </header>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-4 no-scrollbar">

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
                            <ListaDashboard
                                reports={reports}
                                filters={filters}
                                onFiltersChange={setFilters}
                                onViewReport={handleViewReport}
                                onEditReport={onEditReport}
                                onDeleteReport={handleDeleteReport}
                            />
                        )}
                    </>
                )}
            </main>

            {/* Modal de Exportação */}
            <ExportModal
                isOpen={showExportModal}
                onClose={() => setShowExportModal(false)}
                reports={reports}
            />
        </div>
    );
};
