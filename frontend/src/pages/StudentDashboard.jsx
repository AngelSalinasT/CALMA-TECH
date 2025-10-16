import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function StudentDashboard() {
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

    // Verificar que sea alumno
    if (parsedUser.role !== 'alumno') {
      navigate('/dashboard/profesor')
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

        const response = await fetch('http://127.0.0.1:8000/api/dashboard/student', {
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
        console.error('Error al cargar dashboard de alumno:', error)
        setError(error.message || 'Error desconocido al cargar tu información')
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

  const getTaskStyles = (status) => {
    switch (status) {
      case 'critical':
        return 'p-3 bg-red-50 border-l-4 border-red-500 rounded'
      case 'warning':
        return 'p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded'
      default:
        return 'p-3 bg-green-50 border-l-4 border-green-500 rounded'
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
              <h1 className="text-2xl font-bold text-primary">Panel de Alumno</h1>
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
            ¡Bienvenido, {user.name.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-600">
            Aquí podrás ver tus tareas, calificaciones y recibir apoyo personalizado.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Tareas Pendientes</h3>
            <p className="text-4xl font-bold text-primary">{dashboard?.stats?.pending_tasks ?? '-'}</p>
            <p className="text-sm text-gray-500 mt-2">
              {dashboard?.stats?.pending_this_week ? `${dashboard.stats.pending_this_week} para esta semana` : 'Sin datos recientes'}
            </p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Promedio General</h3>
            <p className="text-4xl font-bold text-secondary">
              {dashboard?.stats?.average_grade ? dashboard.stats.average_grade : '-'}
            </p>
            <p className="text-sm text-gray-500 mt-2">Actualizado automáticamente</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Cursos Activos</h3>
            <p className="text-4xl font-bold text-accent">{dashboard?.stats?.active_courses ?? '-'}</p>
            <p className="text-sm text-gray-500 mt-2">Sincronizado con Classroom</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tareas Próximas */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Próximas Tareas</h3>
            <div className="space-y-3">
              {dashboard?.upcoming_tasks?.length ? (
                dashboard.upcoming_tasks.map((task, index) => (
                  <div key={`${task.title}-${index}`} className={getTaskStyles(task.status)}>
                    <p className="font-semibold text-gray-900">{task.title}</p>
                    {task.course && <p className="text-sm text-gray-500">{task.course}</p>}
                    <p className="text-sm text-gray-600">Vence: {task.due}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay tareas próximas.</p>
              )}
            </div>
            <button className="btn-primary w-full mt-4">Ver Todas las Tareas</button>
          </div>

          {/* Anuncios Recientes */}
          <div className="card">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Anuncios Recientes</h3>
            <div className="space-y-3">
              {dashboard?.announcements?.length ? (
                dashboard.announcements.map((announcement, index) => (
                  <div key={`${announcement.title}-${index}`} className="p-3 bg-blue-50 rounded">
                    <p className="font-semibold text-gray-900">{announcement.title}</p>
                    {announcement.course && (
                      <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">
                        {announcement.course}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {announcement.author} · {announcement.time}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Sin anuncios recientes.</p>
              )}
            </div>
            <button className="btn-secondary w-full mt-4">Ver Todos los Anuncios</button>
          </div>
        </div>

        {/* AI Assistant */}
        <div className="card mt-6 bg-gradient-to-r from-primary to-secondary text-white">
          <h3 className="text-xl font-bold mb-2">🤖 Asistente de IA</h3>
          <p className="mb-4">¿Necesitas ayuda con tus tareas o te sientes estresado? Habla con nuestro asistente.</p>
          <button className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Iniciar Conversación
          </button>
        </div>
      </main>
    </div>
  )
}

export default StudentDashboard
