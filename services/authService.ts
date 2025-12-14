import type { User } from '../types';
import { UserRole, UserStatus } from '../types';
import { SUPER_ADMIN_USER } from '../constants';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

export const authService = {
  login: async (email: string, password: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/superadmin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        const user: User = {
          id: result.data.id,
          name: result.data.username,
          email: result.data.email,
          role: UserRole.SUPER_ADMIN,
          status: UserStatus.ACTIVE,
          avatarUrl: '',
          team: 'Admin',
          basicSalary: 0,
          hireDate: new Date(result.data.date_created),
          createdAt: new Date(result.data.date_created),
          updatedAt: new Date(),
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        return user;
      }
    } catch (error) {
      console.warn('API login failed, falling back to static credentials:', error);
    }

    // Fallback to static login
    if (email === SUPER_ADMIN_USER.email && password === SUPER_ADMIN_USER.password) {
      const user: User = {
        id: SUPER_ADMIN_USER.id,
        name: SUPER_ADMIN_USER.name,
        email: SUPER_ADMIN_USER.email,
        role: SUPER_ADMIN_USER.role,
        status: SUPER_ADMIN_USER.status,
        avatarUrl: SUPER_ADMIN_USER.avatarUrl,
        team: SUPER_ADMIN_USER.team,
        basicSalary: SUPER_ADMIN_USER.basicSalary,
        hireDate: SUPER_ADMIN_USER.hireDate,
        createdAt: SUPER_ADMIN_USER.createdAt,
        updatedAt: SUPER_ADMIN_USER.updatedAt,
      };
      localStorage.setItem('currentUser', JSON.stringify(user));
      return user;
    }
    return null;
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  },

  logout: (): void => {
    localStorage.removeItem('currentUser');
  },
};
