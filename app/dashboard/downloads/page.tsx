import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Smartphone, CheckCircle } from 'lucide-react';

export default function DownloadsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Descargas</h1>
        <p className="text-gray-500 mt-1">Descarga la app móvil de arbitraje</p>
      </div>

      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-blue-600" />
            <div>
              <CardTitle className="text-blue-900">Salumina Sports - App Android</CardTitle>
              <p className="text-sm text-blue-700 mt-1">
                Scanner de arbitrajes deportivos en tiempo real
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Detección automática</p>
                <p className="text-sm text-gray-500">Encuentra oportunidades sin esfuerzo</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Múltiples bookmakers</p>
                <p className="text-sm text-gray-500">Pinnacle, Betplay, Polymarket y más</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Actualizaciones automáticas</p>
                <p className="text-sm text-gray-500">Siempre la última versión</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border-2 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">Versión actual: 0.2.2</p>
                <p className="text-sm text-gray-500 mt-1">Última actualización: 4 de junio 2026</p>
              </div>
              <a
                href="https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/latest/download/app-release.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-5 h-5" />
                Descargar APK
              </a>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>Nota:</strong> Necesitas una suscripción activa para usar la app. Las casas de
              apuestas visibles dependerán de tu plan actual.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Installation Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instrucciones de Instalación</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3 list-decimal list-inside">
            <li className="text-gray-700">
              Descarga el archivo <code className="px-2 py-1 bg-gray-100 rounded">app-release.apk</code>
            </li>
            <li className="text-gray-700">
              Habilita la instalación de apps desconocidas en tu dispositivo Android:
              <ul className="ml-6 mt-2 space-y-1 list-disc">
                <li className="text-sm text-gray-600">Ve a Configuración → Seguridad</li>
                <li className="text-sm text-gray-600">Activa "Fuentes desconocidas" o "Instalar apps desconocidas"</li>
              </ul>
            </li>
            <li className="text-gray-700">
              Abre el archivo APK descargado y sigue las instrucciones
            </li>
            <li className="text-gray-700">
              Inicia sesión con tu email y contraseña de Salumina
            </li>
            <li className="text-gray-700">
              ¡Listo! Ya puedes usar la app para encontrar arbitrajes
            </li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
