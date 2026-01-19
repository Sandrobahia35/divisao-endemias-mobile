import { supabase } from './supabaseClient';
import {
    SupervisorGeral,
    SupervisorArea,
    LocalidadeSupervisor,
    CreateSupervisorGeralForm,
    CreateSupervisorAreaForm
} from '../types/userTypes';

export const HierarchyService = {
    // ============================================
    // SUPERVISORES GERAIS
    // ============================================

    getAllSupervisoresGerais: async (): Promise<SupervisorGeral[]> => {
        const { data, error } = await supabase
            .from('supervisores_gerais')
            .select(`
                *,
                profile:profiles(id, full_name, role)
            `)
            .order('nome');

        if (error) {
            console.error('Error fetching supervisores gerais:', error);
            return [];
        }
        return data || [];
    },

    getSupervisorGeralById: async (id: string): Promise<SupervisorGeral | null> => {
        const { data, error } = await supabase
            .from('supervisores_gerais')
            .select(`
                *,
                profile:profiles(id, full_name, role),
                supervisores_area(
                    *,
                    localidades:localidades_supervisor(*)
                )
            `)
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching supervisor geral:', error);
            return null;
        }
        return data;
    },

    createSupervisorGeral: async (form: CreateSupervisorGeralForm): Promise<SupervisorGeral | null> => {
        const { data, error } = await supabase
            .from('supervisores_gerais')
            .insert([{
                profile_id: form.profile_id,
                nome: form.nome
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating supervisor geral:', error);
            throw new Error(error.message);
        }

        // Atualizar role do profile
        await supabase
            .from('profiles')
            .update({ role: 'supervisor_geral' })
            .eq('id', form.profile_id);

        return data;
    },

    deleteSupervisorGeral: async (id: string): Promise<boolean> => {
        const { error } = await supabase
            .from('supervisores_gerais')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting supervisor geral:', error);
            return false;
        }
        return true;
    },

    // ============================================
    // SUPERVISORES DE ÁREA
    // ============================================

    getSupervisoresAreaByGeral: async (geralId: string): Promise<SupervisorArea[]> => {
        const { data, error } = await supabase
            .from('supervisores_area')
            .select(`
                *,
                profile:profiles(id, full_name, role),
                localidades:localidades_supervisor(*)
            `)
            .eq('supervisor_geral_id', geralId)
            .order('nome');

        if (error) {
            console.error('Error fetching supervisores area:', error);
            return [];
        }
        return data || [];
    },

    getAllSupervisoresArea: async (): Promise<SupervisorArea[]> => {
        const { data, error } = await supabase
            .from('supervisores_area')
            .select(`
                *,
                profile:profiles(id, full_name, role),
                supervisor_geral:supervisores_gerais(id, nome),
                localidades:localidades_supervisor(*)
            `)
            .order('nome');

        if (error) {
            console.error('Error fetching all supervisores area:', error);
            return [];
        }
        return data || [];
    },

    createSupervisorArea: async (form: CreateSupervisorAreaForm): Promise<SupervisorArea | null> => {
        // Criar supervisor de área
        const { data: supervisor, error: supError } = await supabase
            .from('supervisores_area')
            .insert([{
                profile_id: form.profile_id,
                supervisor_geral_id: form.supervisor_geral_id,
                nome: form.nome
            }])
            .select()
            .single();

        if (supError) {
            console.error('Error creating supervisor area:', supError);
            throw new Error(supError.message);
        }

        // Atualizar role do profile
        await supabase
            .from('profiles')
            .update({ role: 'supervisor_area' })
            .eq('id', form.profile_id);

        // Vincular localidades
        if (form.localidades.length > 0) {
            const localidadesData = form.localidades.map(loc => ({
                supervisor_area_id: supervisor.id,
                localidade: loc
            }));

            await supabase
                .from('localidades_supervisor')
                .insert(localidadesData);
        }

        return supervisor;
    },

    updateSupervisorArea: async (id: string, data: { supervisor_geral_id?: string; nome?: string }): Promise<boolean> => {
        const { error } = await supabase
            .from('supervisores_area')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) {
            console.error('Error updating supervisor area:', error);
            return false;
        }
        return true;
    },

    deleteSupervisorArea: async (id: string): Promise<boolean> => {
        const { error } = await supabase
            .from('supervisores_area')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting supervisor area:', error);
            return false;
        }
        return true;
    },

    // ============================================
    // LOCALIDADES
    // ============================================

    getLocalidadesBySupervisor: async (supervisorAreaId: string): Promise<LocalidadeSupervisor[]> => {
        const { data, error } = await supabase
            .from('localidades_supervisor')
            .select('*')
            .eq('supervisor_area_id', supervisorAreaId)
            .order('localidade');

        if (error) {
            console.error('Error fetching localidades:', error);
            return [];
        }
        return data || [];
    },

    addLocalidade: async (supervisorAreaId: string, localidade: string): Promise<LocalidadeSupervisor | null> => {
        const { data, error } = await supabase
            .from('localidades_supervisor')
            .insert([{
                supervisor_area_id: supervisorAreaId,
                localidade
            }])
            .select()
            .single();

        if (error) {
            console.error('Error adding localidade:', error);
            throw new Error(error.message);
        }
        return data;
    },

    removeLocalidade: async (id: string): Promise<boolean> => {
        const { error } = await supabase
            .from('localidades_supervisor')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error removing localidade:', error);
            return false;
        }
        return true;
    },

    removeLocalidadeByName: async (supervisorAreaId: string, localidade: string): Promise<boolean> => {
        const { error } = await supabase
            .from('localidades_supervisor')
            .delete()
            .eq('supervisor_area_id', supervisorAreaId)
            .eq('localidade', localidade);

        if (error) {
            console.error('Error removing localidade:', error);
            return false;
        }
        return true;
    },

    updateLocalidades: async (supervisorAreaId: string, localidades: string[]): Promise<boolean> => {
        // 1. Remover todas as localidades existentes
        const { error: deleteError } = await supabase
            .from('localidades_supervisor')
            .delete()
            .eq('supervisor_area_id', supervisorAreaId);

        if (deleteError) {
            console.error('Error removing old localidades:', deleteError);
            throw new Error(deleteError.message);
        }

        // 2. Inserir as novas localidades
        if (localidades.length > 0) {
            const localidadesData = localidades.map(loc => ({
                supervisor_area_id: supervisorAreaId,
                localidade: loc
            }));

            const { error: insertError } = await supabase
                .from('localidades_supervisor')
                .insert(localidadesData);

            if (insertError) {
                console.error('Error adding new localidades:', insertError);
                throw new Error(insertError.message);
            }
        }

        return true;
    },

    // ============================================
    // HIERARQUIA COMPLETA
    // ============================================

    getFullHierarchy: async (): Promise<SupervisorGeral[]> => {
        const { data, error } = await supabase
            .from('supervisores_gerais')
            .select(`
                *,
                profile:profiles(id, full_name, role),
                supervisores_area(
                    *,
                    profile:profiles(id, full_name, role),
                    localidades:localidades_supervisor(*)
                )
            `)
            .order('nome');

        if (error) {
            console.error('Error fetching full hierarchy:', error);
            return [];
        }
        return data || [];
    },

    // Para Supervisor Geral: ver apenas sua hierarquia
    getMyHierarchy: async (profileId: string): Promise<SupervisorGeral | null> => {
        const { data, error } = await supabase
            .from('supervisores_gerais')
            .select(`
                *,
                supervisores_area(
                    *,
                    profile:profiles(id, full_name, role),
                    localidades:localidades_supervisor(*)
                )
            `)
            .eq('profile_id', profileId)
            .single();

        if (error) {
            console.error('Error fetching my hierarchy:', error);
            return null;
        }
        return data;
    },

    // Para Supervisor de Área: ver apenas suas localidades
    getMyLocalidades: async (profileId: string): Promise<string[]> => {
        const { data: supervisor } = await supabase
            .from('supervisores_area')
            .select('id')
            .eq('profile_id', profileId)
            .single();

        if (!supervisor) return [];

        const { data: localidades } = await supabase
            .from('localidades_supervisor')
            .select('localidade')
            .eq('supervisor_area_id', supervisor.id);

        return localidades?.map(l => l.localidade) || [];
    }
};
