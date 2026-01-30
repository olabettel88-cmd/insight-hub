import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createAdminUser() {
  const username = 'admin';
  const password = 'admin';
  
  console.log('Creating admin user...');
  
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  let userId: string;

  if (existingUser) {
    console.log('User "admin" already exists, using existing user');
    userId = existingUser.id;
  } else {
    const passwordHash = await hashPassword(password);
    const apiKey = `pka_admin_${Date.now().toString(36)}`;
    const referralCode = `REF_ADMIN_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        api_key: apiKey,
        referral_code: referralCode,
        subscription_plan: 'lifetime',
        daily_search_limit: 999999,
        is_active: true,
        is_banned: false,
      })
      .select('id')
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      process.exit(1);
    }

    userId = newUser.id;
    console.log('Created user with ID:', userId);
  }

  const { data: existingAdmin } = await supabase
    .from('admins')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingAdmin) {
    console.log('Admin entry already exists');
  } else {
    const { error: adminError } = await supabase
      .from('admins')
      .insert({
        user_id: userId,
        role: 'super_admin',
        permissions: {
          manage_users: true,
          manage_admins: true,
          view_logs: true,
          manage_api: true,
          manage_payments: true,
          ban_users: true,
        },
      });

    if (adminError) {
      console.error('Error creating admin entry:', adminError);
      process.exit(1);
    }

    console.log('Created admin entry');
  }

  console.log('\n=================================');
  console.log('Admin user created successfully!');
  console.log('=================================');
  console.log('Username: admin');
  console.log('Password: admin');
  console.log('=================================\n');
}

createAdminUser().catch(console.error);
