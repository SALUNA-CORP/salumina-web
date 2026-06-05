import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Monitor, TrendingUp, Package, Calendar, ExternalLink } from 'lucide-react';

export default async function AdminDownloadsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: userData } = await supabaseAdmin
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userData?.role !== 'superadmin') {
    redirect('/dashboard');
  }

  const appInfo = {
    version: '0.2.0',
    versionCode: 3,
    releaseDate: '2026-06-04',
    repoUrl: 'https://github.com/SALUNA-CORP/salumina-sports-desktop',
    releaseUrl: 'https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/tag/v0.2.0',
    latestReleaseUrl: 'https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/latest',

    platforms: {
      windows: {
        name: 'POLYBET Setup 0.2.0.exe',
        size: '105.78 MB',
        url: 'https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/download/v0.2.0/POLYBET%20Setup%200.2.0.exe',
        checksumUrl: 'https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/download/v0.2.0/CHECKSUMS.txt',
      },
      android: {
        name: 'polybet-v0.2.0.apk',
        size: '3.07 MB',
        packageId: 'com.polybet.sports',
        url: 'https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/download/v0.2.0/polybet-v0.2.0.apk',
        checksumUrl: 'https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/download/v0.2.0/CHECKSUMS.txt',
      },
    },

    changelog: [
      '✨ Rebrand completo a POLYBET',
      '🎨 Nuevo icono y diseño de interfaz',
      '📦 Package ID actualizado: com.polybet.sports',
      '🔗 Deep links actualizados: polybet://',
      '⚡ Mejoras de rendimiento y estabilidad',
      '🔄 Sistema de auto-actualización mejorado',
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Descargas</h1>
          <p className="text-gray-500 mt-1">Administra las versiones de POLYBET</p>
        </div>
        <a
          href={appInfo.releaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          Ver en GitHub
        </a>
      </div>

      {/* Version Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Versión Actual</CardTitle>
            <Package className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{appInfo.version}</div>
            <p className="text-xs text-gray-500 mt-1">Version Code: {appInfo.versionCode}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Fecha de Release</CardTitle>
            <Calendar className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {new Date(appInfo.releaseDate).toLocaleDateString('es-CO', {
                day: 'numeric',
                month: 'short',
              })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date(appInfo.releaseDate).getFullYear()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Plataformas</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">2</div>
            <p className="text-xs text-gray-500 mt-1">Windows + Android</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Tamaño Total</CardTitle>
            <Download className="w-4 h-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">~109 MB</div>
            <p className="text-xs text-gray-500 mt-1">Ambas plataformas</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Windows */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Windows Desktop</CardTitle>
                <p className="text-sm text-blue-700">Aplicación de Escritorio</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Archivo:</span>
                <span className="font-mono text-xs text-gray-900">{appInfo.platforms.windows.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tamaño:</span>
                <span className="font-semibold text-gray-900">{appInfo.platforms.windows.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Requisitos:</span>
                <span className="text-gray-900">Windows 10/11 (64-bit)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Formato:</span>
                <span className="text-gray-900">.exe (Installer)</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <a
                href={appInfo.platforms.windows.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Descargar Windows
              </a>
              <a
                href={appInfo.platforms.windows.checksumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Ver Checksums
              </a>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500">
                ✓ Auto-actualización integrada
                <br />
                ✓ Instalador firmado digitalmente
                <br />
                ✓ Compatibilidad Windows 10/11
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Android */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle>Android Mobile</CardTitle>
                <p className="text-sm text-green-700">Aplicación Móvil</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Archivo:</span>
                <span className="font-mono text-xs text-gray-900">{appInfo.platforms.android.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tamaño:</span>
                <span className="font-semibold text-gray-900">{appInfo.platforms.android.size}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Package ID:</span>
                <span className="font-mono text-xs text-gray-900">{appInfo.platforms.android.packageId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Requisitos:</span>
                <span className="text-gray-900">Android 7.0+ (API 24)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Formato:</span>
                <span className="text-gray-900">.apk (Android Package)</span>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <a
                href={appInfo.platforms.android.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Descargar Android
              </a>
              <a
                href={appInfo.platforms.android.checksumUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Ver Checksums
              </a>
            </div>

            <div className="pt-3 border-t">
              <p className="text-xs text-gray-500">
                ✓ APK firmado digitalmente
                <br />
                ✓ Instalación directa (sideload)
                <br />
                ✓ Compatible Android 7.0+
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Changelog */}
      <Card>
        <CardHeader>
          <CardTitle>Novedades v{appInfo.version}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {appInfo.changelog.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-700">
                <span className="text-green-600 mt-1">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Distribution Links */}
      <Card>
        <CardHeader>
          <CardTitle>Enlaces de Distribución</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Página pública de descargas:</p>
            <code className="text-xs bg-white px-3 py-2 rounded border border-gray-200 block">
              {process.env.NEXT_PUBLIC_BASE_URL || 'https://salumina-web.vercel.app'}/dashboard/downloads
            </code>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Latest Release (siempre actualizado):</p>
            <code className="text-xs bg-white px-3 py-2 rounded border border-gray-200 block break-all">
              {appInfo.latestReleaseUrl}
            </code>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Repositorio GitHub:</p>
            <code className="text-xs bg-white px-3 py-2 rounded border border-gray-200 block break-all">
              {appInfo.repoUrl}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Admin Actions */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900">Acciones de Administrador</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-3 gap-3">
            <a
              href={appInfo.releaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              <ExternalLink className="w-4 h-4" />
              Ver Release en GitHub
            </a>
            <a
              href={`${appInfo.repoUrl}/releases`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium"
            >
              <Package className="w-4 h-4" />
              Todas las Versiones
            </a>
            <a
              href={`${appInfo.repoUrl}/releases/new`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
            >
              <Download className="w-4 h-4" />
              Crear Nuevo Release
            </a>
          </div>

          <div className="pt-3 border-t border-purple-200">
            <p className="text-sm text-purple-800">
              💡 <strong>Nota:</strong> Para publicar una nueva versión, crea un nuevo Release en GitHub.
              Las URLs se actualizan automáticamente con /latest/download/
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
