// Serviço para gerenciamento de usuários

import { User, UserRole } from '../types/userTypes';

const STORAGE_KEY = 'sivep_users';

export class UserService {
    private static generateId(): string {
        return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    static getAllUsers(): User[] {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data) as User[];
        } catch {
            return [];
        }
    }

    static saveUser(userData: Omit<User, 'id' | 'criadoEm' | 'ativo'>): User {
        const users = this.getAllUsers();

        // Verificar se usuário já existe
        const exists = users.find(u => u.usuario.toLowerCase() === userData.usuario.toLowerCase());
        if (exists) {
            throw new Error('Usuário já existe');
        }

        const newUser: User = {
            id: this.generateId(),
            nome: userData.nome,
            funcao: userData.funcao,
            usuario: userData.usuario,
            senha: userData.senha, // Em produção, usar bcrypt ou similar
            ativo: true,
            criadoEm: new Date().toISOString(),
        };

        users.push(newUser);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return newUser;
    }

    static updateUser(id: string, updates: Partial<User>): User | null {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === id);

        if (index === -1) return null;

        users[index] = { ...users[index], ...updates };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return users[index];
    }

    static deleteUser(id: string): boolean {
        const users = this.getAllUsers();
        const filtered = users.filter(u => u.id !== id);

        if (filtered.length === users.length) return false;

        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        return true;
    }

    static toggleUserStatus(id: string): User | null {
        const users = this.getAllUsers();
        const user = users.find(u => u.id === id);

        if (!user) return null;

        user.ativo = !user.ativo;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
        return user;
    }

    static getUserByCredentials(usuario: string, senha: string): User | null {
        const users = this.getAllUsers();
        return users.find(u =>
            u.usuario.toLowerCase() === usuario.toLowerCase() &&
            u.senha === senha &&
            u.ativo
        ) || null;
    }

    static getUsersByRole(role: UserRole): User[] {
        return this.getAllUsers().filter(u => u.funcao === role);
    }

    static getStats() {
        const users = this.getAllUsers();
        return {
            total: users.length,
            ativos: users.filter(u => u.ativo).length,
            inativos: users.filter(u => !u.ativo).length,
            porFuncao: {
                gestor: users.filter(u => u.funcao === 'gestor').length,
                supervisor_geral: users.filter(u => u.funcao === 'supervisor_geral').length,
                supervisor_area: users.filter(u => u.funcao === 'supervisor_area').length,
            }
        };
    }
}
