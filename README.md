# Salumina Sports - Landing Page

Landing page oficial de Salumina Sports con:
- ✅ Reset password universal (Android + Windows)
- 🚀 Página de marketing del producto
- 💰 Sistema de referidos
- 📱 Links de descarga

## Deploy en Vercel

1. Push a GitHub:
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SALUNA-CORP/salumina-web.git
git push -u origin main
```

2. Conectar en Vercel:
- https://vercel.com/new
- Import repository: `SALUNA-CORP/salumina-web`
- Deploy

3. Configurar dominio custom (opcional):
- Vercel → Settings → Domains
- Agregar: `salumina.app` o el que prefieras

## Actualizar Supabase

Una vez deployado en Vercel, actualiza las URLs en Supabase:

**Site URL**: `https://tu-dominio.vercel.app`
**Redirect URLs**: 
```
https://tu-dominio.vercel.app/reset-password
salumina://reset-password
```

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura

- `/` - Landing page con sistema de referidos
- `/reset-password` - Página de reset password (detecta Android/Windows)

## Sistema de Referidos

Compartir link: `https://tu-dominio.vercel.app?ref=CODIGO`

El código se guarda en localStorage y se puede usar para tracking de conversiones.

## TODO

- [ ] Backend de referidos (base de datos)
- [ ] Dashboard de afiliados
- [ ] Tracking de conversiones
- [ ] Pagos de comisiones
- [ ] Analytics
