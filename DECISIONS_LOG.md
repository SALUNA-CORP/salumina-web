# LOG DE DECISIONES - SALUMINA

Registro de todas las decisiones de diseño tomadas durante el análisis de requisitos.

---

## 📋 PREGUNTA 1: Sistema Binario

**Pregunta**: ¿Qué tipo de sistema binario usar?

**Opciones**:
- A) Binario Forzado (máx 2 directos)
- B) Binario Libre con Selección
- C) Binario Automático Balanceado
- D) Otro sistema

**Respuesta**: **B - Binario Libre con Selección**

**Implicaciones**:
- Usuario puede referir a muchas personas
- Debe balancear las piernas para maximizar comisiones
- Necesita selector de pierna al referir

---

## 📋 PREGUNTA 2: Comisiones del Sistema Binario

**Pregunta**: ¿Cómo calcular las comisiones binarias?

**Opciones**:
- A) Por Pares (Match Bonus)
- B) Por Porcentaje del Volumen Menor
- C) Por Niveles con Requisitos de Balance
- D) Sistema híbrido

**Respuesta**: **D - Sistema híbrido**

**Implicaciones**:
- Comisión directa por referidos directos
- + Comisión binaria por pares/volumen balanceado
- Dos flujos de cálculo diferentes

---

## 📋 PREGUNTA 3: Valores de Comisión Directa

**Pregunta**: ¿Cuánto gana por referido directo?

**Opciones**:
- A) Porcentaje fijo del total
- B) Monto fijo por activación
- C) Comisión recurrente fija
- D) Combinación

**Respuesta**: **A - Porcentaje fijo del total**

**Detalle adicional**: El % debe ser **configurable por el superadministrador**

**Implicaciones**:
- Necesita campo en commission_config
- Comisión recurrente mientras el referido esté activo
- % se aplica al pago mensual total del referido

---

## 📋 PREGUNTA 4: Comisión Binaria

**Pregunta**: ¿Cómo calcular la comisión del sistema de piernas?

**Opciones**:
- A) Porcentaje de la pierna débil
- B) Por pares con pago fijo
- C) Por niveles de profundidad
- D) Sin comisión binaria

**Respuesta**: **C - Por niveles de profundidad**

**Detalle adicional**: 
- Se paga sobre el valor de CADA pierna independientemente
- NO importa si no hay balance entre las piernas
- Requisito mínimo: 1 activo por cada pierna

**Implicaciones**:
- No es binario tradicional (no requiere balance)
- Más generoso que sistemas clásicos
- Calculo más complejo (ambas piernas por separado)

---

## 📋 PREGUNTA 5.1: Niveles de Profundidad

**Pregunta**: ¿Hasta qué nivel de profundidad se pagan comisiones?

**Opciones**:
- A) Hasta nivel 5
- B) Hasta nivel 7
- C) Hasta nivel 10
- D) Infinito
- E) Otro número

**Respuesta**: **Hasta nivel 20**

**Implicaciones**:
- Red muy profunda
- Algoritmos recursivos eficientes necesarios
- Posibilidad de redes muy grandes

---

## 📋 PREGUNTA 5.2: Estructura de Porcentajes

**Pregunta**: ¿Los porcentajes son iguales para todos los niveles o diferentes?

**Opciones**:
- A) Mismo % para todos los niveles
- B) Porcentajes decrecientes por rangos
- C) Cada nivel con % independiente
- D) Híbrido personalizado

**Respuesta**: **C - Cada nivel con % independiente**

**Implicaciones**:
- 19 campos configurables (nivel 2 al 20)
- Tabla binary_commission_levels con 19 registros
- Interfaz de admin con 19 inputs
- Máxima flexibilidad para el negocio

---

## 📋 PREGUNTA 6.1: Pasarela de Pagos

**Pregunta**: ¿Qué pasarela(s) usar?

**Opciones**:
- A) Stripe
- B) PayPal
- C) Mercado Pago
- D) Wompi
- E) Combinar varias

**Respuesta**: **Stripe + Bold** (+ cripto en pregunta siguiente)

**Implicaciones**:
- Integración con 2 pasarelas tradicionales
- Stripe para internacional (USD)
- Bold para Colombia (COP)

---

## 📋 PREGUNTA 6.2: Moneda

**Pregunta**: ¿En qué moneda se manejan los pagos?

**Opciones**:
- A) USD
- B) COP
- C) Ambas
- D) Otra

**Respuesta**: **C - Ambas (usuario elige)**

**Implicaciones**:
- Campo currency en subscriptions
- Cálculos en ambas monedas
- Conversión para comisiones

---

## 📋 PREGUNTA 7: Retiros de Comisiones

**Pregunta**: ¿Cómo retiran sus comisiones?

**Opciones**:
- A) Transferencia bancaria manual
- B) Automático vía pasarela
- C) Saldo disponible para pagar su propia suscripción
- D) Combinación

**Respuesta**: **C - Saldo disponible para pagar suscripción**

**Detalle adicional sobre métodos**:
- Retiros por **billeteras virtuales** (para anonimato)
- Mantener anonimato del origen de transferencias
- Incluso en cobros mantener anonimato del destinatario

**Implicaciones**:
- Sistema de criptomonedas necesario
- Puede aplicar saldo O retirar
- Necesita configuración de wallets

---

## 📋 PREGUNTA 7.2: Monto Mínimo de Retiro

**Pregunta**: ¿Hay un monto mínimo de retiro?

**Opciones**:
- A) Sí (¿cuánto?)
- B) No
- C) Configurable por superadmin

**Respuesta**: **C - Configurable por superadmin**

**Implicaciones**:
- Campo en commission_config
- Validación al solicitar retiro

---

## 📋 PREGUNTA 8.1: Billeteras para Retiros

**Pregunta**: ¿Qué billeteras virtuales soportar para RETIROS?

**Opciones**:
- A) Criptomonedas (USDT/USDC)
- B) Binance Pay, Coinbase Commerce
- C) PayPal, Skrill, Neteller
- D) Combinación

**Respuesta**: **A - Criptomonedas (Stablecoins)**

**Detalle**: USDT y USDC

**Implicaciones**:
- Integración con exchange o wallet provider
- Validación de direcciones de wallet
- Procesamiento blockchain

---

## 📋 PREGUNTA 8.2: Opciones Anónimas para Cobros

**Pregunta**: ¿Para cobros también quieres opciones anónimas?

**Opciones**:
- Opción 1: Cripto para pagos
- Opción 2: Solo Stripe/Bold
- Opción 3: Ambas opciones (cripto + tradicional)

**Respuesta**: **Opción 3 - Ambas opciones**

**Implicaciones**:
- 3 métodos de pago: Stripe + Bold + Cripto
- CoinPayments o NOWPayments
- Webhooks para las 3 pasarelas

---

## 📋 PREGUNTA 9: Panel de Administrador

**Pregunta**: ¿Qué funcionalidades necesita el admin?

**Opciones**:
- A) Gestión de Usuarios
- B) Configuración de Comisiones
- C) Gestión de Retiros
- D) Visualización de Red Binaria
- E) Dashboard con Métricas
- F) Gestión de Casas de Apuestas
- G) Otras

**Respuesta**: **TODAS (A-F)**

**Implicaciones**:
- Panel muy completo
- Control total sobre la plataforma
- Muchos endpoints y componentes

---

## 📋 PREGUNTA 10: Panel de Usuario Estándar

**Pregunta**: ¿Qué pueden ver/hacer los usuarios?

**Opciones**:
- A) Dashboard Personal
- B) Gestión de Suscripción
- C) Red Binaria Personal
- D) Sistema de Referidos
- E) Retiros
- F) Descargas
- G) Perfil
- H) Reportes/Estadísticas

**Respuesta**: **TODAS (A-H)**

**Implicaciones**:
- Panel muy completo para usuarios
- Experiencia premium
- Muchos componentes y vistas

---

## 📋 PREGUNTA 11.1: Flujo de Activación

**Pregunta**: ¿Cómo funciona el flujo de registro?

**Opciones**:
- A) Registro → Pago → Activación automática
- B) Registro → Pago → Activación manual por admin

**Respuesta**: **B - Activación manual por admin**

**Implicaciones**:
- Admin debe aprobar cada cuenta
- Más control, menos automático
- Notificaciones al admin necesarias

---

## 📋 PREGUNTA 11.2: Colocación en Red Binaria

**Pregunta**: ¿Quién decide en qué pierna se coloca el nuevo referido?

**Opciones**:
- Opción 1: Siempre Manual (sponsor elige)
- Opción 2: Siempre Automático (pierna débil)
- Opción 3: Híbrido (auto + opción de cambio)
- Opción 4: Link específico por pierna

**Respuesta**: **Opción 3 - Híbrido**

**Detalle**:
- Por defecto: automático en pierna débil
- Sponsor puede cambiar dentro de X días
- Después de X días queda fija

**Implicaciones**:
- Algoritmo de pierna débil
- Función de cambio de ubicación
- Campo placement_locked_at

---

## 📋 PREGUNTA 11.3: Plazo para Cambiar Ubicación

**Pregunta**: ¿Cuántos días tiene el sponsor para cambiar la ubicación?

**Opciones**:
- A) 24 horas
- B) 48 horas
- C) 72 horas
- D) 7 días
- E) 30 días
- F) Configurable por superadmin

**Respuesta**: **F - Configurable por superadmin**

**Implicaciones**:
- Campo en commission_config
- Validación dinámica al intentar mover

---

## 📋 PREGUNTA 12.1: Validación en App Móvil

**Pregunta**: ¿Cómo valida la app qué casas de apuestas mostrar?

**Opciones**:
- A) Al iniciar sesión (consulta API cada vez)
- B) Con token/licencia JWT

**Respuesta**: **B - Con token/licencia JWT**

**Implicaciones**:
- JWT con datos del plan
- Validación local
- Revalida cada X horas
- Endpoints de refresh token

---

## 📋 PREGUNTA 12.2: Si No Paga

**Pregunta**: ¿Qué pasa si el usuario no paga su mensualidad?

**Opciones**:
- A) App se bloquea inmediatamente
- B) Período de gracia de X días
- C) App sigue funcionando con marca de agua

**Respuesta**: **A - Bloqueo inmediato**

**Detalle**: Mostrar motivo "Suscripción vencida" con link para renovar

**Implicaciones**:
- Pantalla de bloqueo en la app
- Mensaje claro
- Botón que abre web de pagos

---

## 📋 PREGUNTA 13.1: Upgrades de Plan

**Pregunta**: ¿Cómo funciona el upgrade/downgrade?

**Opciones**:
- A) Cambio inmediato con prorrateo
- B) Cambio para el siguiente ciclo
- C) Configurable (Admin decide)

**Respuesta**: **A - Cambio inmediato con prorrateo**

**Implicaciones**:
- Cálculo de días proporcionales
- Cargo/reembolso inmediato
- Complejidad en la lógica de prorrateos

---

## 📋 PREGUNTA 13.2: Cambiar Cuáles Casas

**Pregunta**: ¿Puede cambiar CUÁLES casas tiene (sin cambiar cantidad)?

**Opciones**:
- A) Sí, puede cambiar (mismo precio)
- B) No, debe mantener las elegidas
- C) Sí, pero solo 1 vez por mes

**Respuesta**: **B - No, debe mantener las que eligió**

**Implicaciones**:
- Usuario debe pensar bien al inicio
- No puede cambiar "Betplay por Polymarket"
- Solo puede agregar o quitar

---

## 📋 PREGUNTA 14.1: Cancelaciones

**Pregunta**: ¿Qué pasa cuando un usuario cancela?

**Opciones**:
- A) Acceso hasta fin de período pagado
- B) Bloqueo inmediato con reembolso
- C) Acceso + período de gracia

**Respuesta**: **A - Acceso hasta fin de período pagado**

**Implicaciones**:
- Sigue activo hasta current_period_end
- Después se marca como "cancelled"
- No se cobra más

---

## 📋 PREGUNTA 14.2: Posición en Red al Cancelar

**Pregunta**: ¿Qué pasa con su posición en la red binaria?

**Opciones**:
- A) Se mantiene en el árbol (inactivo)
- B) Se elimina del árbol
- C) Después de X días inactivo se elimina

**Respuesta**: **A - Se mantiene en el árbol**

**Detalle**: No recibe comisiones durante el tiempo inactivo

**Implicaciones**:
- Puede reactivar después
- Status = 'inactive' pero placement_parent_id se mantiene
- Filtrar inactivos en cálculo de comisiones

---

## 📋 PREGUNTA 14.3: Usuario Inactivo en Medio del Árbol

**Pregunta**: Si un usuario inactivo está en medio, ¿cómo afecta?

**Opciones**:
- A) Sigue contando para estructura, no genera volumen
- B) Su downline "salta" directamente al upline
- C) Él y su red dejan de contar

**Respuesta**: **A - Sigue contando para estructura, no genera volumen**

**Implicaciones**:
- Su downline sigue ahí
- Él no genera volumen para su upline
- Pero su downline activo SÍ cuenta para el upline

---

## 📋 PREGUNTA 15.1: Arquitectura del Proyecto

**Pregunta**: ¿Crear proyecto nuevo o expandir existente?

**Opciones**:
- A) Expandir SALUMINA-WEB
- B) Crear proyecto nuevo

**Respuesta**: **A - Expandir SALUMINA-WEB**

**Implicaciones**:
- Dos proyectos separados:
  - SALUMINA-WEB (plataforma web)
  - SALUMINA SPORTS DESKTOP (app móvil)
- Se comunican vía API
- App es el "producto", web es el "negocio"

---

## 📋 PREGUNTA 15.2: Base de Datos

**Pregunta**: ¿Confirmas usar Supabase PostgreSQL?

**Respuesta**: **Sí**

**Implicaciones**:
- Supabase para backend completo
- Auth + DB + Storage
- RLS para seguridad
- Webhooks propios

---

## 📊 RESUMEN DE DECISIONES CLAVE

1. **Sistema**: Binario híbrido con colocación automática + opción de cambio
2. **Comisiones**: Directa (% configurable) + Binaria (20 niveles configurables)
3. **Pagos**: Stripe + Bold + Cripto (3 opciones)
4. **Retiros**: USDT/USDC a wallets
5. **Activación**: Manual por admin
6. **Upgrades**: Inmediatos con prorrateo
7. **Cancel