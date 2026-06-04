const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkBookmakersType() {
  console.log('🔍 Verificando estructura de bookmakers...\n');

  const { data, error } = await supabase
    .from('bookmakers')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data && data.length > 0) {
    const sample = data[0];
    console.log('📊 Columnas y tipos:');
    console.log('');
    Object.entries(sample).forEach(([key, value]) => {
      const type = typeof value;
      const actualType = value === null ? 'null' :
                        Number.isInteger(value) ? 'integer' :
                        typeof value === 'string' && value.length === 36 && value.includes('-') ? 'uuid?' :
                        type;
      console.log(`  ${key.padEnd(20)} : ${actualType.padEnd(10)} (valor: ${JSON.stringify(value).slice(0, 50)})`);
    });

    console.log('\n📋 ID es de tipo:', Number.isInteger(sample.id) ? 'INTEGER' : typeof sample.id);
  }
}

checkBookmakersType()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
