# SALUMINA - Sistema Binario con Suscripciones

## 📋 RESUMEN EJECUTIVO

Plataforma web completa para gestión de sistema binario de marketing multinivel con suscripciones mensuales para acceso a app de arbitraje deportivo.

**Fecha de inicio**: 4 de junio de 2026  
**Desarrollador**: Claude Code  
**Cliente**: SALUNA CORP

---

## 🎯 OBJETIVO DEL PROYECTO

Crear una plataforma web que permita:
1. Registro y gestión de usuarios con sistema binario de referidos
2. Cobro de suscripciones mensuales mediante múltiples pasarelas
3. Cálculo y pago de comisiones en 20 niveles de profundidad
4. Panel de administrador completo
5. Panel de usuario con visualización de red binaria
6. Integración con app móvil existente (SALUMINA SPORTS DESKTOP)

---

## 💰 MODELO DE NEGOCIO

### Planes de Suscripción
- **Base**: $20 USD/mes (activación del sistema)
- **Casas de apuestas**: +$5 USD/mes por cada casa adicional
- **Casas disponibles**: Pinnacle, Betplay, Polymarket
- **Monedas**: USD y COP (usuario elige)

**Ejemplo**:
- Usuario con 2 casas = $20 + ($5 × 2) = $30 USD/mes

### Pasarelas de Pago

**COBROS (usuarios pagan suscripción)**:
- Stripe (internacional, tarjetas, USD)
- Bold (Colombia, COP, PSE, Nequi)
- CoinPayments (USDT/USDC para anonimato)

**RETIROS (usuarios retiran comisiones)**:
- USDT a wallet del usuario
- USDC a wallet del usuario
- Mínimo configurable por superadmin

---

## 🌳 SISTEMA BINARIO

### Estructura
- Cada usuario tiene 2 "piernas": Izquierda y Derecha
- **Profundidad**: Hasta 20 niveles
- **Colocación**: Automática en pierna más débil
- **Cambio de ubicación**: Sponsor puede mover al referido dentro de X días (configurable)
- **Requisito mínimo**: 1 activo en cada pierna para cobrar comisiones binarias

### Posicionamiento
1. Usuario nuevo se registra vía link de referido
2. Sistema lo coloca automáticamente en la pierna más débil del sponsor
3. Sponsor puede cambiar la ubicación (si lo hace dentro del plazo configurado)
4. Después del plazo, la ubicación queda permanente
5. Usuario inactivo mantiene su posición en el árbol (no pierde su lugar)

---

## 💵 SISTEMA DE COMISIONES

### 1. Comisión Directa (Nivel 1)
- **Tipo**: Porcentaje del pago mensual del referido directo
- **Porcentaje**: Configurable por superadmin
- **Ejemplo**: Si está en 20% y el referido paga $30/mes → sponsor gana $6/mes
- **Recurrente**: Mientras el referido esté activo

### 2. Comisión Binaria (Niveles 2-20)
- **Niveles**: 19 niveles configurables independientemente (nivel 2 al 20)
- **Cálculo**: Se paga sobre el volumen de AMBAS piernas por separado
- **NO requiere balance**: Se paga de cada pierna independientemente
- **Requisito único**: Mínimo 1 activo en cada pierna para activar comisiones
- **Configuración**: Superadmin configura % de cada nivel (19 campos)

**Ejemplo de configuración**:
```
Nivel 2:  5%
Nivel 3:  4%
Nivel 4:  4%
Nivel 5:  3%
...
Nivel 20: 1%
```

### 3. Usuario Inactivo
- NO recibe comisiones durante el tiempo inactivo
- Mantiene su posición en el árbol
- Su downline sigue contando para estructura del upline
- Pero el inactivo NO genera volumen para su upline

---

## 🔄 FLUJOS PRINCIPALES

### Registro y Activación
1. Usuario hace clic en link de referido único
2. Completa formulario de registro
3. Selecciona plan (cuántas casas de apuestas quiere)
4. Paga con Stripe, Bold o Cripto
5. Sistema confirma pago vía webhook
6. **Admin aprueba manualmente** la activación
7. Sistema coloca al usuario en la red binaria (pierna débil del sponsor)
8. Usuario recibe acceso al panel y link de descarga del APK
9. Sponsor puede cambiar la ubicación dentro del plazo configurado

### Upgrade de Plan
1. Usuario solicita agregar/quitar casas de apuestas
2. Sistema calcula prorrateo del mes actual
3. Cobra/reembolsa la diferencia proporcionalmente
4. Cambio se aplica **inmediatamente**
5. App móvil se actualiza en próxima validación
6. **NO puede cambiar CUÁLES casas** (solo cantidad)

### Retiros de Comisiones
1. Usuario acumula comisiones (directas + binarias)
2. Puede aplicar saldo a su propia suscripción
3. O solicitar retiro a wallet cripto
4. Ingresa dirección de wallet (USDT o USDC)
5. Solicitud queda pendiente
6. Admin aprueba/rechaza manualmente
7. Sistema procesa pago a wallet
8. Usuario recibe notificación

### Cancelación de Suscripción
1. Usuario cancela desde su panel
2. Tiene acceso hasta fin del período pagado
3. Después se vuelve "inactivo"
4. Mantiene su posición en el árbol
5. NO recibe comisiones mientras está inactivo
6. Puede reactivar en cualquier momento
7. Al reactivar, recupera su posición exacta

---

## 👥 ROLES Y PERMISOS

### Superadmin
- Control total sobre la plataforma
- Configuración de comisiones (20 niveles)
- Gestión de usuarios (activar, desactivar, editar)
- Aprobación de retiros
- Visualización de toda la red binaria
- Dashboard con todas las métricas
- Gestión de casas de apuestas
- Configuración global (mínimos de retiro, días de cambio, etc)

### Usuario Estándar
- Dashboard personal con sus métricas
- Gestión de su suscripción
- Visualización de su red binaria (sus piernas)
- Sistema de referidos (link único + QR)
- Solicitud de retiros
- Descarga de APK
- Perfil y configuración de wallet

---

## 📱 INTEGRACIÓN CON APP MÓVIL

### Validación de Plan
- App móvil (SALUMINA SPORTS DESKTOP) se conecta a API
- Usuario inicia sesión con email/password
- API responde con JWT que contiene:
  ```json
  {
    "userId": "uuid",
    "email": "user@example.com",
    "bookmakers": ["pinnacle", "betplay"],
    "expiresAt": "2026-07-04T00:00:00Z",
    "status": "active"
  }
  ```
- App valida el JWT localmente
- Revalida cada 6-12 horas contra el servidor
- Solo muestra las casas de apuestas incluidas en el plan

### Bloqueo por Vencimiento
- Si suscripción vence: `status: "expired"`
- App muestra pantalla de bloqueo con:
  - Mensaje: "Tu suscripción ha vencido"
  - Botón "Renovar Plan" (abre web de pagos)
  - **Bloqueo inmediato** (no hay período de gracia)

### Descarga del APK
- Link de descarga solo visible si `status: "active"`
- Usuario inactivo NO puede descargar
- APK se sirve desde GitHub Releases o CDN
- Versiones por canal (producción, beta)

---

## 🗄️ BASE DE DATOS (Ver DATABASE_SCHEMA.sql)

**Tablas principales**:
- `user_profiles` - Datos de usuarios y estructura binaria
- `subscriptions` - Suscripciones activas
- `payments` - Historial de pagos
- `commission_config` - Configuración global de comisiones
- `binary_commission_levels` - % por cada nivel (2-20)
- `commissions` - Comisiones generadas
- `withdrawals` - Solicitudes de retiro
- `bookmakers` - Casas de apuestas disponibles
- `binary_network` - Tabla materializada para performance

---

## 🎨 TECNOLOGÍAS

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: Supabase PostgreSQL
- **Auth**: Supabase Auth + JWT custom
- **Pagos**: Stripe SDK, Bold API, CoinPayments API
- **Visualización**: React Flow (árbol binario), Recharts (gráficas)
- **Email**: Resend
- **Deploy**: Vercel

---

## 📊 FASES DE DESARROLLO (10 semanas)

1. **Semana 1**: Base y Autenticación
2. **Semana 2**: Sistema de Suscripciones
3. **Semana 3**: Red Binaria
4. **Semana 4**: Sistema de Comisiones
5. **Semana 5**: Retiros
6. **Semana 6**: Panel de Administrador
7. **Semana 7**: Panel de Usuario
8. **Semana 8**: Integración con App Móvil
9. **Semana 9**: Testing y Optimización
10. **Semana 10**: Deploy y Documentación

Ver **DEVELOPMENT_PLAN.md** para detalles completos.

---

## 🔐 SEGURIDAD

- JWT con expiración corta (24h)
- Refresh tokens seguros
- Validación de permisos en cada endpoint
- Rate limiting en APIs críticas
- Sanitización de inputs
- Encriptación de datos sensibles
- 2FA para admins (opcional)
- Auditoría de acciones críticas

---

## 📈 MÉTRICAS CLAVE

### Dashboard Admin
- Total usuarios activos/inactivos
- Ingresos mensuales (por pasarela)
- Comisiones pagadas (directas vs binarias)
- Retiros pendientes/aprobados
- Tasa de crecimiento mensual
- Top 10 referidores
- Casas de apuestas más usadas

### Dashboard Usuario
- Comisiones ganadas (mes actual)
- Saldo disponible para retiro
- Referidos directos activos
- Volumen total de red
- Volumen pierna izquierda vs derecha
- Próximo pago de suscripción
- Historial de comisiones (gráfica)

---

## ⚠️ DECISIONES IMPORTANTES

### Tomadas en diseño
1. **Colocación automática** en pierna débil (con opción de cambio)
2. **Activación manual** por admin (no automática)
3. **Cambios de plan inmediatos** con prorrateo
4. **NO se pueden cambiar casas** (solo agregar/quitar)
5. **Usuario inactivo mantiene posición** pero no cobra comisiones
6. **Retiros solo en cripto** (USDT/USDC)
7. **Bloqueo inmediato** si no paga (sin período de gracia)

### Configurables por superadmin
- % comisión directa
- % de cada nivel binario (2-20)
- Mínimo de retiro (USD y COP)
- Días para cambiar ubicación de referido
- Precio por casa de apuestas
- Activar/desactivar casas globalmente

---

## 🔗 RELACIÓN CON OTROS PROYECTOS

### SALUMINA SPORTS DESKTOP (App móvil)
- **Ubicación**: Proyecto separado
- **Relación**: Cliente de esta API
- **Modificaciones necesarias**:
  - `licenseChecker.ts`: Validar con JWT en lugar de sistema actual
  - `DashboardPage.tsx`: Filtrar bookmakers según plan del usuario
  - Agregar pantalla de bloqueo si suscripción vencida

### SALUMINA-WEB (Este proyecto)
- **Ubicación**: `C:\Users\frane\Proyect\Proyectos React\SALUMINA-WEB`
- **Deploy**: Vercel (https://salumina-web.vercel.app)
- **Estado actual**: Landing page + reset password
- **Acción**: Expandir con toda la funcionalidad descrita

---

## 📞 CONTACTO Y SOPORTE

- **Email corporativo**: salunacorpsas@gmail.com
- **GitHub Org**: SALUNA-CORP
- **Repositorio Web**: salumina-web
- **Repositorio App**: salumina-sports-desktop

---

**Última actualización**: 4 de junio de 2026  
**Versión del brief**: 1.0  
**Estado**: ✅ Autorizado para desarrollo
