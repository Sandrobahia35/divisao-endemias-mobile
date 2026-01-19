import React from 'react';

interface SemanaData {
    semana: string;
    count: number;
}

interface SemanaSelectorProps {
    semanas: SemanaData[];
    selectedSemana: string | null;
    onSelectSemana: (semana: string | null) => void;
    totalReports: number;
}

export const SemanaSelector: React.FC<SemanaSelectorProps> = ({
    semanas,
    selectedSemana,
    onSelectSemana,
    totalReports
}) => {
    // Gerar opções de todas as semanas que têm dados
    const semanasComDados = semanas.filter(s => s.count > 0);

    return (
        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            {/* Header com estatísticas */}
            <div className="bg-gradient-to-r from-primary to-blue-600 p-4 text-white">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <span className="material-symbols-outlined text-2xl">analytics</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Relatórios por Semana</h3>
                        <p className="text-sm text-white/80">{totalReports} {totalReports === 1 ? 'registro' : 'registros'} em {semanasComDados.length} {semanasComDados.length === 1 ? 'semana' : 'semanas'}</p>
                    </div>
                </div>
            </div>

            {/* Campo de seleção profissional */}
            <div className="p-4">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Selecione a Semana Epidemiológica
                </label>
                <div className="relative">
                    <select
                        value={selectedSemana || ''}
                        onChange={(e) => onSelectSemana(e.target.value || null)}
                        className="w-full h-14 px-4 pr-12 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-base font-semibold appearance-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                    >
                        <option value="">-- Selecione uma Semana --</option>
                        {Array.from({ length: 52 }, (_, i) => {
                            const seNum = String(i + 1).padStart(2, '0');
                            const seKey = `SE ${seNum}`;
                            const found = semanas.find(s => s.semana === seKey);
                            const count = found?.count || 0;

                            return (
                                <option key={seKey} value={seKey} disabled={count === 0}>
                                    {seKey} {count > 0 ? `(${count} ${count === 1 ? 'localidade' : 'localidades'})` : '(sem dados)'}
                                </option>
                            );
                        })}
                    </select>

                    {/* Ícone customizado */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400 text-2xl">expand_more</span>
                    </div>
                </div>

                {/* Dica visual */}
                {!selectedSemana && semanasComDados.length > 0 && (
                    <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">info</span>
                        Semanas com dados: {semanasComDados.map(s => s.semana.replace('SE ', '')).join(', ')}
                    </p>
                )}

                {/* Botão para limpar quando selecionado */}
                {selectedSemana && (
                    <button
                        onClick={() => onSelectSemana(null)}
                        className="mt-3 w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Limpar seleção
                    </button>
                )}
            </div>
        </div>
    );
};
