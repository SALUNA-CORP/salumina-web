'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Loader2, RefreshCw, Copy } from 'lucide-react';

interface GeneratedMarket {
  title: string;
  description: string;
  options: Array<{
    text: string;
    description: string;
  }>;
  category: string;
  suggested_event_date: string;
}

interface AIMarketGeneratorProps {
  onUseGenerated?: (market: GeneratedMarket) => void;
}

export function AIMarketGenerator({ onUseGenerated }: AIMarketGeneratorProps) {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<GeneratedMarket | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Ingresa un tema para generar el mercado');
      return;
    }

    setLoading(true);
    setError('');
    setGenerated(null);

    try {
      const response = await fetch('/api/admin/ai/generate-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (data.success) {
        setGenerated(data.market);
        setIsMock(data.is_mock || false);
      } else if (data.setup_required) {
        setError(data.message || 'OpenAI no está configurado');
      } else {
        setError(data.error || 'Error al generar mercado');
      }
    } catch (err) {
      console.error('Error generating market:', err);
      setError('Error de conexión al generar mercado');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    if (generated) {
      const text = `Título: ${generated.title}\n\nDescripción: ${generated.description}\n\nOpciones:\n${generated.options.map((o, i) => `${i + 1}. ${o.text}: ${o.description}`).join('\n')}\n\nCategoría: ${generated.category}\nFecha: ${generated.suggested_event_date}`;
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="w-5 h-5" />
          Generador de Mercados con IA
        </CardTitle>
        <p className="text-sm text-gray-600">
          Genera mercados de predicción automáticamente usando inteligencia artificial
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tema del Mercado
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
              placeholder="Ej: Mundial de Fútbol 2026, Elecciones presidenciales Colombia, etc."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              disabled={loading}
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !topic.trim()}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generar
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Mock Warning */}
        {isMock && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 font-medium mb-1">⚠️ Modo de demostración</p>
            <p className="text-xs text-yellow-700">
              Para obtener generación real con IA, instala el paquete <code className="bg-yellow-100 px-1 rounded">npm install openai</code> y
              agrega <code className="bg-yellow-100 px-1 rounded">OPENAI_API_KEY</code> a tu archivo .env.local
            </p>
          </div>
        )}

        {/* Generated Market Preview */}
        {generated && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Mercado Generado:</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyToClipboard}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copiar al portapapeles"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Regenerar
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3">
              {/* Title */}
              <div>
                <span className="text-xs text-gray-500 uppercase">Título</span>
                <h4 className="font-bold text-lg text-gray-900">{generated.title}</h4>
              </div>

              {/* Description */}
              <div>
                <span className="text-xs text-gray-500 uppercase">Descripción</span>
                <p className="text-gray-700">{generated.description}</p>
              </div>

              {/* Category & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-gray-500 uppercase">Categoría</span>
                  <p className="font-medium capitalize">{generated.category}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-500 uppercase">Fecha Sugerida</span>
                  <p className="font-medium">{generated.suggested_event_date}</p>
                </div>
              </div>

              {/* Options */}
              <div>
                <span className="text-xs text-gray-500 uppercase">Opciones ({generated.options.length})</span>
                <div className="mt-2 space-y-2">
                  {generated.options.map((option, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="font-medium text-gray-900">{option.text}</div>
                      {option.description && (
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Use Generated Button */}
            {onUseGenerated && (
              <button
                onClick={() => onUseGenerated(generated)}
                className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Usar este Mercado Generado
              </button>
            )}
          </div>
        )}

        {/* Examples */}
        {!generated && !loading && (
          <div>
            <span className="text-xs text-gray-500 uppercase">Ejemplos de temas:</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                'Copa América 2026',
                'Elecciones USA 2026',
                'Premios Oscar 2027',
                'Precio del Bitcoin en 2027',
                'Lanzamiento de iPhone 18',
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => setTopic(example)}
                  className="text-xs px-3 py-1 bg-white border border-gray-300 rounded-full hover:border-purple-400 hover:bg-purple-50 transition-colors"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
