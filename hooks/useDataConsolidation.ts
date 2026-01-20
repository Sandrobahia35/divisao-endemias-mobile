import { useMemo } from 'react';
import { Report, ConsolidatedData, WeekData, LocalityRankingItem, GroupedAnalyticsData } from '../types/reportTypes';

type GroupBy = 'localidade' | 'semana' | 'ciclo';

/**
 * Hook para consolidação de dados de relatórios
 * Calcula totais, dados para gráficos, rankings e agrupamentos
 */
export function useDataConsolidation(reports: Report[]) {
    // Dados consolidados (totais)
    const consolidated = useMemo<ConsolidatedData>(() => {
        const initial: ConsolidatedData = {
            totalImoveis: 0,
            totalFechados: 0,
            totalRecuperados: 0,
            totalInformados: 0,
            pendenciaPercent: 0,
            totalDepositos: 0,
            depositosPorTipo: { A1: 0, A2: 0, B: 0, C: 0, D1: 0, D2: 0, E: 0 },
            totalEliminados: 0,
            totalAgentes: 0,
            totalDiasTrabalhados: 0,
            totalReports: reports.length,
            concluidos: 0,
            totalTratamentos: { inspecionados: 0, focal: 0, perifocal: 0 },
            totalLarvicida: { quantidade: 0, depTratados: 0 }
        };

        const result = reports.reduce((acc, report) => {
            const data = report.data;

            // Imóveis
            const imoveis = data.imoveis;
            acc.totalImoveis += (imoveis.residencias || 0) + (imoveis.comercios || 0) +
                (imoveis.terrenos || 0) + (imoveis.pontos || 0) + (imoveis.outros || 0);

            // Fechados, Recuperados, Informados
            acc.totalFechados += imoveis.fechados || 0;
            acc.totalRecuperados += imoveis.recuperados || 0;
            acc.totalInformados += imoveis.informados || 0;

            // Depósitos
            const depositos = data.depositos;
            acc.depositosPorTipo.A1 += depositos.A1 || 0;
            acc.depositosPorTipo.A2 += depositos.A2 || 0;
            acc.depositosPorTipo.B += depositos.B || 0;
            acc.depositosPorTipo.C += depositos.C || 0;
            acc.depositosPorTipo.D1 += depositos.D1 || 0;
            acc.depositosPorTipo.D2 += depositos.D2 || 0;
            acc.depositosPorTipo.E += depositos.E || 0;
            acc.totalDepositos += (depositos.A1 || 0) + (depositos.A2 || 0) + (depositos.B || 0) +
                (depositos.C || 0) + (depositos.D1 || 0) + (depositos.D2 || 0) + (depositos.E || 0);

            // Eliminados e Agentes
            acc.totalEliminados += data.eliminados || 0;
            acc.totalAgentes += data.agentes || 0;
            acc.totalDiasTrabalhados += data.diasTrabalhados || 0;

            // Tratamentos
            const tratamentos = data.tratamentos;
            acc.totalTratamentos.inspecionados += tratamentos.inspecionados || 0;
            acc.totalTratamentos.focal += tratamentos.focal || 0;
            acc.totalTratamentos.perifocal += tratamentos.perifocal || 0;

            // Larvicida (soma dos dois larvicidas)
            acc.totalLarvicida.quantidade += (data.larvicida1?.quantidade || 0) + (data.larvicida2?.quantidade || 0);
            acc.totalLarvicida.depTratados += (data.larvicida1?.['dep tratados'] || 0) + (data.larvicida2?.['dep tratados'] || 0);

            // Concluídos
            if (report.concluido) acc.concluidos += 1;

            return acc;
        }, initial);

        // Calcular pendência % com a fórmula: (fechados - recuperados) * 100 / informados
        result.pendenciaPercent = result.totalInformados > 0
            ? Math.round(((result.totalFechados - result.totalRecuperados) * 100 / result.totalInformados) * 100) / 100
            : 0;

        return result;
    }, [reports]);

    // Dados por semana para gráficos
    const weekData = useMemo<WeekData[]>(() => {
        const grouped: Record<string, WeekData> = {};

        reports.forEach(report => {
            const semana = report.semanaEpidemiologica;
            const data = report.data;

            if (!grouped[semana]) {
                grouped[semana] = {
                    semana,
                    imoveis: 0,
                    depositos: 0,
                    eliminados: 0,
                    agentes: 0,
                    reports: 0
                };
            }

            const imoveis = data.imoveis;
            grouped[semana].imoveis += (imoveis.residencias || 0) + (imoveis.comercios || 0) +
                (imoveis.terrenos || 0) + (imoveis.pontos || 0) + (imoveis.outros || 0);

            const depositos = data.depositos;
            grouped[semana].depositos += (depositos.A1 || 0) + (depositos.A2 || 0) + (depositos.B || 0) +
                (depositos.C || 0) + (depositos.D1 || 0) + (depositos.D2 || 0) + (depositos.E || 0);

            grouped[semana].eliminados += data.eliminados || 0;
            grouped[semana].agentes += data.agentes || 0;
            grouped[semana].reports += 1;
        });

        return Object.values(grouped).sort((a, b) => {
            const numA = parseInt(a.semana.replace('SE ', ''));
            const numB = parseInt(b.semana.replace('SE ', ''));
            return numA - numB;
        });
    }, [reports]);

    // Semanas que possuem dados
    const weeksWithData = useMemo<string[]>(() => {
        return [...new Set(reports.map(r => r.semanaEpidemiologica))].sort((a, b) => {
            const numA = parseInt(a.replace('SE ', ''));
            const numB = parseInt(b.replace('SE ', ''));
            return numA - numB;
        });
    }, [reports]);

    // Ranking de localidades por eliminados
    const localityRanking = useMemo<LocalityRankingItem[]>(() => {
        const grouped: Record<string, Omit<LocalityRankingItem, 'rank'>> = {};

        reports.forEach(report => {
            const localidade = report.localidade;
            const data = report.data;

            if (!grouped[localidade]) {
                grouped[localidade] = {
                    localidade,
                    eliminados: 0,
                    depositos: 0,
                    imoveis: 0,
                    agentes: 0
                };
            }

            const imoveis = data.imoveis;
            grouped[localidade].imoveis += (imoveis.residencias || 0) + (imoveis.comercios || 0) +
                (imoveis.terrenos || 0) + (imoveis.pontos || 0) + (imoveis.outros || 0);

            const depositos = data.depositos;
            grouped[localidade].depositos += (depositos.A1 || 0) + (depositos.A2 || 0) + (depositos.B || 0) +
                (depositos.C || 0) + (depositos.D1 || 0) + (depositos.D2 || 0) + (depositos.E || 0);

            grouped[localidade].eliminados += data.eliminados || 0;
            grouped[localidade].agentes += data.agentes || 0;
        });

        return Object.values(grouped)
            .sort((a, b) => b.eliminados - a.eliminados)
            .map((item, index) => ({ ...item, rank: index + 1 }));
    }, [reports]);

    // Função para gerar dados agrupados para tabela analítica
    const getGroupedData = useMemo(() => {
        return (groupBy: GroupBy): GroupedAnalyticsData[] => {
            const grouped: Record<string, GroupedAnalyticsData> = {};

            reports.forEach(report => {
                let key: string;
                let label: string;

                switch (groupBy) {
                    case 'localidade':
                        key = report.localidade;
                        label = report.localidade;
                        break;
                    case 'semana':
                        key = report.semanaEpidemiologica;
                        label = report.semanaEpidemiologica;
                        break;
                    case 'ciclo':
                        key = `ciclo-${report.ciclo}`;
                        label = `Ciclo ${report.ciclo}`;
                        break;
                    default:
                        key = report.localidade;
                        label = report.localidade;
                }

                if (!grouped[key]) {
                    grouped[key] = {
                        key,
                        label,
                        imoveis: 0,
                        fechados: 0,
                        recuperados: 0,
                        informados: 0,
                        pendencias: 0,
                        cargaLarvicida: 0,
                        reports: 0,
                        concluidos: 0,
                        percentConcluido: 0
                    };
                }

                const data = report.data;
                const imoveis = data.imoveis;

                // Total de imóveis trabalhados
                grouped[key].imoveis += (imoveis.residencias || 0) + (imoveis.comercios || 0) +
                    (imoveis.terrenos || 0) + (imoveis.pontos || 0) + (imoveis.outros || 0);

                // Campos específicos de imóveis
                grouped[key].fechados += imoveis.fechados || 0;
                grouped[key].recuperados += imoveis.recuperados || 0;
                grouped[key].informados += imoveis.informados || 0;
                // pendencias será calculado depois com a fórmula (fechados - recuperados) * 100 / informados

                // Carga de larvicida (soma dos dois larvicidas)
                grouped[key].cargaLarvicida += (data.larvicida1?.quantidade || 0) + (data.larvicida2?.quantidade || 0);

                grouped[key].reports += 1;
                if (report.concluido) grouped[key].concluidos += 1;
            });

            return Object.values(grouped)
                .map(item => ({
                    ...item,
                    // Cálculo da pendência: (fechados - recuperados) * 100 / informados
                    pendencias: item.informados > 0
                        ? Math.round(((item.fechados - item.recuperados) * 100 / item.informados) * 100) / 100
                        : 0,
                    percentConcluido: item.reports > 0 ? Math.round((item.concluidos / item.reports) * 100) : 0
                }))
                .sort((a, b) => {
                    if (groupBy === 'semana') {
                        const numA = parseInt(a.label.replace('SE ', ''));
                        const numB = parseInt(b.label.replace('SE ', ''));
                        return numA - numB;
                    }
                    if (groupBy === 'ciclo') {
                        return parseInt(a.key.replace('ciclo-', '')) - parseInt(b.key.replace('ciclo-', ''));
                    }
                    return a.label.localeCompare(b.label);
                });
        };
    }, [reports]);

    return {
        consolidated,
        weekData,
        weeksWithData,
        localityRanking,
        getGroupedData
    };
}
