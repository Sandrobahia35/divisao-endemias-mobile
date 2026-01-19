
import React, { useEffect } from 'react';
import { FormData } from '../types';
import { TIPO_ATIVIDADES } from '../constants';

interface PeriodStepProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export const PeriodStep: React.FC<PeriodStepProps> = ({ data, onChange }) => {
  const toggleAtividade = (tipo: string) => {
    const updated = data.tipoAtividade.includes(tipo)
      ? data.tipoAtividade.filter(t => t !== tipo)
      : [...data.tipoAtividade, tipo];
    onChange({ tipoAtividade: updated });
  };

  // Função para calcular a Semana Epidemiológica
  const calculateEpidemiologicalWeek = (dateString: string): string => {
    if (!dateString) return 'SE --';
    
    const date = new Date(dateString + 'T12:00:00'); // Evita problemas de timezone
    const year = date.getFullYear();
    
    // Primeiro dia do ano
    const firstDayOfYear = new Date(year, 0, 1);
    // Primeiro domingo do ano (Início da SE 01)
    const firstSunday = new Date(year, 0, 1);
    firstSunday.setDate(1 + (7 - firstDayOfYear.getDay()) % 7);
    
    // Se a data for antes do primeiro domingo, ela pertence à última SE do ano anterior
    if (date < firstSunday) {
      return calculateEpidemiologicalWeek(`${year - 1}-12-31`);
    }
    
    const diffInMs = date.getTime() - firstSunday.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    const weekNumber = Math.floor(diffInDays / 7) + 1;
    
    return `SE ${weekNumber.toString().padStart(2, '0')}`;
  };

  // Atualiza a SE sempre que a data de início mudar (comportamento inteligente)
  useEffect(() => {
    if (data.dataInicio) {
      const se = calculateEpidemiologicalWeek(data.dataInicio);
      if (se !== data.semanaEpidemiologica && !data.semanaEpidemiologica.includes('manual')) {
        onChange({ semanaEpidemiologica: se });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.dataInicio]);

  // Gera array de 1 a 24 para ciclos
  const ciclos = Array.from({ length: 24 }, (_, i) => i + 1);
  
  // Gera array de 2025 a 2035 para anos
  const anos = Array.from({ length: 11 }, (_, i) => 2025 + i);

  // Gera array de 1 a 52 para semanas epidemiológicas
  const semanas = Array.from({ length: 52 }, (_, i) => `SE ${(i + 1).toString().padStart(2, '0')}`);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300 px-4 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Definição de Período</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Preencha os dados da operação de campo.</p>
      </div>

      <section>
        <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">description</span>
          Detalhes da Operação
        </h3>
        
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-slate-900 dark:text-white text-base font-medium">Tipo de Atividade</label>
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 uppercase font-semibold">Selecione as aplicáveis:</p>
              <div className="flex flex-wrap gap-2">
                {TIPO_ATIVIDADES.map(tipo => {
                  const isActive = data.tipoAtividade.includes(tipo);
                  return (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => toggleAtividade(tipo)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-primary text-white shadow-sm ring-2 ring-primary ring-offset-1 dark:ring-offset-background-dark' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {isActive && <span className="material-symbols-outlined text-[18px]">check</span>}
                      {tipo}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-slate-900 dark:text-white text-base font-medium pb-2">Ciclo</p>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 z-10 pointer-events-none">
                  <span className="material-symbols-outlined">sync</span>
                </span>
                <select 
                  className="form-select w-full rounded-xl bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 pl-10 h-12 text-slate-900 dark:text-white appearance-none"
                  value={data.ciclo}
                  onChange={e => onChange({ ciclo: Number(e.target.value) })}
                >
                  {ciclos.map(c => (
                    <option key={c} value={c}>
                      {c.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-slate-900 dark:text-white text-base font-medium pb-2">Ano</p>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 z-10 pointer-events-none">
                  <span className="material-symbols-outlined">calendar_today</span>
                </span>
                <select 
                  className="form-select w-full rounded-xl bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 pl-10 h-12 text-slate-900 dark:text-white appearance-none"
                  value={data.ano}
                  onChange={e => onChange({ ano: Number(e.target.value) })}
                >
                  {anos.map(a => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-primary text-sm font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">schedule</span>
          CALENDÁRIO DA SEMANA
        </h3>
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-xl">event_available</span>
                Início (Domingo)
              </span>
              <input 
                type="date"
                className="form-input w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 px-3 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                value={data.dataInicio}
                onChange={e => onChange({ dataInicio: e.target.value })}
              />
            </label>
            
            <label className="flex flex-col gap-2">
              <span className="text-slate-700 dark:text-slate-300 text-[13px] font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-red-500 text-xl">event_busy</span>
                Término (Sábado)
              </span>
              <input 
                type="date"
                className="form-input w-full rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 h-12 px-3 text-sm text-slate-900 dark:text-white focus:ring-primary focus:border-primary"
                value={data.dataFim}
                onChange={e => onChange({ dataFim: e.target.value })}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 bg-primary/5 dark:bg-primary/10 rounded-xl p-4 border border-primary/20 flex items-center justify-between">
          <div className="flex items-center gap-4 w-full">
            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[28px] material-symbols-filled">event_note</span>
            </div>
            <div className="flex-1">
              <p className="text-primary dark:text-blue-400 text-xs font-bold uppercase tracking-wide">Semana Epidemiológica</p>
              <select 
                value={data.semanaEpidemiologica}
                onChange={e => onChange({ semanaEpidemiologica: e.target.value })}
                className="w-full bg-transparent border-none p-0 text-2xl font-bold text-slate-900 dark:text-white focus:ring-0 appearance-none cursor-pointer"
              >
                <option value="SE --" disabled>SE --</option>
                {semanas.map(se => (
                  <option key={se} value={se} className="dark:bg-slate-800 text-base">{se}</option>
                ))}
              </select>
            </div>
            <span className="material-symbols-outlined text-slate-400">expand_more</span>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-900 dark:text-white">Concluído</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Marcar ciclo como finalizado</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={data.concluido}
              onChange={e => onChange({ concluido: e.target.checked })}
            />
            <div className="w-14 h-8 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>
      </section>
    </div>
  );
};
