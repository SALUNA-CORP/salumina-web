# 🚀 Features Pendientes - QuantixBet

Este documento detalla las features restantes que fueron solicitadas pero aún no implementadas.

## 📊 **ESTADO ACTUAL:**

✅ **Implementado (4/10):**
1. Dashboard de Performance Visual (MLM)
2. Calculadora de Proyecciones MLM  
3. Sistema de Favoritos (Market Pools)
4. Migraciones de Base de Datos

⏳ **Pendiente (6/10):**
5. Historial de Predicciones con Analytics
6. Sistema de Alertas de Mercados
7. Sistema de Logros/Badges
8. Training Center para MLM
9. Sistema de Notificaciones Unificado
10. Creador de Mercados con IA (OpenAI)

📱 **Proyecto Separado (1/10):**
11. App Móvil Nativa (React Native)

---

## 5️⃣ **HISTORIAL DE PREDICCIONES CON ANALYTICS**

### Descripción:
Página que muestre todas las participaciones del usuario en mercados con estadísticas detalladas de rendimiento.

### Archivos a Crear:

**API Route:** `app/api/pools/history/route.ts`
```typescript
// GET - Obtener historial de bets del usuario con stats
// Calcular: win rate, ROI, mejor categoría, racha actual
// Filtros: por categoría, status (won/lost/pending), fechas
```

**Componente:** `components/pools/PredictionHistory.tsx`
```typescript
// Tabla o grid con historial
// Stats cards: Total participaciones, Win Rate, ROI, Mejor categoría
// Gráfico de rendimiento en el tiempo
// Filtros y búsqueda
```

**Página:** `app/dashboard/pools/history/page.tsx`
```typescript
// Usa el componente PredictionHistory
// Server component que fetch initial data
```

### Features:
- ✅ Win rate por categoría (deportes, política, etc)
- ✅ ROI histórico
- ✅ Racha actual de victorias/derrotas
- ✅ Gráfico de ganancias/pérdidas en el tiempo
- ✅ Comparativa vs promedio de la plataforma
- ✅ Filtros por categoría, estado, fechas

### SQL Query Ejemplo:
```sql
-- Win rate por categoría
SELECT 
  m.category,
  COUNT(*) as total_bets,
  SUM(CASE WHEN b.status = 'won' THEN 1 ELSE 0 END) as wins,
  ROUND(
    (SUM(CASE WHEN b.status = 'won' THEN 1 ELSE 0 END)::DECIMAL / COUNT(*)) * 100, 
    2
  ) as win_rate
FROM bets b
JOIN markets m ON b.market_id = m.id
WHERE b.user_id = $1
  AND b.status IN ('won', 'lost')
GROUP BY m.category;
```

---

## 6️⃣ **SISTEMA DE ALERTAS DE MERCADOS**

### Descripción:
Permite a los usuarios crear alertas personalizadas sobre eventos en mercados favoritos.

### Archivos a Crear:

**API Route:** `app/api/pools/alerts/route.ts`
```typescript
// CRUD completo para alertas
// POST - crear alerta
// GET - listar alertas del usuario
// DELETE - eliminar alerta
// PATCH - activar/desactivar
```

**Componente:** `components/pools/AlertManager.tsx`
```typescript
// Formulario para crear alertas
// Lista de alertas activas
// Tipos de alerta:
// - Cambio de cuotas X%
// - Pool alcanza $X
// - Cierra en X horas
// - Cambio de estado
```

**Página:** `app/dashboard/pools/alerts/page.tsx`

**Background Job (opcional):** `app/api/cron/check-alerts/route.ts`
```typescript
// Cron job que revisa alerts y dispara notificaciones
// Se ejecuta cada 5-15 minutos
```

### Tipos de Alertas:
1. **Odds Change:** Cuotas cambian más de X%
2. **Pool Threshold:** Pool alcanza $X
3. **Closing Soon:** Mercado cierra en X horas
4. **Status Change:** Mercado cambia de estado

---

## 7️⃣ **SISTEMA DE LOGROS/BADGES**

### Descripción:
Gamificación con badges desbloqueables automáticamente cuando el usuario alcanza hitos.

### Archivos a Crear:

**API Route:** `app/api/achievements/route.ts`
```typescript
// GET - listar achievements disponibles
// GET /user - listar achievements del usuario
```

**API Route:** `app/api/achievements/check/route.ts`
```typescript
// Función que revisa si el usuario desbloqueó nuevos achievements
// Se llama después de acciones clave (nueva bet, nuevo referido, etc)
// Auto-unlocks y crea notificación
```

**Componente:** `components/achievements/AchievementCard.tsx`
```typescript
// Card que muestra un achievement
// Badge con rareza (common, rare, epic, legendary)
// Progress bar si está en progreso
// Locked/Unlocked state
```

**Componente:** `components/achievements/AchievementsList.tsx`
```typescript
// Grid de todos los achievements
// Filtros por categoría (pools, mlm, general)
// Ordenar por rareza, fecha
```

**Página:** `app/dashboard/achievements/page.tsx`

### Achievements Ya Definidos (en DB):
- 🎯 Primera Predicción
- 🔥 Racha de 10
- 🧠 Estratega (70% win rate)
- 💰 Ganador Profesional ($1000 profit)
- 🤝 Primer Referido
- 👥 Reclutador Activo (10 referidos)
- 🌐 Constructor de Red (50 personas)
- 💎 Red Diamante (200 personas)
- 💵 Comisionista Pro ($500 en comisiones)
- 📚 Estudiante Dedicado (5 trainings completados)
- 🚀 Adoptador Temprano (primeros 100 usuarios)
- 📈 Trader Activo (30 días consecutivos)

### Lógica de Desbloqueo:
```typescript
// Ejemplo: después de una bet
async function checkAchievements(userId: string) {
  const betsCount = await getTotalBets(userId);
  
  // First Bet
  if (betsCount === 1) {
    await unlockAchievement(userId, 'first_bet');
  }
  
  // Racha de 10
  if (betsCount === 10) {
    await unlockAchievement(userId, 'bet_streak_10');
  }
  
  // Win Rate Achievement
  const winRate = await calculateWinRate(userId);
  if (winRate >= 70 && betsCount >= 20) {
    await unlockAchievement(userId, 'win_rate_70');
  }
}
```

---

## 8️⃣ **TRAINING CENTER PARA MLM**

### Descripción:
Biblioteca de materiales de capacitación para ayudar a usuarios a reclutar mejor.

### Archivos a Crear:

**API Route:** `app/api/training/route.ts`
```typescript
// GET - listar materiales (filtros por categoría, dificultad)
// GET /[id] - obtener un material específico
// POST /[id]/progress - actualizar progreso
```

**Admin API:** `app/api/admin/training/route.ts`
```typescript
// CRUD para que admins gestionen materiales
// POST - crear material
// PATCH /[id] - editar
// DELETE /[id] - eliminar
```

**Componente:** `components/training/TrainingCard.tsx`
```typescript
// Card de material de capacitación
// Muestra: título, tipo (video/article/pdf), duración
// Progress bar si ya lo empezaste
// Badges de dificultad
```

**Página:** `app/dashboard/training/page.tsx`
```typescript
// Grid de materiales
// Filtros: categoría, dificultad, tipo
// Búsqueda
```

**Página:** `app/dashboard/training/[id]/page.tsx`
```typescript
// Vista de material individual
// Video player / Article reader / PDF viewer
// Botón "Marcar como completado"
// Trackeo de tiempo
```

**Admin Page:** `app/admin/training/page.tsx`
```typescript
// Gestión de materiales
// Tabla con lista
// Botones crear/editar/eliminar
// Upload de archivos
```

### Categorías de Training:
1. **recruitment** - Cómo reclutar
2. **sales** - Técnicas de venta
3. **platform** - Uso de la plataforma
4. **success_stories** - Historias de éxito

### Sample Data a Crear:
```sql
INSERT INTO training_materials (title, content_type, category, difficulty, content_url, duration_minutes) VALUES
  ('Cómo Presentar QuantixBet', 'video', 'recruitment', 'beginner', 'https://youtube.com/...', 15),
  ('Guía de Primeros Pasos', 'article', 'platform', 'beginner', NULL, 10),
  ('Técnicas Avanzadas de Cierre', 'video', 'sales', 'advanced', 'https://youtube.com/...', 30),
  ('Historia: De 0 a $5000/mes', 'article', 'success_stories', 'beginner', NULL, 5);
```

---

## 9️⃣ **SISTEMA DE NOTIFICACIONES UNIFICADO**

### Descripción:
Sistema centralizado de notificaciones in-app, email y push.

### Archivos a Crear:

**API Route:** `app/api/notifications/route.ts`
```typescript
// GET - listar notificaciones del usuario
// PATCH /[id]/read - marcar como leída
// DELETE /[id] - eliminar
// DELETE /read-all - marcar todas como leídas
```

**Helper:** `lib/notifications/create.ts`
```typescript
export async function createNotification({
  userId,
  type,
  title,
  message,
  data,
  actionUrl,
}: NotificationData) {
  // Crea notificación en DB
  // Opcionalmente envía email/push según preferencias del usuario
}
```

**Componente:** `components/notifications/NotificationBell.tsx`
```typescript
// Icono de campana con contador
// Dropdown con últimas 5 notificaciones
// Link a página completa
```

**Componente:** `components/notifications/NotificationList.tsx`
```typescript
// Lista completa de notificaciones
// Agrupa por fecha (hoy, ayer, esta semana, etc)
// Marca como leída al hacer click
```

**Página:** `app/dashboard/notifications/page.tsx`

### Tipos de Notificaciones:
```typescript
type NotificationType = 
  | 'new_referral'       // Nuevo referido se unió
  | 'commission_earned'  // Ganaste comisión
  | 'bet_won'            // Ganaste una predicción
  | 'bet_lost'           // Perdiste una predicción
  | 'market_resolved'    // Mercado resuelto
  | 'alert_triggered'    // Alerta disparada
  | 'achievement_unlocked' // Nuevo logro desbloqueado
  | 'training_assigned'  // Nuevo material asignado
  | 'level_up'           // Subiste de nivel/rango
```

### Integración en Eventos:
```typescript
// Ejemplo: después de resolver un mercado
await createNotification({
  userId: bet.user_id,
  type: bet.status === 'won' ? 'bet_won' : 'bet_lost',
  title: bet.status === 'won' ? '¡Ganaste!' : 'Mercado Resuelto',
  message: `Tu participación en "${market.title}" fue ${bet.status === 'won' ? 'ganadora' : 'perdedora'}`,
  data: { marketId: market.id, betId: bet.id, amount: bet.net_payout },
  actionUrl: `/dashboard/pools/history`,
});
```

---

## 🔟 **CREADOR DE MERCADOS CON IA (OPENAI)**

### Descripción:
Herramienta de admin que usa IA para generar mercados automáticamente.

### Setup Requerido:
```bash
npm install openai
```

Agregar a `.env.local`:
```
OPENAI_API_KEY=sk-...
```

### Archivos a Crear:

**API Route:** `app/api/admin/ai/generate-market/route.ts`
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  // Input: tema del mercado (ej: "Mundial de fútbol Qatar 2026")
  // Output: {title, description, options[], category, suggested_date}
  
  const { topic } = await request.json();
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: `Eres un experto en crear mercados de predicción. 
        Genera opciones claras, mutuamente exclusivas y exhaustivas.
        Retorna JSON con: title (corto), description (1-2 oraciones),
        options (array de 3-5 opciones), category (sports/politics/entertainment/economics),
        suggested_event_date (ISO 8601)`
      },
      {
        role: "user",
        content: `Crea un mercado de predicción sobre: ${topic}`
      }
    ],
    response_format: { type: "json_object" },
  });
  
  const generated = JSON.parse(completion.choices[0].message.content);
  return NextResponse.json({ success: true, market: generated });
}
```

**Componente:** `components/admin/AIMarketGenerator.tsx`
```typescript
// Input field para el topic
// Botón "Generar con IA"
// Preview del mercado generado
// Botón "Crear Mercado" o "Regenerar"
```

**Integración en:** `app/admin/pools/markets/create/page.tsx`
```typescript
// Agregar tab "Generar con IA"
// Permite generar base del mercado con IA
// Admin puede editar antes de crear
```

### Prompt Engineering Tips:
- Pedir formato JSON específico
- Incluir ejemplos de buenos mercados
- Especificar que las opciones deben ser MECE (Mutually Exclusive, Collectively Exhaustive)
- Pedir que genere fecha de evento realista

---

## 1️⃣1️⃣ **APP MÓVIL NATIVA (REACT NATIVE)**

### Setup del Proyecto:

```bash
# Crear nuevo proyecto React Native
npx create-expo-app quantixbet-mobile --template blank-typescript

cd quantixbet-mobile

# Instalar dependencias
npm install @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs
npm install react-native-screens react-native-safe-area-context
npm install @supabase/supabase-js @react-native-async-storage/async-storage
npm install react-native-url-polyfill
```

### Estructura del Proyecto:
```
quantixbet-mobile/
├── app/
│   ├── (auth)/
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/
│   │   ├── pools.tsx
│   │   ├── network.tsx
│   │   ├── wallet.tsx
│   │   └── profile.tsx
│   └── _layout.tsx
├── components/
│   ├── pools/
│   ├── network/
│   └── ui/
├── lib/
│   ├── supabase.ts
│   └── api.ts
├── types/
└── constants/
```

### Features a Implementar:

**Fase 1 - Core:**
- ✅ Autenticación (login/register)
- ✅ Bottom tabs navigation
- ✅ Dashboard principal
- ✅ Lista de mercados
- ✅ Detalle de mercado
- ✅ Wallet overview

**Fase 2 - MLM:**
- ✅ Vista de red binaria
- ✅ Performance dashboard
- ✅ Calculadora de proyecciones
- ✅ Referidos

**Fase 3 - Notificaciones:**
- ✅ Push notifications con Expo
- ✅ Deep linking
- ✅ Badge de notificaciones sin leer

**Fase 4 - Advanced:**
- ✅ Modo offline con sync
- ✅ Biometric authentication
- ✅ Share sheets (compartir mercados)

### Supabase Client (Mobile):
```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Push Notifications:
```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export async function registerForPushNotificationsAsync() {
  if (!Device.isDevice) return null;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
```

### Deep Linking:
```typescript
// app.json
{
  "expo": {
    "scheme": "quantixbet",
    "ios": {
      "bundleIdentifier": "com.quantixbet.sports"
    },
    "android": {
      "package": "com.quantixbet.sports"
    }
  }
}

// Links:
// quantixbet://pools/markets/3
// quantixbet://network/performance
```

---

## 📦 **DEPENDENCIAS ADICIONALES NECESARIAS**

Para implementar todas las features, instalar:

```bash
# OpenAI (para creador de mercados con IA)
npm install openai

# React Native (proyecto separado - ver sección 11)
# Ver instrucciones específicas arriba

# Email (opcional - para notificaciones)
npm install @sendgrid/mail
# o
npm install nodemailer

# Cron jobs (opcional - para alerts background check)
# Usar Vercel Cron: https://vercel.com/docs/cron-jobs
# O usar el Edge Config de Vercel
```

---

## 🎯 **ORDEN SUGERIDO DE IMPLEMENTACIÓN**

**Si tienes tiempo limitado, implementa en este orden:**

1. ✅ **Sistema de Logros/Badges** (alto impacto, gamificación)
2. ✅ **Historial de Predicciones con Analytics** (valor para usuario)
3. ✅ **Sistema de Notificaciones Unificado** (infraestructura crítica)
4. ✅ **Training Center** (valor para MLM)
5. ⏳ **Sistema de Alertas** (nice to have)
6. ⏳ **Creador con IA** (admin tool, puede esperar)
7. ⏳ **App Móvil** (proyecto grande, última prioridad)

---

## 📞 **NECESITAS AYUDA?**

Para implementar cualquiera de estas features:
1. Abre el proyecto
2. Pídeme implementar la feature específica por número
3. Te daré el código completo paso a paso

Ejemplo: "Implementa la feature #5 - Historial de Predicciones"

---

**Última actualización:** 5 de junio 2026  
**Features implementadas:** 4/11 (36%)  
**Tiempo estimado restante:** 20-30 horas de desarrollo
