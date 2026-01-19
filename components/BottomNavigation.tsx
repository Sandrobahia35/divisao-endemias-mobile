import React from 'react';

type PageType = 'home' | 'form' | 'reports' | 'users' | 'admin';

interface BottomNavigationProps {
    currentPage: PageType;
    onNavigate: (page: PageType) => void;
}

interface NavItem {
    id: PageType;
    icon: string;
    iconFilled: string;
    label: string;
}

const navItems: NavItem[] = [
    { id: 'home', icon: 'home', iconFilled: 'home', label: 'Início' },
    { id: 'form', icon: 'add_circle', iconFilled: 'add_circle', label: 'Novo' },
    { id: 'reports', icon: 'list_alt', iconFilled: 'list_alt', label: 'Relatórios' },
    { id: 'users', icon: 'person', iconFilled: 'person', label: 'Perfil' },
    { id: 'admin', icon: 'settings', iconFilled: 'settings', label: 'Admin' },
];

export const BottomNavigation: React.FC<BottomNavigationProps> = ({ currentPage, onNavigate }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-800 shadow-lg md:hidden">
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const isActive = currentPage === item.id;
                    const isNew = item.id === 'form';

                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                flex flex-col items-center justify-center flex-1 h-full relative
                transition-all duration-200
                ${isActive
                                    ? 'text-primary'
                                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                }
              `}
                        >
                            {/* Indicador ativo */}
                            {isActive && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary rounded-b-full" />
                            )}

                            {/* Botão especial para "Novo" */}
                            {isNew ? (
                                <div className={`
                  w-11 h-11 -mt-4 rounded-full flex items-center justify-center shadow-lg transition-all
                  ${isActive
                                        ? 'bg-primary text-white scale-110'
                                        : 'bg-primary/90 text-white hover:bg-primary hover:scale-105'
                                    }
                `}>
                                    <span className="material-symbols-outlined material-symbols-filled text-xl">
                                        {item.iconFilled}
                                    </span>
                                </div>
                            ) : (
                                <span className={`material-symbols-outlined text-xl ${isActive ? 'material-symbols-filled' : ''}`}>
                                    {isActive ? item.iconFilled : item.icon}
                                </span>
                            )}

                            {/* Label */}
                            <span className={`text-[9px] font-semibold mt-1 ${isNew ? 'mt-0' : ''}`}>
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Safe area para dispositivos com notch */}
            <div className="h-safe-bottom bg-white dark:bg-surface-dark" />
        </nav>
    );
};

export type { PageType };

