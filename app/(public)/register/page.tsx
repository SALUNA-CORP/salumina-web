import { Suspense } from 'react';
import { RegisterForm } from './RegisterForm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">Cargando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
