// Tipos para gerenciamento de usuários e hierarquia

export type UserRole = 'admin' | 'supervisor_geral' | 'supervisor_area' | 'gestor';

export interface User {
    id: string;
    nome: string;
    funcao: UserRole;
    email: string;
    senha: string;
    ativo: boolean;
    criadoEm: string;
}

export const USER_ROLES: { value: UserRole; label: string }[] = [
    { value: 'admin', label: 'Administrador' },
    { value: 'supervisor_geral', label: 'Supervisor Geral' },
    { value: 'supervisor_area', label: 'Supervisor de Área' },
    { value: 'gestor', label: 'Gestor' },
];

// ============================================
// TIPOS PARA HIERARQUIA
// ============================================

export interface SupervisorGeral {
    id: string;
    profile_id: string;
    nome: string;
    created_at: string;
    updated_at: string;
    // Relacionamentos (populated via join)
    supervisores_area?: SupervisorArea[];
    profile?: {
        id: string;
        full_name: string;
        email?: string;
        role: string;
    };
}

export interface SupervisorArea {
    id: string;
    profile_id: string;
    supervisor_geral_id: string;
    nome: string;
    created_at: string;
    updated_at: string;
    // Relacionamentos (populated via join)
    localidades?: LocalidadeSupervisor[];
    supervisor_geral?: SupervisorGeral;
    profile?: {
        id: string;
        full_name: string;
        email?: string;
        role: string;
    };
}

export interface LocalidadeSupervisor {
    id: string;
    supervisor_area_id: string;
    localidade: string;
    created_at: string;
}

// ============================================
// TIPOS PARA FORMULÁRIOS
// ============================================

export interface CreateSupervisorGeralForm {
    profile_id: string;
    nome: string;
}

export interface CreateSupervisorAreaForm {
    profile_id: string;
    supervisor_geral_id: string;
    nome: string;
    localidades: string[];
}

export interface UpdateSupervisorAreaForm {
    supervisor_geral_id?: string;
    nome?: string;
}
