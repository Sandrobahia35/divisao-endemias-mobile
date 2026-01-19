import React from 'react';
import { useAuth } from '../contexts/AuthContext';

type PageType = 'home' | 'form' | 'reports' | 'users';

interface SidebarNavigationProps {
    currentPage: PageType;
    onNavigate: (page: PageType) => void;
    onOpenAdmin: () => void;
}

interface NavItem {
    id: PageType;
    icon: string;
    label: string;
    description: string;
}

const navItems: NavItem[] = [
    { id: 'home', icon: 'home', label: 'Início', description: 'Dashboard principal' },
    { id: 'form', icon: 'add_circle', label: 'Novo Relatório', description: 'Criar atividade' },
    { id: 'reports', icon: 'list_alt', label: 'Relatórios', description: 'Ver histórico' },
    { id: 'users', icon: 'person', label: 'Meu Perfil', description: 'Configurações' },
];

export const SidebarNavigation: React.FC<SidebarNavigationProps> = ({
    currentPage,
    onNavigate,
    onOpenAdmin
}) => {
    const { user, profile } = useAuth();
    const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Usuário';

    return (
        <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 bg-white dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 h-screen sticky top-0">
            {/* Logo / Header */}
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center">
                        <span className="material-symbols-outlined text-white text-xl">vaccines</span>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white">Endemias Vetorial</h1>
                        <p className="text-xs text-slate-400">Sistema de Entomologia</p>
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Menu</p>

                {navItems.map((item) => {
                    const isActive = currentPage === item.id;

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                                w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }
                            `}
                        >
                            <span className={`material-symbols-outlined text-xl ${isActive ? 'material-symbols-filled' : ''}`}>
                                {item.icon}
                            </span>
                            <div className="text-left">
                                <p className={`text-sm font-semibold ${isActive ? 'text-primary' : ''}`}>
                                    {item.label}
                                </p>
                                <p className="text-[10px] text-slate-400">{item.description}</p>
                            </div>
                            {isActive && (
                                <div className="ml-auto w-1.5 h-8 bg-primary rounded-full" />
                            )}
                        </button>
                    );
                })}

                {/* Divider */}
                <div className="my-4 border-t border-slate-200 dark:border-slate-800" />

                {/* Admin Link */}
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Administração</p>
                <button
                    onClick={onOpenAdmin}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
                >
                    <span className="material-symbols-outlined text-xl">settings</span>
                    <div className="text-left">
                        <p className="text-sm font-semibold">Painel Admin</p>
                        <p className="text-[10px] text-slate-400">Gerenciar sistema</p>
                    </div>
                </button>
            </nav>

            {/* Footer / User Info */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                            {displayName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">Divisão de Endemias</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export type { PageType };
