
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import db, { getSupabaseClient, setCompanyContext } from './services/database.js';
import { validatePasswordStrength } from './utils/passwordValidator.js';

dotenv.config();

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
    origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://192.168.0.93:3000'],
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

const PORT = process.env.PORT || 3001;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

// --- CONFIGURATION & SECRETS ---
const CONFIG = {
    MOMO_BASE_URL: process.env.MOMO_BASE_URL || 'https://sandbox.momodeveloper.mtn.com/disbursement',
    MOMO_USER_ID: process.env.MOMO_USER_ID,
    MOMO_API_KEY: process.env.MOMO_API_KEY,
    MOMO_SUBSCRIPTION_KEY: process.env.MOMO_SUBSCRIPTION_KEY,
    MOMO_TARGET_ENV: process.env.MOMO_TARGET_ENV || 'sandbox',
    CALLBACK_HOST: process.env.CALLBACK_HOST || 'http://localhost:3001',
    APPROVAL_PASSWORD: process.env.APPROVAL_PASSWORD || 'approve123'
};

// --- FALLBACK MOCK DATA (Used when database is not configured) ---
const MOCK_USERS = [
    { id: '1', name: 'Alice Johnson', email: 'alice@vertex.com', role: 'Admin', basic_salary: 8000, mobile_money_number: '0240123456', company_id: 'vertex' },
    { id: '2', name: 'Bob Williams', email: 'bob@vertex.com', role: 'Employee', basic_salary: 6000, mobile_money_number: '0551234567', company_id: 'vertex' },
    { id: '3', name: 'Charlie Brown', email: 'charlie@summit.inc', role: 'Admin', basic_salary: 70000, mobile_money_number: '0272345678', company_id: 'summit' },
    { id: '4', name: 'Diana Prince', email: 'diana@vertex.com', role: 'Employee', basic_salary: 3500, mobile_money_number: '0503456789', company_id: 'vertex' },
    { id: '5', name: 'Eva Green', email: 'eva@vertex.com', role: 'HR', basic_salary: 12000, mobile_money_number: '0201112222', company_id: 'vertex' },
    { id: '6', name: 'Frank Miller', email: 'frank@vertex.com', role: 'Operations', basic_salary: 11000, mobile_money_number: '0543334444', company_id: 'vertex' },
    { id: '7', name: 'Grace Jones', email: 'grace@summit.inc', role: 'Payments', basic_salary: 15000, mobile_money_number: '0265556666', company_id: 'summit' },
    { id: '8', name: 'Henry Wilson', email: 'henry@vpena.com', role: 'Admin', basic_salary: 25000, mobile_money_number: '0577778888', company_id: 'vpena' },
    { id: '9', name: 'Admin User', email: 'admin@vpena.com', role: 'Admin', basic_salary: 30000, mobile_money_number: '0240000000', company_id: '1ed88d70-725a-4ec0-be81-0d4fd5670cf0' },
    { id: '934674dd-c37c-4cf8-9053-5c452b85f32c', name: 'Vpena Admin', email: 'admin@vpena.com', role: 'Admin', basic_salary: 30000, mobile_money_number: '0240000000', company_id: '1ed88d70-725a-4ec0-be81-0d4fd5670cf0' },
];

const MOCK_COMPANIES = [
    { id: 'vertex', name: 'Vertex Innovations Ltd.', license_count: 50, used_licenses: 7, status: 'Active', modules: { payroll: true, leave: true, expenses: true, reports: true, announcements: true }, description: 'Leading tech innovation company specializing in software solutions.', created_at: '2023-01-15', updated_at: '2024-12-01', admin_id: '1', admin_name: 'Alice Johnson', admin_email: 'alice@vertex.com' },
    { id: 'summit', name: 'Summit Solutions Inc.', license_count: 10, used_licenses: 3, status: 'Active', modules: { payroll: true, leave: true, expenses: false, reports: true, announcements: false }, description: 'Consulting and solutions provider for enterprise clients.', created_at: '2022-06-20', updated_at: '2024-11-15', admin_id: '3', admin_name: 'Charlie Brown', admin_email: 'charlie@summit.inc' },
    { id: 'vpena', name: 'Vpena Teck', license_count: 25, used_licenses: 5, status: 'Active', modules: { payroll: true, leave: true, expenses: true, reports: true, announcements: true }, description: 'Technology solutions provider.', created_at: '2023-08-10', updated_at: '2024-12-14', admin_id: '8', admin_name: 'Henry Wilson', admin_email: 'henry@vpena.com' },
];

// In-memory storage for transaction logs (Used when database not configured)
const PAYROLL_HISTORY = [];

// --- VALIDATION HELPERS ---
const validators = {
    isValidGhanaPhone(phone) {
        // Ghana phone numbers: 0XX XXX XXXX (10 digits starting with 0)
        const ghanaPattern = /^0[235]\d{8}$/;
        return ghanaPattern.test(phone?.replace(/\s+/g, ''));
    },

    isValidEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    },

    isValidAmount(amount) {
        return typeof amount === 'number' && amount > 0 && amount <= 100000;
    },

    sanitizePhone(phone) {
        // Remove spaces and ensure proper format
        return phone?.replace(/\s+/g, '').trim();
    }
};

// --- ERROR HANDLER ---
const errorHandler = (error, req, res, next) => {
    console.error('❌ Server Error:', error);
    
    const statusCode = error.statusCode || 500;
    const message = IS_PRODUCTION && statusCode === 500 
        ? 'Internal server error' 
        : error.message;

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(IS_PRODUCTION ? {} : { stack: error.stack })
    });
};

// --- MOMO SERVICE CLASS ---
class MomoService {
    constructor() {
        this.token = null;
        this.tokenExpiry = 0;
    }

    generateUUID() {
        return crypto.randomUUID();
    }

    // 1. Authentication: Get Bearer Token
    async getToken() {
        // Return cached token if valid
        if (this.token && Date.now() < this.tokenExpiry - 60000) {
            return this.token;
        }

        // If credentials missing, simulate
        if (!CONFIG.MOMO_USER_ID || !CONFIG.MOMO_API_KEY) {
            // Logging simulation only once to avoid spamming
            if (!this.hasLoggedSim) {
                console.log(">> 🟡 API Keys missing. Using SIMULATION MODE for token.");
                this.hasLoggedSim = true;
            }
            return 'SIMULATED_TOKEN';
        }

        const authString = Buffer.from(`${CONFIG.MOMO_USER_ID}:${CONFIG.MOMO_API_KEY}`).toString('base64');

        try {
            const response = await fetch(`${CONFIG.MOMO_BASE_URL}/token/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Ocp-Apim-Subscription-Key': CONFIG.MOMO_SUBSCRIPTION_KEY
                }
            });

            if (!response.ok) throw new Error(`Token Auth Failed: ${response.statusText}`);

            const data = await response.json();
            this.token = data.access_token;
            this.tokenExpiry = Date.now() + (data.expires_in * 1000);
            return this.token;
        } catch (error) {
            console.error('MoMo Token Error:', error);
            throw error;
        }
    }

    // 2. Transfer: Send money
    async transfer(amount, payeeNumber, externalId, payeeNote = 'Payroll') {
        const token = await this.getToken();

        // SIMULATION LOGIC
        if (token === 'SIMULATED_TOKEN') {
            await new Promise(r => setTimeout(r, 800)); // Fake delay
            const isSuccess = Math.random() > 0.1; // 90% success rate in simulation
            if (isSuccess) {
                return { status: 'PENDING', referenceId: this.generateUUID(), simulated: true };
            } else {
                 return { status: 'FAILED', error: 'Simulated Network Error' };
            }
        }

        const referenceId = this.generateUUID();
        
        try {
            const response = await fetch(`${CONFIG.MOMO_BASE_URL}/v1_0/transfer`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'X-Reference-Id': referenceId,
                    'X-Target-Environment': CONFIG.MOMO_TARGET_ENV,
                    'Ocp-Apim-Subscription-Key': CONFIG.MOMO_SUBSCRIPTION_KEY,
                    'Content-Type': 'application/json',
                    'X-Callback-Url': `${CONFIG.CALLBACK_HOST}/api/momo/callback`
                },
                body: JSON.stringify({
                    amount: amount.toString(),
                    currency: 'GHS',
                    externalId: externalId,
                    payee: {
                        partyIdType: 'MSISDN',
                        partyId: payeeNumber
                    },
                    payerMessage: 'Salary Payment',
                    payeeNote: payeeNote
                })
            });

            if (response.status === 202) {
                return { status: 'PENDING', referenceId };
            } else {
                const errText = await response.text();
                throw new Error(`Transfer Failed: ${response.status} - ${errText}`);
            }

        } catch (error) {
            console.error('MoMo Transfer Error:', error);
            return { status: 'FAILED', error: error.message };
        }
    }

    // 3. Batch Processor
    async processBatch(payments) {
        const results = [];
        
        for (const payment of payments) {
            const { userId, amount, mobileMoneyNumber, reason } = payment;
            const externalId = `PAY_${Date.now()}_${userId}`;
            
            try {
                // Validation
                if (!mobileMoneyNumber) {
                    throw new Error('Missing Mobile Money Number');
                }
                
                if (!validators.isValidGhanaPhone(mobileMoneyNumber)) {
                    throw new Error('Invalid Ghana phone number format');
                }
                
                if (!validators.isValidAmount(amount)) {
                    throw new Error('Invalid payment amount');
                }

                const sanitizedPhone = validators.sanitizePhone(mobileMoneyNumber);
                const result = await this.transfer(amount, sanitizedPhone, externalId, reason);
                
                const isSuccess = result.status !== 'FAILED';
                
                results.push({
                    userId,
                    amount,
                    status: isSuccess ? 'success' : 'failed',
                    referenceId: result.referenceId,
                    message: isSuccess ? 'Payment queued successfully' : result.error
                });

                if (isSuccess) {
                    // Save to database if available, otherwise use in-memory
                    const payrollRecord = {
                        transaction_id: result.referenceId,
                        user_id: userId,
                        amount,
                        reason,
                        status: result.status,
                        external_id: externalId,
                        created_at: new Date().toISOString()
                    };

                    const { error } = await db.createPayrollRecord(payrollRecord);
                    
                    if (error) {
                        // Fallback to in-memory if database fails
                        PAYROLL_HISTORY.push({
                            transactionId: result.referenceId,
                            userId,
                            amount,
                            reason,
                            date: new Date(),
                            status: result.status,
                            externalId
                        });
                    }
                }

            } catch (err) {
                console.error(`Payment error for user ${userId}:`, err.message);
                results.push({ 
                    userId, 
                    status: 'failed', 
                    message: err.message 
                });
            }
        }
        return results;
    }
}

const momoService = new MomoService();

// --- UTILITY FUNCTIONS ---
async function getUsers() {
    const { data, error } = await db.getUsers();
    if (error) {
        console.log('⚠️  Using fallback mock data (database not configured)');
        return MOCK_USERS;
    }
    return data || [];
}

async function getCompanies() {
    const { data, error } = await db.getAllCompanies();
    if (error || !data || data.length === 0) {
        console.log('⚠️  Using fallback mock companies (database not configured)');
        return MOCK_COMPANIES;
    }
    return data;
}

async function getUserById(userId) {
    const { data, error } = await db.getUserById(userId);
    if (error || !data) {
        return MOCK_USERS.find(u => u.id === userId);
    }
    return data;
}

// Transform database company data to frontend format
function transformCompany(company) {
    const parseDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(typeof dateStr === 'string' ? dateStr.replace(' ', 'T') : dateStr);
        return isNaN(date.getTime()) ? null : date;
    };

    return {
        id: company.id,
        name: company.name,
        licenseCount: company.license_count,
        usedLicenses: company.used_licenses,
        status: company.status,
        modules: company.modules,
        description: company.description,
        registrationId: company.registration_id,
        address: company.address,
        adminName: company.admin_name,
        adminEmail: company.admin_email,
        loginUrl: company.login_url,
        tableName: company.table_name,
        createdAt: parseDate(company.created_at),
        updatedAt: parseDate(company.updated_at),
        adminId: company.admin_id
    };
}

// Transform database user data to frontend format
function transformUser(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatarUrl: user.avatar_url,
        team: user.team || '',
        companyId: user.company_id,
        basicSalary: parseFloat(user.basic_salary),
        hireDate: user.hire_date ? new Date(user.hire_date) : undefined,
        mobileMoneyNumber: user.mobile_money_number,
        lastLogin: user.last_login ? new Date(user.last_login.replace(' ', 'T')) : undefined,
        createdAt: new Date(user.created_at.replace(' ', 'T')),
        updatedAt: new Date(user.updated_at.replace(' ', 'T'))
    };
}

// --- API ENDPOINTS ---

// Health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'running',
        message: 'Vpena OnPoint Backend API',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        database: getSupabaseClient() ? 'connected' : 'mock mode',
        momo: CONFIG.MOMO_API_KEY ? 'live' : 'simulation',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint to check if user exists
app.get('/api/test/check-user/:email', async (req, res) => {
    try {
        const { email } = req.params;
        const { data: user, error } = await db.getUserByEmail(email);
        
        res.json({
            success: true,
            exists: !!user,
            error: error?.message,
            user: user ? {
                email: user.email,
                name: user.name,
                role: user.role,
                hasTemporaryPassword: !!user.temporary_password,
                hasPasswordHash: !!user.password_hash,
                requiresPasswordChange: user.requires_password_change,
                isActive: user.is_active
            } : null
        });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// --- AUTHENTICATION ENDPOINTS ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password are required' 
            });
        }

        if (!validators.isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid email format' 
            });
        }

        // Get user from database
        const { data: user, error } = await db.getUserByEmail(email);

        console.log(`Login attempt for: ${email}`);
        console.log('Database query result:', { user: user ? 'Found' : 'Not found', error: error?.message });

        if (error) {
            console.error('Database error during login:', error);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        if (!user) {
            console.log(`User not found in database: ${email}`);
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        console.log('User found:', {
            email: user.email,
            hasTemporaryPassword: !!user.temporary_password,
            hasPasswordHash: !!user.password_hash,
            requiresPasswordChange: user.requires_password_change,
            isActive: user.is_active
        });

        let passwordMatch = false;

        // Check if this is first-time login with temporary password
        if (user.temporary_password && user.requires_password_change) {
            // Direct comparison for temporary password (plain text)
            passwordMatch = password === user.temporary_password;
            
            if (passwordMatch) {
                console.log(`✅ First-time login successful for: ${email}`);
            } else {
                console.log(`❌ Temporary password mismatch for: ${email}`);
            }
        } 
        // Regular login with hashed password
        else if (user.password_hash) {
            passwordMatch = await bcrypt.compare(password, user.password_hash);
            if (passwordMatch) {
                console.log(`✅ Regular login successful for: ${email}`);
            } else {
                console.log(`❌ Password hash mismatch for: ${email}`);
            }
        } 
        // No password set at all
        else {
            console.log(`❌ No password configured for: ${email}`);
            return res.status(401).json({ 
                success: false, 
                error: 'Account not properly configured. Please contact administrator.' 
            });
        }

        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }

        // Update last login
        await db.updateLastLogin(user.id);

        // Set company context for RLS (Row Level Security)
        if (user.company_id) {
            await setCompanyContext(user.company_id, user.id);
            console.log('✅ Company context set for:', user.company_id);
        }

        // Remove sensitive data before sending response
        const { password_hash, temporary_password, ...userWithoutPassword } = user;

        res.json({ 
            success: true, 
            user: userWithoutPassword,
            requiresPasswordChange: user.requires_password_change || false,
            isFirstLogin: !!user.temporary_password
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed' 
        });
    }
});

// Change password endpoint (for first-time login and password changes)
app.post('/api/auth/change-password', async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and new password are required' 
            });
        }

        // Validate password strength
        const validation = validatePasswordStrength(newPassword);
        
        if (!validation.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password does not meet security requirements',
                validationErrors: validation.errors,
                passwordStrength: validation.strength,
                passwordScore: validation.score
            });
        }

        // Get user from database
        const { data: user, error } = await db.getUserByEmail(email);

        if (error || !user) {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Verify current password (either temporary or hashed)
        if (currentPassword) {
            let passwordMatch = false;
            
            // Check temporary password for first-time login
            if (user.temporary_password && user.requires_password_change) {
                passwordMatch = currentPassword === user.temporary_password;
            } 
            // Check regular password hash
            else if (user.password_hash) {
                passwordMatch = await bcrypt.compare(currentPassword, user.password_hash);
            }
            
            if (!passwordMatch) {
                return res.status(401).json({ 
                    success: false, 
                    error: 'Current password is incorrect' 
                });
            }
        }

        // Prevent reusing the same password
        if (user.password_hash) {
            const isSamePassword = await bcrypt.compare(newPassword, user.password_hash);
            if (isSamePassword) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'New password must be different from your current password' 
                });
            }
        }

        // Hash new password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(newPassword, saltRounds);

        // Update password in database
        const { data: updatedUser, error: updateError } = await db.updateUserPassword(user.id, passwordHash);

        if (updateError) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to update password' 
            });
        }

        // Remove sensitive data
        const { password_hash, temporary_password, ...userWithoutPassword } = updatedUser;

        res.json({ 
            success: true, 
            message: 'Password updated successfully',
            user: userWithoutPassword,
            passwordStrength: validation.strength
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to change password' 
        });
    }
});

// Validate password strength (for real-time feedback in UI)
app.post('/api/auth/validate-password', async (req, res) => {
    try {
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password is required' 
            });
        }

        const validation = validatePasswordStrength(password);

        res.json({ 
            success: true,
            isValid: validation.isValid,
            errors: validation.errors,
            strength: validation.strength,
            score: validation.score
        });

    } catch (error) {
        console.error('Password validation error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to validate password' 
        });
    }
});

// Initialize user password (for admin creating test user)
app.post('/api/auth/initialize-password', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password are required' 
            });
        }

        // Get user from database
        const { data: user, error } = await db.getUserByEmail(email);

        if (error || !user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        // Hash password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Update password in database
        const { data: updatedUser, error: updateError } = await db.updateUserPassword(user.id, passwordHash);

        if (updateError) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to initialize password' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Password initialized successfully'
        });

    } catch (error) {
        console.error('Initialize password error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to initialize password' 
        });
    }
});

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email, password, and name are required' 
            });
        }

        if (!validators.isValidEmail(email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid email format' 
            });
        }

        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password must be at least 8 characters' 
            });
        }

        const { data, error } = await db.signUp(email, password, { name, role });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.json({ 
            success: true, 
            user: data.user 
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Registration failed' 
        });
    }
});

app.post('/api/auth/logout', async (req, res) => {
    try {
        await db.signOut();
        res.json({ success: true });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Logout failed' 
        });
    }
});

// --- SUPER ADMIN ENDPOINTS ---
app.post('/api/superadmin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password are required' 
            });
        }
        
        const { data: user, error } = await db.loginSuperAdmin(email, password);
        
        if (error || !user) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid credentials' 
            });
        }
        
        res.json({ 
            success: true, 
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                date_created: user.date_created,
                last_access_time: user.last_access_time
            }
        });
    } catch (error) {
        console.error('Super admin login error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Login failed' 
        });
    }
});

app.post('/api/superadmin/create', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        if (!email || !username || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email, username, and password are required' 
            });
        }
        
        // Validate password strength
        const passwordValidation = validatePasswordStrength(password);
        if (!passwordValidation.isValid) {
            return res.status(400).json({ 
                success: false, 
                error: passwordValidation.errors.join(', ') 
            });
        }
        
        const { data: user, error } = await db.createSuperAdmin(email, username, password);
        
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        res.json({ 
            success: true, 
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                date_created: user.date_created
            }
        });
    } catch (error) {
        console.error('Create super admin error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create super admin' 
        });
    }
});

app.get('/api/superadmin/list', async (req, res) => {
    try {
        const { data: admins, error } = await db.getAllSuperAdmins();
        
        if (error) {
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        res.json({ 
            success: true, 
            data: admins 
        });
    } catch (error) {
        console.error('List super admins error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch super admins' 
        });
    }
});

app.post('/api/superadmin/reset-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email is required' 
            });
        }
        
        const { data: result, error } = await db.resetSuperAdminPassword(email);
        
        if (error) {
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        if (!result) {
            return res.status(404).json({ 
                success: false, 
                error: 'Super admin not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: {
                message: 'Password reset successful. Check your email for the temporary password.',
                tempPassword: result.tempPassword // In production, this would be sent via email
            }
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to reset password' 
        });
    }
});

app.get('/api/superadmin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data: admin, error } = await db.getSuperAdmin(id);
        
        if (error) {
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                error: 'Super admin not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: admin
        });
    } catch (error) {
        console.error('Get super admin error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to get super admin' 
        });
    }
});

app.put('/api/superadmin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { email, username } = req.body;
        
        if (!email || !username) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and username are required' 
            });
        }
        
        const { data: admin, error } = await db.updateSuperAdmin(id, { email, username });
        
        if (error) {
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                error: 'Super admin not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: admin
        });
    } catch (error) {
        console.error('Update super admin error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update super admin' 
        });
    }
});

app.delete('/api/superadmin/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { data: admin, error } = await db.deleteSuperAdmin(id);
        
        if (error) {
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        if (!admin) {
            return res.status(404).json({ 
                success: false, 
                error: 'Super admin not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: admin
        });
    } catch (error) {
        console.error('Delete super admin error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete super admin' 
        });
    }
});

// --- COMPANY MANAGEMENT ENDPOINTS ---
app.post('/api/companies', async (req, res) => {
    try {
        const { name, licenseCount, modules, adminName, adminEmail, description, registrationId, address } = req.body;
        
        const { data: company, error: companyError } = await db.createCompany({
            name,
            licenseCount,
            modules,
            description,
            registrationId,
            address,
            adminName,
            adminEmail
        });
        
        if (companyError) {
            return res.status(500).json({ 
                success: false, 
                error: companyError.message 
            });
        }
        
        res.json({ 
            success: true, 
            data: { company: transformCompany(company) } 
        });
    } catch (error) {
        console.error('Create company error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create company' 
        });
    }
});

app.get('/api/companies', async (req, res) => {
    try {
        const companies = await getCompanies();
        res.json({ 
            success: true, 
            data: companies.map(transformCompany)
        });
    } catch (error) {
        console.error('List companies error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch companies' 
        });
    }
});

app.get('/api/companies/:id', async (req, res) => {
    try {
        const companyId = req.params.id;
        const { data: company, error } = await db.getCompanyById(companyId);
        
        if (error) {
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        if (!company) {
            return res.status(404).json({ 
                success: false, 
                error: 'Company not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: transformCompany(company)
        });
    } catch (error) {
        console.error('Get company error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch company' 
        });
    }
});

// Update company
app.put('/api/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const { data: company, error } = await db.updateCompany(id, updates);
        
        if (error) {
            return res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        if (!company) {
            return res.status(404).json({ 
                success: false, 
                error: 'Company not found' 
            });
        }
        
        res.json({ 
            success: true, 
            data: transformCompany(company)
        });
    } catch (error) {
        console.error('Update company error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update company' 
        });
    }
});

app.delete('/api/companies/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const { error } = await db.deleteCompany(id);
        
        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }
        
        res.json({ 
            success: true, 
            message: 'Company deleted successfully' 
        });
    } catch (error) {
        console.error('Delete company error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete company' 
        });
    }
});

// --- USER MANAGEMENT ENDPOINTS ---
app.get('/api/users', async (req, res) => {
    try {
        const users = await getUsers();
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch users' 
        });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const user = await getUserById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch user' 
        });
    }
});

app.post('/api/users', async (req, res) => {
    try {
        const userData = req.body;

        // Validation
        if (!userData.name || !userData.email) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name and email are required' 
            });
        }

        if (!validators.isValidEmail(userData.email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid email format' 
            });
        }

        if (userData.mobile_money_number && !validators.isValidGhanaPhone(userData.mobile_money_number)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Ghana phone number format' 
            });
        }

        const { data, error } = await db.createUser({
            ...userData,
            created_at: new Date().toISOString()
        });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.status(201).json({ 
            success: true, 
            data 
        });

    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create user' 
        });
    }
});

app.put('/api/users/:id', async (req, res) => {
    try {
        const updates = req.body;
        const userId = req.params.id;

        // Validation
        if (updates.email && !validators.isValidEmail(updates.email)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid email format' 
            });
        }

        if (updates.mobile_money_number && !validators.isValidGhanaPhone(updates.mobile_money_number)) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid Ghana phone number format' 
            });
        }

        const { data, error } = await db.updateUser(userId, {
            ...updates,
            updated_at: new Date().toISOString()
        });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.json({ 
            success: true, 
            data 
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update user' 
        });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    try {
        const { error } = await db.deleteUser(req.params.id);

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.json({ 
            success: true, 
            message: 'User deleted successfully' 
        });

    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to delete user' 
        });
    }
});

// --- PAYROLL ENDPOINTS ---
// --- PAYROLL ENDPOINTS ---
app.get('/api/payroll/payable-employees', async (req, res) => {
    try {
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const users = await getUsers();

        // Get payroll history from database
        const { data: historyData } = await db.getPayrollHistory({
            month: currentMonth + 1,
            year: currentYear
        });

        const payableEmployees = users.map(user => {
            const netPay = user.basic_salary * 0.90; // Mock calculation (90% after deductions)
            
            // Check if paid this month (from database or fallback)
            let paymentLog;
            
            if (historyData && historyData.length > 0) {
                paymentLog = historyData.find(log => 
                    log.user_id === user.id && 
                    (log.status === 'SUCCESS' || log.status === 'PENDING')
                );
            } else {
                // Fallback to in-memory
                paymentLog = PAYROLL_HISTORY.find(log => {
                    const logDate = new Date(log.date);
                    return log.userId === user.id && 
                           logDate.getMonth() === currentMonth && 
                           logDate.getFullYear() === currentYear &&
                           (log.status === 'SUCCESS' || log.status === 'PENDING');
                });
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                mobileMoneyNumber: user.mobile_money_number,
                netPay: netPay,
                basicSalary: user.basic_salary,
                isPaid: !!paymentLog,
                paidAmount: paymentLog ? paymentLog.amount : 0,
                paidDate: paymentLog ? paymentLog.created_at || paymentLog.date : null,
                paidReason: paymentLog ? paymentLog.reason : null
            };
        });

        res.json({ 
            success: true, 
            data: payableEmployees 
        });

    } catch (error) {
        console.error("Error fetching payables:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch payable employees" 
        });
    }
});

app.get('/api/payroll/history', async (req, res) => {
    try {
        const { userId, month, year } = req.query;

        const filters = {};
        if (userId) filters.userId = userId;
        if (month && year) {
            filters.month = parseInt(month);
            filters.year = parseInt(year);
        }

        const { data, error } = await db.getPayrollHistory(filters);

        if (error) {
            // Fallback to in-memory
            let history = PAYROLL_HISTORY;
            
            if (userId) {
                history = history.filter(h => h.userId === userId);
            }
            
            return res.json({ 
                success: true, 
                data: history,
                source: 'fallback' 
            });
        }

        res.json({ 
            success: true, 
            data,
            source: 'database' 
        });

    } catch (error) {
        console.error("Error fetching payroll history:", error);
        res.status(500).json({ 
            success: false, 
            error: "Failed to fetch payroll history" 
        });
    }
});


app.post('/api/payroll/pay', async (req, res) => {
    try {
        const { payments, password } = req.body;

        // Validation
        if (!password || password !== CONFIG.APPROVAL_PASSWORD) {
            return res.status(401).json({ 
                success: false, 
                error: 'Incorrect approval password.' 
            });
        }

        if (!payments || !Array.isArray(payments) || payments.length === 0) {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid payments data' 
            });
        }

        // Enrich payments with mobile money numbers
        const users = await getUsers();
        const enrichedPayments = payments.map(p => {
            const user = users.find(u => u.id === p.userId);
            
            if (!user) {
                throw new Error(`User not found: ${p.userId}`);
            }

            return { 
                ...p, 
                mobileMoneyNumber: user.mobile_money_number || user.mobileMoneyNumber 
            };
        });

        // Process batch payments
        const results = await momoService.processBatch(enrichedPayments);

        // Calculate summary
        const summary = {
            total: results.length,
            successful: results.filter(r => r.status === 'success').length,
            failed: results.filter(r => r.status === 'failed').length
        };

        res.json({ 
            success: true, 
            data: results,
            summary
        });

    } catch (error) {
        console.error("Payroll processing error:", error);
        res.status(500).json({ 
            success: false, 
            error: error.message || "Payroll processing failed" 
        });
    }
});

// --- LEAVE MANAGEMENT ENDPOINTS ---
app.get('/api/leave/requests', async (req, res) => {
    try {
        const { status, userId } = req.query;
        
        const filters = {};
        if (status) filters.status = status;
        if (userId) filters.userId = userId;

        const { data, error } = await db.getLeaveRequests(filters);

        if (error) {
            return res.status(500).json({ 
                success: false, 
                error: 'Failed to fetch leave requests' 
            });
        }

        res.json({ 
            success: true, 
            data 
        });

    } catch (error) {
        console.error('Error fetching leave requests:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to fetch leave requests' 
        });
    }
});

app.post('/api/leave/requests', async (req, res) => {
    try {
        const leaveData = req.body;

        // Validation
        if (!leaveData.user_id || !leaveData.start_date || !leaveData.end_date || !leaveData.reason) {
            return res.status(400).json({ 
                success: false, 
                error: 'Missing required fields' 
            });
        }

        const { data, error } = await db.createLeaveRequest({
            ...leaveData,
            status: 'pending',
            created_at: new Date().toISOString()
        });

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.status(201).json({ 
            success: true, 
            data 
        });

    } catch (error) {
        console.error('Error creating leave request:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to create leave request' 
        });
    }
});

app.put('/api/leave/requests/:id', async (req, res) => {
    try {
        const updates = req.body;
        const leaveId = req.params.id;

        const { data, error } = await db.updateLeaveRequest(leaveId, updates);

        if (error) {
            return res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }

        res.json({ 
            success: true, 
            data 
        });

    } catch (error) {
        console.error('Error updating leave request:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to update leave request' 
        });
    }
});

// --- MOMO CALLBACK ENDPOINT ---
app.post('/api/momo/callback', async (req, res) => {
    try {
        console.log('📞 MoMo Callback received:', req.body);
        
        const { referenceId, status } = req.body;

        if (referenceId && status) {
            // Update payment status in database
            await db.updatePayrollStatus(referenceId, status);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error('Callback error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Callback processing failed' 
        });
    }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Vpena OnPoint - Professional Payroll System`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📍 Server:      http://localhost:${PORT}`);
    console.log(`📍 API Docs:    http://localhost:${PORT}/api/health`);
    console.log(`${'='.repeat(60)}`);
    
    // Database Status
    if (getSupabaseClient()) {
        console.log(`✅ Database:    Connected (Supabase)`);
    } else {
        console.log(`⚠️  Database:    Fallback Mode (Mock Data)`);
        console.log(`   💡 Add SUPABASE_URL and SUPABASE_ANON_KEY to .env`);
    }
    
    // Payment Provider Status
    if (CONFIG.MOMO_API_KEY) {
        console.log(`✅ Payments:    Live Mode (MTN MoMo ${CONFIG.MOMO_TARGET_ENV})`);
    } else {
        console.log(`⚠️  Payments:    Simulation Mode`);
        console.log(`   💡 Add MTN MoMo credentials to .env for live payments`);
    }
    
    console.log(`${'='.repeat(60)}`);
    console.log(`🌍 Environment: ${IS_PRODUCTION ? 'Production' : 'Development'}`);
    console.log(`📅 Started:     ${new Date().toLocaleString('en-GB', { timeZone: 'Africa/Accra' })} GMT`);
    console.log(`${'='.repeat(60)}\n`);
    
    console.log(`💼 Ready to serve businesses across Ghana!\n`);
});
