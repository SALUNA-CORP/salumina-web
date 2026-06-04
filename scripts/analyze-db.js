const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function analyzeDatabase() {
  console.log('🔍 Analizando base de datos Supabase...\n');
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('');

  const tablesToCheck = [
    'user_profiles',
    'profiles',
    'users',
    'subscriptions',
    'commissions',
    'bookmakers',
    'payments',
    'withdrawals',
    'binary_network',
    'surebets',
    'scrapers',
    'app_logs'
  ];

  console.log('📋 Tablas encontradas:\n');
  const existingTables = [];

  for (const table of tablesToCheck) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        console.log(`✅ ${table.padEnd(20)} - ${count || 0} registros`);
        existingTables.push(table);
      }
    } catch (e) {
      // Tabla no existe
    }
  }

  console.log('\n👥 Usuarios en auth.users:\n');

  try {
    const { data: authUsers, error } = await supabase.auth.admin.listUsers();

    if (!error && authUsers) {
      console.log(`Total: ${authUsers.users.length} usuarios`);

      if (authUsers.users.length > 0) {
        console.log('\nPrimeros usuarios:');
        authUsers.users.slice(0, 3).forEach((user, i) => {
          console.log(`${i + 1}. ${user.email} (${user.id.slice(0, 8)}...)`);
        });
      }
    }
  } catch (e) {
    console.log('Error al obtener usuarios:', e.message);
  }

  console.log('\n📊 Resumen:\n');
  console.log(`- Tablas existentes: ${existingTables.length}`);
  console.log(`- Tablas: ${existingTables.join(', ')}`);

  return existingTables;
}

analyzeDatabase()
  .then(() => {
    console.log('\n✅ Análisis completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
