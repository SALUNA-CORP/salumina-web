export const metadata = {
  title: 'Salumina Sports - Scanner de Arbitrajes Deportivos',
  description: 'Detecta oportunidades de apuestas sin riesgo en tiempo real. Pinnacle, Betplay y Polymarket.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body style={{ margin: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        {children}
      </body>
    </html>
  )
}
