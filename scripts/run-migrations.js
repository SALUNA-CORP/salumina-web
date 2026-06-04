const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  console.log('🚀 Ejecutando migraciones...\n');

  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  const migrations = [
    '000_create_base_tables.sql',
    '001_add_mlm_fields.sql',
    '002_set_superadmin.sql'
  ];

  for (const migrationFile of migrations) {
    const filePath = path.join(migrationsDir, migrationFile);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Migración ${migrationFile} no encontrada`);
      continue;
    }

    console.log(`📄 Ejecutando ${migrationFile}...`);

    const sql = fs.readFileSync(filePath, 'utf8');

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });

      if (error) {
        // Si no existe la función exec_sql, usar método alternativo
        console.log(`⚠️  No se pudo ejecutar vía RPC. Ejecuta manualmente en el SQL Editor:`);
        console.log(`   https://supabase.com/dashboard/project/owurgpuzkgghrncdxqaz/sql/new\n`);
        return;
      }

      console.log(`✅ ${migrationFile} completada\n`);
    } catch (err) {
      console.error(`❌ Error en ${migrationFile}:`, err.message);
      return;
    }
  }

  console.log('✅ Todas las migraciones completadas\n');

  // Verificar resultado
  console.log('🔍 Verificando cambios...\n');

  const { data: users } = await supabase
    .from('user_profiles')
    .select('email, role, status, referral_code')
    .order('created_at');

  if (users) {
    console.log('👥 Usuarios actualizados:');
    users.forEach(user => {
      console.log(`  ${user.email.padEnd(35)} | ${(user.role || 'user').padEnd(12)} | Ref: ${user.referral_code}`);
    });
  }

  const { count: levelsCount } = await supabase
    .from('binary_commission_levels')
    .select('*', { count: 'exact', head: true });

  console.log(`\n📊 Niveles de comisión binaria: ${levelsCount || 0}/19`);

  const { data: config } = await supabase
    .from('commission_config')
    .select('*')
    .single();

  if (config) {
    console.log(`💰 Comisión directa: ${config.direct_commission_percentage}%`);
    console.log(`💵 Precio base: $${config.base_subscription_price}`);
    console.log(`🏠 Precio por bookmaker: $${config.bookmaker_price}`);
  }
}

runMigrations()
  .then(() => {
    console.log('\n✅ Proceso completado');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
