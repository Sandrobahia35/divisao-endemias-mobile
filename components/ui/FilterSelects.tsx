import React, { useState, useRef, useEffect } from 'react';

interface FilterSelectProps {
    options: string[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    label?: string;
}

// Estilo 1: Input Select (para Localidades)
export const LocalidadeSelect: React.FC<FilterSelectProps> = ({
    options,
    selected,
    onChange,
    placeholder = "Selecione a localidade",
    label = "Localidade"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    return (
        <div className="w-full" ref={containerRef}>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {label} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl text-left transition-all ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                >
                    <span className={`block truncate ${selected.length === 0 ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                        {selected.length === 0
                            ? placeholder
                            : selected.length === 1
                                ? selected[0]
                                : `${selected.length} selecionadas`}
                    </span>
                    <span className="material-symbols-outlined text-slate-400">expand_more</span>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        <div className="p-2 space-y-1">
                            {options.map(option => {
                                const isSelected = selected.includes(option);
                                return (
                                    <button
                                        key={option}
                                        onClick={() => toggleOption(option)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isSelected
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600'
                                            }`}>
                                            {isSelected && <span className="material-symbols-outlined text-white text-xs font-bold">check</span>}
                                        </div>
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// Estilo 2: Input Select (Agrupado/Grid) para Semanas
export const SemanaSelect: React.FC<FilterSelectProps> = ({
    options,
    selected,
    onChange,
    placeholder = "Todas as semanas",
    label = "Semana Epidemiológica"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (option: string) => {
        const newSelected = selected.includes(option)
            ? selected.filter(item => item !== option)
            : [...selected, option];
        onChange(newSelected);
    };

    return (
        <div className="w-full" ref={containerRef}>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border-2 rounded-xl text-left transition-all ${isOpen ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'
                        }`}
                >
                    <span className={`block truncate ${selected.length === 0 ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
                        {selected.length === 0
                            ? placeholder
                            : selected.length === 1
                                ? selected[0]
                                : `${selected.length} selecionadas`}
                    </span>
                    <span className="material-symbols-outlined text-slate-400">expand_more</span>
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        <div className="p-2 grid grid-cols-4 gap-2">
                            {options.map(option => {
                                const isSelected = selected.includes(option);
                                const weekNum = option.replace(/\D/g, '');

                                return (
                                    <button
                                        key={option}
                                        onClick={() => toggleOption(option)}
                                        className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-bold transition-all border ${isSelected
                                                ? 'bg-blue-500 text-white border-blue-500 shadow-sm'
                                                : 'bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300'
                                            }`}
                                    >
                                        <span className="text-[10px] opacity-70">SE</span>
                                        <span className="text-base">{weekNum}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
