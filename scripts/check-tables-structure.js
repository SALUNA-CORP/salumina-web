const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkStructure() {
  console.log('🔍 Verificando estructura de tablas clave...\n');

  // Verificar user_profiles
  console.log('📋 user_profiles:');
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(1);

  if (!usersError && users && users.length > 0) {
    console.log('Columnas:', Object.keys(users[0]).join(', '));
    console.log('Ejemplo:', users[0]);
  }

  console.log('\n📋 bookmakers:');
  const { data: bookmakers, error: bookmakersError } = await supabase
    .from('bookmakers')
    .select('*')
    .limit(1);

  if (!bookmakersError && bookmakers && bookmakers.length > 0) {
    console.log('Columnas:', Object.keys(bookmakers[0]).join(', '));
    console.log('Total:', await supabase.from('bookmakers').select('id', { count: 'exact', head: true }).then(r => r.count));
  }

  console.log('\n📋 subscriptions:');
  const { data: subs, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .limit(1);

  if (!subsError) {
    if (subs && subs.length > 0) {
      console.log('Columnas:', Object.keys(subs[0]).join(', '));
    } else {
      console.log('Tabla vacía pero existe');
    }
  }

  console.log('\n📋 commissions:');
  const { data: comms, error: commsError } = await supabase
    .from('commissions')
    .select('*')
    .limit(1);

  if (!commsError) {
    if (comms && comms.length > 0) {
      console.log('Columnas:', Object.keys(comms[0]).join(', '));
    } else {
      console.log('Tabla vacía pero existe');
    }
  }

  // Ver todos los usuarios
  console.log('\n👥 Usuarios actuales:');
  const { data: allUsers } = await supabase
    .from('user_profiles')
    .select('id, email, full_name, role, status, referral_code, sponsor_id')
    .order('created_at', { ascending: true });

  if (allUsers) {
    allUsers.forEach((user, i) => {
      console.log(`${i + 1}. ${user.email.padEnd(30)} | ${user.role?.padEnd(10) || 'null'.padEnd(10)} | ${user.status || 'null'}`);
      console.log(`   Ref: ${user.referral_code || 'null'} | Sponsor: ${user.sponsor_id ? user.sponsor_id.slice(0, 8) + '...' : 'null'}`);
    });
  }

  // Verificar tabla commission_config
  console.log('\n📋 commission_config:');
  const { data: config, error: configError } = await supabase
    .from('commission_config')
    .select('*')
    .single();

  if (!configError && config) {
    console.log('✅ Existe');
    console.log('Configuración:', config);
  } else {
    console.log('❌ No existe o está vacía');
  }

  // Verificar tabla binary_commission_levels
  console.log('\n📋 binary_commission_levels:');
  const { count } = await supabase
    .from('binary_commission_levels')
    .select('*', { count: 'exact', head: true });

  console.log(`${count || 0} niveles configurados (debería ser 19)`);
}

checkStructure()
  .then(() => {
    console.log('\n✅ Verificación completada');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  });
