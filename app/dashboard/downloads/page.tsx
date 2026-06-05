import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, Monitor, CheckCircle, AlertCircle } from 'lucide-react';

export default function DownloadsPage() {
  const version = '0.2.0';
  const releaseDate = '4 de junio 2026';
  const appName = 'QUANTIXBET';

  const downloads = {
    windows: {
      name: 'QUANTIXBET para Windows',
      file: 'QUANTIXBET.Setup.0.2.0.exe',
      size: '212.44 MB',
      url: 'https://github.com/SALUNA-CORP/polybet-releases/releases/download/v0.2.0/QUANTIXBET.Setup.0.2.0.exe',
      requirements: 'Windows 10/11 (64-bit)',
      icon: Monitor,
      color: 'blue'
    },
    android: {
      name: 'QUANTIXBET para Android',
      file: 'quantixbet-v0.2.0.apk',
      size: '3.07 MB',
      url: 'https://github.com/SALUNA-CORP/polybet-releases/releases/download/v0.2.0/quantixbet-v0.2.0.apk',
      requirements: 'Android 7.0+ (API 24)',
      packageId: 'com.quantixbet.sports',
      icon: Smartphone,
      color: 'green'
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Descargas</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Descarga {appName} para tu dispositivo</p>
      </div>

      {/* Version Info Banner */}
      <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Versión {version}</p>
                <p className="text-sm text-gray-600">Última actualización: {releaseDate}</p>
              </div>
            </div>
            <a
              href="https://github.com/SALUNA-CORP/polybet-releases/releases/tag/v0.2.0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              Ver notas de la versión →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Scanner en Tiempo Real</p>
            <p className="text-sm text-gray-500">Detecta arbitrajes automáticamente cada 2 minutos</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Múltiples Bookmakers</p>
            <p className="text-sm text-gray-500">Acceso según tu plan de suscripción</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-gray-900">Auto-actualización</p>
            <p className="text-sm text-gray-500">Siempre tendrás la última versión</p>
          </div>
        </div>
      </div>

      {/* Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Windows Card */}
        <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
          <CardHeader className="bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-blue-900">{downloads.windows.name}</CardTitle>
                <p className="text-sm text-blue-700 mt-1">Desktop para Windows</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Archivo:</span>
                <span className="font-medium text-gray-900">{downloads.windows.file}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tamaño:</span>
                <span className="font-medium text-gray-900">{downloads.windows.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Requisitos:</span>
                <span className="font-medium text-gray-900">{downloads.windows.requirements}</span>
              </div>
            </div>

            <a
              href={downloads.windows.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar para Windows
            </a>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                ✓ Instalación con un clic
                <br />
                ✓ Auto-actualización integrada
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Android Card */}
        <Card className="border-2 border-green-200 hover:border-green-400 transition-colors">
          <CardHeader className="bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-900">{downloads.android.name}</CardTitle>
                <p className="text-sm text-green-700 mt-1">Móvil para Android</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Archivo:</span>
                <span className="font-medium text-gray-900">{downloads.android.file}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tamaño:</span>
                <span className="font-medium text-gray-900">{downloads.android.size}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Requisitos:</span>
                <span className="font-medium text-gray-900">{downloads.android.requirements}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Package ID:</span>
                <span className="font-mono text-xs text-gray-900">{downloads.android.packageId}</span>
              </div>
            </div>

            <a
              href={downloads.android.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Descargar APK
            </a>

            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                ✓ APK firmado digitalmente
                <br />
                ✓ Instalación directa
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Note */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-medium mb-1">Requisito: Suscripción Activa</p>
            <p>
              Necesitas una suscripción activa para usar QUANTIXBET. Las casas de apuestas
              disponibles dependerán de tu plan (Inicial, Estándar o Premium).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Windows Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              Instalación en Windows
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside text-gray-700">
              <li>Descarga el archivo <code className="px-2 py-1 bg-gray-100 rounded text-sm">QUANTIXBET.Setup.0.2.0.exe</code></li>
              <li>Ejecuta el instalador descargado</li>
              <li>Sigue el asistente de instalación</li>
              <li>QUANTIXBET se instalará y abrirá automáticamente</li>
              <li>Inicia sesión con tu email y contraseña de QuantixBet</li>
              <li>¡Listo! Empieza a encontrar arbitrajes</li>
            </ol>
          </CardContent>
        </Card>

        {/* Android Instructions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              Instalación en Android
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside text-gray-700">
              <li>Descarga el archivo <code className="px-2 py-1 bg-gray-100 rounded text-sm">quantixbet-v0.2.0.apk</code></li>
              <li>
                Habilita la instalación de apps desconocidas:
                <ul className="ml-6 mt-2 space-y-1 list-disc text-sm text-gray-600">
                  <li>Ve a Configuración → Seguridad</li>
                  <li>Activa "Fuentes desconocidas" o "Instalar apps desconocidas"</li>
                </ul>
              </li>
              <li>Abre el archivo APK descargado</li>
              <li>Acepta los permisos y sigue las instrucciones</li>
              <li>Inicia sesión con tus credenciales de QuantixBet</li>
              <li>¡Listo! La app está instalada</li>
            </ol>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Seguridad:</strong> Todos los archivos están firmados digitalmente y son seguros.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Actualizaciones:</strong> La app se actualiza automáticamente cuando hay nuevas versiones.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Soporte:</strong> ¿Problemas con la instalación? Contacta a{' '}
              <a href="mailto:salunacorpsas@gmail.com" className="text-blue-600 hover:underline">
                salunacorpsas@gmail.com
              </a>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Releases públicos:</strong> Revisa las versiones en{' '}
              <a
                href="https://github.com/SALUNA-CORP/polybet-releases"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
