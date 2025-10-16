import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'

const GOOGLE_SCOPES = [
  'openid',
  'profile',
  'email',
  'https://www.googleapis.com/auth/classroom.courses.readonly',
  'https://www.googleapis.com/auth/classroom.rosters.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
  'https://www.googleapis.com/auth/classroom.coursework.me.readonly',
  'https://www.googleapis.com/auth/classroom.announcements.readonly'
].join(' ')

function Login() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleGoogleLogin = useGoogleLogin({
    flow: 'auth-code',
    scope: GOOGLE_SCOPES,
    onSuccess: async (codeResponse) => {
      if (!codeResponse.code) {
        alert('Google no entregó un código de autorización. Intenta de nuevo.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: codeResponse.code
          })
        })

        if (!response.ok) {
          const errorBody = await response.text()
          console.error('Google login backend error:', errorBody)
          throw new Error('Error al validar el código con el backend')
        }

        const data = await response.json()

        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user', JSON.stringify(data.user))

        if (data.user.role === 'profesor') {
          navigate('/dashboard/profesor')
        } else {
          navigate('/dashboard/alumno')
        }
      } catch (error) {
        console.error('Error en login:', error)
        alert('Error al iniciar sesión. Intenta de nuevo.')
      } finally {
        setLoading(false)
      }
    },
    onError: (errorResponse) => {
      console.error('Error en Google OAuth:', errorResponse)
      alert('Error al iniciar sesión con Google. Intenta de nuevo.')
      setLoading(false)
    }
  })

  const handleClick = useCallback(() => {
    if (!loading) {
      setLoading(true)
      handleGoogleLogin()
    }
  }, [handleGoogleLogin, loading])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Logo */}
      <div className="mb-8">
        <img
          src="/logo-full.jpeg"
          alt="CALMA TECH"
          className="h-24 object-contain"
        />
      </div>

      {/* Login Card */}
      <div className="card w-full max-w-md">
        <h2 className="text-title text-center mb-6">Inicio de Sesión</h2>

        <p className="text-gray-text text-center mb-8">
          Inicia sesión con tu cuenta de Google para acceder al sistema
        </p>

        {/* Google Login Button */}
        <div className="flex justify-center">
          {loading ? (
            <div className="btn-primary w-full flex items-center justify-center gap-3">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Iniciando sesión...
            </div>
          ) : (
            <button
              type="button"
              onClick={handleClick}
              className="btn-primary w-full flex items-center justify-center gap-3"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
              >
                <path fill="#FFC107" d="M43.611 20.083h-1.611v-.083H24v8h11.303c-1.648 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.328 6.053 28.88 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z" />
                <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 19.003 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.328 6.053 28.88 4 24 4c-7.732 0-14.426 4.408-17.694 10.691z" />
                <path fill="#4CAF50" d="M24 44c4.781 0 9.167-1.833 12.5-4.812l-5.781-4.844C28.708 35.583 26.459 36 24 36c-5.202 0-9.619-3.319-11.281-7.946l-6.563 5.047C9.397 39.556 16.195 44 24 44z" />
                <path fill="#1976D2" d="M43.611 20.083h-1.611v-.083H24v8h11.303c-.792 2.237-2.231 4.166-4.084 5.571.001-.001.002-.001.003-.002l5.781 4.844C35.904 39.004 40 32.999 40 24c0-1.341-.138-2.651-.389-3.917z" />
              </svg>
              <span>Continuar con Google</span>
            </button>
          )}
        </div>

      <div className="mt-6 text-center">
        <button
          onClick={() => window.history.back()}
          className="text-primary hover:underline text-sm"
        >
          Volver
        </button>
        <div className="mt-3">
          <button
            onClick={() => navigate('/dashboard/profesor')}
            className="text-xs font-semibold text-[#5B8FC3] hover:underline"
          >
            Ver demo del panel docente
          </button>
        </div>
      </div>
      </div>

      <p className="text-sm text-gray-text mt-8">
        Al iniciar sesión, aceptas nuestros términos y condiciones
      </p>
    </div>
  )
}

export default Login
