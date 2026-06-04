import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/toast';

export const metadata: Metadata = {
  title: 'PolyBet - Arbitraje Deportivo y Red MLM',
  description: 'Plataforma de arbitraje deportivo con sistema MLM binario. Activa tu cuenta y selecciona tus casas de apuestas.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
