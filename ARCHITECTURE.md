# ARQUITECTURA DEL SISTEMA

Documentación técnica completa de la arquitectura de SALUMINA.

---

## 📐 DIAGRAMA DE ARQUITECTURA

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIOS FINALES                          │
├─────────────────────────────────────────────────────────────┤
│  Web (Desktop/Mobile)         │     App Móvil (Android)     │
│  - Next.js 14 App             │     - Electron + Capacitor  │
│  - React 18                   │     - React                 │
│  - Tailwind CSS               │     - TypeScript            │
└────────────┬─────────────────────────────────┬──────────────┘
             │                                 │
             ▼                                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    VERCEL (Frontend + API)                   │
├─────────────────────────────────────────────────────────────┤
│  Next.js App Router                                          │
│  ├── (public) Landing, Registro, Login                      │
│  ├── /dashboard/** (User Panel)                             │
│  ├── /admin/** (Admin Panel)                                │
│  └── /api/** (API Routes)                                   │
│      ├── /auth - Autenticación                              │
│      ├── /subscriptions - Pagos y planes                    │
│      ├── /network - Red binaria                             │
│      ├── /commissions - Cálculos                            │
│      ├── /withdrawals - Retiros                             │
│      ├── /app-api - API para app móvil                      │
│      └── /webhooks - Stripe, Bold, Crypto                   │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────┬──────────────┬─────────────┐
             ▼             ▼              ▼             ▼
     ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌─────────┐
     │  Stripe  │  │   Bold   │  │ CoinPayments│  │ Supabase│
     │          │  │          │  │             │  │         │
     │ Webhooks │  │ Webhooks │  │  Webhooks   │  │ Auth +  │
     │  Pagos   │  │  Pagos   │  │   Cripto    │  │   DB    │
     └──────────┘  └──────────┘  └─────────────┘  └────┬────┘
                                                        │
                                                        ▼
                                           ┌─────────────────────┐
                                           │ PostgreSQL Database │
                                           ├─────────────────────┤
                                           │ - 11 tablas         │
                                           │ - RLS policies      │
                                           │ - Triggers          │
                                           │ - Functions         │
                                           │ - Materialized views│
                                           └─────────────────────┘
```

---

## 🏗️ STACK TECNOLÓGICO

### Frontend Web
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Next.js | 14.x | Framework React con SSR y API Routes |
| React | 18.x | Biblioteca UI |
| TypeScript | 5.x | Lenguaje tipado |
| Tailwind CSS | 3.x | Estilos utility-first |
| React Flow | 11.x | Visualización árbol binario |
| Recharts | 2.x | Gráficas y estadísticas |
| Radix UI | 1.x | Componentes accesibles |
| React Hook Form | 7.x | Formularios |
| Zod | 3.x | Validación de schemas |

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Supabase | Latest | Backend as a Service |
| PostgreSQL | 15.x | Base de datos relacional |
| Supabase Auth | Latest | Autenticación y autorización |
| Supabase RLS | Latest | Seguridad a nivel de fila |

### Pagos
| Servicio | Uso |
|---------|-----|
| Stripe | Pagos internacionales (tarjetas, USD) |
| Bold | Pagos Colombia (PSE, Nequi, COP) |
| CoinPayments | Pagos/retiros cripto (USDT/USDC) |

### Deploy & DevOps
| Servicio | Uso |
|---------|-----|
| Vercel | Hosting frontend + serverless functions |
| GitHub | Repositorio y CI/CD |
| Sentry | Error tracking |
| PostHog | Analytics |

---

## 🗂️ ESTRUCTURA DE CARPETAS

```
SALUMINA-WEB/
├── app/
│   ├── (public)/              # Rutas públicas (sin auth)
│   │   ├── page.tsx           # Landing page
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   │
│   ├── dashboard/             # Panel usuario (con auth)
│   │   ├── page.tsx           # Dashboard principal
│   │   ├── layout.tsx
│   │   ├── subscription/
│   │   │   ├── page.tsx
│   │   │   └── change-plan/page.tsx
│   │   ├── network/
│   │   │   ├── page.tsx       # Vista árbol binario
│   │   │   └── stats/page.tsx
│   │   ├── commissions/
│   │   │   ├── page.tsx
│   │   │   └── history/page.tsx
│   │   ├── withdrawals/
│   │   │   ├── page.tsx
│   │   │   └── request/page.tsx
│   │   ├── referrals/
│   │   │   └── page.tsx
│   │   ├── downloads/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       ├── page.tsx
│   │       └── wallets/page.tsx
│   │
│   ├── admin/                 # Panel admin (con auth + role)
│   │   ├── page.tsx           # Dashboard admin
│   │   ├── layout.tsx
│   │   ├── users/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── config/
│   │   │   ├── commissions/page.tsx
│   │   │   └── bookmakers/page.tsx
│   │   ├── withdrawals/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── network/
│   │   │   └── page.tsx
│   │   └── analytics/
│   │       └── page.tsx
│   │
│   └── api/                   # API Routes
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   ├── logout/route.ts
│       │   └── refresh/route.ts
│       ├── subscriptions/
│       │   ├── create/route.ts
│       │   ├── update/route.ts
│       │   ├── cancel/route.ts
│       │   └── current/route.ts
│       ├── payments/
│       │   ├── stripe/
│       │   │   ├── checkout/route.ts
│       │   │   └── webhook/route.ts
│       │   ├── bold/
│       │   │   ├── checkout/route.ts
│       │   │   └── webhook/route.ts
│       │   └── crypto/
│       │       ├── checkout/route.ts
│       │       └── webhook/route.ts
│       ├── network/
│       │   ├── tree/route.ts
│       │   ├── stats/route.ts
│       │   ├── place-user/route.ts
│       │   └── move-user/route.ts
│       ├── commissions/
│       │   ├── calculate/route.ts
│       │   ├── history/route.ts
│       │   └── apply/route.ts
│       ├── withdrawals/
│       │   ├── request/route.ts
│       │   ├── approve/route.ts
│       │   ├── reject/route.ts
│       │   └── process/route.ts
│       ├── app-api/            # API exclusiva para app móvil
│       │   ├── login/route.ts
│       │   ├── validate/route.ts
│       │   └── plan/route.ts
│       ├── admin/
│       │   ├── users/route.ts
│       │   ├── config/route.ts
│       │   └── analytics/route.ts
│       └── cron/
│           └── monthly-commissions/route.ts
│
├── components/
│   ├── ui/                    # Componentes base (Radix UI)
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── subscription/
│   │   ├── PlanSelector.tsx
│   │   ├── BookmakerCheckbox.tsx
│   │   └── PriceCalculator.tsx
│   ├── network/
│   │   ├── BinaryTree.tsx
│   │   ├── UserNode.tsx
│   │   └── NetworkStats.tsx
│   ├── commissions/
│   │   ├── BalanceCard.tsx
│   │   └── CommissionHistory.tsx
│   ├── withdrawals/
│   │   ├── RequestForm.tsx
│   │   └── WithdrawalCard.tsx
│   ├── admin/
│   │   ├── UserTable.tsx
│   │   ├── CommissionConfig.tsx
│   │   └── Analytics.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── Footer.tsx
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Cliente browser
│   │   ├── server.ts          # Cliente server
│   │   └── admin.ts           # Cliente admin (bypass RLS)
│   ├── auth/
│   │   ├── session.ts
│   │   ├── jwt.ts
│   │   └── permissions.ts
│   ├── payments/
│   │   ├── stripe.ts
│   │   ├── bold.ts
│   │   ├── coinpayments.ts
│   │   └── prorate.ts
│   ├── binary/
│   │   ├── placement.ts       # Lógica de colocación
│   │   ├── volume.ts          # Cálculo de volumen
│   │   └── tree.ts            # Construcción del árbol
│   ├── commissions/
│   │   ├── direct.ts
│   │   ├── binary.ts
│   │   └── calculator.ts
│   ├── withdrawals/
│   │   └── crypto.ts
│   └── utils/
│       ├── validations.ts
│       └── formatters.ts
│
├── types/
│   ├── database.ts            # Tipos generados de Supabase
│   ├── api.ts
│   └── entities.ts
│
├── middleware.ts              # Auth + routing middleware
├── .env.local                 # Variables de entorno
└── supabase/
    ├── migrations/
    └── seed.sql
```

---

## 🔌 ENDPOINTS DE API

### Autenticación

#### `POST /api/auth/register`
Registra nuevo usuario con código de referido.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "Juan Pérez",
  "referralCode": "ABC123XYZ"
}
```

**Response**:
```json
{
  "success": true,
  "userId": "uuid",
  "message": "Usuario registrado. Pendiente de activación por admin."
}
```

---

#### `POST /api/auth/login`
Inicia sesión y devuelve JWT.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "status": "active"
  },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

---

### Suscripciones

#### `POST /api/subscriptions/create`
Crea nueva suscripción.

**Body**:
```json
{
  "bookmakers": ["pinnacle", "betplay"],
  "currency": "USD",
  "paymentMethod": "stripe"
}
```

**Response**:
```json
{
  "success": true,
  "checkoutUrl": "https://checkout.stripe.com/pay/cs_...",
  "subscriptionId": "uuid"
}
```

---

#### `PATCH /api/subscriptions/update`
Actualiza plan con prorrateo.

**Body**:
```json
{
  "bookmakers": ["pinnacle", "betplay", "polymarket"],
  "action": "upgrade"
}
```

**Response**:
```json
{
  "success": true,
  "prorateAmount": 5.50,
  "newMonthlyAmount": 35.00,
  "effectiveDate": "2026-06-03T15:30:00Z"
}
```

---

#### `DELETE /api/subscriptions/cancel`
Cancela suscripción.

**Response**:
```json
{
  "success": true,
  "accessUntil": "2026-07-03T00:00:00Z",
  "message": "Suscripción cancelada. Tendrás acceso hasta el 3 de julio."
}
```

---

### Red Binaria

#### `GET /api/network/tree?userId=uuid&depth=5`
Obtiene árbol binario de un usuario.

**Response**:
```json
{
  "success": true,
  "tree": {
    "id": "uuid",
    "email": "user@example.com",
    "status": "active",
    "left": {
      "id": "uuid2",
      "email": "referido1@example.com",
      "left": {...},
      "right": {...}
    },
    "right": {
      "id": "uuid3",
      "email": "referido2@example.com",
      "left": null,
      "right": null
    }
  }
}
```

---

#### `GET /api/network/stats?userId=uuid`
Estadísticas de red binaria.

**Response**:
```json
{
  "success": true,
  "stats": {
    "leftLegVolume": 1250.00,
    "rightLegVolume": 980.00,
    "leftLegActiveUsers": 12,
    "rightLegActiveUsers": 8,
    "totalLevels": 7,
    "totalDownline": 20
  }
}
```

---

#### `POST /api/network/move-user`
Mueve usuario a otra pierna (solo dentro del plazo).

**Body**:
```json
{
  "userId": "uuid",
  "newLeg": "right"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Usuario movido a pierna derecha.",
  "placementLockedAt": "2026-06-10T00:00:00Z"
}
```

---

### Comisiones

#### `GET /api/commissions/history?page=1&limit=20`
Historial de comisiones del usuario autenticado.

**Response**:
```json
{
  "success": true,
  "commissions": [
    {
      "id": "uuid",
      "type": "direct",
      "amount": 6.00,
      "currency": "USD",
      "fromUser": "Juan Pérez",
      "status": "available",
      "createdAt": "2026-06-01T10:00:00Z"
    },
    {
      "id": "uuid2",
      "type": "binary",
      "level": 3,
      "amount": 4.20,
      "currency": "USD",
      "status": "available",
      "createdAt": "2026-06-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

---

#### `POST /api/commissions/apply`
Aplica saldo de comisiones a próxima mensualidad.

**Body**:
```json
{
  "amount": 30.00
}
```

**Response**:
```json
{
  "success": true,
  "appliedAmount": 30.00,
  "remainingBalance": 150.00,
  "nextPaymentAmount": 0.00,
  "message": "Comisiones aplicadas. Próximo pago cubierto."
}
```

---

### Retiros

#### `POST /api/withdrawals/request`
Solicita retiro a wallet cripto.

**Body**:
```json
{
  "amount": 100.00,
  "currency": "USD",
  "crypto": "USDT",
  "walletAddress": "0xABCDEF1234567890..."
}
```

**Response**:
```json
{
  "success": true,
  "withdrawalId": "uuid",
  "status": "pending",
  "message": "Solicitud enviada. Será procesada en 24-48 horas."
}
```

---

#### `POST /api/withdrawals/approve` (Admin only)
Aprueba un retiro.

**Body**:
```json
{
  "withdrawalId": "uuid",
  "adminNotes": "Verificado y aprobado"
}
```

**Response**:
```json
{
  "success": true,
  "status": "approved",
  "message": "Retiro aprobado. Procesando..."
}
```

---

### App Móvil

#### `POST /api/app-api/login`
Login exclusivo para app móvil con JWT custom.

**Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response**:
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "bookmakers": ["pinnacle", "betplay"],
    "expiresAt": "2026-07-03T00:00:00Z",
    "status": "active"
  }
}
```

---

#### `GET /api/app-api/validate`
Valida JWT de la app móvil.

**Headers**: `Authorization: Bearer eyJhbGc...`

**Response**:
```json
{
  "success": true,
  "valid": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "bookmakers": ["pinnacle", "betplay"],
    "expiresAt": "2026-07-03T00:00:00Z",
    "status": "active"
  }
}
```

**Si expiró**:
```json
{
  "success": false,
  "valid": false,
  "reason": "subscription_expired",
  "message": "Tu suscripción ha vencido",
  "renewUrl": "https://salumina-web.vercel.app/dashboard/subscription"
}
```

---

### Webhooks

#### `POST /api/payments/stripe/webhook`
Recibe eventos de Stripe.

**Headers**: `stripe-signature: t=xxx,v1=yyy`

**Events manejados**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

---

#### `POST /api/payments/bold/webhook`
Recibe eventos de Bold.

**Headers**: `x-bold-signature: sha256=...`

**Events manejados**:
- `payment.approved`
- `payment.rejected`
- `payment.pending`

---

#### `POST /api/payments/crypto/webhook`
Recibe eventos de CoinPayments.

**Events manejados**:
- `payment_complete`
- `payment_pending`
- `payment_failed`

---

## 🔄 FLUJOS DE DATOS

### 1. Flujo de Registro

```
Usuario → Formulario registro
  ↓
Validar referralCode existe
  ↓
Crear usuario en Supabase Auth
  ↓
Crear user_profile (status: pending)
  ↓
Enviar notificación a admin
  ↓
Usuario redirigido a "Pendiente de aprobación"
```

---

### 2. Flujo de Pago (Stripe)

```
Usuario selecciona plan
  ↓
POST /api/subscriptions/create
  ↓
Crear Stripe Checkout Session
  ↓
Redirigir a Stripe
  ↓
Usuario paga
  ↓
Stripe → POST /api/payments/stripe/webhook
  ↓
Validar webhook signature
  ↓
Crear registro en tabla payments
  ↓
Crear/actualizar subscription
  ↓
Enviar notificación a admin (activación pendiente)
  ↓
Admin aprueba manualmente
  ↓
Cambiar status: pending → active
  ↓
Trigger: colocar en red binaria (pierna débil del sponsor)
  ↓
Enviar email bienvenida + link APK
```

---

### 3. Flujo de Comisiones Mensuales

```
Cron job (1ro de cada mes)
  ↓
GET todos los users activos
  ↓
Para cada user:
  ├─ Calcular comisiones directas
  │  └─ % de cada referido directo activo
  │
  └─ Calcular comisiones binarias
     ├─ Para cada nivel 2-20:
     │  ├─ Calcular volumen pierna izq (recursivo)
     │  ├─ Calcular volumen pierna der (recursivo)
     │  ├─ Aplicar % del nivel a cada pierna
     │  └─ Crear registro en commissions
     │
     └─ Validar requisito: mín 1 activo por pierna
  ↓
Actualizar balance de cada user
  ↓
Enviar notificación de comisiones
```

---

### 4. Flujo de Retiro

```
Usuario solicita retiro
  ↓
Validar saldo disponible
  ↓
Validar mínimo de retiro
  ↓
Validar wallet address
  ↓
Crear withdrawal (status: pending)
  ↓
Descontar de balance (pero no confirmar)
  ↓
Notificar admin
  ↓
Admin revisa y aprueba
  ↓
Cambiar status: pending → approved
  ↓
Llamar API de exchange/wallet
  ↓
Enviar USDT/USDC
  ↓
Confirmar transacción blockchain
  ↓
Guardar txHash
  ↓
Cambiar status: approved → completed
  ↓
Notificar usuario
```

---

## 🔐 SEGURIDAD

### Row Level Security (RLS)

**user_profiles**:
```sql
-- Usuarios pueden leer su propio perfil
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Solo admins pueden actualizar status
CREATE POLICY "Only admins can update status" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );
```

**commissions**:
```sql
-- Usuarios ven solo sus comisiones
CREATE POLICY "Users can read own commissions" ON commissions
  FOR SELECT USING (user_id = auth.uid());

-- Solo sistema puede insertar
CREATE POLICY "Only system can insert" ON commissions
  FOR INSERT WITH CHECK (false);
```

**withdrawals**:
```sql
-- Usuarios ven solo sus retiros
CREATE POLICY "Users can read own withdrawals" ON withdrawals
  FOR SELECT USING (user_id = auth.uid());

-- Usuarios pueden crear retiros
CREATE POLICY "Users can create withdrawals" ON withdrawals
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Solo admins pueden aprobar/rechazar
CREATE POLICY "Only admins can approve" ON withdrawals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );
```

---

### JWT Structure

**Access Token** (válido 24h):
```json
{
  "sub": "uuid",
  "email": "user@example.com",
  "role": "user",
  "status": "active",
  "iat": 1717430400,
  "exp": 1717516800
}
```

**App Token** (válido 30 días, con datos de plan):
```json
{
  "sub": "uuid",
  "email": "user@example.com",
  "bookmakers": ["pinnacle", "betplay"],
  "expiresAt": "2026-07-03T00:00:00Z",
  "status": "active",
  "iat": 1717430400,
  "exp": 1720022400
}
```

---

## 📈 OPTIMIZACIONES

### 1. Materialized View para Volumen

```sql
CREATE MATERIALIZED VIEW binary_network AS
SELECT
  user_id,
  placement_parent_id,
  leg,
  calculate_leg_volume(user_id, 'left') AS left_volume,
  calculate_leg_volume(user_id, 'right') AS right_volume,
  count_active_users(user_id, 'left') AS left_active,
  count_active_users(user_id, 'right') AS right_active,
  updated_at
FROM user_profiles
WHERE status = 'active';

CREATE UNIQUE INDEX idx_binary_network_user ON binary_network(user_id);

-- Actualizar cada hora
SELECT cron.schedule('refresh-binary-network', '0 * * * *', $$
  REFRESH MATERIALIZED VIEW CONCURRENTLY binary_network;
$$);
```

---

### 2. Índices Estratégicos

```sql
-- Consultas frecuentes en user_profiles
CREATE INDEX idx_user_sponsor ON user_profiles(sponsor_id);
CREATE INDEX idx_user_placement ON user_profiles(placement_parent_id, leg);
CREATE INDEX idx_user_status ON user_profiles(status);
CREATE INDEX idx_user_referral ON user_profiles(referral_code);

-- Comisiones por usuario y fecha
CREATE INDEX idx_commissions_user_date ON commissions(user_id, created_at DESC);
CREATE INDEX idx_commissions_status ON commissions(status);

-- Suscripciones activas
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_period ON subscriptions(current_period_end);
```

---

### 3. Paginación en Queries

```typescript
// Ejemplo de query paginado
const getCommissions = async (userId: string, page = 1, limit = 20) => {
  const offset = (page - 1) * limit;
  
  const { data, error, count } = await supabase
    .from('commissions')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total: count,
      pages: Math.ceil(count / limit)
    }
  };
};
```

---

## 🚀 DEPLOYMENT

### Variables de Entorno

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Bold
BOLD_API_KEY=xxxxx
BOLD_PUBLIC_KEY=xxxxx
BOLD_WEBHOOK_SECRET=xxxxx

# CoinPayments
COINPAYMENTS_API_KEY=xxxxx
COINPAYMENTS_API_SECRET=xxxxx
COINPAYMENTS_IPN_SECRET=xxxxx

# App JWT
APP_JWT_SECRET=super-secret-key-for-mobile-app

# Email
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@salumina.com

# Base URL
NEXT_PUBLIC_BASE_URL=https://salumina-web.vercel.app
```

---

### Vercel Configuration

**vercel.json**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "crons": [
    {
      "path": "/api/cron/monthly-commissions",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

---

## 📞 INTEGRACIONES EXTERNAS

### GitHub Auto-Update (App Móvil)

```typescript
// La app móvil chequea updates desde GitHub
const checkForUpdates = async () => {
  const response = await fetch(
    'https://api.github.com/repos/SALUNA-CORP/salumina-sports-desktop/releases/latest'
  );
  const release = await response.json();
  
  if (release.tag_name > currentVersion) {
    // Mostrar notificación de actualización
    // Descargar nuevo APK
  }
};
```

---

**Última actualización**: 4 de junio de 2026  
**Versión**: 1.0
