import React, { useEffect, useState } from 'react';
import { ReportService } from '../services/reportService';
import { ReportsSummary } from '../types/reportTypes';
import { useAuth } from '../contexts/AuthContext';

interface HomePageProps {
    onNavigate: (page: 'form' | 'reports' | 'users' | 'admin') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
    const { user, profile, getRoleLabel } = useAuth();
    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';

    const [summary, setSummary] = useState<ReportsSummary>({
        total: 0,
        concluidos: 0,
        emAberto: 0,
        ultimaSemana: null,
        localidadeMaisFrequente: null
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const data = await ReportService.getSummary();
                setSummary(data);
            } catch (error) {
                console.error("Failed to fetch summary", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    const getCurrentGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bom dia';
        if (hour < 18) return 'Boa tarde';
        return 'Boa noite';
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="bg-gradient-to-br from-primary via-blue-600 to-indigo-700 text-white px-5 py-6 relative overflow-hidden">
                {/* Decoração de fundo */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Foto do usuário */}
                            <div className="w-14 h-14 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center shadow-lg overflow-hidden">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-3xl text-white">person</span>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-white/80 font-medium">{getCurrentGreeting()}!</p>
                                <h1 className="text-xl md:text-2xl font-black">{displayName}</h1>
                                <p className="text-xs text-white/70 mt-0.5">{getRoleLabel()} • Divisão de Endemias</p>
                            </div>
                        </div>
                        {profile?.role === 'admin' && (
                            <button
                                onClick={() => onNavigate('admin')}
                                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                            >
                                <span className="material-symbols-outlined text-xl">settings</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Conteúdo principal */}
            <main className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8 space-y-5 md:space-y-6 overflow-y-auto no-scrollbar">

                {/* Seção: Estatísticas */}
                <section>
                    <h2 className="text-sm md:text-base font-bold text-slate-700 dark:text-slate-200 mb-3 md:mb-4 px-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                        Resumo
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        {/* Total Relatórios */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">description</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-slate-800 dark:text-white">
                                {loading ? '...' : summary.total}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">relatórios</p>
                        </div>

                        {/* Concluídos */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span>
                                </div>
                            </div>
                            <p className="text-3xl font-black text-green-600 dark:text-green-400">
                                {loading ? '...' : summary.concluidos}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                                {summary.emAberto > 0 ? `+${summary.emAberto} abertos` : 'concluídos'}
                            </p>
                        </div>

                        {/* Última Semana */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-purple-600 dark:text-purple-400">event</span>
                                </div>
                            </div>
                            <p className="text-xl font-black text-slate-800 dark:text-white truncate">
                                {loading ? '...' : (summary.ultimaSemana || '--')}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">última SE</p>
                        </div>

                        {/* Localidade Mais Ativa */}
                        <div className="bg-white dark:bg-surface-dark rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">location_on</span>
                                </div>
                            </div>
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                {loading ? '...' : (summary.localidadeMaisFrequente || '--')}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">mais ativa</p>
                        </div>
                    </div>
                </section>

                {/* Seção: Ações Rápidas */}
                <section>
                    <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 px-1 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                        Ações Rápidas
                    </h2>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <button
                            onClick={() => onNavigate('form')}
                            className="bg-gradient-to-br from-primary to-blue-600 hover:from-primary-dark hover:to-blue-700 text-white rounded-2xl p-5 shadow-lg flex flex-col items-center gap-3 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-4xl">add_circle</span>
                            <span className="text-sm font-bold">Novo Relatório</span>
                        </button>

                        <button
                            onClick={() => onNavigate('reports')}
                            className="bg-white dark:bg-surface-dark hover:bg-slate-50 dark:hover:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-2xl p-5 shadow-sm flex flex-col items-center gap-3 transition-all active:scale-95"
                        >
                            <span className="material-symbols-outlined text-4xl text-primary">list_alt</span>
                            <span className="text-sm font-bold">Ver Relatórios</span>
                        </button>
                    </div>
                </section>

                {/* Seção: Sobre */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-lg">info</span>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sobre o Sistema</h3>
                    </div>
                    <div className="p-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                        <p>
                            <strong className="text-slate-800 dark:text-white">Endemias Vetorial</strong> é um sistema para registro
                            de atividades de controle de endemias, permitindo o cadastro de ações por semana epidemiológica e localidade.
                        </p>
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="material-symbols-outlined text-primary text-lg">verified</span>
                            <span className="text-xs font-semibold">Versão 1.0.0 • Sistema de Entomologia</span>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};
