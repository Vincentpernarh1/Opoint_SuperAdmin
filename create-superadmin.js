// Create initial superadmin user
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Supabase credentials not found in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createInitialSuperAdmin() {
    console.log('🔍 Checking for existing superadmin...');

    const { data: existing, error: checkError } = await supabase
        .from('opoint_superadmin')
        .select('*')
        .eq('email', 'admin@vpena.com');

    if (checkError) {
        console.error('❌ Error checking for existing superadmin:', checkError.message);
        console.log('\n💡 Make sure you have run the opoint-superadmin.sql script in Supabase first!');
        process.exit(1);
    }

    if (existing && existing.length > 0) {
        console.log('✅ Superadmin already exists:');
        console.log(JSON.stringify(existing[0], null, 2));
        process.exit(0);
    }

    console.log('📝 Creating initial superadmin...');

    const hashedPassword = await bcrypt.hash('superadminpassword', 10);

    const { data, error } = await supabase
        .from('opoint_superadmin')
        .insert({
            email: 'admin@vpena.com',
            username: 'Super Admin',
            password: hashedPassword,
            date_created: new Date().toISOString(),
            logs: 'Initial superadmin account created'
        })
        .select()
        .single();

    if (error) {
        console.error('❌ Error creating superadmin:', error.message);
        process.exit(1);
    }

    console.log('✅ Initial superadmin created successfully!');
    console.log('Email: admin@vpena.com');
    console.log('Password: superadminpassword');
}

createInitialSuperAdmin();