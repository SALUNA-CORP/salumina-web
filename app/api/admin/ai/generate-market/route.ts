import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * AI Market Generator using OpenAI GPT-4
 *
 * SETUP REQUIRED:
 * 1. Install OpenAI SDK:
 *    npm install openai
 *
 * 2. Add to .env.local:
 *    OPENAI_API_KEY=sk-your-api-key-here
 *
 * 3. Uncomment the OpenAI import and code below once setup is complete
 */

// import OpenAI from 'openai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'superadmin') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    const { topic, language = 'es' } = body;

    if (!topic) {
      return NextResponse.json({ error: 'Falta el tema del mercado' }, { status: 400 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        error: 'OpenAI API key no configurada',
        message: 'Agrega OPENAI_API_KEY a tu archivo .env.local',
        setup_required: true,
      }, { status: 503 });
    }

    /*
    // UNCOMMENT THIS SECTION AFTER INSTALLING OPENAI AND CONFIGURING API KEY

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const systemPrompt = `Eres un experto en crear mercados de predicción para una plataforma de betting pools.

Tu tarea es generar mercados de predicción con las siguientes características:
- Título: Corto y atractivo (máximo 100 caracteres)
- Descripción: Clara y concisa (1-2 oraciones)
- Opciones: Entre 3-5 opciones mutuamente exclusivas y exhaustivas (que cubran todos los posibles resultados)
- Categoría: Una de estas: sports, politics, entertainment, economics, technology
- Fecha sugerida de evento: En formato ISO 8601 (YYYY-MM-DD)

IMPORTANTE:
- Las opciones deben ser claras y no ambiguas
- Cada opción debe ser realista y verificable
- El mercado debe ser resolvible objetivamente
- La fecha del evento debe ser futura y realista
- ${language === 'es' ? 'Responde en español' : 'Respond in English'}

Retorna SOLO un objeto JSON con esta estructura:
{
  "title": "Título del mercado",
  "description": "Descripción detallada",
  "options": [
    { "text": "Opción 1", "description": "Breve explicación" },
    { "text": "Opción 2", "description": "Breve explicación" },
    { "text": "Opción 3", "description": "Breve explicación" }
  ],
  "category": "sports",
  "suggested_event_date": "2026-12-31"
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Crea un mercado de predicción sobre: ${topic}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1000,
    });

    const generated = JSON.parse(completion.choices[0].message.content || '{}');

    // Validate generated data
    if (!generated.title || !generated.options || generated.options.length < 2) {
      return NextResponse.json({
        error: 'IA generó datos inválidos',
        generated,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      market: generated,
      tokens_used: completion.usage?.total_tokens || 0,
    });
    */

    // TEMPORARY MOCK RESPONSE (remove after OpenAI setup)
    const mockMarket = {
      title: `${topic} - Predicción Generada`,
      description: `Mercado de predicción generado automáticamente sobre: ${topic}. Configura OpenAI para generar mercados reales.`,
      options: [
        { text: 'Opción 1', description: 'Primera opción generada por IA' },
        { text: 'Opción 2', description: 'Segunda opción generada por IA' },
        { text: 'Opción 3', description: 'Tercera opción generada por IA' },
      ],
      category: 'general',
      suggested_event_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    return NextResponse.json({
      success: true,
      market: mockMarket,
      is_mock: true,
      message: 'OpenAI no configurado. Instala el paquete openai y configura OPENAI_API_KEY para obtener generación real con IA.',
    });

  } catch (error) {
    console.error('Error in AI market generation:', error);
    return NextResponse.json({
      error: 'Error al generar mercado con IA',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
