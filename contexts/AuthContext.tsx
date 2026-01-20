import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

interface AuthContextType {
    session: Session | null;
    user: User | null;
    profile: any | null;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
    getRoleLabel: () => string;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    profile: null,
    isAdmin: false,
    loading: true,
    signOut: async () => { },
    getRoleLabel: () => '',
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Obter sessão inicial
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setLoading(false);
            }
        });

        // Escutar mudanças na auth
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id);
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
            } else {
                setProfile(data);
            }
        } catch (error) {
            console.error('Unexpected error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
        } catch (error) {
            console.error("Erro ao realizar logout:", error);
        } finally {
            // Força a limpeza do estado local mesmo se der erro no servidor (ex: 403)
            setSession(null);
            setUser(null);
            setProfile(null);
            localStorage.clear(); // Limpa dados locais para garantir
        }
    };

    const isAdmin = profile?.role === 'admin';

    const getRoleLabel = () => {
        const role = profile?.role;
        switch (role) {
            case 'admin': return 'Administrador';
            case 'gestor': return 'Gestor';
            case 'supervisor_geral': return 'Supervisor Geral';
            case 'supervisor_area': return 'Supervisor de Área';
            default: return 'Agente de Campo';
        }
    };

    return (
        <AuthContext.Provider value={{ session, user, profile, isAdmin, loading, signOut, getRoleLabel }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
