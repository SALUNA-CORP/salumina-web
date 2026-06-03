'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://owurgpuzkgghrncdxqaz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93dXJncHV6a2dnaHJuY2R4cWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxNTE0NTYsImV4cCI6MjA5MDcyNzQ1Nn0.Hs8ZhEKcXqWbpO_OVHE5TL6zoTSh0-H9_Qe76EQscYM'
)

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Detectar si es Android
    const isAndroid = /android/i.test(navigator.userAgent)
    setIsMobile(isAndroid)

    // Si es Android, intentar abrir la app
    if (isAndroid) {
      const hash = window.location.hash
      if (hash) {
        // Intentar abrir la app con el deep link
        const deepLink = `salumina://reset-password${hash}`
        window.location.href = deepLink

        // Fallback: si después de 2s no abrió la app, mostrar formulario web
        setTimeout(() => {
          setIsMobile(false)
        }, 2000)
      }
    }

    // Establecer la sesión desde el hash de la URL
    const hashParams = new URLSearchParams(window.location.hash.substring(1))
    const accessToken = hashParams.get('access_token')

    if (accessToken) {
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: hashParams.get('refresh_token') || ''
      })
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('Error al actualizar la contraseña')
    } finally {
      setLoading(false)
    }
  }

  if (isMobile) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '20px'
      }}>
        <div style={{
          textAlign: 'center',
          color: '#fff'
        }}>
          <div style={{
            width: 64,
            height: 64,
            border: '4px solid #22c55e',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>Abriendo Salumina Sports...</h2>
          <p style={{ color: '#999', fontSize: 14 }}>
            Si la app no se abre, actualiza tu contraseña abajo
          </p>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        padding: '20px'
      }}>
        <div style={{
          background: '#1a1a1a',
          border: '1px solid #333',
          borderRadius: 12,
          padding: 40,
          maxWidth: 400,
          width: '100%',
          textAlign: 'center'
        }}>
          <div style={{
            width: 64,
            height: 64,
            background: '#22c55e',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32
          }}>
            ✓
          </div>
          <h2 style={{ color: '#fff', marginBottom: 8 }}>¡Contraseña actualizada!</h2>
          <p style={{ color: '#999', marginBottom: 20 }}>
            Ya puedes iniciar sesión con tu nueva contraseña
          </p>
          <a
            href="/"
            style={{
              display: 'inline-block',
              background: '#22c55e',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Volver al inicio
          </a>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #333',
        borderRadius: 12,
        padding: 40,
        maxWidth: 400,
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            color: '#fff',
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 8,
            letterSpacing: '-0.02em'
          }}>
            SALUMINA
          </h1>
          <p style={{ color: '#22c55e', fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Sports
          </p>
        </div>

        <h2 style={{ color: '#fff', fontSize: 20, marginBottom: 8 }}>
          Restablecer contraseña
        </h2>
        <p style={{ color: '#999', fontSize: 14, marginBottom: 24 }}>
          Ingresa tu nueva contraseña
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: 8,
                padding: 12,
                color: '#fff',
                fontSize: 14
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="Confirmar contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: 8,
                padding: 12,
                color: '#fff',
                fontSize: 14
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
              color: '#ef4444',
              fontSize: 14
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            style={{
              width: '100%',
              background: loading ? '#666' : '#22c55e',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: 14,
              fontSize: 16,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>

        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  )
}
