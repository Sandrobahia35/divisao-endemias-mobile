import { supabase } from './supabaseClient';
import { HierarchyService } from './hierarchyService';
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

    /**
     * Busca relatórios filtrados pelo acesso do usuário baseado na hierarquia.
     * - admin/gestor: todos os relatórios
     * - supervisor_geral: relatórios das localidades dos seus supervisores de área
     * - supervisor_area: relatórios das suas localidades atribuídas
     */
    getReportsByUserAccess: async (profileId: string, role: string): Promise<Report[]> => {
        try {
            console.log('[ReportService] getReportsByUserAccess called:', { profileId, role });

            // Obter localidades permitidas para o usuário
            const accessibleLocalidades = await HierarchyService.getAccessibleLocalidades(profileId, role);

            console.log('[ReportService] Accessible localidades:', accessibleLocalidades);

            // null significa acesso total (admin/gestor)
            if (accessibleLocalidades === null) {
                console.log('[ReportService] Full access - fetching all reports');
                const { data, error } = await supabase
                    .from('reports')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                console.log('[ReportService] Fetched reports:', data?.length);
                return data.map(mapToReportType);
            }

            // Array vazio significa sem acesso
            if (accessibleLocalidades.length === 0) {
                console.log('[ReportService] No accessible localidades - returning empty');
                return [];
            }

            // Filtrar por localidades permitidas
            console.log('[ReportService] Filtering by localidades:', accessibleLocalidades);
            const { data, error } = await supabase
                .from('reports')
                .select('*')
                .in('localidade', accessibleLocalidades)
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('[ReportService] Fetched filtered reports:', data?.length);
            return data.map(mapToReportType);
        } catch (error) {
            console.error('Error fetching reports by user access:', error);
            return [];
        }
    },

    /**
     * Busca relatórios com filtros avançados respeitando o acesso do usuário.
     */
    getReportsByAdvancedFilterWithAccess: async (
        filters: any,
        profileId: string,
        role: string
    ): Promise<Report[]> => {
        try {
            const { semanasEpidemiologicas, semanas, localidades, ciclos } = filters;
            const targetSemanas = semanasEpidemiologicas || semanas || [];

            // Obter localidades permitidas para o usuário
            const accessibleLocalidades = await HierarchyService.getAccessibleLocalidades(profileId, role);

            // Se não tem acesso a nenhuma localidade, retorna vazio
            if (accessibleLocalidades !== null && accessibleLocalidades.length === 0) {
                return [];
            }

            let query = supabase.from('reports').select('*');

            // Aplicar filtro de semanas
            if (targetSemanas && targetSemanas.length > 0) {
                query = query.in('semana_epidemiologica', targetSemanas);
            }

            // Aplicar filtro de ciclos
            if (ciclos && ciclos.length > 0) {
                query = query.in('ciclo', ciclos);
            }

            // Aplicar filtro de localidades
            // Combina as localidades do filtro com as localidades permitidas
            if (accessibleLocalidades !== null) {
                // Supervisor: intersecção entre filtro e localidades permitidas
                if (localidades && localidades.length > 0) {
                    // Filtra apenas as localidades que estão tanto no filtro quanto nas permitidas
                    const allowedFromFilter = localidades.filter((loc: string) =>
                        accessibleLocalidades.includes(loc)
                    );
                    if (allowedFromFilter.length === 0) {
                        return []; // Nenhuma localidade do filtro está permitida
                    }
                    query = query.in('localidade', allowedFromFilter);
                } else {
                    // Sem filtro de localidade, usa todas as permitidas
                    query = query.in('localidade', accessibleLocalidades);
                }
            } else {
                // Admin/Gestor: aplica apenas o filtro de localidade se existir
                if (localidades && localidades.length > 0) {
                    query = query.in('localidade', localidades);
                }
            }

            const { data, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error(error);
                return [];
            }
            return data.map(mapToReportType);
        } catch (error) {
            console.error('Error fetching reports by advanced filter with access:', error);
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
