import { FormData } from '../types';

/**
 * Representa um relatório salvo
 * Estrutura preparada para futura migração para banco de dados
 */
export interface Report {
    id: string;                    // UUID único
    createdAt?: string;            // Data/hora de criação (ISO string)
    updatedAt?: string;            // Data/hora de atualização
    semanaEpidemiologica: string;  // Ex: "SE 42"
    localidade: string;            // Nome da localidade
    categoriaLocalidade: string;   // "1" (BRR) ou "2" (POV)
    municipio?: string;            // Município
    ciclo: number;
    ano: number;
    concluido: boolean;
    data: FormData;                // Dados completos do formulário
}

/**
 * Filtros para busca de relatórios
 */
export interface ReportFilters {
    semanaEpidemiologica?: string;
    localidade?: string;
    ano?: number;
    ciclo?: number;
    concluido?: boolean;
}

/**
 * Opções únicas disponíveis para filtros
 */
export interface FilterOptions {
    semanas: string[];
    localidades: string[];
    anos?: number[];
    ciclos?: number[];
}

/**
 * Resumo estatístico dos relatórios
 */
export interface ReportsSummary {
    total: number;
    concluidos: number;
    emAberto: number;
    ultimaSemana: string | null;
    localidadeMaisFrequente: string | null;
}

/**
 * Filtros estendidos para busca avançada
 */
export interface ReportFiltersExtended extends ReportFilters {
    ciclo?: number;
    ciclos?: number[];           // Múltiplos ciclos
    localidades?: string[];      // Múltiplas localidades
    semanasEpidemiologicas?: string[]; // Múltiplas semanas
    dataInicio?: string;
    dataFim?: string;
}

/**
 * Analytics por localidade
 */
export interface LocalityAnalytics {
    localidade: string;
    totalReports: number;
    reportsPorCiclo: Record<number, number>;
    ultimaAtualizacao: string;
    semanasAtivas: string[];
}

/**
 * Analytics por ciclo
 */
export interface CycleAnalytics {
    ciclo: number;
    totalReports: number;
    localidades: string[];
    totalLocalidades: number;
    semanas: string[];
}

/**
 * Opções de formato de exportação
 */
export type ExportFormat = 'pdf' | 'excel' | 'csv' | 'json';

/**
 * Tipo de agrupamento para exportação
 */
export type ExportGrouping = 'localidade' | 'ciclo' | 'semana' | 'detalhado';

/**
 * Configuração de exportação
 */
export interface ExportConfig {
    formato: ExportFormat;
    tipoAgrupamento: ExportGrouping;
    filtros: ReportFiltersExtended;
    incluirResumo: boolean;
    nomeArquivo?: string;
}

/**
 * Dados preparados para exportação
 */
export interface ExportData {
    titulo: string;
    geradoEm: string;
    resumo: ReportsSummary;
    dados: Report[];
    agrupamento: ExportGrouping;
}

