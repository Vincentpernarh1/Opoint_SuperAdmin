import type { Company, NewCompanyData, User, AuditLog, SuperAdmin } from '../types';
import { UserRole, CompanyStatus, UserStatus } from '../types';
import { COMPANIES, USERS } from '../constants';

class ApiService {
  private companies: Company[] = [...COMPANIES];
  private users: User[] = [...USERS];
  private auditLogs: AuditLog[] = [];

  // Company CRUD operations
  async getCompanies(): Promise<Company[]> {
    const response = await fetch('/api/companies');
    
    if (!response.ok) {
      throw new Error('Failed to fetch companies');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch companies');
    }
    
    return result.data;
  }

  async getCompany(id: string): Promise<Company> {
    const response = await fetch(`/api/companies/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch company');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch company');
    }
    
    return result.data;
  }

  async createCompany(data: NewCompanyData): Promise<Company> {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create company');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create company');
    }
    
    return result.data;
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    const response = await fetch(`/api/companies/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update company');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update company');
    }

    return result.data;
  }

  async deleteCompany(id: string): Promise<boolean> {
    const response = await fetch(`/api/companies/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete company');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete company');
    }

    return true;
  }

  // User CRUD operations
  async getUsers(): Promise<User[]> {
    const response = await fetch('/api/users');
    
    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch users');
    }
    
    return result.data;
  }

  async getUser(id: string): Promise<User | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = this.users.find(u => u.id === id);
        resolve(user || null);
      }, 300);
    });
  }

  async getUsersByCompany(companyId: string): Promise<User[]> {
    const response = await fetch(`/api/users?companyId=${companyId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch users for company');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch users for company');
    }
    
    return result.data;
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user: User = {
          ...userData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.users.push(user);
        this.logAudit('create', 'user', user.id, 'superadmin', { ...user });
        resolve(user);
      }, 500);
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error('Failed to update user');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update user');
    }

    return result.data;
  }

  async deleteUser(id: string): Promise<boolean> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete user');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete user');
    }

    return true;
  }

  // Legacy methods for backward compatibility
  async createCompanyAndAdmin(data: NewCompanyData): Promise<{ company: Company }> {
    const response = await fetch('/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create company and admin');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create company and admin');
    }
    
    return result.data;
  }

  // Audit logging
  private logAudit(action: string, entityType: 'company' | 'user', entityId: string, userId: string, changes: any) {
    const log: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      entityType,
      entityId,
      userId,
      changes,
      timestamp: new Date(),
    };
    this.auditLogs.push(log);
  }

  async getAuditLogs(entityType?: 'company' | 'user', entityId?: string): Promise<AuditLog[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        let logs = [...this.auditLogs];
        if (entityType) {
          logs = logs.filter(log => log.entityType === entityType);
        }
        if (entityId) {
          logs = logs.filter(log => log.entityId === entityId);
        }
        resolve(logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()));
      }, 300);
    });
  }

  // SuperAdmin CRUD operations
  async getSuperAdmins(): Promise<SuperAdmin[]> {
    const response = await fetch('/api/superadmin/list');
    
    if (!response.ok) {
      throw new Error('Failed to fetch super admins');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch super admins');
    }
    
    return result.data.map((admin: any) => ({
      ...admin,
      date_created: new Date(admin.date_created),
      last_access_time: admin.last_access_time ? new Date(admin.last_access_time) : null,
    }));
  }

  async createSuperAdmin(data: { email: string; username: string; password: string }): Promise<SuperAdmin> {
    const response = await fetch('/api/superadmin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create super admin');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create super admin');
    }
    
    return {
      ...result.data,
      date_created: new Date(result.data.date_created),
      last_access_time: result.data.last_access_time ? new Date(result.data.last_access_time) : null,
    };
  }

  async resetSuperAdminPassword(email: string): Promise<{ message: string; tempPassword: string }> {
    const response = await fetch('/api/superadmin/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to reset password');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to reset password');
    }
    
    return result.data;
  }

  async getSuperAdmin(id: string): Promise<SuperAdmin> {
    const response = await fetch(`/api/superadmin/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch super admin');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch super admin');
    }
    
    return {
      ...result.data,
      date_created: new Date(result.data.date_created),
      last_access_time: result.data.last_access_time ? new Date(result.data.last_access_time) : null,
    };
  }

  async updateSuperAdmin(id: string, data: { email: string; username: string }): Promise<SuperAdmin> {
    const response = await fetch(`/api/superadmin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update super admin');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update super admin');
    }
    
    return {
      ...result.data,
      date_created: new Date(result.data.date_created),
      last_access_time: result.data.last_access_time ? new Date(result.data.last_access_time) : null,
    };
  }

  async deleteSuperAdmin(id: string): Promise<{ id: string; email: string; username: string }> {
    const response = await fetch(`/api/superadmin/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete super admin');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete super admin');
    }
    
    return result.data;
  }
}

export const api = new ApiService();