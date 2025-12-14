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
            .from('P360-Opoint_User')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    },

    async getUserById(userId) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_User')
            .select('*')
            .eq('id', userId)
            .single();
        
        return { data, error };
    },

    async createUser(userData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_User')
            .insert([userData])
            .select()
            .single();
        
        return { data, error };
    },

    async updateUser(userId, updates) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_User')
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
            .from('P360-Opoint_User')
            .delete()
            .eq('id', userId);
        
        return { data, error };
    },

    // --- COMPANIES ---
    async getCompanies() {
        const client = getSupabaseClient();
        if (!client) return { data: [], error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_Companies')
            .select('*')
            .order('created_at', { ascending: false });
        
        return { data, error };
    },

    async createCompany(companyData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_Companies')
            .insert([companyData])
            .select()
            .single();
        
        return { data, error };
    },

    // --- PAYROLL HISTORY ---
    async createPayrollRecord(payrollData) {
        const client = getSupabaseClient();
        if (!client) return { data: null, error: 'Database not configured' };
        
        const { data, error } = await client
            .from('P360-Opoint_PayrollHistory')
            .insert([payrollData])
            .select()
            .single();
        
        return { data, error };
    },

    async getPayrollHistory(filters = {}) {
        const client = getSupabaseClient();
        if (!client) return { data: [], error: 'Database not configured' };
        
        let query = client
            .from('P360-Opoint_PayrollHistory')
            .select('*, P360-Opoint_User(name, email, mobile_money_number)');

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
            .from('P360-Opoint_PayrollHistory')
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
