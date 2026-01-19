
import React from 'react';
import { FormData } from '../types';

interface DepositsStepProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
}

export const DepositsStep: React.FC<DepositsStepProps> = ({ data, onChange }) => {
  // Verificar tipo de atividade selecionada
  const hasT = data.tipoAtividade.includes('T');
  const hasLI = data.tipoAtividade.includes('LI');
  const hasLIT = data.tipoAtividade.includes('LI+T');
  const hasPE = data.tipoAtividade.includes('PE');

  // Lógica de desabilitação:
  // - Se APENAS "T" está selecionado: desabilita depósitos A1-E
  // - LI, LI+T, PE: habilita depósitos A1-E
  const isOnlyT = hasT && !hasLI && !hasLIT && !hasPE;
  const disableDeposits = isOnlyT;

  const categories = [
    { id: 'A1', label: 'Elevado (A1)', desc: "Caixa d'água", color: 'bg-blue-50 text-blue-700' },
    { id: 'A2', label: 'Nível Solo (A2)', desc: 'Tambor, tonel', color: 'bg-blue-50 text-blue-700' },
    { id: 'B', label: 'Peq. Móvel (B)', desc: 'Vaso, balde', color: 'bg-indigo-50 text-indigo-700' },
    { id: 'C', label: 'Fixo (C)', desc: 'Calha, laje', color: 'bg-purple-50 text-purple-700' },
    { id: 'D1', label: 'Pneus (D1)', desc: 'Rodantes', color: 'bg-orange-50 text-orange-700' },
    { id: 'D2', label: 'Lixo (D2)', desc: 'Sucata', color: 'bg-orange-50 text-orange-700' },
    { id: 'E', label: 'Natural (E)', desc: 'Bromélia, oco', color: 'bg-emerald-50 text-emerald-700' },
  ];

  const updateCount = (id: string, val: string) => {
    if (disableDeposits) return;
    const numVal = val === '' ? 0 : parseInt(val, 10);
    if (!isNaN(numVal)) {
      onChange({
        depositos: { ...data.depositos, [id]: Math.max(0, numVal) }
      });
    }
  };

  const handleStep = (id: string, delta: number) => {
    if (disableDeposits) return;
    const current = data.depositos[id as keyof typeof data.depositos] || 0;
    updateCount(id, (current + delta).toString());
  };

  const total = (Object.values(data.depositos) as number[]).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300 px-4 pt-4 pb-24">
      {/* Aviso quando desabilitado */}
      {disableDeposits && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-amber-500 text-2xl">warning</span>
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Seção Bloqueada</p>
            <p className="text-xs text-amber-600 dark:text-amber-500">Esta seção não está disponível para o tipo de atividade "T" (Tratamento). Selecione LI, LI+T ou PE para habilitar.</p>
          </div>
        </div>
      )}

      {/* Resumo de Produção */}
      <section className={`grid grid-cols-2 gap-4 ${disableDeposits ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="rounded-xl bg-white dark:bg-surface-dark p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Inspecionados</p>
          <p className="text-4xl font-black text-primary tracking-tight">{total}</p>
        </div>
        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-5 shadow-sm border border-red-100 dark:border-red-800/30 flex flex-col items-center text-center">
          <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">Total Eliminados</p>
          <p className="text-4xl font-black text-red-600 dark:text-red-400 tracking-tight">{data.eliminados}</p>
        </div>
      </section>

      {/* Lista de Categorias com Input Numérico */}
      <section className={`flex flex-col gap-4 ${disableDeposits ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-2 px-1">
          <span className="material-symbols-outlined text-primary">view_list</span>
          <h3 className="text-slate-900 dark:text-white text-lg font-bold">Detalhamento por Categoria</h3>
          {disableDeposits && <span className="text-[8px] bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full font-bold">BLOQUEADO</span>}
        </div>

        <div className="flex flex-col gap-3">
          {categories.map(cat => (
            <div key={cat.id} className="bg-white dark:bg-surface-dark p-3 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-black text-sm ${cat.color} dark:bg-opacity-20 border border-current opacity-80`}>
                  {cat.id}
                </div>
                <div className="flex flex-col min-w-0">
                  <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{cat.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{cat.desc}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => handleStep(cat.id, -1)}
                  disabled={disableDeposits}
                  className={`w-8 h-8 flex items-center justify-center rounded-md bg-white dark:bg-slate-800 shadow-sm text-slate-400 active:scale-90 ${disableDeposits ? 'cursor-not-allowed' : ''}`}
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <input
                  type="number"
                  inputMode="numeric"
                  className={`w-14 h-8 p-0 text-center bg-transparent border-none text-lg font-black text-slate-900 dark:text-white focus:ring-0 ${disableDeposits ? 'cursor-not-allowed' : ''}`}
                  value={data.depositos[cat.id as keyof typeof data.depositos]}
                  onChange={e => updateCount(cat.id, e.target.value)}
                  disabled={disableDeposits}
                />
                <button
                  onClick={() => handleStep(cat.id, 1)}
                  disabled={disableDeposits}
                  className={`w-8 h-8 flex items-center justify-center rounded-md bg-primary text-white shadow-sm active:scale-90 ${disableDeposits ? 'cursor-not-allowed opacity-50' : ''}`}
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Seção de Eliminados com Input Numérico Grande */}
      <section className="mt-4">
        <div className="bg-white dark:bg-surface-dark rounded-2xl p-6 shadow-md border-2 border-red-100 dark:border-red-900/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-xl text-red-600">
              <span className="material-symbols-outlined">delete_forever</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Depósitos Eliminados</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Inserção direta de recipientes removidos</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              className="w-full h-20 text-center text-5xl font-black rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 text-red-600 focus:border-red-500 focus:ring-red-500 transition-all"
              value={data.eliminados}
              placeholder="0"
              onChange={e => {
                const val = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
                if (!isNaN(val)) onChange({ eliminados: Math.max(0, val) });
              }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-4">
              <button
                onClick={() => onChange({ eliminados: Math.max(0, data.eliminados - 1) })}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-800 shadow-md text-slate-400 border border-slate-100 dark:border-slate-700 active:scale-90"
              >
                <span className="material-symbols-outlined">remove</span>
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-4">
              <button
                onClick={() => onChange({ eliminados: data.eliminados + 1 })}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-red-600 shadow-md text-white active:scale-90"
              >
                <span className="material-symbols-outlined">add</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
