
import React from 'react';
import { FormData } from '../types';

interface ReviewStepProps {
  data: FormData;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({ data }) => {
  const totalDepositosInspecionados = (Object.values(data.depositos) as number[]).reduce((a, b) => a + b, 0);
  const totalImoveisTrabalhados = (
    data.imoveis.residencias +
    data.imoveis.comercios +
    data.imoveis.terrenos +
    data.imoveis.pontos +
    data.imoveis.outros
  );

  // Formatar datas (com correção de timezone)
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Não informado';
    // Adiciona T12:00:00 para evitar problemas de timezone que deslocam a data
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar tipo de adulticida
  const formatAdulticida = (tipo: string) => {
    const tipos: Record<string, string> = {
      'ubv_costal': 'UBV Costal',
      'ubv_pesado': 'UBV Pesado (Fumacê)',
      'termonebulizacao': 'Termonebulização'
    };
    return tipos[tipo] || 'Nenhuma aplicação';
  };

  return (
    <div className="flex-1 flex flex-col gap-6 p-4 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-primary/10 dark:bg-primary/20 p-4 rounded-xl border border-primary/20 flex items-start gap-3">
        <span className="material-symbols-outlined text-primary mt-0.5">verified</span>
        <div className="flex flex-col">
          <p className="text-sm text-primary dark:text-blue-300 font-bold">Revisão Final</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Confira todos os dados antes de enviar o relatório.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ═══════════════════════════════════════════════════════════
            ETAPA 1: IDENTIFICAÇÃO E LOCALIZAÇÃO
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Etapa 1: Identificação</h3>
            <span className="material-symbols-outlined text-slate-300 text-lg">location_on</span>
          </div>
          <div className="p-4 grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
            <div className="col-span-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Município</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{data.municipio || 'Não informado'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] uppercase font-bold text-slate-400">Localidade</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 uppercase">{data.localidade || 'Não informada'}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Categoria</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                {data.categoriaLocalidade === '1' ? '1 - BRR' : data.categoriaLocalidade === '2' ? '2 - POV' : 'Não informada'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-slate-400">Status</p>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${data.concluido ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                {data.concluido ? 'CONCLUÍDO' : 'EM ABERTO'}
              </span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ETAPA 2: PERÍODO E ATIVIDADES
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Etapa 2: Período e Atividades</h3>
            <span className="material-symbols-outlined text-slate-300 text-lg">calendar_month</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Tipo de Atividade</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {data.tipoAtividade.length > 0 ? (
                    data.tipoAtividade.map(tipo => (
                      <span key={tipo} className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {tipo}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-xs">Não informado</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Ciclo / Ano</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Ciclo {data.ciclo} / {data.ano}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Semana Epidemiológica</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{data.semanaEpidemiologica || 'Não informada'}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Período</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {formatDate(data.dataInicio)} a {formatDate(data.dataFim)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ETAPA 3: IMÓVEIS E TRATAMENTOS
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Etapa 3: Imóveis Trabalhados</h3>
            <span className="material-symbols-outlined text-slate-300 text-lg">home_work</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Resumo principal */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Imóveis</p>
                <p className="text-xl font-black text-slate-900 dark:text-white">{totalImoveisTrabalhados}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800/30">
                <p className="text-[10px] uppercase font-bold text-blue-600 mb-1">Inspecionados</p>
                <p className="text-xl font-black text-blue-700 dark:text-blue-400">{data.tratamentos.inspecionados}</p>
              </div>
            </div>

            {/* Detalhamento de imóveis */}
            <div className="grid grid-cols-6 gap-2 text-center text-xs">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-slate-400">QTD. Q.</p>
                <p className="font-bold">{data.imoveis.numeroQuarteiroes}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-slate-400">RES</p>
                <p className="font-bold">{data.imoveis.residencias}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-slate-400">COM</p>
                <p className="font-bold">{data.imoveis.comercios}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-slate-400">T.B.</p>
                <p className="font-bold">{data.imoveis.terrenos}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-slate-400">P.E.</p>
                <p className="font-bold">{data.imoveis.pontos}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-slate-400">OUT</p>
                <p className="font-bold">{data.imoveis.outros}</p>
              </div>
            </div>

            {/* Tratamentos e Status */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-slate-500">T. Focal:</span>
                <span className="font-bold">{data.tratamentos.focal}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-slate-500">T. Perifocal:</span>
                <span className="font-bold">{data.tratamentos.perifocal}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-slate-500">Amostras:</span>
                <span className="font-bold text-purple-600">{data.imoveis.amostras}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-slate-500">Recuperados:</span>
                <span className="font-bold text-green-600">{data.imoveis.recuperados}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-slate-500">Fechados:</span>
                <span className="font-bold text-orange-600">{data.imoveis.fechados}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-slate-500">Recusas:</span>
                <span className="font-bold text-red-600">{data.imoveis.recusas}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-slate-500">Informados:</span>
                <span className="font-bold text-blue-600">{data.imoveis.informados}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-1">
                <span className="text-slate-500">Pendência:</span>
                <span className="font-bold text-amber-600">
                  {data.imoveis.informados > 0
                    ? (((data.imoveis.fechados - data.imoveis.recuperados) * 100 / data.imoveis.informados).toFixed(2))
                    : '0.00'}%
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ETAPA 4: DEPÓSITOS
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Etapa 4: Depósitos</h3>
            <span className="material-symbols-outlined text-slate-300 text-lg">analytics</span>
          </div>
          <div className="p-4">
            {/* Resumo */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Inspecionados</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalDepositosInspecionados}</p>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/30">
                <p className="text-[10px] uppercase font-bold text-red-500 tracking-wider mb-1">Eliminados</p>
                <p className="text-2xl font-black text-red-600">{data.eliminados}</p>
              </div>
            </div>

            {/* Detalhamento por categoria */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-blue-600">A1</p>
                <p className="font-bold text-blue-700">{data.depositos.A1}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-blue-600">A2</p>
                <p className="font-bold text-blue-700">{data.depositos.A2}</p>
              </div>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-indigo-600">B</p>
                <p className="font-bold text-indigo-700">{data.depositos.B}</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-purple-600">C</p>
                <p className="font-bold text-purple-700">{data.depositos.C}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-orange-600">D1</p>
                <p className="font-bold text-orange-700">{data.depositos.D1}</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-orange-600">D2</p>
                <p className="font-bold text-orange-700">{data.depositos.D2}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg">
                <p className="text-[8px] font-bold text-emerald-600">E</p>
                <p className="font-bold text-emerald-700">{data.depositos.E}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ETAPA 5: PRODUTOS QUÍMICOS
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Etapa 5: Produtos Químicos</h3>
            <span className="material-symbols-outlined text-slate-300 text-lg">science</span>
          </div>
          <div className="p-4 space-y-4">
            {/* Larvicida */}
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Larvicida</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <p className="text-[8px] font-bold text-slate-400">TIPO</p>
                  <p className="font-bold truncate">{data.larvicida1.tipo || 'Não informado'}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <p className="text-[8px] font-bold text-slate-400">QTD (g)</p>
                  <p className="font-bold">{data.larvicida1.quantidade || 0}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <p className="text-[8px] font-bold text-slate-400">DEP. TRATADOS</p>
                  <p className="font-bold">{data.larvicida1['dep tratados'] || 0}</p>
                </div>
              </div>
            </div>

            {/* Adulticida */}
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Adulticida</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <p className="text-[8px] font-bold text-slate-400">TIPO</p>
                  <p className="font-bold">{formatAdulticida(data.adulticida.tipo)}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <p className="text-[8px] font-bold text-slate-400">CARGAS</p>
                  <p className="font-bold">{data.adulticida.cargas || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            ETAPA 6: RECURSOS HUMANOS
        ═══════════════════════════════════════════════════════════ */}
        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden mb-12">
          <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">Etapa 6: Equipe</h3>
            <span className="material-symbols-outlined text-slate-300 text-lg">badge</span>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined material-symbols-filled">person</span>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase">Supervisor</p>
                <p className="text-sm font-bold dark:text-white uppercase">{data.nomeSupervisor || 'Não informado'}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Homen/Dia trabalhado</p>
                <p className="text-lg font-black dark:text-white">{data.agentes}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Supervisores</p>
                <p className="text-lg font-black dark:text-white">{data.supervisores}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Dias Trab.</p>
                <p className="text-lg font-black dark:text-white">{data.diasTrabalhados}</p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Veículos</p>
                <p className="text-lg font-black dark:text-white">{data.veiculos || '0'}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
