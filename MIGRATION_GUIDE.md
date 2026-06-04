# Guía de Migración - Sistema MLM

## 📋 Resumen

Esta migración agrega el sistema binario MLM a tu base de datos existente **sin perder datos**.

**Cambios principales**:
- ✅ Agregar columnas MLM a `user_profiles` existente
- ✅ Generar `referral_code` único para cada usuario
- ✅ Crear tablas: `commission_config`, `binary_commission_levels`, `subscription_bookmakers`
- ✅ Configurar `salunacorpsas@gmail.com` como superadmin
- ✅ Mantener todos los datos existentes (usuarios, bookmakers, surebets)

---

## 🚀 Método 1: Ejecutar en SQL Editor (RECOMENDADO)

### Paso 1: Ir al SQL Editor
```
https://supabase.com/dashboard/project/owurgpuzkgghrncdxqaz/sql/new
```

### Paso 2: Ejecutar migración 000 (crear tablas base)

1. Abre [supabase/migrations/000_create_base_tables.sql](supabase/migrations/000_create_base_tables.sql)
2. Copia **TODO** el contenido
3. Pega en el SQL Editor de Supabase
4. Click en **"Run"**
5. Espera a que termine (puede tomar 10-20 segundos)

✅ Deberías ver mensajes como:
```
NOTICE: ✅ Tablas base creadas
NOTICE:    - subscriptions
NOTICE:    - payments
NOTICE:    - commissions
...
```

### Paso 3: Ejecutar migración 001 (agregar campos MLM)

1. Abre [supabase/migrations/001_add_mlm_fields.sql](supabase/migrations/001_add_mlm_fields.sql)
2. Copia **TODO** el contenido
3. Pega en el SQL Editor de Supabase
4. Click en **"Run"**

✅ Deberías ver mensajes como:
```
NOTICE: ✅ Migración completada
NOTICE:    - Agregadas columnas MLM a user_profiles
NOTICE:    - Generados referral_codes únicos
...
```

### Paso 4: Ejecutar migración 002 (configurar superadmin)

1. Abre [supabase/migrations/002_set_superadmin.sql](supabase/migrations/002_set_superadmin.sql)
2. Copia **TODO** el contenido
3. Pega en el SQL Editor de Supabase
4. Click en **"Run"**

✅ Deberías ver:
```
NOTICE: 👥 USUARIOS REGISTRADOS:
NOTICE:   salunacorpsas@gmail.com | superadmin | approved | Ref: XXXX1234
...
```

---

## 🤖 Método 2: Script automático (alternativo)

Si prefieres usar el script Node.js:

```bash
node scripts/run-migrations.js
```

⚠️ **Nota**: Este método puede fallar si Supabase no permite ejecutar SQL vía RPC. En ese caso, usa el Método 1.

---

## ✅ Verificar que funcionó

Después de ejecutar las migraciones:

### 1. Verificar tablas creadas

En el SQL Editor, ejecuta:

```sql
-- Ver todas las tablas
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;

-- Debería incluir:
-- ✅ commission_config
-- ✅ binary_commission_levels
-- ✅ subscription_bookmakers
```

### 2. Verificar user_profiles actualizado

```sql
-- Ver columnas de user_profiles
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Debe incluir:
-- ✅ referral_code
-- ✅ sponsor_id
-- ✅ placement_parent_id
-- ✅ leg
-- ✅ placement_locked_at
```

### 3. Verificar usuarios con referral_code

```sql
SELECT email, role, status, referral_code
FROM user_profiles
ORDER BY created_at;
```

Todos deben tener `referral_code` único.

### 4. Verificar niveles de comisión

```sql
SELECT level, percentage FROM binary_commission_levels ORDER BY level;
```

Debe haber **19 registros** (niveles 2-20).

### 5. Verificar superadmin

```sql
SELECT email, role, status FROM user_profiles WHERE role = 'superadmin';
```

Debe aparecer: `salunacorpsas@gmail.com | superadmin | approved`

---

## 📊 Qué pasó con tus datos existentes

### ✅ Datos MANTENIDOS:
- Los 4 usuarios existentes siguen ahí
- Sus campos originales intactos:
  - `desktop_plan`
  - `desktop_expires_at`
  - `telegram_chat_id`
  - `currency_settings`
  - etc.
- Los 110 bookmakers
- Los 108 surebets

### ✨ Datos AGREGADOS:
- Cada usuario ahora tiene `referral_code` único
- Ejemplo: `ABC12345` (8 caracteres aleatorios)
- Pueden referir nuevos usuarios

### ⚙️ Configuración por defecto:
```sql
-- commission_config
direct_commission_percentage: 10%
min_withdrawal_usd: $50
min_withdrawal_cop: $150,000
placement_change_days: 7 días
base_subscription_price: $20
bookmaker_price: $5

-- binary_commission_levels (niveles 2-20)
Nivel 2-5:   5%
Nivel 6-10:  4%
Nivel 11-15: 3%
Nivel 16-20: 2%
```

Puedes cambiar estos valores después desde el panel de admin.

---

## 🔧 Troubleshooting

### Error: "column already exists"
✅ **Esto es normal**. El script usa `IF NOT EXISTS`, así que es seguro ejecutarlo múltiples veces.

### Error: "relation does not exist"
❌ Verifica que ejecutaste la migración 001 primero antes de la 002.

### Usuario superadmin no aparece
Si `salunacorpsas@gmail.com` no está en `user_profiles`:
1. Regístrate primero en `/register` (usa el referral_code de otro usuario)
2. Ejecuta la migración 002 nuevamente

---

## 🎯 Próximos pasos

Una vez completada la migración:

1. ✅ Iniciar servidor de desarrollo: `npm run dev`
2. ✅ Login como superadmin: http://localhost:3000/login
   - Email: `salunacorpsas@gmail.com`
   - Password: (la que tengas en auth.users)
3. ✅ Serás redirigido a `/admin`
4. ✅ Desde ahí podrás:
   - Ver todos los usuarios
   - Aprobar nuevos registros
   - Configurar comisiones
   - Ver la red binaria

---

## 📞 Soporte

Si algo falla:
1. Copia el mensaje de error completo
2. Comparte qué migración estabas ejecutando
3. Verifica que tus credenciales en `.env.local` son correctas

**El sistema está diseñado para NO perder datos**, todas las operaciones son aditivas (solo agregan, no borran).
