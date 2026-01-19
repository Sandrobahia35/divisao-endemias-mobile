import React, { useState, useEffect } from 'react';
import { ReportService } from '../services/reportService';
import { UserService } from '../services/userService';
import { HierarchyService } from '../services/hierarchyService';
import { Report } from '../types/reportTypes';
import { User, USER_ROLES, UserRole, SupervisorGeral } from '../types/userTypes';
import { LOCALIDADES } from '../constants';
import { UserEditModal } from '../components/UserManagement/UserEditModal';
import { HierarchyTree } from '../components/UserManagement/HierarchyTree';

interface AdminPageProps {
    onBack: () => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onBack }) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'data' | 'settings'>('overview');
    const [showUserModal, setShowUserModal] = useState(false);
    const [userForm, setUserForm] = useState({
        nome: '',
        funcao: 'gestor' as UserRole,
        email: '',
        senha: '',
        // Campos para hierarquia
        supervisorGeralId: '',
        localidadesSelecionadas: [] as string[]
    });
    const [formError, setFormError] = useState('');
    const [supervisoresGerais, setSupervisoresGerais] = useState<SupervisorGeral[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingUser, setEditingUser] = useState<{
        id: string;
        nome: string;
        email: string;
        funcao: UserRole;
    } | null>(null);

    const [filterOptions, setFilterOptions] = useState<{
        semanas: string[];
        localidades: string[];
        ciclos: number[];
    }>({ semanas: [], localidades: [], ciclos: [] });

    const [summary, setSummary] = useState({
        total: 0,
        concluidos: 0,
        emAberto: 0,
        ultimaSemana: null as string | null,
        localidadeMaisFrequente: null as string | null
    });

    useEffect(() => {
        const fetchData = async () => {
            setReports(await ReportService.getAllReports());

            // Carregar usuários do Supabase profiles
            const { supabase } = await import('../services/supabaseClient');
            const { data: profiles, error } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .order('full_name');

            if (!error && profiles) {
                const supabaseUsers = profiles.map(p => ({
                    id: p.id,
                    nome: p.full_name || 'Sem nome',
                    email: p.email || '',
                    usuario: p.email || '',
                    funcao: (p.role === 'admin' ? 'gestor' : p.role || 'user') as UserRole,
                    ativo: true,
                    criadoEm: new Date().toISOString(),
                    senha: ''
                }));
                setUsers(supabaseUsers);
            } else {
                // Fallback para local storage se falhar
                setUsers(UserService.getAllUsers());
            }

            const options = await ReportService.getFilterOptions();
            setFilterOptions(options);
            const summaryData = await ReportService.getSummary();
            setSummary(summaryData);
            // Carregar supervisores gerais para o dropdown
            const gerais = await HierarchyService.getAllSupervisoresGerais();
            setSupervisoresGerais(gerais);
        };
        fetchData();
    }, []);

    const userStats = UserService.getStats();

    const handleClearAllData = () => {
        if (window.confirm('⚠️ ATENÇÃO: Isso irá APAGAR TODOS os relatórios. Esta ação não pode ser desfeita. Continuar?')) {
            if (window.confirm('Tem CERTEZA ABSOLUTA? Todos os dados serão perdidos permanentemente.')) {
                localStorage.removeItem('sivep_reports');
                setReports([]);
                window.location.reload();
            }
        }
    };

    const handleExportData = () => {
        const data = JSON.stringify(reports, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sivep-endemias-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleAddUser = async () => {
        setFormError('');
        setIsSubmitting(true);

        try {
            // Validações básicas
            if (!userForm.nome.trim()) {
                setFormError('Nome é obrigatório');
                setIsSubmitting(false);
                return;
            }
            if (!userForm.email.trim()) {
                setFormError('Email é obrigatório');
                setIsSubmitting(false);
                return;
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email)) {
                setFormError('Email inválido');
                setIsSubmitting(false);
                return;
            }
            if (!userForm.senha.trim()) {
                setFormError('Senha é obrigatória');
                setIsSubmitting(false);
                return;
            }
            if (userForm.senha.length < 6) {
                setFormError('Senha deve ter no mínimo 6 caracteres');
                setIsSubmitting(false);
                return;
            }

            // Validações específicas para Supervisor de Área
            if (userForm.funcao === 'supervisor_area') {
                if (!userForm.supervisorGeralId) {
                    setFormError('Selecione o Supervisor Geral');
                    setIsSubmitting(false);
                    return;
                }
            }

            // Importar supabase dinamicamente
            const { supabase } = await import('../services/supabaseClient');

            // Verificar se o email já existe
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('email', userForm.email)
                .maybeSingle();

            if (existingProfile) {
                setFormError('Este email já está cadastrado no sistema.');
                setIsSubmitting(false);
                return;
            }

            // Chamar Edge Function para criar usuário com Admin API
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            if (!accessToken) {
                setFormError('Sessão expirada. Faça login novamente.');
                setIsSubmitting(false);
                return;
            }

            const response = await fetch(
                'https://whdnkliyufiadwmvdmrk.supabase.co/functions/v1/create-user',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({
                        email: userForm.email,
                        password: userForm.senha,
                        full_name: userForm.nome,
                        role: userForm.funcao
                    })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                setFormError(result.error || 'Erro ao criar usuário');
                setIsSubmitting(false);
                return;
            }

            const userId = result.user.id;

            // Criar entrada na hierarquia se for supervisor
            if (userForm.funcao === 'supervisor_geral') {
                await HierarchyService.createSupervisorGeral({
                    profile_id: userId,
                    nome: userForm.nome
                });
            } else if (userForm.funcao === 'supervisor_area') {
                await HierarchyService.createSupervisorArea({
                    profile_id: userId,
                    supervisor_geral_id: userForm.supervisorGeralId,
                    nome: userForm.nome,
                    localidades: userForm.localidadesSelecionadas
                });
            }

            // Atualizar lista de usuários
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .order('full_name');

            if (profiles) {
                const supabaseUsers = profiles.map(p => ({
                    id: p.id,
                    nome: p.full_name || 'Sem nome',
                    email: p.email || '',
                    usuario: p.email || '',
                    funcao: (p.role === 'admin' ? 'gestor' : p.role || 'user') as UserRole,
                    ativo: true,
                    criadoEm: new Date().toISOString(),
                    senha: ''
                }));
                setUsers(supabaseUsers);
            }

            // Atualizar supervisores gerais
            const gerais = await HierarchyService.getAllSupervisoresGerais();
            setSupervisoresGerais(gerais);

            // Fechar modal e resetar form
            setShowUserModal(false);
            setUserForm({
                nome: '',
                funcao: 'gestor',
                email: '',
                senha: '',
                supervisorGeralId: '',
                localidadesSelecionadas: []
            });

            alert('✅ Usuário criado com sucesso! Ele já pode fazer login com email e senha.');
        } catch (error) {
            console.error('Error creating user:', error);
            setFormError(error instanceof Error ? error.message : 'Erro ao salvar usuário');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleUserStatus = (id: string) => {
        UserService.toggleUserStatus(id);
        setUsers(UserService.getAllUsers());
    };

    const handleDeleteUser = async (id: string, nome: string) => {
        if (!window.confirm(`Deseja excluir o usuário "${nome}"?`)) {
            return;
        }
        if (!window.confirm(`⚠️ CONFIRMAÇÃO FINAL: Excluir "${nome}" permanentemente? Esta ação não pode ser desfeita.`)) {
            return;
        }

        try {
            const { supabase } = await import('../services/supabaseClient');
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            if (!accessToken) {
                alert('Sessão expirada. Faça login novamente.');
                return;
            }

            const response = await fetch(
                'https://whdnkliyufiadwmvdmrk.supabase.co/functions/v1/delete-user',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ user_id: id })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                alert(`Erro ao excluir usuário: ${result.error}`);
                return;
            }

            // Atualizar lista de usuários
            const { data: profiles } = await supabase
                .from('profiles')
                .select('id, full_name, email, role')
                .order('full_name');

            if (profiles) {
                const supabaseUsers = profiles.map(p => ({
                    id: p.id,
                    nome: p.full_name || 'Sem nome',
                    email: p.email || '',
                    usuario: p.email || '',
                    funcao: (p.role === 'admin' ? 'gestor' : p.role || 'user') as UserRole,
                    ativo: true,
                    criadoEm: new Date().toISOString(),
                    senha: ''
                }));
                setUsers(supabaseUsers);
            }

            // Atualizar supervisores gerais
            const gerais = await HierarchyService.getAllSupervisoresGerais();
            setSupervisoresGerais(gerais);

            alert(`✅ Usuário "${nome}" excluído com sucesso!`);
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Erro ao excluir usuário. Tente novamente.');
        }
    };

    const getRoleLabel = (role: UserRole): string => {
        return USER_ROLES.find(r => r.value === role)?.label || role;
    };

    const getRoleColor = (role: UserRole): string => {
        switch (role) {
            case 'admin': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
            case 'gestor': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            case 'supervisor_geral': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'supervisor_area': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-background-light dark:bg-background-dark">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">Painel Administrativo</h1>
                        <p className="text-xs text-white/60">Gerenciamento do Sistema</p>
                    </div>
                </div>
            </header>

            {/* Tabs */}
            <div className="bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800">
                <div className="flex">
                    {[
                        { id: 'overview', label: 'Visão Geral', icon: 'dashboard' },
                        { id: 'users', label: 'Usuários', icon: 'group' },
                        { id: 'data', label: 'Dados', icon: 'database' },
                        { id: 'settings', label: 'Config', icon: 'settings' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex-1 py-3 text-[10px] font-bold transition-colors flex flex-col items-center gap-1 ${activeTab === tab.id
                                ? 'text-primary border-b-2 border-primary bg-primary/5'
                                : 'text-slate-400 hover:text-slate-600'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Conteúdo */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 pb-8 space-y-4 md:space-y-6 no-scrollbar">

                {activeTab === 'overview' && (
                    <>
                        {/* Estatísticas Gerais */}
                        <section className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
                            <div className="bg-primary text-white rounded-xl p-3 text-center">
                                <p className="text-2xl font-black">{summary.total}</p>
                                <p className="text-[9px] font-semibold uppercase opacity-80">Relatórios</p>
                            </div>
                            <div className="bg-green-500 text-white rounded-xl p-3 text-center">
                                <p className="text-2xl font-black">{filterOptions.localidades.length}</p>
                                <p className="text-[9px] font-semibold uppercase opacity-80">Localidades</p>
                            </div>
                            <div className="bg-purple-500 text-white rounded-xl p-3 text-center">
                                <p className="text-2xl font-black">{filterOptions.semanas.length}</p>
                                <p className="text-[9px] font-semibold uppercase opacity-80">Semanas</p>
                            </div>
                        </section>

                        {/* Lista de Localidades */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Localidades Registradas</h3>
                            </div>
                            <div className="max-h-48 overflow-y-auto">
                                {filterOptions.localidades.length === 0 ? (
                                    <p className="p-4 text-sm text-slate-400 text-center">Nenhuma localidade registrada</p>
                                ) : (
                                    filterOptions.localidades.map(loc => {
                                        const count = reports.filter(r => r.localidade === loc).length;
                                        return (
                                            <div key={loc} className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{loc}</span>
                                                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">{count}</span>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </section>

                        {/* Semanas Epidemiológicas */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Semanas com Dados</h3>
                            </div>
                            <div className="p-4 flex flex-wrap gap-2">
                                {filterOptions.semanas.length === 0 ? (
                                    <p className="text-sm text-slate-400">Nenhuma semana registrada</p>
                                ) : (
                                    filterOptions.semanas.map(se => (
                                        <span key={se} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-bold">
                                            {se}
                                        </span>
                                    ))
                                )}
                            </div>
                        </section>
                    </>
                )}

                {activeTab === 'users' && (
                    <>
                        {/* Header Usuários */}
                        <section className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Usuários</h2>
                                <p className="text-xs text-slate-400">{userStats.total} usuários cadastrados</p>
                            </div>
                            <button
                                onClick={() => setShowUserModal(true)}
                                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm flex items-center gap-2 transition-colors"
                            >
                                <span className="material-symbols-outlined text-lg">person_add</span>
                                Adicionar
                            </button>
                        </section>

                        {/* Cards de Estatísticas */}
                        <section className="grid grid-cols-4 md:grid-cols-8 gap-2 md:gap-3">
                            <div className="bg-white dark:bg-surface-dark rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800">
                                <p className="text-xl font-black text-slate-800 dark:text-white">{userStats.total}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Total</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800">
                                <p className="text-xl font-black text-green-600">{userStats.ativos}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Ativos</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800">
                                <p className="text-xl font-black text-red-500">{userStats.inativos}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Inativos</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark rounded-xl p-3 text-center border border-slate-200 dark:border-slate-800">
                                <p className="text-xl font-black text-purple-600">{userStats.porFuncao.supervisor_geral + userStats.porFuncao.supervisor_area}</p>
                                <p className="text-[8px] font-bold text-slate-400 uppercase">Superv.</p>
                            </div>
                        </section>

                        {/* Lista de Usuários */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Lista de Usuários</h3>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {users.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-2">person_off</span>
                                        <p className="text-sm text-slate-400">Nenhum usuário cadastrado</p>
                                        <button
                                            onClick={() => setShowUserModal(true)}
                                            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold"
                                        >
                                            Adicionar primeiro usuário
                                        </button>
                                    </div>
                                ) : (
                                    users.map(user => (
                                        <div key={user.id} className="flex items-center gap-3 px-4 py-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.ativo ? 'bg-primary/10' : 'bg-slate-100 dark:bg-slate-800'}`}>
                                                <span className={`material-symbols-outlined ${user.ativo ? 'text-primary' : 'text-slate-400'}`}>person</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={`text-sm font-bold truncate ${user.ativo ? 'text-slate-800 dark:text-white' : 'text-slate-400 line-through'}`}>
                                                        {user.nome}
                                                    </p>
                                                    {!user.ativo && (
                                                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-bold rounded uppercase">Inativo</span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${getRoleColor(user.funcao)}`}>
                                                        {getRoleLabel(user.funcao)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">@{user.usuario}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => setEditingUser({
                                                        id: user.id,
                                                        nome: user.nome,
                                                        email: user.email || user.usuario,
                                                        funcao: user.funcao
                                                    })}
                                                    className="p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                                                    title="Editar"
                                                >
                                                    <span className="material-symbols-outlined text-lg">edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleUserStatus(user.id)}
                                                    className={`p-2 rounded-lg transition-colors ${user.ativo ? 'hover:bg-orange-50 text-orange-500' : 'hover:bg-green-50 text-green-500'}`}
                                                    title={user.ativo ? 'Desativar' : 'Ativar'}
                                                >
                                                    <span className="material-symbols-outlined text-lg">{user.ativo ? 'person_off' : 'person'}</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.nome)}
                                                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                                    title="Excluir"
                                                >
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        {/* Árvore de Hierarquia */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden p-4">
                            <HierarchyTree onRefresh={async () => {
                                const gerais = await HierarchyService.getAllSupervisoresGerais();
                                setSupervisoresGerais(gerais);
                            }} />
                        </section>
                    </>
                )}

                {activeTab === 'data' && (
                    <>
                        {/* Ações de Dados */}
                        <section className="space-y-3">
                            <button
                                onClick={handleExportData}
                                className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-600 text-2xl">download</span>
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-bold text-slate-800 dark:text-white">Exportar Dados</p>
                                    <p className="text-xs text-slate-400">Baixar backup em JSON</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </button>

                            <button className="w-full bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-600 text-2xl">upload</span>
                                </div>
                                <div className="text-left flex-1">
                                    <p className="font-bold text-slate-800 dark:text-white">Importar Dados</p>
                                    <p className="text-xs text-slate-400">Restaurar de backup</p>
                                </div>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </button>
                        </section>

                        {/* Zona de Perigo */}
                        <section className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/50 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="material-symbols-outlined text-red-500">warning</span>
                                <h3 className="text-sm font-bold text-red-700 dark:text-red-400">Zona de Perigo</h3>
                            </div>
                            <p className="text-xs text-red-600/70 dark:text-red-400/70 mb-4">
                                Ações irreversíveis. Tenha certeza antes de prosseguir.
                            </p>
                            <button
                                onClick={handleClearAllData}
                                className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">delete_forever</span>
                                Apagar Todos os Dados
                            </button>
                        </section>
                    </>
                )}

                {activeTab === 'settings' && (
                    <>
                        {/* Configurações do Sistema */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Sistema</h3>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                <div className="flex items-center justify-between px-4 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">Versão</p>
                                        <p className="text-xs text-slate-400">Sivep-Endemias</p>
                                    </div>
                                    <span className="text-sm font-bold text-primary">1.0.0</span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">Armazenamento</p>
                                        <p className="text-xs text-slate-400">Dados locais</p>
                                    </div>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded font-mono">
                                        localStorage
                                    </span>
                                </div>
                                <div className="flex items-center justify-between px-4 py-4">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">Registros</p>
                                        <p className="text-xs text-slate-400">Total armazenado</p>
                                    </div>
                                    <span className="text-sm font-bold text-slate-800 dark:text-white">{reports.length}</span>
                                </div>
                            </div>
                        </section>

                        {/* Informações */}
                        <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                <h3 className="text-xs font-bold text-slate-500 uppercase">Informações</h3>
                            </div>
                            <div className="p-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                                <p><strong>Desenvolvido por:</strong> Divisão de Endemias</p>
                                <p><strong>Tecnologia:</strong> React + TypeScript</p>
                                <p><strong>Build:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
                            </div>
                        </section>
                    </>
                )}
            </main>

            {/* Modal Adicionar Usuário */}
            {showUserModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Header Modal */}
                        <div className="bg-primary text-white px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined">person_add</span>
                                <h2 className="text-lg font-bold">Novo Usuário</h2>
                            </div>
                            <button
                                onClick={() => {
                                    setShowUserModal(false);
                                    setFormError('');
                                    setUserForm({ nome: '', funcao: 'gestor', email: '', senha: '', supervisorGeralId: '', localidadesSelecionadas: [] });
                                }}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-5 space-y-4">
                            {formError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">error</span>
                                    {formError}
                                </div>
                            )}

                            {/* Nome */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    value={userForm.nome}
                                    onChange={(e) => setUserForm({ ...userForm, nome: e.target.value })}
                                    placeholder="Ex: João da Silva"
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>

                            {/* Função */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Função
                                </label>
                                <select
                                    value={userForm.funcao}
                                    onChange={(e) => setUserForm({ ...userForm, funcao: e.target.value as UserRole })}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                >
                                    {USER_ROLES.map(role => (
                                        <option key={role.value} value={role.value}>{role.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    value={userForm.email}
                                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value.toLowerCase().trim() })}
                                    placeholder="Ex: joao.silva@email.com"
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Senha
                                </label>
                                <input
                                    type="password"
                                    value={userForm.senha}
                                    onChange={(e) => setUserForm({ ...userForm, senha: e.target.value })}
                                    placeholder="Mínimo 4 caracteres"
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>

                            {/* Campos condicionais para Supervisor de Área */}
                            {userForm.funcao === 'supervisor_area' && (
                                <>
                                    {/* Supervisor Geral */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Supervisor Geral <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={userForm.supervisorGeralId}
                                            onChange={(e) => setUserForm({ ...userForm, supervisorGeralId: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                        >
                                            <option value="">Selecione o Supervisor Geral</option>
                                            {supervisoresGerais.map(sg => (
                                                <option key={sg.id} value={sg.id}>{sg.nome}</option>
                                            ))}
                                        </select>
                                        {supervisoresGerais.length === 0 && (
                                            <p className="text-xs text-amber-500 mt-1">
                                                ⚠️ Nenhum Supervisor Geral cadastrado. Crie um primeiro.
                                            </p>
                                        )}
                                    </div>

                                    {/* Localidades */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                            Localidades Vinculadas
                                        </label>
                                        <div className="max-h-40 overflow-y-auto border-2 border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800 space-y-1">
                                            {LOCALIDADES.map(loc => {
                                                const isSelected = userForm.localidadesSelecionadas.includes(loc);
                                                return (
                                                    <button
                                                        key={loc}
                                                        type="button"
                                                        onClick={() => {
                                                            const updated = isSelected
                                                                ? userForm.localidadesSelecionadas.filter(l => l !== loc)
                                                                : [...userForm.localidadesSelecionadas, loc];
                                                            setUserForm({ ...userForm, localidadesSelecionadas: updated });
                                                        }}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${isSelected
                                                            ? 'bg-primary/10 text-primary font-semibold'
                                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        <span className={`material-symbols-outlined text-sm ${isSelected ? 'text-primary' : 'text-slate-400'}`}>
                                                            {isSelected ? 'check_box' : 'check_box_outline_blank'}
                                                        </span>
                                                        {loc}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {userForm.localidadesSelecionadas.length > 0 && (
                                            <p className="text-xs text-primary mt-1 font-semibold">
                                                {userForm.localidadesSelecionadas.length} localidade(s) selecionada(s)
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-5 pb-5 flex gap-3">
                            <button
                                onClick={() => {
                                    setShowUserModal(false);
                                    setFormError('');
                                    setUserForm({ nome: '', funcao: 'gestor', email: '', senha: '', supervisorGeralId: '', localidadesSelecionadas: [] });
                                }}
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleAddUser}
                                disabled={isSubmitting}
                                className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-lg">check</span>
                                )}
                                {isSubmitting ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Editar Usuário */}
            <UserEditModal
                isOpen={editingUser !== null}
                onClose={() => setEditingUser(null)}
                user={editingUser}
                supervisoresGerais={supervisoresGerais}
                onUserUpdated={async () => {
                    setUsers(UserService.getAllUsers());
                    const gerais = await HierarchyService.getAllSupervisoresGerais();
                    setSupervisoresGerais(gerais);
                }}
            />
        </div>
    );
};
