import { supabase } from './supabaseClient';
import { FormData } from '../types';
import { Report, ReportFilters, ReportsSummary, FilterOptions } from '../types/reportTypes';
import { LOCALIDADES } from '../constants';

export const ReportService = {
    // Salvar relatório no Supabase
    saveReport: async (data: FormData): Promise<void> => {
        try {
            const { user } = (await supabase.auth.getUser()).data;
            if (!user) throw new Error('Usuário não autenticado');

            const {
                municipio, localidade, categoriaLocalidade,
                semanaEpidemiologica, ciclo, ano,
                dataInicio, dataFim, concluido,
                ...rest
            } = data;

            const { error } = await supabase
                .from('reports')
                .insert({
                    user_id: user.id,
                    municipio,
                    localidade,
                    categoria_localidade: categoriaLocalidade,
                    semana_epidemiologica: semanaEpidemiologica,
                    ciclo,
                    ano,
                    data_inicio: dataInicio,
                    data_fim: dataFim,
                    concluido,
                    content: rest
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving report:', error);
            throw error;
        }
    },

    getAllReports: async (): Promise<Report[]> => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data.map(mapToReportType);
        } catch (error) {
            console.error('Error fetching reports:', error);
            return [];
        }
    },

    getReportById: async (id: string): Promise<Report | undefined> => {
        try {
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            if (!data) return undefined;
            return mapToReportType(data);
        } catch (error) {
            console.error('Error fetching report by id:', error);
            return undefined;
        }
    },

    deleteReport: async (id: string): Promise<void> => {
        try {
            const { error } = await supabase
                .from('reports')
                .delete()
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error deleting report:', error);
            throw error;
        }
    },

    updateReport: async (id: string, data: FormData): Promise<void> => {
        try {
            const {
                municipio, localidade, categoriaLocalidade,
                semanaEpidemiologica, ciclo, ano,
                dataInicio, dataFim, concluido,
                ...rest
            } = data;

            const { error } = await supabase
                .from('reports')
                .update({
                    municipio,
                    localidade,
                    categoria_localidade: categoriaLocalidade,
                    semana_epidemiologica: semanaEpidemiologica,
                    ciclo,
                    ano,
                    data_inicio: dataInicio,
                    data_fim: dataFim,
                    concluido,
                    content: rest,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error updating report:', error);
            throw error;
        }
    },

    getReportsByFilter: async (filters: ReportFilters): Promise<Report[]> => {
        try {
            let query = supabase.from('reports').select('*').order('created_at', { ascending: false });

            if (filters.semanaEpidemiologica) query = query.eq('semana_epidemiologica', filters.semanaEpidemiologica);
            if (filters.localidade) query = query.eq('localidade', filters.localidade);
            if (filters.ciclo) query = query.eq('ciclo', filters.ciclo);

            const { data, error } = await query;
            if (error) throw error;
            return data.map(mapToReportType);
        } catch (error) {
            console.error('Error fetching filtered reports:', error);
            return [];
        }
    },

    getReportsByAdvancedFilter: async (filters: any): Promise<Report[]> => {
        const { semanasEpidemiologicas, semanas, localidades, ciclos } = filters;
        const targetSemanas = semanasEpidemiologicas || semanas || [];

        let query = supabase.from('reports').select('*');

        if (targetSemanas && targetSemanas.length > 0) query = query.in('semana_epidemiologica', targetSemanas);
        if (localidades && localidades.length > 0) query = query.in('localidade', localidades);
        if (ciclos && ciclos.length > 0) query = query.in('ciclo', ciclos);

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) {
            console.error(error);
            return [];
        }
        return data.map(mapToReportType);
    },

    getFilterOptions: async (): Promise<FilterOptions> => {
        return {
            semanas: Array.from({ length: 52 }, (_, i) => `SE ${(i + 1).toString().padStart(2, '0')}`),
            localidades: LOCALIDADES,
            ciclos: [1, 2, 3, 4, 5, 6]
        };
    },

    getSummary: async (): Promise<ReportsSummary> => {
        // Re-fetch all reports to calculate summary
        const { data: reports, error } = await supabase
            .from('reports')
            .select('localidade, semana_epidemiologica, concluido');

        if (error || !reports) {
            return { total: 0, concluidos: 0, emAberto: 0, ultimaSemana: null, localidadeMaisFrequente: null };
        }

        const total = reports.length;
        const concluidos = reports.filter(r => r.concluido).length;
        const emAberto = total - concluidos;

        const ultimaSemana = reports.length > 0
            ? reports.map(r => r.semana_epidemiologica).sort().pop() || null
            : null;

        const locCounts: Record<string, number> = {};
        reports.forEach(r => {
            if (r.localidade) locCounts[r.localidade] = (locCounts[r.localidade] || 0) + 1;
        });

        let localidadeMaisFrequente = null;
        let maxCount = 0;
        Object.entries(locCounts).forEach(([loc, count]) => {
            if (count > maxCount) {
                maxCount = count;
                localidadeMaisFrequente = loc;
            }
        });

        return { total, concluidos, emAberto, ultimaSemana: ultimaSemana || null, localidadeMaisFrequente };
    },

    getLocalityAnalytics: async (localidade: string) => {
        return null;
    }
};

function mapToReportType(row: any): Report {
    return {
        id: row.id,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        municipio: row.municipio,
        localidade: row.localidade,
        categoriaLocalidade: row.categoria_localidade,
        semanaEpidemiologica: row.semana_epidemiologica,
        ciclo: row.ciclo,
        ano: row.ano,
        concluido: row.concluido,
        data: {
            municipio: row.municipio,
            localberry: '',
            localidade: row.localidade,
            categoriaLocalidade: row.categoria_localidade,
            semanaEpidemiologica: row.semana_epidemiologica,
            ciclo: row.ciclo,
            ano: row.ano,
            dataInicio: row.data_inicio,
            dataFim: row.data_fim,
            concluido: row.concluido,
            ...row.content
        }
    };
}
