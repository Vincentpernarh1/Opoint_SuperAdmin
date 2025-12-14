import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

let supabase = null;
let currentCompanyId = null;
let currentUserId = null;

// Create Supabase client with error handling
export function getSupabaseClient() {
    // Read environment variables inside the function to ensure dotenv has loaded
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.warn('⚠️  Supabase credentials not found. Database features disabled.');
        return null;
    }
    
    if (!supabase) {
        supabase = createClient(supabaseUrl, supabaseKey);
    }
    
    return supabase;
}

// Set company context for RLS (Row Level Security)
export async function setCompanyContext(companyId, userId) {
    const client = getSupabaseClient();
    if (!client) return false;
    
    currentCompanyId = companyId;
    currentUserId = userId;
    
    try {
        const { error } = await client.rpc('set_company_context', {
            company_uuid: companyId,
            user_uuid: userId
        });
        
        if (error) {
            console.warn('⚠️  Could not set company context (RLS may not be enabled):', error.message);
            return false;
        }
        
        console.log('✅ Company context set:', companyId);
        return true;
    } catch (err) {
        console.warn('⚠️  Company context function not available:', err.message);
        return false;
    }
}

// Get current company context
export function getCurrentCompanyId() {
    return currentCompanyId;
}


// Database Helper Functions
export const db = {
    // --- USERS / EMPLOYEES ---
    async getUsers() {
        const client = getSupabaseClient();
        if (!client) return { data: [], error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_users')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    },

    async getUserById(userId) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_users')
            .select('*')
            .eq('id', userId)
            .single();
        
        return { data, error };
    },

    async createUser(userData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_users')
            .insert([userData])
            .select()
            .single();
        
        return { data, error };
    },

    async updateUser(userId, updates) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_users')
            .update(updates)
            .eq('id', userId)
            .select()
            .single();
        
        return { data, error };
    },

    async deleteUser(userId) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_users')
            .delete()
            .eq('id', userId);
        
        return { data, error };
    },

    // --- COMPANIES ---
    async getCompanies() {
        const client = getSupabaseClient();
        if (!client) return { data: [], error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_companies')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    },

    async updateCompany(companyId, updates) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        // Transform camelCase to snake_case for database
        const dataToUpdate = {
            ...(updates.name !== undefined && { name: updates.name }),
            ...(updates.licenseCount !== undefined && { license_count: updates.licenseCount }),
            ...(updates.registrationId !== undefined && { registration_id: updates.registrationId }),
            ...(updates.address !== undefined && { address: updates.address }),
            ...(updates.modules !== undefined && { modules: updates.modules }),
            ...(updates.status !== undefined && { status: updates.status }),
            ...(updates.description !== undefined && { description: updates.description }),
            updated_at: new Date().toISOString()
        };
        
        const { data, error } = await client
            .from('opoint_companies')
            .update(dataToUpdate)
            .eq('id', companyId)
            .select()
            .single();
        
        return { data, error };
    },

    async deleteCompany(companyId) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_companies')
            .delete()
            .eq('id', companyId);
        
        return { data, error };
    },

    // --- PAYROLL HISTORY ---
    async createPayrollRecord(payrollData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_payroll_history')
            .insert([payrollData])
            .select()
            .single();
        
        return { data, error };
    },

    async getPayrollHistory(filters = {}) {
        const client = getSupabaseClient();
        if (!client) return { data: [], error: 'Database not configured' };
        
        let query = client
            .from('opoint_payroll_history')
            .select('*, opoint_users(name, email, mobile_money_number)');

        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }

        if (filters.month && filters.year) {
            const startDate = new Date(filters.year, filters.month - 1, 1);
            const endDate = new Date(filters.year, filters.month, 0);
            query = query
                .gte('created_at', startDate.toISOString())
                .lte('created_at', endDate.toISOString());
        }

        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        return { data, error };
    },

    async updatePayrollStatus(transactionId, status) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_payroll_history')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('transaction_id', transactionId)
            .select()
            .single();
        
        return { data, error };
    },

    // --- LEAVE MANAGEMENT ---
    async createLeaveRequest(leaveData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_LeaveRequests')
            .insert([leaveData])
            .select()
            .single();
        
        return { data, error };
    },

    async getLeaveRequests(filters = {}) {
        const client = getSupabaseClient();
        if (!client) return { data: [], error: 'Database not configured' };
        
        let query = client
            .from('P360-Opoint_LeaveRequests')
            .select('*, P360-Opoint_User(name, email)');

        if (filters.status) {
            query = query.eq('status', filters.status);
        }

        if (filters.userId) {
            query = query.eq('user_id', filters.userId);
        }

        query = query.order('created_at', { ascending: false });
        
        const { data, error } = await query;
        return { data, error };
    },

    async updateLeaveRequest(leaveId, updates) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_LeaveRequests')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', leaveId)
            .select()
            .single();
        
        return { data, error };
    },

    // --- AUTHENTICATION ---
    async getUserByEmail(email) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_User')
            .select('*')
            .eq('email', email)
            .eq('is_active', true)
            .single();
        
        return { data, error };
    },

    async updateUserPassword(userId, passwordHash) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_User')
            .update({ 
                password_hash: passwordHash,
                temporary_password: null, // Clear temporary password
                requires_password_change: false,
                password_changed_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();
        
        return { data, error };
    },

    async updateLastLogin(userId) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_User')
            .update({ 
                last_login: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();
        
        return { data, error };
    },

    // Super Admin functions
    async createSuperAdmin(email, username, password) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data, error } = await client
            .from('opoint_superadmin')
            .insert({
                email,
                username,
                password: hashedPassword,
                date_created: new Date().toISOString(),
                logs: 'Account created'
            })
            .select()
            .single();
        
        return { data, error };
    },

    async loginSuperAdmin(email, password) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data: user, error } = await client
            .from('opoint_superadmin')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error || !user) {
            return { data: null, error: 'Invalid credentials' };
        }
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return { data: null, error: 'Invalid credentials' };
        }
        
        // Update last access time
        await client
            .from('opoint_superadmin')
            .update({ last_access_time: new Date().toISOString() })
            .eq('id', user.id);
        
        return { data: user, error: null };
    },

    async getAllSuperAdmins() {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_superadmin')
            .select('id, email, username, date_created, last_access_time')
            .order('date_created', { ascending: false });
        
        return { data, error };
    },

    async resetSuperAdminPassword(email) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        // Generate a temporary password
        const tempPassword = Math.random().toString(36).slice(-12) + 'Temp!';
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        const { data, error } = await client
            .from('opoint_superadmin')
            .update({ 
                password: hashedPassword,
                logs: `Password reset on ${new Date().toISOString()}`
            })
            .eq('email', email)
            .select('id, email, username')
            .single();
        
        if (error) {
            return { data: null, error };
        }
        
        return { data: { ...data, tempPassword }, error: null };
    },

    async getSuperAdmin(id) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_superadmin')
            .select('id, email, username, date_created, last_access_time')
            .eq('id', id)
            .single();
        
        return { data, error };
    },

    async updateSuperAdmin(id, updateData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_superadmin')
            .update({
                ...updateData,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select('id, email, username, date_created, last_access_time')
            .single();
        
        return { data, error };
    },

    async deleteSuperAdmin(id) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_superadmin')
            .delete()
            .eq('id', id)
            .select('id, email, username')
            .single();
        
        return { data, error };
    },

    // Company functions
    async createCompany(companyData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_companies')
            .insert({
                name: companyData.name,
                license_count: companyData.licenseCount,
                used_licenses: 0,
                status: 'Active',
                modules: companyData.modules,
                description: companyData.description || null,
                registration_id: companyData.registrationId || null,
                address: companyData.address || null,
                admin_name: companyData.adminName,
                admin_email: companyData.adminEmail,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                admin_id: null
            })
            .select()
            .single();
        
        return { data, error };
    },

    async getAllCompanies() {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_companies')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    },

    async getCompanyById(companyId) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_companies')
            .select('*')
            .eq('id', companyId)
            .single();
        
        return { data, error };
    },

    async updateCompanyAdminId(companyId, adminId) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('opoint_companies')
            .update({ admin_id: adminId, updated_at: new Date().toISOString() })
            .eq('id', companyId)
            .select()
            .single();
        
        return { data, error };
    },

    async createUser(userData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_User')
            .insert({
                name: userData.name,
                email: userData.email,
                role: userData.role,
                status: userData.status,
                avatar_url: userData.avatarUrl,
                team: userData.team,
                company_id: userData.companyId,
                basic_salary: userData.basicSalary,
                hire_date: userData.hireDate.toISOString(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select()
            .single();
        
        return { data, error };
    },

    // Legacy Supabase Auth (kept for backward compatibility)
    async signIn(email, password) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password
        });
        
        return { data, error };
    },

    async signUp(email, password, metadata = {}) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        
        return { data, error };
    },

    async signOut() {
        const client = getSupabaseClient();
        if (!client) return { error: 'Database not configured' };
        
        const { error } = await client.auth.signOut();
        return { error };
    },

    async getCurrentUser() {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client.auth.getUser();
        return { data, error };
    }
};

export default db;
