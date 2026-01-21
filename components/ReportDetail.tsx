import React from 'react';
import { Report } from '../types/reportTypes';

interface ReportDetailProps {
    report: Report;
    onBack: () => void;
    onDelete: (id: string) => void;
}

export const ReportDetail: React.FC<ReportDetailProps> = ({ report, onBack, onDelete }) => {
    const data = report.data;

    const totalDepositosInspecionados = (Object.values(data.depositos) as number[]).reduce((a, b) => a + b, 0);
    const totalImoveisTrabalhados = (
        data.imoveis.residencias +
        data.imoveis.comercios +
        data.imoveis.terrenos +
        data.imoveis.pontos +
        data.imoveis.outros
    );

    const formatDate = (isoString: string) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatSimpleDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');
    };

    const handleDelete = () => {
        if (window.confirm('Tem certeza que deseja excluir este relatório?')) {
            onDelete(report.id);
        }
    };

    // Mapeia tipo de adulticida para label
    const getAdulticidaLabel = (tipo: string) => {
        const labels: Record<string, string> = {
            'ubv_costal': 'UBV Costal',
            'ubv_pesado': 'UBV Pesado (Fumacê)',
            'termonebulizacao': 'Termonebulização'
        };
        return labels[tipo] || tipo || 'Nenhuma';
    };

    return (
        <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <header className="sticky top-0 z-50 flex items-center bg-white dark:bg-surface-dark px-4 py-3 justify-between border-b border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                    onClick={onBack}
                    className="text-primary hover:bg-primary/10 rounded-full p-2 flex items-center justify-center transition-colors"
                >
                    <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back_ios_new</span>
                </button>
                <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center truncate">
                    Detalhes do Relatório
                </h2>
                <button
                    onClick={handleDelete}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full p-2 transition-colors"
                >
                    <span className="material-symbols-outlined">delete</span>
                </button>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 pb-8 space-y-5 no-scrollbar">
                {/* Badge SE e Status */}
                <div className="flex items-center justify-between">
                    <span className="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold">
                        {report.semanaEpidemiologica}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${report.concluido
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}>
                        {report.concluido ? 'CONCLUÍDO' : 'EM ABERTO'}
                    </span>
                </div>

                {/* ============================================ */}
                {/* ETAPA 1: IDENTIFICAÇÃO */}
                {/* ============================================ */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">1. Identificação e Localização</h3>
                        <span className="material-symbols-outlined text-slate-300 text-lg">location_on</span>
                    </div>
                    <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Município</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase">{data.municipio || 'Itabuna'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Localidade</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase">{data.localidade || 'Não informada'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Categoria</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{data.categoriaLocalidade === '1' ? 'Bairro (BRR)' : 'Povoado (POV)'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* ETAPA 2: PERÍODO */}
                {/* ============================================ */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">2. Definição de Período</h3>
                        <span className="material-symbols-outlined text-slate-300 text-lg">calendar_today</span>
                    </div>
                    <div className="p-4 space-y-3">
                        {/* Tipo de Atividade */}
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Tipo de Atividade</p>
                            <div className="flex flex-wrap gap-2">
                                {data.tipoAtividade && data.tipoAtividade.length > 0 ? (
                                    data.tipoAtividade.map(tipo => (
                                        <span key={tipo} className="px-3 py-1 rounded-full bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 text-xs font-bold">
                                            {tipo}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-400">Nenhuma atividade selecionada</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Ciclo</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{String(data.ciclo).padStart(2, '0')}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Ano</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{data.ano}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Data Início</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatSimpleDate(data.dataInicio)}</p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-slate-400">Data Fim</p>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{formatSimpleDate(data.dataFim)}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[10px] uppercase font-bold text-slate-400">Semana Epidemiológica</p>
                                <p className="text-lg font-black text-primary dark:text-blue-400">{data.semanaEpidemiologica}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* ETAPA 3: PRODUÇÃO DOS AGENTES (IMÓVEIS) */}
                {/* ============================================ */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">3. Produção dos Agentes</h3>
                        <span className="material-symbols-outlined text-slate-300 text-lg">home_work</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Total */}
                        <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-lg border border-primary/20 text-center">
                            <p className="text-[10px] uppercase font-bold text-primary mb-1">Total Imóveis Trabalhados</p>
                            <p className="text-3xl font-black text-primary">{totalImoveisTrabalhados}</p>
                        </div>

                        {/* Imóveis Detalhados */}
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Detalhamento por Tipo</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg col-span-2">
                                    <span className="text-slate-500">Nº Quarteirões:</span>
                                    <span className="font-bold">{data.imoveis.numeroQuarteiroes ?? 0}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                                    <span className="text-slate-500">Residências:</span>
                                    <span className="font-bold">{data.imoveis.residencias}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                                    <span className="text-slate-500">Comércios:</span>
                                    <span className="font-bold">{data.imoveis.comercios}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                                    <span className="text-slate-500">Terrenos B.:</span>
                                    <span className="font-bold">{data.imoveis.terrenos}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                                    <span className="text-slate-500">Pontos Estr.:</span>
                                    <span className="font-bold">{data.imoveis.pontos}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg col-span-2">
                                    <span className="text-slate-500">Outros:</span>
                                    <span className="font-bold">{data.imoveis.outros}</span>
                                </div>
                            </div>
                        </div>

                        {/* Status das Visitas */}
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Status das Visitas</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                    <span className="text-purple-600">Amostras:</span>
                                    <span className="font-bold text-purple-600">{data.imoveis.amostras}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                    <span className="text-orange-600">Fechados:</span>
                                    <span className="font-bold text-orange-600">{data.imoveis.fechados}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                    <span className="text-red-600">Recusas:</span>
                                    <span className="font-bold text-red-600">{data.imoveis.recusas}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <span className="text-green-600">Recuperados:</span>
                                    <span className="font-bold text-green-600">{data.imoveis.recuperados}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <span className="text-blue-600">Informados:</span>
                                    <span className="font-bold text-blue-600">{data.imoveis.informados || 0}</span>
                                </div>
                                <div className="flex justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <span className="text-amber-600">Pendência:</span>
                                    <span className="font-bold text-amber-600">
                                        {data.imoveis.informados > 0
                                            ? (((data.imoveis.fechados - data.imoveis.recuperados) * 100 / data.imoveis.informados).toFixed(2))
                                            : '0.00'}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Tratamentos */}
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Tratamentos Realizados</p>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                                    <p className="text-[9px] font-bold text-blue-500 uppercase">Inspecionados</p>
                                    <p className="text-lg font-black text-blue-600">{data.tratamentos.inspecionados}</p>
                                </div>
                                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
                                    <p className="text-[9px] font-bold text-emerald-500 uppercase">Focal</p>
                                    <p className="text-lg font-black text-emerald-600">{data.tratamentos.focal}</p>
                                </div>
                                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                                    <p className="text-[9px] font-bold text-purple-500 uppercase">Perifocal</p>
                                    <p className="text-lg font-black text-purple-600">{data.tratamentos.perifocal}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* ETAPA 4: DEPÓSITOS INSPECIONADOS */}
                {/* ============================================ */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">4. Depósitos Inspecionados</h3>
                        <span className="material-symbols-outlined text-slate-300 text-lg">water_drop</span>
                    </div>
                    <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-center">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Total Inspecionados</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{totalDepositosInspecionados}</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-800/30 text-center">
                                <p className="text-[10px] uppercase font-bold text-red-500 mb-1">Eliminados</p>
                                <p className="text-2xl font-black text-red-600">{data.eliminados}</p>
                            </div>
                        </div>

                        {/* Categorias */}
                        <div>
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Por Categoria</p>
                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                    <p className="text-[9px] font-bold text-blue-600">A1</p>
                                    <p className="text-sm font-black text-blue-700">{data.depositos.A1}</p>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                    <p className="text-[9px] font-bold text-blue-600">A2</p>
                                    <p className="text-sm font-black text-blue-700">{data.depositos.A2}</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded-lg">
                                    <p className="text-[9px] font-bold text-indigo-600">B</p>
                                    <p className="text-sm font-black text-indigo-700">{data.depositos.B}</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/20 p-2 rounded-lg">
                                    <p className="text-[9px] font-bold text-purple-600">C</p>
                                    <p className="text-sm font-black text-purple-700">{data.depositos.C}</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                                    <p className="text-[9px] font-bold text-orange-600">D1</p>
                                    <p className="text-sm font-black text-orange-700">{data.depositos.D1}</p>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                                    <p className="text-[9px] font-bold text-orange-600">D2</p>
                                    <p className="text-sm font-black text-orange-700">{data.depositos.D2}</p>
                                </div>
                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2 rounded-lg col-span-2">
                                    <p className="text-[9px] font-bold text-emerald-600">E (Natural)</p>
                                    <p className="text-sm font-black text-emerald-700">{data.depositos.E}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* ETAPA 5: CONTROLE DE LARVICIDAS */}
                {/* ============================================ */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">5. Controle de Larvicidas</h3>
                        <span className="material-symbols-outlined text-slate-300 text-lg">pest_control</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Larvicida 1 */}
                        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Larvicida Principal</p>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400">Tipo</p>
                                    <p className="text-xs font-bold text-slate-800 dark:text-white">{data.larvicida1?.tipo || 'Não informado'}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400">Qtd (g)</p>
                                    <p className="text-sm font-black text-slate-800 dark:text-white">{data.larvicida1?.quantidade || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400">Dep. Tratados</p>
                                    <p className="text-sm font-black text-primary">{data.larvicida1?.['dep tratados'] || 0}</p>
                                </div>
                            </div>
                        </div>

                        {/* Larvicida 2 (se preenchido) */}
                        {data.larvicida2 && data.larvicida2.tipo && (
                            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Larvicida Secundário</p>
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400">Tipo</p>
                                        <p className="text-xs font-bold text-slate-800 dark:text-white">{data.larvicida2.tipo}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400">Qtd (g)</p>
                                        <p className="text-sm font-black text-slate-800 dark:text-white">{data.larvicida2.quantidade}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-bold text-slate-400">Dep. Tratados</p>
                                        <p className="text-sm font-black text-primary">{data.larvicida2['dep tratados']}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Adulticida */}
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                            <p className="text-[10px] uppercase font-bold text-orange-600 mb-2">Aplicação Adulticida</p>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div>
                                    <p className="text-[9px] font-bold text-orange-500">Tipo de Aplicação</p>
                                    <p className="text-xs font-bold text-orange-700">{getAdulticidaLabel(data.adulticida?.tipo)}</p>
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-orange-500">Cargas</p>
                                    <p className="text-lg font-black text-orange-700">{data.adulticida?.cargas || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============================================ */}
                {/* ETAPA 6: EQUIPE E LOGÍSTICA */}
                {/* ============================================ */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="font-bold text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest">6. Equipe e Logística</h3>
                        <span className="material-symbols-outlined text-slate-300 text-lg">groups</span>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Supervisor */}
                        <div className="flex items-center gap-3 p-3 bg-primary/5 dark:bg-primary/10 rounded-lg">
                            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined material-symbols-filled text-2xl">person</span>
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-primary uppercase">Supervisor Responsável</p>
                                <p className="text-base font-bold text-slate-900 dark:text-white uppercase">{data.nomeSupervisor || 'Não informado'}</p>
                            </div>
                        </div>

                        {/* Equipe */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Homen/Dia trabalhado</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{data.agentes}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Supervisores</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{data.supervisores || 0}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Dias Trabalhados</p>
                                <p className="text-2xl font-black text-slate-900 dark:text-white">{data.diasTrabalhados}</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Veículos</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{data.veiculos || '-'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Meta info */}
                <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <p>Criado em {formatDate(report.createdAt)}</p>
                    <p className="font-mono text-[10px] mt-1">ID: {report.id}</p>
                </div>
            </div>
        </div>
    );
};
