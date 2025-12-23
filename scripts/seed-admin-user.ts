import dotenv from 'dotenv';
import { resolve } from 'path';
import { getServiceSupabase } from '../lib/supabase';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') });

async function seedAdminUser() {
  const supabase = getServiceSupabase();

  console.log('🔐 Creating admin user...');

  const adminUser = {
    email: 'admin@example.com',
    password_hash: 'admin123', // In production, use bcrypt!
    role: 'admin',
  };

  // Check if admin already exists
  const { data: existing } = await supabase
    .from('admin_users')
    .select('id')
    .eq('email', adminUser.email)
    .single();

  if (existing) {
    console.log('✅ Admin user already exists!');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: admin123`);
    return;
  }

  const { data, error } = await supabase
    .from('admin_users')
    .insert([adminUser])
    .select()
    .single();

  if (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }

  console.log('✅ Admin user created successfully!');
  console.log(`   Email: ${adminUser.email}`);
  console.log(`   Password: admin123`);
  console.log('\n⚠️  IMPORTANT: Change this password in production!');
}

seedAdminUser().catch(console.error);
