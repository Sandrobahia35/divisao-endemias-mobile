import React, { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
    label: string;
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    label,
    options,
    selected,
    onChange,
    placeholder = 'Selecione...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const toggleOption = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    const handleSelectAll = () => {
        if (selected.length === options.length) {
            onChange([]);
        } else {
            onChange([...options]);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm hover:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
                <div className="flex flex-wrap gap-1 max-w-[90%] overflow-hidden text-left">
                    {selected.length === 0 ? (
                        <span className="text-slate-400 text-sm">{placeholder}</span>
                    ) : selected.length <= 2 ? (
                        selected.map(item => (
                            <span key={item} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-md font-medium">
                                {item}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-700 dark:text-slate-200 text-sm font-medium">
                            {selected.length} selecionados
                        </span>
                    )}
                </div>
                <span className="material-symbols-outlined text-slate-400 text-xl">
                    {isOpen ? 'expand_less' : 'expand_more'}
                </span>
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                        <button
                            onClick={handleSelectAll}
                            className="w-full text-left px-2 py-1 text-xs font-bold text-primary hover:bg-primary/5 rounded transition-colors"
                        >
                            {selected.length === options.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                        </button>
                    </div>
                    <div className="p-1">
                        {options.length > 0 ? (
                            options.map(option => (
                                <button
                                    key={option}
                                    onClick={() => toggleOption(option)}
                                    className="w-full flex items-center gap-2 px-2 py-2 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-md transition-colors group"
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(option)
                                            ? 'bg-primary border-primary'
                                            : 'border-slate-300 dark:border-slate-600 group-hover:border-primary'
                                        }`}>
                                        {selected.includes(option) && (
                                            <span className="material-symbols-outlined text-[10px] text-white font-bold">check</span>
                                        )}
                                    </div>
                                    <span className={`text-sm ${selected.includes(option)
                                            ? 'text-primary font-semibold'
                                            : 'text-slate-600 dark:text-slate-300'
                                        }`}>
                                        {option}
                                    </span>
                                </button>
                            ))
                        ) : (
                            <div className="px-4 py-3 text-center text-sm text-slate-400">
                                Sem opções disponíveis
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
