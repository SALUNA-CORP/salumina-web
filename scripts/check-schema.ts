import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkSchema() {
  console.log('🔍 Analizando schema de Supabase...\n');

  // Ver todas las tablas
  const { data: tables, error: tablesError } = await supabase.rpc('get_tables', {});

  if (tablesError) {
    // Si no existe la función, usar query directa
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    console.log('📊 Tablas existentes:');
    console.log(data);
  }

  // Intentar leer algunas tablas comunes
  const tablesToCheck = [
    'user_profiles',
    'users',
    'subscriptions',
    'commissions',
    'bookmakers',
    'surebets',
    'scrapers'
  ];

  console.log('\n📋 Verificando tablas:\n');

  for (const table of tablesToCheck) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`❌ ${table}: No existe`);
    } else {
      console.log(`✅ ${table}: Existe (${count} registros)`);
    }
  }

  // Ver usuarios de auth
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

  if (!authError) {
    console.log(`\n👥 Usuarios en auth.users: ${authUsers.users.length}`);
    if (authUsers.users.length > 0) {
      console.log('Ejemplo:', authUsers.users[0].email);
    }
  }
}

checkSchema().catch(console.error);
