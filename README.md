# PolyBet - Sistema de Arbitraje Deportivo con Red MLM

Plataforma completa de arbitraje deportivo con sistema MLM binario de 20 niveles. Activa tu cuenta y selecciona tus casas de apuestas.

## 🚀 Características Implementadas

### ✅ Sistema de Autenticación
- Login/Register con Supabase Auth
- Protección de rutas con middleware
- Roles (superadmin/user)
- Logout funcional

### ✅ Sistema de Suscripciones
- Activación: $20 + $5 por casa de apuestas
- Mínimo 2 casas para arbitraje
- Integración completa con Stripe
- Webhooks automáticos
- Selector de plan interactivo
- Soporte USD y COP

### ✅ Red Binaria (20 niveles)
- Colocación automática en pierna débil
- Visualización con React Flow
- Cálculo de volumen por pierna
- Estadísticas en tiempo real

### ✅ Sistema de Comisiones
- Comisiones directas (configurable)
- Comisiones binarias 19 niveles (2-20)
- Cálculo independiente por pierna
- Historial completo

### ✅ Panel de Administrador
- Dashboard con métricas
- Gestión de usuarios
- Configuración de comisiones (preparado)
- Vista de red global

### ✅ Panel de Usuario
- Dashboard personal
- Gestión de suscripción
- Red binaria visual
- Comisiones
- Referidos con código único
- Descarga de app

### ✅ API para App Móvil
- `/api/app-api/login` - JWT custom
- `/api/app-api/validate` - Validación de token
- Filtrado de bookmakers por plan

## 📋 Stack Tecnológico

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase PostgreSQL
- **Pagos**: Stripe
- **Visualización**: React Flow, Lucide Icons

## 🛠️ Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar .env.local (ver .env.local.example)

# 3. Ejecutar migraciones en Supabase
# Ver MIGRATION_GUIDE.md

# 4. Iniciar desarrollo
npm run dev
```

## 📖 Documentación

- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) - Guía de migraciones ⭐
- [PROJECT_BRIEF.md](PROJECT_BRIEF.md) - Descripción completa
- [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md) - Fases de desarrollo
- [ARCHITECTURE.md](ARCHITECTURE.md) - Arquitectura técnica
- [DECISIONS_LOG.md](DECISIONS_LOG.md) - Decisiones de diseño
- [DATABASE_SCHEMA.sql](DATABASE_SCHEMA.sql) - Schema de BD

## 🚀 Deploy en Vercel

```bash
# 1. Push a GitHub
git push origin main

# 2. Conectar en Vercel
# https://vercel.com/new

# 3. Configurar variables de entorno en Vercel
# (todas las de .env.local)

# 4. Configurar webhook de Stripe
# URL: https://tu-dominio.vercel.app/api/payments/stripe/webhook
```

## 💡 Uso

### Login como Superadmin
```
Email: salunacorpsas@gmail.com
Password: (configurada en Supabase Auth)
URL: http://localhost:3000/login
```

### Registrar nuevo usuario
```
URL: http://localhost:3000/register?ref=DB9FF94B
(usar referral_code del superadmin)
```

## 📞 Soporte

Email: salunacorpsas@gmail.com

---

**Desarrollado por Claude Code** 🤖
