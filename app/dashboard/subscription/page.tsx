import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PlanSelector } from '@/components/subscription/PlanSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Calendar, CreditCard } from 'lucide-react';

export default async function SubscriptionPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Get active subscription
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*, subscription_bookmakers(bookmaker_id, bookmakers(id, name, slug))')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  // Get all available bookmakers
  const { data: bookmakers } = await supabase
    .from('bookmakers')
    .select('id, name, slug, price, is_active')
    .eq('is_active', true)
    .order('name');

  if (subscription) {
    // User has active subscription
    const currentBookmakers = subscription.subscription_bookmakers?.map((sb: any) => ({
      id: sb.bookmakers.id,
      name: sb.bookmakers.name,
      slug: sb.bookmakers.slug,
    })) || [];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Suscripción</h1>
          <p className="text-gray-500 mt-1">Gestiona tu plan actual</p>
        </div>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <CardTitle className="text-green-900">Suscripción Activa</CardTitle>
                <p className="text-sm text-green-700 mt-1">
                  Tu plan está activo y funcionando correctamente
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Total Mensual</p>
                  <p className="font-bold text-gray-900">
                    ${subscription.total_amount} {subscription.currency}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Próximo Cobro</p>
                  <p className="font-bold text-gray-900">
                    {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <CheckCircle className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Casas de Apuestas</p>
                  <p className="font-bold text-gray-900">{currentBookmakers.length}</p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">
                Casas de apuestas activas:
              </p>
              <div className="flex flex-wrap gap-2">
                {currentBookmakers.map((bm: any) => (
                  <span
                    key={bm.id}
                    className="px-3 py-1 bg-white text-gray-700 text-sm rounded-full border border-gray-200"
                  >
                    {bm.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-green-200">
              <p className="text-xs text-gray-600">
                Para cambiar tu plan o cancelar tu suscripción, contacta con soporte.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // User doesn't have subscription - show plan selector
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Elige tu Plan</h1>
        <p className="text-gray-500 mt-1">
          Selecciona las casas de apuestas que deseas incluir en tu suscripción
        </p>
      </div>

      <PlanSelector bookmakers={bookmakers || []} />
    </div>
  );
}
