# PLAN DE DESARROLLO DETALLADO

## Proyecto: SALUMINA - Sistema Binario con Suscripciones
**Duración estimada**: 10 semanas  
**Estado**: ✅ Fase 1 en progreso

---

## 📅 CRONOGRAMA POR FASES

### **FASE 1: Base y Autenticación** (Semana 1)

**Objetivo**: Crear la estructura base del proyecto y sistema de autenticación

**Tareas**:
- [x] Estructura de carpetas Next.js 14 (App Router)
- [ ] Configuración de Supabase
  - [ ] Crear proyecto en Supabase
  - [ ] Ejecutar schema SQL completo
  - [ ] Configurar variables de entorno
  - [ ] Configurar RLS policies
- [ ] Sistema de autenticación
  - [ ] Registro de usuarios
  - [ ] Login/logout
  - [ ] Reset password (ya existe, revisar)
  - [ ] Protección de rutas
- [ ] Roles y permisos
  - [ ] Middleware para validar roles
  - [ ] HOC para proteger componentes
- [ ] Layouts base
  - [ ] Layout público (marketing)
  - [ ] Layout autenticado (dashboard)
  - [ ] Layout admin
- [ ] Generación de códigos de referido
  - [ ] Trigger automático en Supabase
  - [ ] Validación de códigos únicos

**Archivos a crear**:
```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx
├── dashboard/layout.tsx
├── admin/layout.tsx
└── api/auth/[...nextauth]/route.ts

lib/
├── supabase/
│   ├── client.ts
│   └── server.ts
├── auth.ts
└── permissions.ts

middleware.ts
```

---

### **FASE 2: Sistema de Suscripciones** (Semana 2)

**Objetivo**: Integrar pasarelas de pago y gestión de suscripciones

**Tareas**:
- [ ] Integración Stripe
  - [ ] Crear productos y precios
  - [ ] Checkout de suscripciones
  - [ ] Webhooks (subscription created, updated, deleted)
  - [ ] Customer portal
- [ ] Integración Bold
  - [ ] Configurar API Bold
  - [ ] Flujo de pago
  - [ ] Webhooks de confirmación
- [ ] Integración CoinPayments
  - [ ] Configurar API
  - [ ] Flujo de pago cripto (USDT/USDC)
  - [ ] Webhooks de confirmación
- [ ] Selección de plan
  - [ ] Componente selector de casas de apuestas
  - [ ] Cálculo dinámico de precio
  - [ ] Preview del plan
- [ ] Gestión de webhooks
  - [ ] Endpoint unificado de webhooks
  - [ ] Validación de firmas
  - [ ] Procesamiento de eventos
  - [ ] Activación de suscripciones
- [ ] Cálculo de prorrateos
  - [ ] Función para calcular días proporcionales
  - [ ] Upgrade inmediato con cargo
  - [ ] Downgrade inmediato con crédito
- [ ] Dashboard de suscripción
  - [ ] Ver plan actual
  - [ ] Próximo cobro
  - [ ] Historial de pagos
  - [ ] Cambiar plan

**Archivos a crear**:
```
app/
├── api/
│   ├── stripe/
│   │   ├── checkout/route.ts
│   │   └── webhook/route.ts
│   ├── bold/
│   │   ├── checkout/route.ts
│   │   └── webhook/route.ts
│   └── coinpayments/
│       ├── checkout/route.ts
│       └── webhook/route.ts
├── dashboard/
│   └── subscription/
│       ├── page.tsx
│       ├── change-plan/page.tsx
│       └── payment-history/page.tsx

lib/
├── stripe.ts
├── bold.ts
├── coinpayments.ts
└── prorate.ts

components/
└── subscription/
    ├── PlanSelector.tsx
    ├── BookmakerCheckbox.tsx
    └── PriceCalculator.tsx
```

---

### **FASE 3: Red Binaria** (Semana 3)

**Objetivo**: Implementar estructura binaria y colocación de usuarios

**Tareas**:
- [ ] Colocación automática
  - [ ] Algoritmo para encontrar pierna más débil
  - [ ] Insertar usuario en posición correcta
  - [ ] Validar que no haya duplicados
- [ ] Sistema de cambio de ubicación
  - [ ] Verificar plazo configurado (días)
  - [ ] Mover usuario a otra pierna
  - [ ] Bloquear después del plazo
  - [ ] Notificaciones al sponsor
- [ ] Cálculo de volumen por pierna
  - [ ] Función recursiva para sumar volumen
  - [ ] Actualizar tabla binary_network
  - [ ] Contar usuarios activos
  - [ ] Profundidad máxima
- [ ] Visualización de árbol binario
  - [ ] Componente con React Flow
  - [ ] Nodos personalizados por usuario
  - [ ] Navegación por niveles
  - [ ] Zoom y pan
  - [ ] Búsqueda de usuarios
- [ ] Estadísticas de red
  - [ ] Volumen pierna izq/der
  - [ ] Usuarios activos por pierna
  - [ ] Balance entre piernas
  - [ ] Niveles de profundidad

**Archivos a crear**:
```
app/
├── api/
│   └── network/
│       ├── place-user/route.ts
│       ├── move-user/route.ts
│       ├── stats/route.ts
│       └── tree/route.ts
├── dashboard/
│   └── network/
│       ├── page.tsx
│       └── tree-view/page.tsx
└── admin/
    └── network/
        ├── page.tsx
        └── user/[id]/page.tsx

lib/
└── binary/
    ├── placement.ts
    ├── volume.ts
    └── tree.ts

components/
└── network/
    ├── BinaryTree.tsx
    ├── UserNode.tsx
    ├── NetworkStats.tsx
    └── LegVolume.tsx
```

---

### **FASE 4: Sistema de Comisiones** (Semana 4)

**Objetivo**: Calcular y registrar comisiones directas y binarias

**Tareas**:
- [ ] Comisiones directas
  - [ ] Detectar nuevo pago de referido directo
  - [ ] Calcular % configurado
  - [ ] Crear registro en tabla commissions
  - [ ] Actualizar saldo del sponsor
- [ ] Comisiones binarias
  - [ ] Algoritmo recursivo hasta nivel 20
  - [ ] Para cada upline: calcular comisión según % del nivel
  - [ ] Aplicar a ambas piernas por separado
  - [ ] Validar requisito mínimo (1 activo por pierna)
  - [ ] Crear registros en commissions
- [ ] Procesamiento mensual
  - [ ] Cron job (vercel cron o similar)
  - [ ] Ejecutar al inicio de cada mes
  - [ ] Calcular comisiones de todos
  - [ ] Marcar como "available"
  - [ ] Enviar notificaciones
- [ ] Gestión de saldo
  - [ ] Saldo disponible vs pendiente
  - [ ] Vista de comisiones por mes
  - [ ] Filtros por tipo (directa/binaria)
  - [ ] Gráficas de evolución
- [ ] Aplicar a suscripción
  - [ ] Usar saldo para pagar mensualidad
  - [ ] Descuento automático
  - [ ] Registro del uso de comisiones

**Archivos a crear**:
```
app/
├── api/
│   ├── commissions/
│   │   ├── calculate/route.ts
│   │   ├── process-monthly/route.ts
│   │   ├── apply-to-subscription/route.ts
│   │   └── stats/route.ts
│   └── cron/
│       └── monthly-commissions/route.ts
└── dashboard/
    └── commissions/
        ├── page.tsx
        ├── history/page.tsx
        └── stats/page.tsx

lib/
└── commissions/
    ├── direct.ts
    ├── binary.ts
    ├── calculator.ts
    └── processor.ts

components/
└── commissions/
    ├── BalanceCard.tsx
    ├── CommissionHistory.tsx
    ├── CommissionChart.tsx
    └── ApplyToSubscription.tsx
```

---

### **FASE 5: Retiros** (Semana 5)

**Objetivo**: Sistema de solicitud y procesamiento de retiros

**Tareas**:
- [ ] Solicitud de retiro
  - [ ] Formulario de solicitud
  - [ ] Selección de wallet (USDT/USDC)
  - [ ] Validar saldo mínimo
  - [ ] Validar dirección de wallet
  - [ ] Crear registro en withdrawals
- [ ] Configuración de wallets
  - [ ] Guardar wallets del usuario
  - [ ] Validar formato de direcciones
  - [ ] Múltiples wallets (USDT/USDC)
- [ ] Panel de admin para retiros
  - [ ] Lista de solicitudes pendientes
  - [ ] Detalles de cada solicitud
  - [ ] Aprobar/rechazar
  - [ ] Notas del admin
- [ ] Integración con exchange
  - [ ] API para enviar USDT/USDC
  - [ ] Confirmar transacción
  - [ ] Guardar hash de transacción
  - [ ] Marcar como completado
- [ ] Notificaciones
  - [ ] Email al solicitar
  - [ ] Email al aprobar/rechazar
  - [ ] Email al completar
- [ ] Historial de retiros
  - [ ] Ver todos los retiros
  - [ ] Estados (pending, approved, completed, rejected)
  - [ ] Filtros y búsqueda

**Archivos a crear**:
```
app/
├── api/
│   └── withdrawals/
│       ├── request/route.ts
│       ├── approve/route.ts
│       ├── reject/route.ts
│       ├── process/route.ts
│       └── list/route.ts
├── dashboard/
│   └── withdrawals/
│       ├── page.tsx
│       ├── request/page.tsx
│       └── history/page.tsx
└── admin/
    └── withdrawals/
        ├── page.tsx
        └── [id]/page.tsx

lib/
├── crypto/
│   ├── exchange.ts
│   └── validator.ts
└── withdrawals.ts

components/
└── withdrawals/
    ├── RequestForm.tsx
    ├── WalletConfig.tsx
    ├── WithdrawalCard.tsx
    └── AdminApproval.tsx
```

---

### **FASE 6: Panel de Administrador** (Semana 6)

**Objetivo**: Dashboard completo de administración

**Tareas**:
- [ ] Dashboard principal
  - [ ] KPIs principales (usuarios, ingresos, comisiones)
  - [ ] Gráficas de crecimiento
  - [ ] Métricas en tiempo real
  - [ ] Actividad reciente
- [ ] Gestión de usuarios
  - [ ] Lista de todos los usuarios
  - [ ] Filtros (activos, inactivos, pendientes)
  - [ ] Búsqueda
  - [ ] Ver detalle de usuario
  - [ ] Activar/desactivar manualmente
  - [ ] Editar información
  - [ ] Ver su red binaria
- [ ] Configuración de comisiones
  - [ ] Formulario para % comisión directa
  - [ ] 19 campos para niveles 2-20
  - [ ] Mínimos de retiro (USD/COP)
  - [ ] Días para cambiar ubicación
  - [ ] Historial de cambios
- [ ] Gestión de retiros
  - [ ] Ya cubierto en Fase 5
- [ ] Visualización de red completa
  - [ ] Árbol binario de cualquier usuario
  - [ ] Búsqueda en toda la red
  - [ ] Estadísticas globales
- [ ] Gestión de casas de apuestas
  - [ ] Lista de casas
  - [ ] Activar/desactivar
  - [ ] Cambiar precio
  - [ ] Ver cuántos usuarios usan cada una
- [ ] Analytics y reportes
  - [ ] Ingresos por mes
  - [ ] Comisiones pagadas
  - [ ] Top referidores
  - [ ] Tasa de crecimiento
  - [ ] Exportar reportes (PDF/Excel)

**Archivos a crear**:
```
app/
├── api/admin/
│   ├── users/
│   │   ├── list/route.ts
│   │   ├── [id]/route.ts
│   │   ├── activate/route.ts
│   │   └── deactivate/route.ts
│   ├── config/
│   │   ├── commissions/route.ts
│   │   └── bookmakers/route.ts
│   └── analytics/
│       ├── dashboard/route.ts
│       └── export/route.ts
└── admin/
    ├── page.tsx (dashboard)
    ├── users/
    │   ├── page.tsx
    │   └── [id]/page.tsx
    ├── config/
    │   ├── commissions/page.tsx
    │   └── bookmakers/page.tsx
    └── analytics/
        └── page.tsx

components/admin/
├── Dashboard.tsx
├── UserTable.tsx
├── CommissionConfig.tsx
├── BookmakerConfig.tsx
└── Analytics.tsx
```

---

### **FASE 7: Panel de Usuario** (Semana 7)

**Objetivo**: Dashboard completo para usuarios estándar

**Tareas**:
- [ ] Dashboard personal
  - [ ] KPIs personales
  - [ ] Comisiones del mes
  - [ ] Saldo disponible
  - [ ] Próximo pago
  - [ ] Gráficas de evolución
- [ ] Gestión de suscripción
  - [ ] Ya cubierto en Fase 2
- [ ] Red binaria personal
  - [ ] Su árbol (piernas izq/der)
  - [ ] Estadísticas de cada pierna
  - [ ] Navegación por niveles
- [ ] Sistema de referidos
  - [ ] Link único de referido
  - [ ] QR code para compartir
  - [ ] Selector de pierna (si aplica)
  - [ ] Lista de referidos directos
  - [ ] Stats de referidos
- [ ] Retiros
  - [ ] Ya cubierto en Fase 5
- [ ] Descargas
  - [ ] Link para descargar APK
  - [ ] Versión actual
  - [ ] Instrucciones de instalación
  - [ ] Credenciales de acceso
- [ ] Perfil
  - [ ] Editar datos personales
  - [ ] Cambiar contraseña
  - [ ] Configurar wallets
  - [ ] Preferencias
- [ ] Reportes
  - [ ] Comisiones por mes
  - [ ] Crecimiento de red
  - [ ] Top referidos
  - [ ] Exportar (PDF/Excel)

**Archivos a crear**:
```
app/dashboard/
├── page.tsx (dashboard principal)
├── subscription/ (ya en Fase 2)
├── network/ (ya en Fase 3)
├── referrals/
│   ├── page.tsx
│   └── stats/page.tsx
├── withdrawals/ (ya en Fase 5)
├── downloads/
│   └── page.tsx
├── profile/
│   ├── page.tsx
│   ├── password/page.tsx
│   └── wallets/page.tsx
└── reports/
    └── page.tsx

components/dashboard/
├── PersonalDashboard.tsx
├── ReferralLink.tsx
├── QRCode.tsx
├── DownloadAPK.tsx
└── Reports.tsx
```

---

### **FASE 8: Integración con App Móvil** (Semana 8)

**Objetivo**: Conectar la app móvil con la plataforma

**Tareas**:
- [ ] API de validación
  - [ ] Endpoint de login con JWT
  - [ ] Endpoint para validar token
  - [ ] Endpoint para refresh token
  - [ ] Incluir datos del plan en JWT
- [ ] Endpoint de plan
  - [ ] Devolver bookmakers permitidas
  - [ ] Devolver estado de suscripción
  - [ ] Devolver fecha de expiración
- [ ] Modificar app móvil
  - [ ] Actualizar licenseChecker.ts
  - [ ] Validar con JWT
  - [ ] Parsear bookmakers del token
  - [ ] Filtrar en DashboardPage
  - [ ] Pantalla de bloqueo
  - [ ] Botón "Renovar Plan"
- [ ] Sistema de bloqueo
  - [ ] Detectar suscripción vencida
  - [ ] Mostrar mensaje
  - [ ] Link a página de renovación
  - [ ] Deshabilitar funciones
- [ ] Testing
  - [ ] Probar login desde app
  - [ ] Probar filtro de bookmakers
  - [ ] Probar bloqueo por vencimiento
  - [ ] Probar renovación

**Archivos a crear/modificar**:
```
# En SALUMINA-WEB
app/api/app-api/
├── login/route.ts
├── validate/route.ts
├── refresh/route.ts
└── plan/route.ts

lib/jwt.ts

# En SALUMINA SPORTS DESKTOP
src/main/license/
└── licenseChecker.ts (modificar)

src/renderer/src/
├── pages/
│   ├── DashboardPage.tsx (modificar)
│   └── BlockedPage.tsx (nuevo)
└── lib/
    └── jwt.ts (nuevo)
```

---

### **FASE 9: Testing y Optimización** (Semana 9)

**Objetivo**: Asegurar calidad y performance

**Tareas**:
- [ ] Tests unitarios
  - [ ] Funciones de cálculo de comisiones
  - [ ] Algoritmo de red binaria
  - [ ] Cálculo de prorrateos
  - [ ] Validaciones
- [ ] Tests de integración
  - [ ] Flujo de registro completo
  - [ ] Flujo de pago (mock)
  - [ ] Flujo de retiro (mock)
  - [ ] Webhooks
- [ ] Optimización de queries
  - [ ] Índices en columnas clave
  - [ ] Queries recursivas eficientes
  - [ ] Tabla binary_network materializada
  - [ ] Paginación en listas grandes
- [ ] Auditoría de seguridad
  - [ ] Validación de inputs
  - [ ] Protección CSRF
  - [ ] Rate limiting
  - [ ] Sanitización
  - [ ] Validación de permisos
- [ ] Testing responsive
  - [ ] Desktop
  - [ ] Tablet
  - [ ] Móvil
- [ ] Corrección de bugs
  - [ ] Bugs encontrados en testing
  - [ ] Edge cases
  - [ ] Manejo de errores

**Herramientas**:
- Jest para tests unitarios
- Playwright para tests E2E
- React Testing Library
- Supabase Performance Insights

---

### **FASE 10: Deploy y Documentación** (Semana 10)

**Objetivo**: Lanzar a producción con documentación completa

**Tareas**:
- [ ] Configuración de producción
  - [ ] Crear proyecto Supabase producción
  - [ ] Ejecutar migrations
  - [ ] Configurar RLS
  - [ ] Variables de entorno en Vercel
- [ ] Deploy en Vercel
  - [ ] Conectar repositorio
  - [ ] Configurar dominios
  - [ ] SSL
  - [ ] Preview deployments
- [ ] Configuración de pasarelas
  - [ ] Stripe cuenta producción
  - [ ] Bold cuenta producción
  - [ ] CoinPayments cuenta producción
  - [ ] Webhooks en producción
- [ ] Documentación admin
  - [ ] Guía de uso del panel
  - [ ] Configuración de comisiones
  - [ ] Aprobación de usuarios
  - [ ] Gestión de retiros
  - [ ] Troubleshooting
- [ ] Documentación usuario
  - [ ] Cómo registrarse
  - [ ] Cómo pagar suscripción
  - [ ] Cómo referir usuarios
  - [ ] Cómo solicitar retiros
  - [ ] Cómo descargar la app
  - [ ] FAQs
- [ ] Videos tutoriales (opcional)
  - [ ] Tutorial para usuarios
  - [ ] Tutorial para admins
- [ ] Monitoreo
  - [ ] Sentry para errors
  - [ ] Logs
  - [ ] Alertas
  - [ ] Uptime monitoring

---

## 🎯 DEPENDENCIAS ENTRE FASES

```
Fase 1 (Base)
  ↓
Fase 2 (Suscripciones) ← Requiere autenticación
  ↓
Fase 3 (Red Binaria) ← Requiere usuarios y suscripciones
  ↓
Fase 4 (Comisiones) ← Requiere red binaria y pagos
  ↓
Fase 5 (Retiros) ← Requiere comisiones
  ↓
Fase 6 (Admin) ← Requiere todas las anteriores
Fase 7 (Usuario) ← Requiere todas las anteriores
  ↓
Fase 8 (App Móvil) ← Requiere API completa
  ↓
Fase 9 (Testing) ← Requiere todo implementado
  ↓
Fase 10 (Deploy) ← Requiere testing completado
```

---

## 📊 MÉTRICAS DE PROGRESO

- **Fase 1**: 5% completado
- **Fase 2**: 0% completado
- **Total general**: 5% completado

**Próximo milestone**: Completar autenticación (Fase 1)

---

**Última actualización**: 4 de junio de 2026  
**Por**: Claude Code
