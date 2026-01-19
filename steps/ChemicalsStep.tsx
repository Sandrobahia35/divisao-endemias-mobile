
import React from 'react';
import { FormData } from '../types';

interface ChemicalsStepProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export const ChemicalsStep: React.FC<ChemicalsStepProps> = ({ data, onChange }) => {
  // Verificar tipo de atividade selecionada
  const hasPE = data.tipoAtividade.includes('PE');

  // Lógica de desabilitação para Adulticida:
  // - Aplicação Adulticida só está disponível para PE
  const disableAdulticida = !hasPE;

  const lData = data.larvicida1 || { tipo: '', quantidade: 0, 'dep tratados': 0 };

  const updateLarvicida = (updates: Partial<typeof lData>) => {
    onChange({
      larvicida1: { ...lData, ...updates }
    });
  };

  const handleQtdChange = (val: string) => {
    // Permite digitar pontos e decimais livremente no input type number
    const num = parseFloat(val);
    updateLarvicida({ quantidade: isNaN(num) ? 0 : num });
  };

  const handleDepTratadosChange = (val: string) => {
    const num = parseInt(val, 10);
    updateLarvicida({ 'dep tratados': isNaN(num) ? 0 : Math.max(0, num) });
  };

  return (
    <div className="flex flex-col px-4 pt-4 pb-24 animate-in fade-in slide-in-from-right-4 duration-300">
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="material-symbols-outlined text-primary">pest_control</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Controle de Larvicida</h3>
        </div>

        <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-6">
          {/* SELETOR DE LARVICIDA */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Tipo de Larvicida <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <select
                value={lData.tipo}
                onChange={e => updateLarvicida({ tipo: e.target.value })}
                className="w-full h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 pl-4 pr-10 text-base font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all"
              >
                <option value="" className="dark:bg-slate-800">Selecione o produto</option>
                <option value="BTI" className="dark:bg-slate-800">BTI (Bacillus thuringiensis)</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform">
                expand_more
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* QUANTIDADE DECIMAL */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Qtd (gramas)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={lData.quantidade || ''}
                  onChange={e => handleQtdChange(e.target.value)}
                  className="w-full h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-4 text-lg font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">g</div>
              </div>
            </div>

            {/* DEPÓSITOS TRATADOS COM CONTADOR FUNCIONAL */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Dep. Tratados
              </label>
              <div className="flex h-14 items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner">
                <button
                  type="button"
                  onClick={() => updateLarvicida({ 'dep tratados': Math.max(0, (lData['dep tratados'] || 0) - 1) })}
                  className="h-full px-5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all border-r border-slate-200 dark:border-slate-700"
                >
                  <span className="material-symbols-outlined font-bold">remove</span>
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={lData['dep tratados'] || ''}
                  onChange={e => handleDepTratadosChange(e.target.value)}
                  className="flex-1 h-full text-center bg-transparent border-none text-xl font-black text-slate-900 dark:text-white focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => updateLarvicida({ 'dep tratados': (lData['dep tratados'] || 0) + 1 })}
                  className="h-full px-5 text-primary hover:bg-primary/10 active:scale-95 transition-all border-l border-slate-200 dark:border-slate-700"
                >
                  <span className="material-symbols-outlined font-bold">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ADULTICIDA */}
      <section className={disableAdulticida ? 'opacity-50' : ''}>
        <div className="flex items-center gap-2 mb-4 px-1">
          <span className="material-symbols-outlined text-primary">bug_report</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Aplicação Adulticida</h3>
          {disableAdulticida && (
            <span className="text-[8px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">APENAS PE</span>
          )}
        </div>

        {/* Aviso quando desabilitado */}
        {disableAdulticida && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3 mb-4">
            <span className="material-symbols-outlined text-amber-500 text-2xl">info</span>
            <div>
              <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Seção Disponível Apenas para PE</p>
              <p className="text-xs text-amber-600 dark:text-amber-500">Para habilitar esta seção, selecione o tipo de atividade "PE" (Ponto Estratégico) na Etapa 2.</p>
            </div>
          </div>
        )}

        <div className={`bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-5 space-y-6 ${disableAdulticida ? 'pointer-events-none' : ''}`}>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipo de Aplicação</label>
            <div className="relative group">
              <select
                value={data.adulticida.tipo}
                onChange={e => onChange({ adulticida: { ...data.adulticida, tipo: e.target.value } })}
                disabled={disableAdulticida}
                className={`w-full h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 pl-4 pr-10 text-base font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary appearance-none transition-all ${disableAdulticida ? 'cursor-not-allowed' : ''}`}
              >
                <option value="" className="dark:bg-slate-800">Nenhuma aplicação</option>
                <option value="ubv_costal" className="dark:bg-slate-800">UBV Costal</option>
                <option value="ubv_pesado" className="dark:bg-slate-800">UBV Pesado (Fumacê)</option>
                <option value="termonebulizacao" className="dark:bg-slate-800">Termonebulização</option>
              </select>
              <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none group-focus-within:rotate-180 transition-transform">
                expand_more
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Quantidade (Cargas)</label>
            <div className={`flex h-14 items-center bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-inner ${disableAdulticida ? 'cursor-not-allowed' : ''}`}>
              <button
                type="button"
                onClick={() => onChange({ adulticida: { ...data.adulticida, cargas: Math.max(0, data.adulticida.cargas - 1) } })}
                disabled={disableAdulticida}
                className={`h-full px-5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all border-r border-slate-200 dark:border-slate-700 ${disableAdulticida ? 'cursor-not-allowed' : ''}`}
              >
                <span className="material-symbols-outlined font-bold">remove</span>
              </button>
              <input
                type="number"
                inputMode="numeric"
                placeholder="0"
                value={data.adulticida.cargas || ''}
                onChange={e => {
                  const val = parseInt(e.target.value, 10);
                  onChange({ adulticida: { ...data.adulticida, cargas: isNaN(val) ? 0 : Math.max(0, val) } });
                }}
                disabled={disableAdulticida}
                className={`flex-1 h-full text-center bg-transparent border-none text-xl font-black text-slate-900 dark:text-white focus:ring-0 ${disableAdulticida ? 'cursor-not-allowed' : ''}`}
              />
              <button
                type="button"
                onClick={() => onChange({ adulticida: { ...data.adulticida, cargas: data.adulticida.cargas + 1 } })}
                disabled={disableAdulticida}
                className={`h-full px-5 text-primary hover:bg-primary/10 active:scale-95 transition-all border-l border-slate-200 dark:border-slate-700 ${disableAdulticida ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                <span className="material-symbols-outlined font-bold">add</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
