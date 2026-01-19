
import React, { useState, useEffect } from 'react';
import { FormData } from '../types';
import { MUNICIPIOS, CATEGORIAS, LOCALIDADES } from '../constants';
import { supabase } from '../services/supabaseClient';
import { HierarchyService } from '../services/hierarchyService';

interface IdentificationStepProps {
  data: FormData;
  onChange: (data: Partial<FormData>) => void;
  onClear?: () => void;
}

export const IdentificationStep: React.FC<IdentificationStepProps> = ({ data, onChange, onClear }) => {
  const [allowedLocalidades, setAllowedLocalidades] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState<{ role: string; name: string } | null>(null);

  useEffect(() => {
    loadUserLocalidades();
  }, []);

  const loadUserLocalidades = async () => {
    setLoading(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No user logged in, showing all localities');
        setAllowedLocalidades(LOCALIDADES);
        setLoading(false);
        return;
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('id', user.id)
        .single();

      if (!profile) {
        console.log('No profile found, showing all localities');
        setAllowedLocalidades(LOCALIDADES);
        setLoading(false);
        return;
      }

      setUserInfo({ role: profile.role || 'user', name: profile.full_name || 'Usuário' });

      // Check role and get appropriate localities
      if (profile.role === 'admin' || profile.role === 'gestor') {
        // Admin/Gestor sees all localities
        setAllowedLocalidades(LOCALIDADES);
      } else if (profile.role === 'supervisor_geral') {
        // Supervisor Geral sees all localities from their subordinate Supervisores de Área
        const { data: supervisorGeral } = await supabase
          .from('supervisores_gerais')
          .select('id')
          .eq('profile_id', user.id)
          .single();

        if (supervisorGeral) {
          // Get all supervisores de área under this supervisor geral
          const { data: supervisoresArea } = await supabase
            .from('supervisores_area')
            .select('id')
            .eq('supervisor_geral_id', supervisorGeral.id);

          if (supervisoresArea && supervisoresArea.length > 0) {
            const saIds = supervisoresArea.map(sa => sa.id);

            // Get all localities from these supervisores de área
            const { data: localidades } = await supabase
              .from('localidades_supervisor')
              .select('localidade')
              .in('supervisor_area_id', saIds);

            if (localidades && localidades.length > 0) {
              const locs = [...new Set(localidades.map(l => l.localidade))];
              setAllowedLocalidades(locs.sort());
            } else {
              // No localities assigned yet, show empty
              setAllowedLocalidades([]);
            }
          } else {
            // No subordinates yet, show empty
            setAllowedLocalidades([]);
          }
        } else {
          // Not found as supervisor geral, show all
          setAllowedLocalidades(LOCALIDADES);
        }
      } else if (profile.role === 'supervisor_area') {
        // Supervisor de Área sees only their assigned localities
        const localidades = await HierarchyService.getMyLocalidades(user.id);
        setAllowedLocalidades(localidades.sort());
      } else {
        // Unknown role, show all
        setAllowedLocalidades(LOCALIDADES);
      }
    } catch (error) {
      console.error('Error loading user localities:', error);
      setAllowedLocalidades(LOCALIDADES);
    } finally {
      setLoading(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'gestor': return 'Gestor';
      case 'supervisor_geral': return 'Supervisor Geral';
      case 'supervisor_area': return 'Supervisor de Área';
      default: return role;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="px-5 pt-4">
        <h2 className="text-slate-900 dark:text-white tracking-tight text-[28px] font-bold leading-tight">Identificação e Localização</h2>
        <p className="text-slate-500 dark:text-slate-400 text-base font-normal mt-2">
          Preencha os dados geográficos e de identificação da localidade inspecionada em Itabuna.
        </p>
        {userInfo && (
          <div className="mt-3 px-3 py-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <p className="text-xs text-primary dark:text-blue-300">
              <span className="font-bold">{userInfo.name}</span> • {getRoleLabel(userInfo.role)}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5 px-5 pb-10">
        <div className="flex flex-col gap-1 w-full">
          <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold pb-2">Município <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={data.municipio}
              onChange={(e) => onChange({ municipio: e.target.value })}
              className="form-select w-full rounded-xl text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark focus:border-primary h-14 pl-4 pr-10 text-base appearance-none"
            >
              <option disabled value="">Selecione o município</option>
              {MUNICIPIOS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold pb-2">
            Localidade <span className="text-red-500">*</span>
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({loading ? 'carregando...' : `${allowedLocalidades.length} disponíveis`})
            </span>
          </label>
          <div className="relative">
            <select
              value={data.localidade}
              onChange={(e) => onChange({ localidade: e.target.value })}
              disabled={loading}
              className="form-select w-full rounded-xl text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark focus:border-primary h-14 pl-4 pr-10 text-base appearance-none disabled:opacity-50"
            >
              <option value="">
                {loading ? 'Carregando...' : allowedLocalidades.length === 0 ? 'Nenhuma localidade vinculada' : 'Selecione a localidade'}
              </option>
              {allowedLocalidades.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>
          {!loading && allowedLocalidades.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">warning</span>
              Nenhuma localidade vinculada ao seu perfil. Contate o administrador.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1 w-full">
          <label className="text-slate-900 dark:text-slate-200 text-sm font-semibold pb-2">Categoria da Localidade <span className="text-red-500">*</span></label>
          <div className="relative">
            <select
              value={data.categoriaLocalidade}
              onChange={(e) => onChange({ categoriaLocalidade: e.target.value })}
              className="form-select w-full rounded-xl text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 bg-white dark:bg-surface-dark h-14 pl-4 pr-10 text-base focus:border-primary appearance-none"
            >
              <option disabled value="">Selecione a categoria</option>
              {CATEGORIAS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Botão Limpar Formulário */}
      {onClear && (
        <div className="px-5 pb-4">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Tem certeza que deseja limpar todos os dados do formulário?')) {
                onClear();
              }
            }}
            className="w-full h-12 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
          >
            <span className="material-symbols-outlined text-lg">delete_sweep</span>
            <span>Limpar Formulário</span>
          </button>
        </div>
      )}
    </div>
  );
};
