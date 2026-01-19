import React, { useState, useEffect } from 'react';
import { HierarchyService } from '../../services/hierarchyService';
import { SupervisorGeral, SupervisorArea, LocalidadeSupervisor, UserRole } from '../../types/userTypes';
import { LOCALIDADES } from '../../constants';

interface UserEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: {
        id: string;
        nome: string;
        email: string;
        funcao: UserRole;
    } | null;
    supervisoresGerais: SupervisorGeral[];
    onUserUpdated: () => void;
}

type TabType = 'info' | 'hierarchy' | 'localities';

export const UserEditModal: React.FC<UserEditModalProps> = ({
    isOpen,
    onClose,
    user,
    supervisoresGerais,
    onUserUpdated
}) => {
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Dados do supervisor de área (se aplicável)
    const [supervisorAreaData, setSupervisorAreaData] = useState<SupervisorArea | null>(null);
    const [selectedGeralId, setSelectedGeralId] = useState('');
    const [localidades, setLocalidades] = useState<LocalidadeSupervisor[]>([]);
    const [newLocalidade, setNewLocalidade] = useState('');

    useEffect(() => {
        if (isOpen && user && user.funcao === 'supervisor_area') {
            loadSupervisorAreaData();
        }
    }, [isOpen, user]);

    const loadSupervisorAreaData = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const allAreas = await HierarchyService.getAllSupervisoresArea();
            // Buscar por nome já que não temos o profile_id real
            const found = allAreas.find(sa => sa.nome === user.nome);
            if (found) {
                setSupervisorAreaData(found);
                setSelectedGeralId(found.supervisor_geral_id);
                setLocalidades(found.localidades || []);
            }
        } catch (err) {
            console.error('Error loading supervisor area data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateHierarchy = async () => {
        if (!supervisorAreaData || !selectedGeralId) return;
        setIsLoading(true);
        setError('');
        try {
            await HierarchyService.updateSupervisorArea(supervisorAreaData.id, {
                supervisor_geral_id: selectedGeralId
            });
            setSuccess('Hierarquia atualizada com sucesso!');
            onUserUpdated();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Erro ao atualizar hierarquia');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddLocalidade = async () => {
        if (!supervisorAreaData || !newLocalidade) return;
        setIsLoading(true);
        setError('');
        try {
            await HierarchyService.addLocalidade(supervisorAreaData.id, newLocalidade);
            const updated = await HierarchyService.getLocalidadesBySupervisor(supervisorAreaData.id);
            setLocalidades(updated);
            setNewLocalidade('');
            setSuccess('Localidade adicionada!');
            onUserUpdated();
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Erro ao adicionar localidade. Pode já existir.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveLocalidade = async (localidadeId: string) => {
        if (!window.confirm('Remover esta localidade?')) return;
        setIsLoading(true);
        try {
            await HierarchyService.removeLocalidade(localidadeId);
            setLocalidades(prev => prev.filter(l => l.id !== localidadeId));
            setSuccess('Localidade removida!');
            onUserUpdated();
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Erro ao remover localidade');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!user) return;
        const confirmMsg = `⚠️ ATENÇÃO: Isso irá excluir permanentemente o usuário "${user.nome}" e todos os dados relacionados. Continuar?`;
        if (!window.confirm(confirmMsg)) return;
        if (!window.confirm('Tem certeza absoluta? Esta ação não pode ser desfeita.')) return;

        setIsLoading(true);
        try {
            if (supervisorAreaData) {
                await HierarchyService.deleteSupervisorArea(supervisorAreaData.id);
            }
            // TODO: Também deletar do UserService local
            setSuccess('Usuário excluído!');
            onUserUpdated();
            setTimeout(() => onClose(), 1000);
        } catch (err) {
            setError('Erro ao excluir usuário');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    const tabs = [
        { id: 'info' as TabType, label: 'Informações', icon: 'person' },
        ...(user.funcao === 'supervisor_area' ? [
            { id: 'hierarchy' as TabType, label: 'Hierarquia', icon: 'account_tree' },
            { id: 'localities' as TabType, label: 'Localidades', icon: 'location_on' },
        ] : []),
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="bg-primary text-white px-5 py-4 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined">edit</span>
                        <h2 className="text-lg font-bold">Editar Usuário</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-white/20 rounded-full transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-200 dark:border-slate-700 shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${activeTab === tab.id
                                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                                }`}
                        >
                            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Messages */}
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-600 dark:text-green-400 text-sm flex items-center gap-2">
                            <span className="material-symbols-outlined text-lg">check_circle</span>
                            {success}
                        </div>
                    )}

                    {/* Tab: Info */}
                    {activeTab === 'info' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                                    {user.nome.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">{user.nome}</h3>
                                    <p className="text-sm text-slate-500">{user.email}</p>
                                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${user.funcao === 'supervisor_geral' ? 'bg-purple-100 text-purple-700' :
                                            user.funcao === 'supervisor_area' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                        }`}>
                                        {user.funcao.replace('_', ' ')}
                                    </span>
                                </div>
                            </div>

                            {supervisorAreaData && (
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl space-y-2">
                                    <p className="text-xs font-bold text-blue-600 uppercase">Vinculado a</p>
                                    <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                                        {supervisoresGerais.find(sg => sg.id === supervisorAreaData.supervisor_geral_id)?.nome || 'Não encontrado'}
                                    </p>
                                    <p className="text-xs text-blue-600">
                                        {localidades.length} localidade(s) vinculada(s)
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tab: Hierarchy */}
                    {activeTab === 'hierarchy' && user.funcao === 'supervisor_area' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                                    Supervisor Geral Atual
                                </label>
                                <select
                                    value={selectedGeralId}
                                    onChange={(e) => setSelectedGeralId(e.target.value)}
                                    className="w-full h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                >
                                    <option value="">Selecione...</option>
                                    {supervisoresGerais.map(sg => (
                                        <option key={sg.id} value={sg.id}>{sg.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <button
                                onClick={handleUpdateHierarchy}
                                disabled={isLoading || !selectedGeralId || selectedGeralId === supervisorAreaData?.supervisor_geral_id}
                                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined">save</span>
                                )}
                                Atualizar Hierarquia
                            </button>
                        </div>
                    )}

                    {/* Tab: Localities */}
                    {activeTab === 'localities' && user.funcao === 'supervisor_area' && (
                        <div className="space-y-4">
                            {/* Add new */}
                            <div className="flex gap-2">
                                <select
                                    value={newLocalidade}
                                    onChange={(e) => setNewLocalidade(e.target.value)}
                                    className="flex-1 h-10 px-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm"
                                >
                                    <option value="">Adicionar localidade...</option>
                                    {LOCALIDADES.filter(loc => !localidades.some(l => l.localidade === loc)).map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleAddLocalidade}
                                    disabled={!newLocalidade || isLoading}
                                    className="px-4 h-10 rounded-lg bg-primary text-white font-bold disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined text-lg">add</span>
                                </button>
                            </div>

                            {/* List */}
                            <div className="space-y-2">
                                {localidades.length === 0 ? (
                                    <p className="text-center text-slate-400 py-4 text-sm">Nenhuma localidade vinculada</p>
                                ) : (
                                    localidades.map(loc => (
                                        <div
                                            key={loc.id}
                                            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-primary">location_on</span>
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {loc.localidade}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleRemoveLocalidade(loc.id)}
                                                disabled={isLoading}
                                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-lg">delete</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer - Delete */}
                <div className="px-5 pb-5 pt-2 border-t border-slate-200 dark:border-slate-700 shrink-0">
                    <button
                        onClick={handleDeleteUser}
                        disabled={isLoading}
                        className="w-full py-3 rounded-xl border-2 border-red-200 dark:border-red-800 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined">delete_forever</span>
                        Excluir Usuário
                    </button>
                </div>
            </div>
        </div>
    );
};
