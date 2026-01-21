
import React from 'react';
import { FormData } from '../types';
import { NumberStepper } from '../components/NumberStepper';

interface HumanResourcesStepProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export const HumanResourcesStep: React.FC<HumanResourcesStepProps> = ({ data, onChange }) => {
  return (
    <div className="flex-1 flex flex-col gap-6 p-4 pb-20 animate-in fade-in slide-in-from-right-4 duration-300">
      <section className="flex flex-col gap-4">
        {/* Detalhamento da Equipe agora em primeiro */}
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-primary">groups</span>
          <h3 className="text-slate-900 dark:text-white text-lg font-bold">Detalhamento da Equipe</h3>
        </div>

        <div className="flex flex-col rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
          <NumberStepper
            label="Homen/Dia trabalhado"
            sublabel="Quantidade total"
            value={data.agentes}
            onChange={v => onChange({ agentes: v })}
          />
          <NumberStepper
            label="Dias Trabalhados"
            sublabel="Total de dias na semana"
            value={data.diasTrabalhados}
            max={7}
            onChange={v => onChange({ diasTrabalhados: v })}
          />
        </div>

        {/* Identificação do Responsável agora em segundo */}
        <div className="flex items-center gap-2 px-1 mt-4">
          <span className="material-symbols-outlined text-primary">person</span>
          <h3 className="text-slate-900 dark:text-white text-lg font-bold">Identificação do Responsável</h3>
        </div>

        <div className="rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm p-4">
          <label className="flex flex-col w-full gap-2">
            <span className="text-slate-700 dark:text-slate-300 text-sm font-semibold italic">Nome do Supervisor</span>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <span className="material-symbols-outlined text-lg">badge</span>
              </span>
              <input
                className="w-full rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-12 pl-10 pr-4 placeholder:text-slate-400 text-slate-900 dark:text-white focus:ring-primary focus:border-primary transition-all"
                placeholder="Digite o nome completo"
                type="text"
                value={data.nomeSupervisor}
                onChange={e => onChange({ nomeSupervisor: e.target.value })}
              />
            </div>
          </label>
        </div>
      </section>
    </div>
  );
};
