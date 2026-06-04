'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { Plus, X } from 'lucide-react';
import type { MarketCategory } from '@/types/pools';

export function CreateMarketForm() {
  const router = useRouter();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    category: 'sports_soccer' as MarketCategory,
    title: '',
    description: '',
    options: ['', ''],
    opens_at: '',
    closes_at: '',
    event_date: '',
    min_bet: 1,
    max_bet: 100,
    max_total_bet: 500,
  });

  const [loading, setLoading] = useState(false);

  const categories = [
    { value: 'sports_soccer', label: 'Fútbol' },
    { value: 'sports_basketball', label: 'Baloncesto' },
    { value: 'sports_tennis', label: 'Tenis' },
    { value: 'sports_other', label: 'Otros Deportes' },
    { value: 'politics', label: 'Política' },
    { value: 'entertainment', label: 'Entretenimiento' },
    { value: 'prediction', label: 'Predicción' },
  ];

  const addOption = () => {
    if (formData.options.length < 10) {
      setFormData({
        ...formData,
        options: [...formData.options, ''],
      });
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index),
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      showToast('El título es requerido', 'warning');
      return;
    }

    const validOptions = formData.options.filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      showToast('Se requieren al menos 2 opciones', 'warning');
      return;
    }

    if (!formData.event_date || !formData.closes_at || !formData.opens_at) {
      showToast('Las fechas son requeridas', 'warning');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/pools/markets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          options: validOptions,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast('Mercado creado exitosamente', 'success');
        router.push('/admin/pools/markets');
      } else {
        showToast(data.message || 'Error al crear mercado', 'error');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error creating market:', error);
      showToast('Error al procesar la solicitud', 'error');
      setLoading(false);
    }
  };

  // Set default dates
  const setDefaultDates = () => {
    const now = new Date();
    const opensAt = new Date(now.getTime() + 1 * 60 * 60 * 1000); // In 1 hour
    const closesAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // In 24 hours
    const eventDate = new Date(now.getTime() + 25 * 60 * 60 * 1000); // In 25 hours

    setFormData({
      ...formData,
      opens_at: opensAt.toISOString().slice(0, 16),
      closes_at: closesAt.toISOString().slice(0, 16),
      event_date: eventDate.toISOString().slice(0, 16),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="p-6 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value as MarketCategory })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título del Mercado *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Junior vs Atlético Nacional - Liga BetPlay"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Información adicional sobre el evento..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Opciones de Apuesta * (mínimo 2, máximo 10)
              </label>
              <Button
                type="button"
                onClick={addOption}
                disabled={formData.options.length >= 10}
                size="sm"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
            </div>
            <div className="space-y-2">
              {formData.options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Opción ${index + 1}`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {formData.options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="px-3 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Abre el *
              </label>
              <input
                type="datetime-local"
                value={formData.opens_at}
                onChange={(e) => setFormData({ ...formData, opens_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cierra el *
              </label>
              <input
                type="datetime-local"
                value={formData.closes_at}
                onChange={(e) => setFormData({ ...formData, closes_at: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha del Evento *
              </label>
              <input
                type="datetime-local"
                value={formData.event_date}
                onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={setDefaultDates}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Establecer fechas por defecto (abre en 1h, cierra en 24h)
          </button>

          {/* Limits */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apuesta Mínima ($)
              </label>
              <input
                type="number"
                value={formData.min_bet}
                onChange={(e) =>
                  setFormData({ ...formData, min_bet: parseFloat(e.target.value) })
                }
                min="0.01"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Apuesta Máxima ($)
              </label>
              <input
                type="number"
                value={formData.max_bet}
                onChange={(e) =>
                  setFormData({ ...formData, max_bet: parseFloat(e.target.value) })
                }
                min="1"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Máximo Total por Usuario ($)
              </label>
              <input
                type="number"
                value={formData.max_total_bet}
                onChange={(e) =>
                  setFormData({ ...formData, max_total_bet: parseFloat(e.target.value) })
                }
                min="1"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={() => router.back()}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Creando...' : 'Crear Mercado'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
