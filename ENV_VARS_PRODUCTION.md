# 🔑 VARIABLES DE ENTORNO PARA PRODUCCIÓN

## 📋 INSTRUCCIONES

1. **Ve a Vercel Dashboard**: https://vercel.com/dashboard
2. **Selecciona tu proyecto**: `salumina-web`
3. **Ve a**: Settings → Environment Variables
4. **Copia y pega** las variables de abajo
5. **Selecciona** todos los environments (Production, Preview, Development)
6. **Re-deploy** el proyecto

---

## 🔐 SECRETOS GENERADOS (Cron & JWT)

**RECOMENDADO - OPCIÓN 1** (Base64 - 32 bytes):
```bash
CRON_SECRET=TRLNOdJq+GErFHRSihJBRB2BD+tYaJmNEZ0Td+ZgNcQ=
JWT_SECRET=dcKM+O0YNwMab1raz9zjL9kjOrWnkwLZEFe1nxKT7ng=
```

**OPCIÓN 2** (Hexadecimal - más largo):
```bash
CRON_SECRET=53923f359760ac61ab7e4144e1ea39e8d0c1946343d49f3b8a1c32660de50054
JWT_SECRET=0a44947a67a4f680dc5ff47bcce46a61cbe0f0fcaae4d11a476f6535fd8794ad
```

**OPCIÓN 3** (Base64 - 64 bytes - MÁS SEGURO):
```bash
CRON_SECRET=5NsWhfOZufuMeW5aNnzqdF8650k+R2qpMUzR55LK6D4LmzrMyV2jJbbTUyuipjLB8D/dvoJANF13Jwa5nTBUhg==
JWT_SECRET=gwEWmjz6ED30rw3uqxcX+x5NsGjTEli3+HMRcHK8K7ydhALM1QmuGZEgMvlANIdk6HpQ2iGgqPi3bFIqPSpDsA==
```

---

## 📝 TODAS LAS VARIABLES DE ENTORNO NECESARIAS

### 1️⃣ SUPABASE (OBLIGATORIO)

**Dónde obtener**: https://supabase.com/dashboard → Tu Proyecto → Settings → API

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: 
- `SUPABASE_SERVICE_ROLE_KEY` es **MUY SENSIBLE** - solo para servidor
- Nunca expongas esta key en el cliente

---

### 2️⃣ BASE URL (OBLIGATORIO)

```bash
NEXT_PUBLIC_BASE_URL=https://tu-dominio.vercel.app
```

O si tienes dominio personalizado:
```bash
NEXT_PUBLIC_BASE_URL=https://salumina.com
```

⚠️ **Actualiza** esto después del primer deploy cuando tengas tu URL de Vercel

---

### 3️⃣ STRIPE (OBLIGATORIO para pagos)

**Dónde obtener**: https://dashboard.stripe.com → Developers → API keys

```bash
# API Keys
STRIPE_SECRET_KEY=sk_test_51xxxxx... (o sk_live_51xxxxx... para producción)
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx... (o pk_live_51xxxxx... para producción)

# Webhook Secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...
```

📌 **Para obtener STRIPE_WEBHOOK_SECRET**:
1. Ve a: https://dashboard.stripe.com/webhooks
2. Crea endpoint: `https://tu-dominio.vercel.app/api/payments/stripe/webhook`
3. Eventos a seleccionar:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copia el **Signing secret**

---

### 4️⃣ CRON & JWT (OBLIGATORIO)

**Usa los secretos generados arriba**:

```bash
# Usa OPCIÓN 1, 2 o 3 de arriba
CRON_SECRET=TRLNOdJq+GErFHRSihJBRB2BD+tYaJmNEZ0Td+ZgNcQ=
JWT_SECRET=dcKM+O0YNwMab1raz9zjL9kjOrWnkwLZEFe1nxKT7ng=
```

**¿Para qué sirven?**
- `CRON_SECRET`: Protege el endpoint de cron job mensual (comisiones)
- `JWT_SECRET`: Firma tokens JWT para la API móvil

---

## 📋 RESUMEN COMPLETO (COPY-PASTE)

**Reemplaza los valores con los tuyos**:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.yyyyyyyyyy

# Base URL (actualiza con tu dominio de Vercel)
NEXT_PUBLIC_BASE_URL=https://salumina-web.vercel.app

# Stripe (usa test keys primero, luego live)
STRIPE_SECRET_KEY=sk_test_51xxxxx...
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
STRIPE_WEBHOOK_SECRET=whsec_xxxxx...

# Cron & JWT (copia de arriba)
CRON_SECRET=TRLNOdJq+GErFHRSihJBRB2BD+tYaJmNEZ0Td+ZgNcQ=
JWT_SECRET=dcKM+O0YNwMab1raz9zjL9kjOrWnkwLZEFe1nxKT7ng=
```

---

## 🔒 SEGURIDAD

### ✅ DO's (Hacer):
- ✅ Usa secretos diferentes para dev/staging/production
- ✅ Rota secretos cada 6 meses
- ✅ Usa Stripe test keys hasta que estés listo para producción
- ✅ Mantén `SUPABASE_SERVICE_ROLE_KEY` privado
- ✅ Configura Stripe webhook con la URL correcta

### ❌ DON'Ts (No hacer):
- ❌ NUNCA commitees secretos al repositorio
- ❌ NUNCA compartas `SUPABASE_SERVICE_ROLE_KEY`
- ❌ NUNCA uses secretos de producción en desarrollo
- ❌ NUNCA expongas `STRIPE_SECRET_KEY` en el cliente

---

## 🧪 TEST vs PRODUCCIÓN

### Desarrollo/Testing (Stripe Test Mode):
```bash
STRIPE_SECRET_KEY=sk_test_51xxxxx...
STRIPE_PUBLISHABLE_KEY=pk_test_51xxxxx...
```

**Tarjetas de prueba**:
- Éxito: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

### Producción (Stripe Live Mode):
```bash
STRIPE_SECRET_KEY=sk_live_51xxxxx...
STRIPE_PUBLISHABLE_KEY=pk_live_51xxxxx...
```

⚠️ **Solo cambia a live** cuando estés 100% listo para aceptar pagos reales

---

## 📍 CÓMO CONFIGURAR EN VERCEL

### Paso 1: Acceder a Variables de Entorno
1. Ve a: https://vercel.com/dashboard
2. Selecciona proyecto: `salumina-web`
3. Settings → Environment Variables

### Paso 2: Agregar Variables
1. Click **Add New**
2. Key: `NEXT_PUBLIC_SUPABASE_URL`
3. Value: `https://tu-proyecto.supabase.co`
4. Environments: ✅ Production ✅ Preview ✅ Development
5. Click **Save**

Repite para cada variable.

### Paso 3: Re-deploy
1. Ve a: Deployments
2. Último deployment → ⋯ (tres puntos)
3. Click: **Redeploy**
4. Espera ~2-3 minutos

---

## ✅ VERIFICACIÓN

Después de configurar, verifica que todo funcione:

1. **Supabase**: Login debería funcionar
2. **Stripe**: Crear suscripción debería redirigir a checkout
3. **Cron**: Endpoint protegido (solo Vercel Cron puede acceder)
4. **JWT**: App móvil puede autenticarse

---

## 🆘 PROBLEMAS COMUNES

### "supabaseUrl is required"
❌ **Problema**: Variables de Supabase no configuradas  
✅ **Solución**: Agrega `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### "MIDDLEWARE_INVOCATION_FAILED"
❌ **Problema**: Middleware no puede conectar a Supabase  
✅ **Solución**: Verifica que las variables estén en los 3 environments

### Stripe checkout no funciona
❌ **Problema**: Keys no configuradas o webhook URL incorrecta  
✅ **Solución**: Verifica `STRIPE_SECRET_KEY` y configura webhook en Stripe Dashboard

### Cron job falla
❌ **Problema**: `CRON_SECRET` no configurado  
✅ **Solución**: Agrega el secret generado arriba

---

## 📚 DOCUMENTACIÓN

- **Supabase**: https://supabase.com/docs
- **Stripe**: https://stripe.com/docs
- **Vercel**: https://vercel.com/docs/environment-variables
- **Next.js**: https://nextjs.org/docs/app/building-your-application/configuring/environment-variables

---

**Generado**: 4 de junio de 2026  
**Proyecto**: Salumina Web  
**Versión**: 1.0

---

## 🔄 ROTACIÓN DE SECRETOS (Cada 6 meses)

Para generar nuevos secretos:

```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# OpenSSL
openssl rand -base64 32

# PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

**¡Listo para configurar!** 🚀
