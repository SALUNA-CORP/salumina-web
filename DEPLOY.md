# 🚀 Deploy en Vercel - Guía Paso a Paso

## 1. Conectar GitHub con Vercel

1. Ve a https://vercel.com
2. Click en **"Add New"** → **"Project"**
3. Busca y selecciona: **`SALUNA-CORP/salumina-web`**
4. Click en **"Import"**

## 2. Configurar el proyecto

En la pantalla de configuración:

- **Framework Preset**: Next.js (se detecta automáticamente)
- **Root Directory**: `./` (dejar por defecto)
- **Build Command**: `npm run build` (automático)
- **Output Directory**: `.next` (automático)

**No necesitas variables de entorno por ahora**

Click en **"Deploy"** 

⏱️ Espera 1-2 minutos...

## 3. Obtener tu URL

Una vez deployado, Vercel te dará una URL como:

```
https://salumina-web.vercel.app
```

o puedes configurar un dominio custom.

## 4. Actualizar Supabase con la nueva URL

### Site URL

1. Ve a https://app.supabase.com
2. Proyecto: `owurgpuzkgghrncdxqaz`
3. **Authentication** → **URL Configuration**
4. **Site URL**: Cambia de `salumina://reset-password` a:
   ```
   https://salumina-web.vercel.app
   ```

### Redirect URLs

En la misma página, **Redirect URLs**, actualiza a:

```
https://salumina-web.vercel.app/reset-password
salumina://reset-password
```

Click en **"Save"**

## 5. Actualizar código de reset password

Actualiza ambos archivos de licenseChecker para que usen la URL de Vercel:

**src/main/license/licenseChecker.ts** (línea 61-63):
```typescript
const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://salumina-web.vercel.app/reset-password'
})
```

**src/capacitor/licenseChecker.ts** (línea 43-45):
```typescript
const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
  redirectTo: 'https://salumina-web.vercel.app/reset-password'
})
```

Commit y rebuild:
```bash
git add .
git commit -m "Update reset password URL to Vercel"
git push

# Rebuild apps
npm run build:desktop
cd android && .\gradlew assembleRelease
```

## 6. Probar el flujo completo

### En Windows:

1. Abre la app Desktop
2. "Olvidé mi contraseña"
3. Ingresa tu email
4. Revisa tu correo
5. Click en el link → se abre en navegador
6. Ingresa nueva contraseña en la página web ✅

### En Android:

1. Abre la app
2. "Olvidé mi contraseña"
3. Ingresa tu email
4. Revisa tu correo en el teléfono
5. Click en el link → intenta abrir la app (si falla, abre en web)
6. Ingresa nueva contraseña ✅

## 7. Configurar dominio custom (opcional)

Si tienes un dominio propio:

1. Vercel → Settings → Domains
2. Add domain: `salumina.app`
3. Configurar DNS según instrucciones de Vercel
4. Actualizar Supabase con el nuevo dominio

## ✅ Checklist

- [ ] Proyecto deployado en Vercel
- [ ] URL de Vercel obtenida
- [ ] Site URL actualizado en Supabase
- [ ] Redirect URLs actualizados en Supabase
- [ ] Código actualizado con URL de Vercel
- [ ] Apps rebuildeadas
- [ ] Flujo probado en Windows
- [ ] Flujo probado en Android

---

## 🎯 Próximos pasos

Una vez que el reset password funcione, podemos agregar:

1. **Backend de referidos**
   - Base de datos en Supabase
   - Tracking de conversiones
   - Dashboard de afiliados

2. **Página de registro**
   - Formulario web
   - Integración con sistema de pagos
   - Activación automática de licencias

3. **Analytics**
   - Google Analytics
   - Tracking de descargas
   - Métricas de referidos

4. **Blog/Docs**
   - Guías de uso
   - FAQ
   - Updates
