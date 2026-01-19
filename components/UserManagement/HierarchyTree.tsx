import React, { useState, useEffect } from 'react';
import { HierarchyService } from '../../services/hierarchyService';
import { SupervisorGeral, SupervisorArea } from '../../types/userTypes';
import { LOCALIDADES } from '../../constants';

interface HierarchyTreeProps {
    onRefresh?: () => void;
}

export const HierarchyTree: React.FC<HierarchyTreeProps> = ({ onRefresh }) => {
    const [hierarchy, setHierarchy] = useState<SupervisorGeral[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

    // Modal state
    const [editingSupervidor, setEditingSupervidor] = useState<SupervisorArea | null>(null);
    const [selectedLocalidades, setSelectedLocalidades] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadHierarchy();
    }, []);

    const loadHierarchy = async () => {
        setLoading(true);
        try {
            const data = await HierarchyService.getFullHierarchy();
            setHierarchy(data);
            // Expandir todos por padrão
            const allIds = new Set<string>();
            data.forEach(sg => {
                allIds.add(sg.id);
                sg.supervisores_area?.forEach(sa => allIds.add(sa.id));
            });
            setExpandedItems(allIds);
        } catch (error) {
            console.error('Error loading hierarchy:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    const openEditModal = (supervisor: SupervisorArea) => {
        setEditingSupervidor(supervisor);
        setSelectedLocalidades(supervisor.localidades?.map(l => l.localidade) || []);
    };

    const closeEditModal = () => {
        setEditingSupervidor(null);
        setSelectedLocalidades([]);
    };

    const handleSaveLocalidades = async () => {
        if (!editingSupervidor) return;

        setSaving(true);
        try {
            await HierarchyService.updateLocalidades(editingSupervidor.id, selectedLocalidades);
            await loadHierarchy();
            onRefresh?.();
            closeEditModal();
            alert('✅ Localidades atualizadas com sucesso!');
        } catch (error) {
            console.error('Error updating localidades:', error);
            alert('❌ Erro ao atualizar localidades');
        } finally {
            setSaving(false);
        }
    };

    const toggleLocalidade = (loc: string) => {
        setSelectedLocalidades(prev =>
            prev.includes(loc)
                ? prev.filter(l => l !== loc)
                : [...prev, loc]
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (hierarchy.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl text-slate-400">account_tree</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                    Nenhuma hierarquia cadastrada ainda.
                </p>
                <p className="text-slate-400 text-xs mt-1">
                    Crie Supervisores Gerais para começar.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg text-primary">account_tree</span>
                    Árvore de Hierarquia
                </h3>
                <button
                    onClick={() => {
                        loadHierarchy();
                        onRefresh?.();
                    }}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Atualizar"
                >
                    <span className="material-symbols-outlined text-lg text-slate-500">refresh</span>
                </button>
            </div>

            {/* Tree */}
            <div className="space-y-2">
                {hierarchy.map(supervisorGeral => (
                    <div key={supervisorGeral.id} className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                        {/* Supervisor Geral */}
                        <button
                            onClick={() => toggleExpand(supervisorGeral.id)}
                            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <span className={`material-symbols-outlined text-lg transition-transform ${expandedItems.has(supervisorGeral.id) ? 'rotate-90' : ''}`}>
                                chevron_right
                            </span>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                {supervisorGeral.nome.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 text-left">
                                <p className="font-semibold text-slate-800 dark:text-white">{supervisorGeral.nome}</p>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-[10px] font-bold uppercase">
                                        Supervisor Geral
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        {supervisorGeral.supervisores_area?.length || 0} subordinado(s)
                                    </span>
                                </div>
                            </div>
                        </button>

                        {/* Supervisores de Área */}
                        {expandedItems.has(supervisorGeral.id) && supervisorGeral.supervisores_area && supervisorGeral.supervisores_area.length > 0 && (
                            <div className="border-t border-slate-100 dark:border-slate-800">
                                {supervisorGeral.supervisores_area.map(supervisorArea => (
                                    <div key={supervisorArea.id} className="ml-8 border-l-2 border-slate-200 dark:border-slate-700">
                                        {/* Supervisor de Área */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => toggleExpand(supervisorArea.id)}
                                                className="flex-1 flex items-center gap-3 p-3 pl-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                            >
                                                <span className={`material-symbols-outlined text-sm transition-transform ${expandedItems.has(supervisorArea.id) ? 'rotate-90' : ''}`}>
                                                    chevron_right
                                                </span>
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white text-sm font-bold">
                                                    {supervisorArea.nome.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium text-slate-700 dark:text-slate-200 text-sm">{supervisorArea.nome}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-[9px] font-bold uppercase">
                                                            Sup. Área
                                                        </span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {supervisorArea.localidades?.length || 0} localidade(s)
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    openEditModal(supervisorArea);
                                                }}
                                                className="p-2 mr-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                title="Editar Localidades"
                                            >
                                                <span className="material-symbols-outlined text-lg text-blue-500">edit_location_alt</span>
                                            </button>
                                        </div>

                                        {/* Localidades */}
                                        {expandedItems.has(supervisorArea.id) && supervisorArea.localidades && supervisorArea.localidades.length > 0 && (
                                            <div className="ml-8 py-2 space-y-1">
                                                {supervisorArea.localidades.map(loc => (
                                                    <div
                                                        key={loc.id}
                                                        className="flex items-center gap-2 px-4 py-1.5 text-sm text-slate-600 dark:text-slate-400"
                                                    >
                                                        <span className="material-symbols-outlined text-sm text-green-500">location_on</span>
                                                        <span>{loc.localidade}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* No localities message */}
                                        {expandedItems.has(supervisorArea.id) && (!supervisorArea.localidades || supervisorArea.localidades.length === 0) && (
                                            <div className="ml-8 py-2 px-4">
                                                <p className="text-xs text-slate-400 italic">Nenhuma localidade vinculada</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Sem subordinados */}
                        {expandedItems.has(supervisorGeral.id) && (!supervisorGeral.supervisores_area || supervisorGeral.supervisores_area.length === 0) && (
                            <div className="border-t border-slate-100 dark:border-slate-800 p-4 ml-8">
                                <p className="text-xs text-slate-400 italic">Nenhum Supervisor de Área vinculado</p>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Supervisor Geral</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Supervisor de Área</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-green-500">location_on</span>
                    <span>Localidade</span>
                </div>
            </div>

            {/* Edit Localidades Modal */}
            {editingSupervidor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
                    <div className="bg-white dark:bg-surface-dark rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-5 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-white text-2xl">edit_location_alt</span>
                                <div>
                                    <h2 className="text-lg font-bold text-white">Editar Localidades</h2>
                                    <p className="text-white/80 text-xs">{editingSupervidor.nome}</p>
                                </div>
                            </div>
                            <button
                                onClick={closeEditModal}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <span className="material-symbols-outlined text-white">close</span>
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                Selecione as localidades que este Supervisor de Área será responsável:
                            </p>

                            <div className="max-h-64 overflow-y-auto border-2 border-slate-200 dark:border-slate-700 rounded-xl p-2 bg-slate-50 dark:bg-slate-800 space-y-1">
                                {LOCALIDADES.map(loc => {
                                    const isSelected = selectedLocalidades.includes(loc);
                                    return (
                                        <button
                                            key={loc}
                                            type="button"
                                            onClick={() => toggleLocalidade(loc)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${isSelected
                                                    ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 font-semibold'
                                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                                                }`}
                                        >
                                            <span className={`material-symbols-outlined text-sm ${isSelected ? 'text-blue-500' : 'text-slate-400'}`}>
                                                {isSelected ? 'check_box' : 'check_box_outline_blank'}
                                            </span>
                                            <span className="material-symbols-outlined text-sm text-green-500">location_on</span>
                                            {loc}
                                        </button>
                                    );
                                })}
                            </div>

                            <p className="text-xs text-slate-400 mt-3">
                                {selectedLocalidades.length} localidade(s) selecionada(s)
                            </p>
                        </div>

                        {/* Footer */}
                        <div className="px-5 pb-5 flex gap-3">
                            <button
                                onClick={closeEditModal}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSaveLocalidades}
                                disabled={saving}
                                className="flex-1 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span className="material-symbols-outlined text-lg">check</span>
                                )}
                                {saving ? 'Salvando...' : 'Salvar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
