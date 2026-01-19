
import React from 'react';
import { FormData } from '../types';

interface SummaryStepProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export const SummaryStep: React.FC<SummaryStepProps> = ({ data, onChange }) => {
  // Verificar tipo de atividade selecionada
  const hasT = data.tipoAtividade.includes('T');
  const hasLI = data.tipoAtividade.includes('LI');
  const hasLIT = data.tipoAtividade.includes('LI+T');
  const hasPE = data.tipoAtividade.includes('PE');

  // Lógica de desabilitação:
  // - Se APENAS "T" está selecionado: desabilita Amostras e Inspecionados
  // - LI, LI+T, PE: habilita Amostras e Inspecionados
  const isOnlyT = hasT && !hasLI && !hasLIT && !hasPE;
  const disableAmostrasAndInspecionados = isOnlyT;

  const updateImoveis = (field: keyof typeof data.imoveis, val: string) => {
    const numVal = val === '' ? 0 : parseInt(val, 10);
    if (!isNaN(numVal)) {
      onChange({
        imoveis: { ...data.imoveis, [field]: Math.max(0, numVal) }
      });
    }
  };

  const updateTratamentos = (field: keyof typeof data.tratamentos, val: string) => {
    const numVal = val === '' ? 0 : parseInt(val, 10);
    if (!isNaN(numVal)) {
      onChange({
        tratamentos: { ...data.tratamentos, [field]: Math.max(0, numVal) }
      });
    }
  };

  // Soma apenas as categorias principais de imóveis para o Total Trabalhado
  const totalImoveisTrabalhados = (
    data.imoveis.residencias +
    data.imoveis.comercios +
    data.imoveis.terrenos +
    data.imoveis.pontos +
    data.imoveis.outros
  );

  // Cálculo automático: Informados = Total Geral + Fechados - Recuperados
  const calculatedInformados = totalImoveisTrabalhados + data.imoveis.fechados - data.imoveis.recuperados;

  // Cálculo automático: Pendência % = (Fechados - Recuperados) / Informados * 100
  const calculatedPendencia = calculatedInformados > 0
    ? Math.round(((data.imoveis.fechados - data.imoveis.recuperados) / calculatedInformados) * 100 * 100) / 100
    : 0;

  // Atualizar informados e pendência automaticamente quando os valores mudarem
  React.useEffect(() => {
    const updates: Partial<typeof data.imoveis> = {};

    if (data.imoveis.informados !== calculatedInformados) {
      updates.informados = calculatedInformados;
    }
    if (data.imoveis.pendencia !== calculatedPendencia) {
      updates.pendencia = calculatedPendencia;
    }

    if (Object.keys(updates).length > 0) {
      onChange({
        imoveis: { ...data.imoveis, ...updates }
      });
    }
  }, [totalImoveisTrabalhados, data.imoveis.fechados, data.imoveis.recuperados]);

  return (
    <div className="flex-1 w-full p-4 flex flex-col gap-6 pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-surface-dark py-2 px-4 rounded-full shadow-sm border border-slate-200 dark:border-slate-800 self-center">
        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
        <span>{new Date().toLocaleDateString('pt-BR')}</span>
        <span className="w-1 h-1 rounded-full bg-slate-400"></span>
        <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {/* SEÇÃO: IMÓVEIS TRABALHADOS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-primary">domain</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Imóveis Trabalhados</h2>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800">
            <EditableStatItem
              icon="home"
              label="Residências"
              value={data.imoveis.residencias}
              onChange={(v) => updateImoveis('residencias', v)}
            />
            <EditableStatItem
              icon="storefront"
              label="Comércios"
              value={data.imoveis.comercios}
              onChange={(v) => updateImoveis('comercios', v)}
            />
            <EditableStatItem
              icon="landscape"
              label="Terrenos B."
              value={data.imoveis.terrenos}
              onChange={(v) => updateImoveis('terrenos', v)}
            />
            <EditableStatItem
              icon="flag"
              label="Pontos Estr."
              value={data.imoveis.pontos}
              onChange={(v) => updateImoveis('pontos', v)}
            />
            <EditableStatItem
              icon="category"
              label="Outros"
              value={data.imoveis.outros}
              onChange={(v) => updateImoveis('outros', v)}
              span={2}
            />
          </div>

          <div className="bg-primary/5 dark:bg-primary/10 p-4 flex justify-between items-center border-t border-primary/10">
            <span className="text-sm font-bold text-primary dark:text-blue-400 uppercase tracking-wide">Total Geral</span>
            <span className="text-2xl font-bold text-primary dark:text-blue-400">{totalImoveisTrabalhados}</span>
          </div>
        </div>
      </section>

      {/* SEÇÃO: VISITAS E AMOSTRAS (Ajustada com as informações do print) */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-primary">assignment_turned_in</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Status das Visitas e Amostras</h2>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-800">
            <EditableStatusItem
              icon="science"
              label="Amostras Coletadas"
              value={data.imoveis.amostras}
              onChange={(v) => updateImoveis('amostras', v)}
              iconColor="text-purple-500"
              disabled={disableAmostrasAndInspecionados}
            />
            <EditableStatusItem
              icon="lock"
              label="Fechados"
              value={data.imoveis.fechados}
              onChange={(v) => updateImoveis('fechados', v)}
              iconColor="text-orange-500"
            />
            <EditableStatusItem
              icon="block"
              label="Recusas"
              value={data.imoveis.recusas}
              onChange={(v) => updateImoveis('recusas', v)}
              iconColor="text-red-500"
            />
            <EditableStatusItem
              icon="check_circle"
              label="Recuperados"
              value={data.imoveis.recuperados}
              onChange={(v) => updateImoveis('recuperados', v)}
              iconColor="text-green-500"
            />
            {/* Informados - Campo calculado automaticamente */}
            <div className="bg-white dark:bg-surface-dark p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-blue-500 text-[18px]">info</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">Informados</span>
                <span className="text-[8px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-full font-bold">AUTO</span>
              </div>
              <div className="relative">
                <div className="w-full h-9 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-base font-bold text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  {calculatedInformados}
                </div>
              </div>
              <p className="text-[9px] text-slate-400">
                = Total ({totalImoveisTrabalhados}) + Fechados ({data.imoveis.fechados}) - Recuperados ({data.imoveis.recuperados})
              </p>
            </div>
            {/* Pendência - Campo calculado automaticamente */}
            <div className="bg-white dark:bg-surface-dark p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-500 text-[18px]">pending_actions</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">Pendência %</span>
                <span className="text-[8px] bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-bold">AUTO</span>
              </div>
              <div className="relative">
                <div className="w-full h-9 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-base font-bold text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  {calculatedPendencia}%
                </div>
              </div>
              <p className="text-[9px] text-slate-400">
                = (Fechados ({data.imoveis.fechados}) - Recuperados ({data.imoveis.recuperados})) / Informados ({calculatedInformados}) × 100
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SEÇÃO: TRATAMENTOS REALIZADOS */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-primary">pest_control</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-white">Tratamentos Realizados</h2>
        </div>
        <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-1 divide-y divide-slate-100 dark:divide-slate-800">
            <EditableTratamentoRow
              icon="fact_check"
              label="Imóveis Inspecionados"
              value={data.tratamentos.inspecionados}
              onChange={(v) => updateTratamentos('inspecionados', v)}
              color="text-blue-600"
              bg="bg-blue-50 dark:bg-blue-900/20"
              disabled={disableAmostrasAndInspecionados}
            />
            <EditableTratamentoRow
              icon="target"
              label="Tratamento Focal"
              value={data.tratamentos.focal}
              onChange={(v) => updateTratamentos('focal', v)}
              color="text-emerald-600"
              bg="bg-emerald-50 dark:bg-emerald-900/20"
            />
            <EditableTratamentoRow
              icon="radar"
              label="Tratamento Perifocal"
              value={data.tratamentos.perifocal}
              onChange={(v) => updateTratamentos('perifocal', v)}
              color="text-purple-600"
              bg="bg-purple-50 dark:bg-purple-900/20"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

interface EditableStatItemProps {
  icon: string;
  label: string;
  value: number;
  onChange: (val: string) => void;
  span?: number;
  disabled?: boolean;
}

const EditableStatItem = ({ icon, label, value, onChange, span = 1, disabled = false }: EditableStatItemProps) => (
  <div className={`bg-white dark:bg-surface-dark p-3 flex flex-col gap-2 ${span === 2 ? 'col-span-2' : ''} ${disabled ? 'opacity-50' : ''}`}>
    <div className="flex items-center gap-1.5">
      <span className="material-symbols-outlined text-slate-400 text-[16px]">{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">{label}</span>
      {disabled && <span className="text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold">BLOQUEADO</span>}
    </div>
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        value={value || ''}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-9 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 rounded-lg text-base font-bold text-slate-800 dark:text-white focus:ring-primary focus:border-primary text-center transition-all ${disabled ? 'cursor-not-allowed' : ''}`}
      />
    </div>
  </div>
);

interface EditableStatusItemProps {
  icon: string;
  label: string;
  value: number;
  onChange: (val: string) => void;
  iconColor: string;
  disabled?: boolean;
}

const EditableStatusItem = ({ icon, label, value, onChange, iconColor, disabled = false }: EditableStatusItemProps) => (
  <div className={`bg-white dark:bg-surface-dark p-3 flex flex-col gap-2 ${disabled ? 'opacity-50' : ''}`}>
    <div className="flex items-center gap-1.5">
      <span className={`material-symbols-outlined ${iconColor} text-[18px]`}>{icon}</span>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 truncate">{label}</span>
      {disabled && <span className="text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold">BLOQUEADO</span>}
    </div>
    <div className="relative">
      <input
        type="number"
        inputMode="numeric"
        value={value || ''}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full h-9 bg-slate-50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 rounded-lg text-base font-bold text-slate-800 dark:text-white focus:ring-primary focus:border-primary text-center transition-all ${disabled ? 'cursor-not-allowed' : ''}`}
      />
    </div>
  </div>
);

interface EditableTratamentoRowProps {
  icon: string;
  label: string;
  value: number;
  onChange: (val: string) => void;
  color: string;
  bg: string;
  disabled?: boolean;
}

const EditableTratamentoRow = ({ icon, label, value, onChange, color, bg, disabled = false }: EditableTratamentoRowProps) => (
  <div className={`flex items-center justify-between p-3 bg-white dark:bg-surface-dark ${disabled ? 'opacity-50' : ''}`}>
    <div className="flex items-center gap-3">
      <div className={`${bg} ${color} p-2 rounded-lg`}>
        <span className="material-symbols-outlined text-[18px]">{icon}</span>
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{label}</span>
      {disabled && <span className="text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold">BLOQUEADO</span>}
    </div>
    <div className="flex items-center gap-2">
      <input
        type="number"
        inputMode="numeric"
        value={value || ''}
        placeholder="0"
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-16 h-9 text-center bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-base font-black text-slate-900 dark:text-white focus:ring-primary focus:border-primary ${disabled ? 'cursor-not-allowed' : ''}`}
      />
    </div>
  </div>
);
