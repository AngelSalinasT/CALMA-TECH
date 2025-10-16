import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function TeacherDashboard() {
  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)

    // Verificar que sea profesor
    if (parsedUser.role !== 'profesor') {
      navigate('/dashboard/alumno')
      return
    }

    setUser(parsedUser)

    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch('http://127.0.0.1:8000/api/dashboard/teacher', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}))
          const detailMessage = errorBody?.detail || 'No se pudo cargar la información del dashboard'
          if (response.status === 401) {
            console.warn('Sesión expirada o sin credenciales, redirigiendo al login')
            navigate('/login')
            return
          }
          throw new Error(detailMessage)
        }
        const data = await response.json()
        setDashboard(data)
      } catch (error) {
        console.error('Error al cargar dashboard de profesor:', error)
        setError(error.message || 'Error desconocido al cargar la información')
      } finally {
        setLoadingDashboard(false)
      }
    }

    fetchDashboard()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (loadingDashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4">
        <h2 className="text-2xl font-semibold text-gray-800">
          No pudimos cargar tu panel
        </h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const statBlocks = dashboard?.stats || {}

  const getToneClasses = (tone) => {
    switch (tone) {
      case 'blue':
        return {
          container: 'p-4 bg-blue-50 border-l-4 border-blue-500 rounded',
          accent: 'text-blue-600',
        }
      case 'green':
        return {
          container: 'p-4 bg-green-50 border-l-4 border-green-500 rounded',
          accent: 'text-green-600',
        }
      case 'yellow':
        return {
          container: 'p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded',
          accent: 'text-yellow-600',
        }
      case 'orange':
        return {
          container: 'p-4 bg-orange-50 border-l-4 border-orange-500 rounded',
          accent: 'text-orange-600',
        }
      case 'purple':
        return {
          container: 'p-4 bg-purple-50 border-l-4 border-purple-500 rounded',
          accent: 'text-purple-600',
        }
      default:
        return {
          container: 'p-4 bg-gray-50 border-l-4 border-gray-300 rounded',
          accent: 'text-gray-600',
        }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.jpeg" alt="CALMA TECH" className="h-12" />
              <h1 className="text-2xl font-bold text-primary">Panel de Profesor</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-semibold text-gray-900">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              {user.picture && (
                <img src={user.picture} alt={user.name} className="w-10 h-10 rounded-full" />
              )}
              <button onClick={handleLogout} className="btn-secondary">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bienvenido, Profesor {user.name.split(' ')[0]} 👨‍🏫
          </h2>
          <p className="text-gray-600">
            Gestiona tus clases, tareas y monitorea el progreso de tus estudiantes.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Cursos Activos</h3>
            <p className="text-4xl font-bold text-primary">
              {statBlocks?.active_courses?.count ?? '-'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {statBlocks?.active_courses?.summary ?? 'Sincronizando...'}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tareas Pendientes</h3>
            <p className="text-4xl font-bold text-secondary">
              {statBlocks?.pending_reviews?.count ?? '-'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {statBlocks?.pending_reviews?.summary ?? 'Sincronizando...'}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Alertas Activas</h3>
            <p className="text-4xl font-bold text-red-500">
              {statBlocks?.active_alerts?.count ?? '-'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {statBlocks?.active_alerts?.summary ?? 'Sincronizando...'}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Asistencia Hoy</h3>
            <p className="text-4xl font-bold text-accent">
              {statBlocks?.today_attendance?.count
                ? `${statBlocks.today_attendance.count}%`
                : '-'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {statBlocks?.today_attendance?.summary ?? 'Sincronizando...'}
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Clases de Hoy */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📚 Clases de Hoy</h3>
            <div className="space-y-3">
              {dashboard?.today_classes?.length ? (
                dashboard.today_classes.map((course, index) => {
                  const tone = getToneClasses(course.badge)
                  return (
                    <div
                      key={`${course.title}-${course.time}-${index}`}
                      className={tone.container}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{course.title}</p>
                          <p className="text-sm text-gray-600">{course.group}</p>
                        </div>
                        <span className={`text-sm font-semibold ${tone.accent}`}>
                          {course.time}
                        </span>
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">No hay clases programadas para hoy.</p>
              )}
            </div>
            <button className="btn-primary w-full mt-4">Ver Todos los Cursos</button>
          </div>

          {/* Tareas Recientes */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">📝 Tareas por Calificar</h3>
            <div className="space-y-3">
              {dashboard?.pending_assignments?.length ? (
                dashboard.pending_assignments.map((assignment, index) => {
                  const tone = getToneClasses(assignment.tone)
                  return (
                    <div
                      key={`${assignment.title}-${index}`}
                      className={tone.container}
                    >
                      <p className="font-semibold text-gray-900">{assignment.title}</p>
                      <p className="text-sm text-gray-600">{assignment.detail}</p>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500">Sin tareas por calificar.</p>
              )}
            </div>
            <button className="btn-primary w-full mt-4">Ir a Calificaciones</button>
          </div>

          {/* Alertas de Estudiantes */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚠️ Alertas de Estudiantes</h3>
            <div className="space-y-3">
              {dashboard?.alerts?.length ? (
                dashboard.alerts.map((alert) => (
                  <div key={alert.student} className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                    <p className="font-semibold text-gray-900">{alert.student}</p>
                    <p className="text-sm text-gray-600">{alert.detail}</p>
                    <button className="text-sm text-red-600 font-semibold mt-2 hover:underline">
                      Ver detalles →
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Sin alertas activas.</p>
              )}
            </div>
            <button className="btn-secondary w-full mt-4">Ver Todas las Alertas</button>
          </div>

          {/* Acciones Rápidas */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Acciones Rápidas</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-center">
                <span className="text-2xl mb-2 block">➕</span>
                <span className="text-sm font-semibold">Nueva Tarea</span>
              </button>
              <button className="p-4 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors text-center">
                <span className="text-2xl mb-2 block">📢</span>
                <span className="text-sm font-semibold">Anuncio</span>
              </button>
              <button className="p-4 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-center">
                <span className="text-2xl mb-2 block">✓</span>
                <span className="text-sm font-semibold">Pasar Lista</span>
              </button>
              <button className="p-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-center">
                <span className="text-2xl mb-2 block">📊</span>
                <span className="text-sm font-semibold">Reportes</span>
              </button>
            </div>
          </div>
        </div>

        {/* Estadísticas Generales */}
        <div className="card mt-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Estadísticas Generales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">
                {dashboard?.general_stats?.average_grade ?? '-'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Promedio General</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-secondary">
                {dashboard?.general_stats?.delivery_rate
                  ? `${dashboard.general_stats.delivery_rate}%`
                  : '-'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Tasa de Entrega</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-accent">
                {dashboard?.general_stats?.attendance_rate
                  ? `${dashboard.general_stats.attendance_rate}%`
                  : '-'}
              </p>
              <p className="text-sm text-gray-600 mt-1">Asistencia Promedio</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default TeacherDashboard
