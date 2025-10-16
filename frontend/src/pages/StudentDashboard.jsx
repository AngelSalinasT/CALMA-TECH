import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Clock, BarChart3, Calendar } from 'lucide-react'

function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const navigate = useNavigate()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (!userData) {
      navigate('/login')
      return
    }

    const parsedUser = JSON.parse(userData)

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
            console.warn('Sesión expirada, redirigiendo al login')
            navigate('/login')
            return
          }
          throw new Error(detailMessage)
        }

        const data = await response.json()
        setDashboard(data)
      } catch (error) {
        console.error('Error al cargar dashboard:', error)
        setError(error.message || 'Error al cargar tu información')
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

  if (!user || loadingDashboard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <img src="/logo.jpeg" alt="CALMA TECH" className="h-16 mb-4 animate-pulse" />
        <div className="w-12 h-12 border-4 border-[#5B8FC3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center gap-4 bg-white">
        <h2 className="text-2xl font-semibold text-gray-800">
          No pudimos cargar tu panel
        </h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-[#5B8FC3] text-white rounded-lg font-medium hover:bg-[#4A7FB0] transition-colors"
        >
          Reintentar
        </button>
      </div>
    )
  }

  const getTaskStatusIcon = (status) => {
    if (status === 'critical') return '🔴'
    if (status === 'warning') return '🟡'
    return '✅'
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#5B8FC3] rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[#5B8FC3]">CALMA TECH</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user.picture && (
                <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full border-2 border-[#5B8FC3]" />
              )}
              <button onClick={handleLogout} className="text-gray-600 hover:text-gray-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Bienvenido {user.name.split(' ')[0]} 👋
              </h2>
              <p className="text-gray-600">
                {dashboard?.stats?.pending_this_week
                  ? `Tienes ${dashboard.stats.pending_this_week} tarea${dashboard.stats.pending_this_week > 1 ? 's' : ''} para esta semana`
                  : 'No tienes tareas pendientes esta semana'}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">Presente | Hoy</span>
                </div>
                <p className="text-3xl font-bold text-[#5B8FC3]">{dashboard?.stats?.active_courses ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Cursos activos</p>
              </div>

              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">📚</span>
                  </div>
                  <span className="text-sm font-medium text-gray-600">Tareas</span>
                </div>
                <p className="text-3xl font-bold text-[#5B8FC3]">{dashboard?.stats?.pending_tasks ?? 0}</p>
                <p className="text-xs text-gray-500 mt-1">Pendientes</p>
              </div>
            </div>

            {/* Upcoming Tasks */}
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Próximas Tareas</h3>
                <button className="text-sm text-[#5B8FC3] font-medium">Ver todas</button>
              </div>

              <div className="space-y-3">
                {dashboard?.upcoming_tasks?.length ? (
                  dashboard.upcoming_tasks.slice(0, 5).map((task, index) => (
                    <div key={`${task.title}-${index}`} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <span className="text-xl">{getTaskStatusIcon(task.status)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-1">{task.title}</p>
                        {task.course && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{task.course}</p>}
                        <p className="text-xs text-[#5B8FC3] font-medium mt-1">{task.due}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-4xl mb-2">🎉</p>
                    <p className="text-sm">No hay tareas pendientes</p>
                  </div>
                )}
              </div>
            </div>

            {/* Announcements */}
            {dashboard?.announcements?.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Anuncios Recientes</h3>
                </div>

                <div className="space-y-3">
                  {dashboard.announcements.slice(0, 3).map((announcement, index) => (
                    <div key={`${announcement.title}-${index}`} className="p-3 bg-blue-50 rounded-xl">
                      <p className="font-semibold text-gray-900 text-sm line-clamp-2">{announcement.title}</p>
                      {announcement.course && (
                        <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{announcement.course}</p>
                      )}
                      <p className="text-xs text-gray-600 mt-1">{announcement.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Assistant CTA */}
            <div className="bg-gradient-to-r from-[#5B8FC3] to-[#4A7FB0] rounded-2xl p-6 shadow-sm text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Asistente IA</h3>
                  <p className="text-sm text-white/80">Aquí para ayudarte</p>
                </div>
              </div>
              <p className="text-sm mb-4 text-white/90">
                ¿Necesitas ayuda con tus tareas o consejos de estudio? Habla con nuestro asistente inteligente.
              </p>
              <button className="w-full bg-white text-[#5B8FC3] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
                Iniciar Conversación
              </button>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 px-2">Todas las Tareas</h2>

            {dashboard?.upcoming_tasks?.length ? (
              dashboard.upcoming_tasks.map((task, index) => (
                <div key={`${task.title}-${index}`} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTaskStatusIcon(task.status)}</span>
                    <div className="flex-1">
                      <p className="font-bold text-gray-900">{task.title}</p>
                      {task.course && <p className="text-sm text-gray-500 mt-1">{task.course}</p>}
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-[#5B8FC3]" />
                        <p className="text-sm text-[#5B8FC3] font-medium">{task.due}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-6xl mb-4">🎉</p>
                <p className="text-xl font-semibold text-gray-900 mb-2">¡Todo al día!</p>
                <p className="text-gray-600">No tienes tareas pendientes</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#5B8FC3] shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-around">
            <button
              onClick={() => setActiveTab('home')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'home' ? 'text-white' : 'text-white/60'
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Inicio</span>
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'tasks' ? 'text-white' : 'text-white/60'
              }`}
            >
              <Clock className="w-6 h-6" />
              <span className="text-xs font-medium">Tareas</span>
            </button>

            <button
              onClick={() => setActiveTab('stats')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'stats' ? 'text-white' : 'text-white/60'
              }`}
            >
              <BarChart3 className="w-6 h-6" />
              <span className="text-xs font-medium">Estadísticas</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'calendar' ? 'text-white' : 'text-white/60'
              }`}
            >
              <Calendar className="w-6 h-6" />
              <span className="text-xs font-medium">Calendario</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default StudentDashboard
