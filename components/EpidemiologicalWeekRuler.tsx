import React, { useState, useCallback, useRef, useEffect } from 'react';

interface EpidemiologicalWeekRulerProps {
    selectedWeeks: string[];
    onSelectionChange: (weeks: string[]) => void;
    weeksWithData?: string[];
}

/**
 * Régua interativa de semanas epidemiológicas
 * Suporta seleção única, múltipla (Ctrl+click) e por intervalo (Shift+click ou drag)
 */
export const EpidemiologicalWeekRuler: React.FC<EpidemiologicalWeekRulerProps> = ({
    selectedWeeks,
    onSelectionChange,
    weeksWithData = []
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<number | null>(null);
    const [lastClickedWeek, setLastClickedWeek] = useState<number | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Gera semanas de 01 a 52
    const weeks = Array.from({ length: 52 }, (_, i) => {
        const num = (i + 1).toString().padStart(2, '0');
        return `SE ${num}`;
    });

    // Semana atual do ano
    const currentWeek = Math.ceil((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));

    const getWeekNumber = (week: string) => parseInt(week.replace('SE ', ''));

    const handleWeekClick = useCallback((week: string, event: React.MouseEvent) => {
        const weekNum = getWeekNumber(week);

        if (event.shiftKey && lastClickedWeek !== null) {
            // Seleção por intervalo
            const start = Math.min(lastClickedWeek, weekNum);
            const end = Math.max(lastClickedWeek, weekNum);
            const rangeWeeks = weeks.filter(w => {
                const num = getWeekNumber(w);
                return num >= start && num <= end;
            });
            onSelectionChange(rangeWeeks);
        } else if (event.ctrlKey || event.metaKey) {
            // Toggle individual
            if (selectedWeeks.includes(week)) {
                onSelectionChange(selectedWeeks.filter(w => w !== week));
            } else {
                onSelectionChange([...selectedWeeks, week]);
            }
        } else {
            // Seleção única
            if (selectedWeeks.length === 1 && selectedWeeks[0] === week) {
                onSelectionChange([]); // Deselect if clicking same week
            } else {
                onSelectionChange([week]);
            }
        }

        setLastClickedWeek(weekNum);
    }, [selectedWeeks, lastClickedWeek, weeks, onSelectionChange]);

    const handleMouseDown = (weekNum: number) => {
        setIsDragging(true);
        setDragStart(weekNum);
    };

    const handleMouseEnter = (weekNum: number) => {
        if (isDragging && dragStart !== null) {
            const start = Math.min(dragStart, weekNum);
            const end = Math.max(dragStart, weekNum);
            const rangeWeeks = weeks.filter(w => {
                const num = getWeekNumber(w);
                return num >= start && num <= end;
            });
            onSelectionChange(rangeWeeks);
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        setDragStart(null);
    };

    useEffect(() => {
        const handleGlobalMouseUp = () => {
            setIsDragging(false);
            setDragStart(null);
        };
        window.addEventListener('mouseup', handleGlobalMouseUp);
        return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
    }, []);

    const handleClearSelection = () => {
        onSelectionChange([]);
    };

    const handleSelectAll = () => {
        onSelectionChange(weeks);
    };

    const handleSelectWithData = () => {
        onSelectionChange(weeksWithData);
    };

    return (
        <div className="bg-white dark:bg-surface-dark rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/5 to-blue-500/5 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">calendar_month</span>
                    <h3 className="font-bold text-slate-700 dark:text-white text-sm">Semanas Epidemiológicas</h3>
                    {selectedWeeks.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
                            {selectedWeeks.length} selecionada{selectedWeeks.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {weeksWithData.length > 0 && (
                        <button
                            onClick={handleSelectWithData}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        >
                            Com dados ({weeksWithData.length})
                        </button>
                    )}
                    <button
                        onClick={handleSelectAll}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        Todas
                    </button>
                    {selectedWeeks.length > 0 && (
                        <button
                            onClick={handleClearSelection}
                            className="text-xs font-semibold text-red-500 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-sm">close</span>
                            Limpar
                        </button>
                    )}
                </div>
            </div>

            {/* Instruções */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 flex items-center gap-3">
                    <span>🖱️ Clique = única</span>
                    <span>⌘/Ctrl + clique = múltipla</span>
                    <span>⇧ Shift + clique = intervalo</span>
                    <span>Arraste = intervalo</span>
                </p>
            </div>

            {/* Ruler Container with Scroll */}
            <div className="relative">
                {/* Scroll Left Button */}
                <button
                    onClick={() => {
                        if (containerRef.current) {
                            containerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
                        }
                    }}
                    className="absolute left-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-r from-white via-white to-transparent dark:from-surface-dark dark:via-surface-dark flex items-center justify-center hover:from-slate-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-500 hover:text-primary transition-colors">chevron_left</span>
                </button>

                {/* Scroll Right Button */}
                <button
                    onClick={() => {
                        if (containerRef.current) {
                            containerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
                        }
                    }}
                    className="absolute right-0 top-0 bottom-0 z-20 px-2 bg-gradient-to-l from-white via-white to-transparent dark:from-surface-dark dark:via-surface-dark flex items-center justify-center hover:from-slate-100 transition-colors"
                >
                    <span className="material-symbols-outlined text-slate-500 hover:text-primary transition-colors">chevron_right</span>
                </button>

                {/* Scrollable Week Ruler */}
                <div
                    ref={containerRef}
                    className="overflow-x-auto p-4 px-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent hover:scrollbar-thumb-slate-400"
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ scrollbarWidth: 'thin' }}
                >
                    <div className="flex gap-1 min-w-max">
                        {weeks.map((week, index) => {
                            const weekNum = index + 1;
                            const isSelected = selectedWeeks.includes(week);
                            const hasData = weeksWithData.includes(week);
                            const isCurrent = weekNum === currentWeek;

                            return (
                                <button
                                    key={week}
                                    onClick={(e) => handleWeekClick(week, e)}
                                    onMouseDown={() => handleMouseDown(weekNum)}
                                    onMouseEnter={() => handleMouseEnter(weekNum)}
                                    className={`
                                        relative w-10 h-12 rounded-lg flex flex-col items-center justify-center
                                        text-xs font-semibold transition-all duration-150 select-none
                                        ${isSelected
                                            ? 'bg-primary text-white shadow-lg scale-105 z-10'
                                            : hasData
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                                                : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                                        }
                                        ${isCurrent && !isSelected ? 'ring-2 ring-amber-400 ring-offset-1' : ''}
                                    `}
                                    title={`${week}${hasData ? ' (com dados)' : ''}${isCurrent ? ' (atual)' : ''}`}
                                >
                                    <span className="text-[10px] opacity-60">SE</span>
                                    <span className="font-bold">{weekNum.toString().padStart(2, '0')}</span>
                                    {hasData && !isSelected && (
                                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                    {isCurrent && (
                                        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-400 rounded-full"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Quick Selection Shortcuts */}
            <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                <span className="text-[10px] text-slate-400 font-semibold mr-2">Seleção rápida:</span>
                {[
                    { label: 'Q1', start: 1, end: 13 },
                    { label: 'Q2', start: 14, end: 26 },
                    { label: 'Q3', start: 27, end: 39 },
                    { label: 'Q4', start: 40, end: 52 }
                ].map(quarter => (
                    <button
                        key={quarter.label}
                        onClick={() => {
                            const quarterWeeks = weeks.filter(w => {
                                const num = getWeekNumber(w);
                                return num >= quarter.start && num <= quarter.end;
                            });
                            onSelectionChange(quarterWeeks);
                        }}
                        className="px-2 py-1 text-[10px] font-bold rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-primary hover:text-white transition-colors"
                    >
                        {quarter.label} (SE {quarter.start.toString().padStart(2, '0')}-{quarter.end.toString().padStart(2, '0')})
                    </button>
                ))}
            </div>
        </div>
    );
};
