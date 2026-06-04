'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [referralCode, setReferralCode] = useState<string | null>(null)

  useEffect(() => {
    // Detectar si es un reset password y redirigir
    const hash = window.location.hash
    if (hash.includes('access_token') && hash.includes('type=recovery')) {
      window.location.href = `/reset-password${hash}`
      return
    }

    // Capturar código de referido desde URL
    const params = new URLSearchParams(window.location.search)
    const ref = params.get('ref')
    if (ref) {
      setReferralCode(ref)
      localStorage.setItem('referralCode', ref)
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      color: '#fff'
    }}>
      {/* Header */}
      <header style={{
        padding: '20px 40px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #333'
      }}>
        <div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: '-0.02em',
            margin: 0
          }}>
            SALUMINA
          </h1>
          <p style={{
            color: '#22c55e',
            fontSize: 12,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            margin: 0
          }}>
            Sports
          </p>
        </div>

        <nav style={{ display: 'flex', gap: 24 }}>
          <a href="#features" style={{ color: '#999', textDecoration: 'none' }}>Características</a>
          <a href="#pricing" style={{ color: '#999', textDecoration: 'none' }}>Planes</a>
          <a href="#download" style={{
            background: '#22c55e',
            color: '#fff',
            padding: '8px 20px',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600
          }}>
            Descargar
          </a>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '120px 40px',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1.2,
          marginBottom: 24,
          background: 'linear-gradient(135deg, #fff 0%, #22c55e 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Scanner de Arbitrajes Deportivos
        </h2>
        <p style={{
          fontSize: 20,
          color: '#999',
          marginBottom: 40,
          maxWidth: 600,
          margin: '0 auto 40px'
        }}>
          Detecta oportunidades de apuestas sin riesgo en tiempo real.
          Pinnacle, Betplay y Polymarket sincronizados.
        </p>

        {referralCode && (
          <div style={{
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            borderRadius: 12,
            padding: 16,
            marginBottom: 32,
            maxWidth: 500,
            margin: '0 auto 32px'
          }}>
            <p style={{ margin: 0, fontSize: 14 }}>
              🎁 Invitado por: <strong>{referralCode}</strong>
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
          <a
            href="#download"
            style={{
              background: '#22c55e',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: 12,
              textDecoration: 'none',
              fontSize: 18,
              fontWeight: 600,
              display: 'inline-block'
            }}
          >
            Descargar para Windows
          </a>
          <a
            href="#download"
            style={{
              background: '#333',
              color: '#fff',
              padding: '16px 32px',
              borderRadius: 12,
              textDecoration: 'none',
              fontSize: 18,
              fontWeight: 600,
              display: 'inline-block'
            }}
          >
            Descargar para Android
          </a>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '80px 40px'
      }}>
        <h3 style={{
          fontSize: 36,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 60
        }}>
          Características
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32
        }}>
          {[
            {
              icon: '⚡',
              title: 'Tiempo Real',
              description: 'Escaneo continuo cada 2 minutos. Detecta arbitrajes antes que nadie.'
            },
            {
              icon: '🎾',
              title: 'Múltiples Deportes',
              description: 'Tennis, fútbol, basketball, esports y más. ITF, ATP, WTA, ligas profesionales.'
            },
            {
              icon: '📊',
              title: 'Calculadora Integrada',
              description: 'Calcula stakes automáticamente. Historial de apuestas realizadas.'
            },
            {
              icon: '🔒',
              title: 'Seguro y Privado',
              description: 'Datos locales cifrados. Sin compartir información con terceros.'
            },
            {
              icon: '💰',
              title: 'Sistema de Referidos',
              description: 'Gana comisiones por cada usuario que invites. Plan de afiliados activo.'
            },
            {
              icon: '🔄',
              title: 'Auto-Update',
              description: 'Actualizaciones automáticas. Siempre con las últimas mejoras.'
            }
          ].map((feature, i) => (
            <div key={i} style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 12,
              padding: 32
            }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{feature.icon}</div>
              <h4 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
                {feature.title}
              </h4>
              <p style={{ color: '#999', fontSize: 14, margin: 0 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '80px 40px'
      }}>
        <h3 style={{
          fontSize: 36,
          fontWeight: 700,
          textAlign: 'center',
          marginBottom: 60
        }}>
          Planes
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          maxWidth: 900,
          margin: '0 auto'
        }}>
          {[
            {
              name: 'Starter',
              price: '$29',
              period: '/mes',
              features: ['1 bookmaker', 'Actualizaciones cada 5 min', 'Soporte email'],
              cta: 'Comenzar'
            },
            {
              name: 'Pro',
              price: '$49',
              period: '/mes',
              features: ['2 bookmakers', 'Actualizaciones cada 2 min', 'Calculadora avanzada', 'Soporte prioritario'],
              cta: 'Más popular',
              highlighted: true
            },
            {
              name: 'Elite',
              price: '$99',
              period: '/mes',
              features: ['3 bookmakers', 'Tiempo real', 'API access', 'Soporte 24/7', 'Sistema de referidos'],
              cta: 'Comenzar'
            }
          ].map((plan, i) => (
            <div key={i} style={{
              background: plan.highlighted ? '#22c55e' : '#1a1a1a',
              border: plan.highlighted ? 'none' : '1px solid #333',
              borderRadius: 12,
              padding: 32,
              color: plan.highlighted ? '#000' : '#fff',
              transform: plan.highlighted ? 'scale(1.05)' : 'none'
            }}>
              <h4 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>
                {plan.name}
              </h4>
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontSize: 48, fontWeight: 800 }}>{plan.price}</span>
                <span style={{ fontSize: 16, opacity: 0.7 }}>{plan.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 24 }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ marginBottom: 12, fontSize: 14 }}>
                    ✓ {f}
                  </li>
                ))}
              </ul>
              <button style={{
                width: '100%',
                background: plan.highlighted ? '#000' : '#22c55e',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: 14,
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer'
              }}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Download */}
      <section id="download" style={{
        maxWidth: 800,
        margin: '0 auto',
        padding: '80px 40px',
        textAlign: 'center'
      }}>
        <h3 style={{ fontSize: 36, fontWeight: 700, marginBottom: 24 }}>
          Descarga Salumina Sports
        </h3>
        <p style={{ color: '#999', marginBottom: 40 }}>
          Disponible para Windows y Android
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/latest"
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 12,
              padding: '24px 32px',
              textDecoration: 'none',
              color: '#fff',
              display: 'inline-block',
              minWidth: 200
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>🪟</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Windows</div>
            <div style={{ fontSize: 12, color: '#999' }}>v0.2.1</div>
          </a>

          <a
            href="https://github.com/SALUNA-CORP/salumina-sports-desktop/releases/latest"
            style={{
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 12,
              padding: '24px 32px',
              textDecoration: 'none',
              color: '#fff',
              display: 'inline-block',
              minWidth: 200
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 8 }}>📱</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Android</div>
            <div style={{ fontSize: 12, color: '#999' }}>APK v0.2.1</div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid #333',
        padding: '40px',
        textAlign: 'center',
        color: '#999',
        fontSize: 14
      }}>
        <p>SALUNA CORP © 2026 - Todos los derechos reservados</p>
      </footer>
    </div>
  )
}
