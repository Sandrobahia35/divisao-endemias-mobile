import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface UsersPageProps {
    isDarkMode: boolean;
    onToggleDarkMode: () => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ isDarkMode, onToggleDarkMode }) => {
    const { user, profile, signOut } = useAuth();
    const [isSigningOut, setIsSigningOut] = useState(false);

    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';
    const displayRole = profile?.role === 'admin' ? 'Administrador' : 'Agente de Campo';
    const email = user?.email || '';

    const handleSignOut = async () => {
        if (window.confirm('Tem certeza que deseja sair da conta?')) {
            setIsSigningOut(true);
            try {
                await signOut();
            } catch (error) {
                console.error('Erro ao sair:', error);
                setIsSigningOut(false);
            }
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="bg-white dark:bg-surface-dark px-4 py-4 border-b border-slate-200 dark:border-slate-800">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white text-center">Meu Perfil</h1>
            </header>

            {/* Conteúdo */}
            <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 pb-24 md:pb-8 space-y-5 md:max-w-2xl md:mx-auto">
                {/* Perfil do usuário */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg">
                            <span className="material-symbols-outlined text-3xl">person</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                                {displayName}
                            </h2>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                {displayRole}
                            </p>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{email}</p>
                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide">
                                    Ativo
                                </span>
                                {profile?.role === 'admin' && (
                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wide">
                                        Admin
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Configurações */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Configurações</h3>
                    </div>

                    {/* Dark Mode Toggle */}
                    <button
                        onClick={onToggleDarkMode}
                        className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
                                {isDarkMode ? 'dark_mode' : 'light_mode'}
                            </span>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">Modo Escuro</p>
                                <p className="text-xs text-slate-400">{isDarkMode ? 'Ativado' : 'Desativado'}</p>
                            </div>
                        </div>
                        <div className={`w-12 h-7 rounded-full p-1 transition-colors relative ${isDarkMode ? 'bg-primary' : 'bg-slate-300'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 absolute top-1 left-1 ${isDarkMode ? 'translate-x-5' : 'translate-x-0'}`} />
                        </div>
                    </button>

                    {/* Outras opções mantidas para layout */}
                    <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">notifications</span>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">Notificações</p>
                                <p className="text-xs text-slate-400">Gerenciar alertas</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </button>

                    <button className="w-full flex items-center justify-between px-4 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">sync</span>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">Sincronização</p>
                                <p className="text-xs text-slate-400">Última: agora mesmo</p>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                    </button>
                </section>

                {/* Informações do App */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sobre</h3>
                    </div>

                    <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Versão</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">1.0.0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Build</span>
                            <span className="text-sm font-semibold text-slate-800 dark:text-white">2026.01.18</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Desenvolvido por</span>
                            <span className="text-sm font-semibold text-primary">Divisão de Endemias</span>
                        </div>
                    </div>
                </section>

                {/* Botão de Sair */}
                <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="w-full py-4 rounded-xl border-2 border-red-200 dark:border-red-900/30 text-red-500 font-bold text-sm hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSigningOut ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <span className="material-symbols-outlined">logout</span>
                    )}
                    {isSigningOut ? 'Saindo...' : 'Sair da Conta'}
                </button>
            </main>
        </div>
    );
};
