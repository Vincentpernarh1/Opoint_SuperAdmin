import type { Company, NewCompanyData, User, AuditLog } from '../types';
import { UserRole, CompanyStatus, UserStatus } from '../types';
import { COMPANIES, USERS } from '../constants';

class ApiService {
  private companies: Company[] = [...COMPANIES];
  private users: User[] = [...USERS];
  private auditLogs: AuditLog[] = [];

  // Company CRUD operations
  async getCompanies(): Promise<Company[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.companies]), 300);
    });
  }

  async getCompany(id: string): Promise<Company | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const company = this.companies.find(c => c.id === id);
        resolve(company || null);
      }, 300);
    });
  }

  async createCompany(data: NewCompanyData): Promise<Company> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const company: Company = {
          id: Math.random().toString(36).substr(2, 9),
          name: data.name,
          licenseCount: data.licenseCount,
          usedLicenses: 0,
          status: CompanyStatus.ACTIVE,
          modules: data.modules,
          description: data.description,
          registrationId: data.registrationId,
          address: data.address,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        this.companies.push(company);
        this.logAudit('create', 'company', company.id, 'superadmin', { ...company });
        resolve(company);
      }, 500);
    });
  }

  async updateCompany(id: string, updates: Partial<Company>): Promise<Company | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.companies.findIndex(c => c.id === id);
        if (index === -1) {
          resolve(null);
          return;
        }

        const oldCompany = { ...this.companies[index] };
        this.companies[index] = {
          ...this.companies[index],
          ...updates,
          updatedAt: new Date()
        };

        this.logAudit('update', 'company', id, 'superadmin', { old: oldCompany, new: this.companies[index] });
        resolve(this.companies[index]);
      }, 500);
    });
  }

  async deleteCompany(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.companies.findIndex(c => c.id === id);
        if (index === -1) {
          resolve(false);
          return;
        }

        const company = this.companies[index];
        this.companies.splice(index, 1);
        this.logAudit('delete', 'company', id, 'superadmin', { deleted: company });
        resolve(true);
      }, 500);
    });
  }

  // User CRUD operations
  async getUsers(): Promise<User[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve([...this.users]), 300);
    });
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const companyUsers = this.users.filter(u => u.companyId === companyId);
        resolve(companyUsers);
      }, 300);
    });
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
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) {
          resolve(null);
          return;
        }

        const oldUser = { ...this.users[index] };
        this.users[index] = {
          ...this.users[index],
          ...updates,
          updatedAt: new Date()
        };

        this.logAudit('update', 'user', id, 'superadmin', { old: oldUser, new: this.users[index] });
        resolve(this.users[index]);
      }, 500);
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = this.users.findIndex(u => u.id === id);
        if (index === -1) {
          resolve(false);
          return;
        }

        const user = this.users[index];
        this.users.splice(index, 1);
        this.logAudit('delete', 'user', id, 'superadmin', { deleted: user });
        resolve(true);
      }, 500);
    });
  }

  // Legacy methods for backward compatibility
  async createCompanyAndAdmin(data: NewCompanyData): Promise<{ company: Company; user: User }> {
    return new Promise(async (resolve) => {
      const company = await this.createCompany(data);
      const user = await this.createUser({
        name: data.adminName,
        email: data.adminEmail,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        avatarUrl: '',
        team: 'Admin',
        companyId: company.id,
        basicSalary: 0,
        hireDate: new Date(),
      });

      // Update company with admin ID
      company.adminId = user.id;
      await this.updateCompany(company.id, { adminId: user.id });

      resolve({ company, user });
    });
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
}

export const api = new ApiService();