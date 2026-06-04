# 🎯 PolyBet Pools - Guía de Deployment

## 📋 **RESUMEN DEL SISTEMA**

**PolyBet Pools** es un sistema completo de apuestas parimutuel integrado en PolyBet que permite:

- ✅ Apuestas en eventos deportivos, políticos, entretenimiento y predicciones
- ✅ Wallet interno con depósitos/retiros
- ✅ Pool parimutuel (cuotas dinámicas)
- ✅ Comisión diferenciada: 6% usuarios free, 3% usuarios premium
- ✅ Resolución manual de mercados con pagos automáticos
- ✅ Stripe, PSE, BOLD, Wompi (próximamente)

---

## 🗄️ **PASO 1: EJECUTAR MIGRACIONES EN SUPABASE**

### **Opción A: Dashboard de Supabase** (Recomendado)

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **SQL Editor**
4. Ejecuta las migraciones en orden:

**Migration 010 - Schema Principal**:
```sql
-- Copia y pega el contenido completo de:
-- supabase/migrations/010_polybet_pools_system.sql
```

**Migration 011 - Mercados de Muestra**:
```sql
-- Copia y pega el contenido completo de:
-- supabase/migrations/011_sample_markets.sql
```

### **Opción B: Supabase CLI**

```bash
# Instala Supabase CLI si no lo tienes
npm install -g supabase

# Login
supabase login

# Link proyecto
supabase link --project-ref TU_PROJECT_REF

# Ejecuta migraciones
supabase db push
```

### **Verificación**

Ejecuta en SQL Editor:

```sql
-- Verifica que las tablas existan
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_wallets', 'wallet_transactions', 'markets', 'bets', 'pool_stats');

-- Verifica mercados de muestra
SELECT id, title, status FROM markets;

-- Deberías ver 5 mercados:
-- 1. Junior vs Nacional
-- 2. Elecciones Colombia 2026
-- 3. Bitcoin $100K
-- 4. Colombia Mundial 2026
-- 5. Copa América 2024 (resuelto - ejemplo)
```

---

## 🔐 **PASO 2: VARIABLES DE ENTORNO**

### **Agregar a Vercel**

Ve a: **Vercel Dashboard** → **Tu Proyecto** → **Settings** → **Environment Variables**

**Nuevas Variables (PolyBet Pools)**:

```bash
# Stripe Webhook para Pools (opcional - puedes usar el mismo)
STRIPE_POOLS_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Si quieres webhooks separados para suscripciones vs pools
# Si no, el sistema usará STRIPE_WEBHOOK_SECRET existente
```

**Variables Existentes** (ya deberías tenerlas):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

STRIPE_SECRET_KEY=sk_live_xxxxx (o sk_test_xxxxx)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx (o pk_test_xxxxx)

NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

---

## 🎣 **PASO 3: CONFIGURAR WEBHOOK DE STRIPE (Depósitos)**

### **Crear Webhook Endpoint**

1. Ve a https://dashboard.stripe.com/webhooks
2. Click **Add endpoint**
3. URL: `https://tu-dominio.vercel.app/api/pools/webhook/stripe`
4. Eventos a escuchar:
   - ✅ `checkout.session.completed`
5. Guarda y copia el **Signing secret** (`whsec_...`)
6. Agrégalo a Vercel como `STRIPE_POOLS_WEBHOOK_SECRET`

### **Probar Webhook** (Local)

```bash
# Instala Stripe CLI
stripe login

# Reenvía webhooks a localhost
stripe listen --forward-to localhost:3000/api/pools/webhook/stripe

# En otra terminal, ejecuta test
stripe trigger checkout.session.completed
```

---

## 🚀 **PASO 4: DEPLOYMENT**

### **Push a GitHub**

```bash
git add -A
git commit -m "Add PolyBet Pools system complete"
git push origin master
```

### **Vercel Auto-Deploy**

Vercel detectará el push y desplegará automáticamente.

**Verifica deployment**:
- ✅ Build exitoso
- ✅ Sin errores de TypeScript
- ✅ Funciones edge desplegadas

---

## 🧪 **PASO 5: TESTING**

### **Test 1: Ver Mercados (Usuario)**

1. Login como usuario normal
2. Ve a `/dashboard/pools`
3. **Deberías ver**:
   - Card de wallet (balance $0.00)
   - 4 mercados disponibles
   - Botón "Depositar"

### **Test 2: Depositar Saldo**

1. Click "Depositar" o ve a `/dashboard/pools/wallet`
2. Ingresa monto: `$20`
3. Método: Stripe
4. Completa checkout (usa tarjeta de prueba: `4242 4242 4242 4242`)
5. **Verifica**:
   - Redirección a wallet
   - Balance actualizado a $20.00
   - Transacción en historial

### **Test 3: Colocar Apuesta**

1. Ve a `/dashboard/pools`
2. Click en un mercado (ej: Junior vs Nacional)
3. Selecciona opción (ej: "Junior de Barranquilla")
4. Ingresa monto: `$10`
5. Click "Confirmar Apuesta"
6. **Verifica**:
   - Balance actualizado ($20 - $10 = $10)
   - Apuesta en "Mis Apuestas"
   - Pool total aumentó en $10

### **Test 4: Resolver Mercado (Admin)**

1. Login como superadmin
2. Ve a `/admin/pools/markets`
3. Click "Resolver Mercado" en cualquier mercado con apuestas
4. Selecciona opción ganadora
5. Ingresa fuente: `https://ejemplo.com/resultado`
6. Click "Confirmar y Resolver"
7. **Verifica**:
   - Mercado marcado como "Resuelto"
   - Usuarios ganadores recibieron pago
   - Comisión aplicada correctamente

### **Test 5: Crear Mercado (Admin)**

1. Ve a `/admin/pools/markets/create`
2. Completa formulario:
   - Categoría: Fútbol
   - Título: "América vs Cali"
   - Opciones: ["América", "Empate", "Cali"]
   - Fechas: Próxima semana
3. Click "Crear Mercado"
4. **Verifica**:
   - Mercado aparece en lista
   - Estado: "Abierto"
   - Usuarios pueden apostar

---

## 📊 **ESTRUCTURA DEL SISTEMA**

### **Database Tables**

```
user_wallets           → Balance y estadísticas
wallet_transactions    → Historial completo
markets                → Eventos de apuestas
bets                   → Apuestas individuales
pool_stats             → Stats denormalizadas (performance)
```

### **API Endpoints**

**Wallet**:
- `GET /api/pools/wallet/balance`
- `GET /api/pools/wallet/transactions`
- `POST /api/pools/wallet/deposit`
- `POST /api/pools/wallet/withdraw`

**Markets**:
- `GET /api/pools/markets` (list)
- `GET /api/pools/markets/[id]` (detail)
- `POST /api/pools/markets` (create - admin)
- `POST /api/pools/markets/resolve` (resolve - admin)

**Bets**:
- `POST /api/pools/bets/place`
- `GET /api/pools/bets/history`

**Webhooks**:
- `POST /api/pools/webhook/stripe` (deposits)

### **UI Routes**

**Admin**:
- `/admin/pools` - Dashboard
- `/admin/pools/markets` - Lista mercados
- `/admin/pools/markets/create` - Crear mercado

**User**:
- `/dashboard/pools` - Dashboard principal
- `/dashboard/pools/wallet` - Wallet y transacciones
- `/dashboard/pools/history` - Historial apuestas
- `/dashboard/pools/markets` - Todos los mercados

---

## ⚙️ **CONFIGURACIONES OPCIONALES**

### **Límites de Apuesta**

Edita en la BD (tabla `markets`):

```sql
UPDATE markets 
SET 
  min_bet = 5.00,
  max_bet = 200.00,
  max_total_bet = 1000.00
WHERE id = 1;
```

### **Comisiones**

Actualmente:
- Free users: 6%
- Premium users (con suscripción activa): 3%

Para cambiar, modifica en:
- `app/api/pools/bets/place/route.ts` línea ~109

### **Métodos de Pago**

**Actualmente Implementado**:
- ✅ Stripe (tarjetas internacionales)

**Pendientes** (código preparado, falta integración):
- ⏳ PSE (bancos colombianos)
- ⏳ BOLD (Nequi, corresponsales)
- ⏳ Wompi (Bancolombia, QR)

---

## 🐛 **TROUBLESHOOTING**

### **Error: "Wallet no encontrado"**

**Causa**: Usuario creado antes de la migración  
**Solución**:

```sql
INSERT INTO user_wallets (user_id, balance)
SELECT id, 0.00 
FROM users 
WHERE id NOT IN (SELECT user_id FROM user_wallets);
```

### **Error: "Mercado no encontrado"**

**Causa**: Migración 011 no ejecutada  
**Solución**: Ejecuta `011_sample_markets.sql` en Supabase SQL Editor

### **Webhook no funciona**

**Causa**: Signing secret incorrecto  
**Solución**:
1. Ve a Stripe Dashboard → Webhooks
2. Copia el signing secret
3. Actualiza `STRIPE_POOLS_WEBHOOK_SECRET` en Vercel
4. Redeploy

### **Cuotas no se actualizan**

**Causa**: Trigger `update_pool_stats_on_bet` no ejecutado  
**Solución**:

```sql
-- Recalcula pool stats manualmente
TRUNCATE TABLE pool_stats;

INSERT INTO pool_stats (market_id, option_index, total_amount, total_bets, premium_amount, premium_bets, free_amount, free_bets)
SELECT 
  market_id,
  option_index,
  SUM(amount) as total_amount,
  COUNT(*) as total_bets,
  SUM(CASE WHEN is_premium THEN amount ELSE 0 END) as premium_amount,
  SUM(CASE WHEN is_premium THEN 1 ELSE 0 END) as premium_bets,
  SUM(CASE WHEN NOT is_premium THEN amount ELSE 0 END) as free_amount,
  SUM(CASE WHEN NOT is_premium THEN 1 ELSE 0 END) as free_bets
FROM bets
GROUP BY market_id, option_index;
```

---

## 📈 **MONITORING**

### **Métricas Clave**

**Dashboard Admin** (`/admin/pools`):
- Mercados totales/activos/resueltos
- Apuestas totales y monto
- Balance en wallets
- Usuarios activos

**Queries útiles**:

```sql
-- Total en pools activos
SELECT SUM(total_amount) 
FROM pool_stats ps
JOIN markets m ON ps.market_id = m.id
WHERE m.status IN ('open', 'locked');

-- Top apostadores
SELECT u.email, SUM(b.amount) as total_bet
FROM bets b
JOIN users u ON b.user_id = u.id
GROUP BY u.id, u.email
ORDER BY total_bet DESC
LIMIT 10;

-- Comisión generada hoy
SELECT SUM(commission_charged)
FROM bets
WHERE DATE(created_at) = CURRENT_DATE
AND status = 'won';
```

---

## ✅ **CHECKLIST DE DEPLOYMENT**

- [ ] Migración 010 ejecutada en Supabase
- [ ] Migración 011 ejecutada (mercados de muestra)
- [ ] Variables de entorno en Vercel
- [ ] Webhook de Stripe configurado
- [ ] Push a GitHub completado
- [ ] Vercel deployment exitoso
- [ ] Test: Ver mercados (usuario)
- [ ] Test: Depositar saldo
- [ ] Test: Colocar apuesta
- [ ] Test: Resolver mercado (admin)
- [ ] Test: Crear mercado (admin)

---

## 🎉 **¡LISTO!**

Tu sistema PolyBet Pools está completamente funcional.

**Próximos pasos sugeridos**:
1. Agregar más mercados desde `/admin/pools/markets/create`
2. Promover entre usuarios para generar liquidez
3. Implementar PSE/BOLD/Wompi para mercado local
4. Agregar notificaciones (email/push) para resultados
5. Dashboard de estadísticas avanzadas

**¿Preguntas?** Revisa la documentación técnica en el código o contacta soporte.

---

**Creado con** ❤️ **por Claude Sonnet 4.5**
