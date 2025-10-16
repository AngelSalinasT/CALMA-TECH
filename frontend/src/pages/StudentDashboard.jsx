import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Home, Clock, BookOpen, Calendar, Sparkles, MessageCircle } from 'lucide-react'
import ChatbotPopup from '../components/ChatbotPopup'

function StudentDashboard() {
  const [user, setUser] = useState(null)
  const [dashboard, setDashboard] = useState(null)
  const [courses, setCourses] = useState([])
  const [prioritizedTasks, setPrioritizedTasks] = useState([])
  const [loadingDashboard, setLoadingDashboard] = useState(true)
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [loadingPrioritizedTasks, setLoadingPrioritizedTasks] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('home')
  const [isChatOpen, setIsChatOpen] = useState(false)
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

  useEffect(() => {
    if (activeTab === 'courses' && courses.length === 0 && !loadingCourses) {
      const fetchCourses = async () => {
        setLoadingCourses(true)
        try {
          const token = localStorage.getItem('access_token')
          if (!token) {
            navigate('/login')
            return
          }

          const response = await fetch('http://127.0.0.1:8000/api/dashboard/student/courses', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('No se pudieron cargar los cursos')
          }

          const data = await response.json()
          setCourses(data.courses || [])
        } catch (error) {
          console.error('Error al cargar cursos:', error)
        } finally {
          setLoadingCourses(false)
        }
      }

      fetchCourses()
    }
  }, [activeTab, courses.length, loadingCourses, navigate])

  useEffect(() => {
    if (activeTab === 'tasks' && prioritizedTasks.length === 0 && !loadingPrioritizedTasks) {
      const fetchPrioritizedTasks = async () => {
        setLoadingPrioritizedTasks(true)
        try {
          const token = localStorage.getItem('access_token')
          if (!token) {
            navigate('/login')
            return
          }

          const response = await fetch('http://127.0.0.1:8000/api/dashboard/student/tasks/prioritized', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          })

          if (!response.ok) {
            throw new Error('No se pudieron cargar las tareas priorizadas')
          }

          const data = await response.json()
          setPrioritizedTasks(data.tasks || [])
        } catch (error) {
          console.error('Error al cargar tareas priorizadas:', error)
          // Si falla la IA, usar las tareas normales del dashboard
          setPrioritizedTasks(dashboard?.upcoming_tasks || [])
        } finally {
          setLoadingPrioritizedTasks(false)
        }
      }

      fetchPrioritizedTasks()
    }
  }, [activeTab, prioritizedTasks.length, loadingPrioritizedTasks, navigate, dashboard])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (!user || loadingDashboard) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <img src="/logo.jpeg" alt="CALMA TECH" className="h-16 mb-4 animate-pulse" />
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
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
              <button
                onClick={() => setIsChatOpen(true)}
                className="w-full bg-white text-[#5B8FC3] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Iniciar Conversación
              </button>
            </div>
          </div>
        )}

        {/* Tasks Tab - Priorizadas por IA */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {/* Header con badge de IA */}
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-bold text-gray-900">Tareas Priorizadas</h2>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full relative overflow-hidden">
                <div className="absolute inset-0 animate-shimmer"></div>
                <Sparkles className="w-4 h-4 text-[#5B8FC3] animate-sparkle" />
                <span className="text-xs font-semibold text-[#5B8FC3] relative z-10">Ordenado por IA</span>
              </div>
            </div>

            {loadingPrioritizedTasks ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : prioritizedTasks?.length ? (
              prioritizedTasks.map((task, index) => {
                const priorityColors = {
                  ALTA: 'bg-red-100 text-red-700 border-red-200',
                  MEDIA: 'bg-yellow-100 text-yellow-700 border-yellow-200',
                  BAJA: 'bg-green-100 text-green-700 border-green-200'
                }
                const difficultyIcons = {
                  ALTA: '🔥',
                  MEDIA: '⚡',
                  BAJA: '✨'
                }

                return (
                  <button
                    key={`${task.id || task.title}-${index}`}
                    onClick={() => task.courseId && task.id && navigate(`/curso/${task.courseId}/tarea/${task.id}`)}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-all text-left w-full relative overflow-hidden group"
                  >
                    {/* Shimmer effect on hover */}
                    {task.ai_analyzed && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-shimmer"></div>
                    )}

                    <div className="flex items-start gap-3 relative z-10">
                      <span className="text-2xl">{getTaskStatusIcon(task.status)}</span>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-bold text-gray-900 flex-1">{task.title}</p>
                          {task.ai_analyzed && task.ai_priority && (
                            <div className="flex items-center gap-1.5">
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${priorityColors[task.ai_priority] || priorityColors.MEDIA}`}>
                                {difficultyIcons[task.ai_priority]} {task.ai_priority}
                              </span>
                            </div>
                          )}
                        </div>

                        {task.course && <p className="text-sm text-gray-500 mt-1">{task.course}</p>}

                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-[#5B8FC3]" />
                            <span className="text-sm text-[#5B8FC3] font-medium">{task.due}</span>
                          </div>

                          {task.ai_estimated_time && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              ⏱️ {task.ai_estimated_time}
                            </span>
                          )}

                          {task.ai_difficulty && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              💪 {task.ai_difficulty}
                            </span>
                          )}
                        </div>

                        {task.ai_reason && (
                          <p className="text-xs text-gray-600 mt-2 italic line-clamp-2">
                            💡 {task.ai_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-6xl mb-4">🎉</p>
                <p className="text-xl font-semibold text-gray-900 mb-2">¡Todo al día!</p>
                <p className="text-gray-600">No tienes tareas pendientes</p>
              </div>
            )}
          </div>
        )}

        {/* Courses Tab */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 px-2">Mis Materias</h2>

            {loadingCourses ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-[#5B8FC3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : courses?.length ? (
              <div className="grid gap-4">
                {courses.map((course, index) => (
                  <button
                    key={`${course.id}-${index}`}
                    onClick={() => navigate(`/curso/${course.id}`)}
                    className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-left w-full"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[#5B8FC3] to-[#4A7FB0] rounded-xl flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">{course.name}</h3>
                        {course.section && (
                          <p className="text-sm text-gray-500 mt-1">Sección {course.section}</p>
                        )}
                        {course.teacher && (
                          <p className="text-sm text-gray-600 mt-1">Profesor: {course.teacher}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3">
                          {course.studentCount > 0 && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <span>👥</span>
                              <span>{course.studentCount} estudiantes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-6xl mb-4">📚</p>
                <p className="text-xl font-semibold text-gray-900 mb-2">Sin materias</p>
                <p className="text-gray-600">No estás inscrito en ninguna materia aún</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#5B8FC3] shadow-lg z-50">
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
              onClick={() => setActiveTab('courses')}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === 'courses' ? 'text-white' : 'text-white/60'
              }`}
            >
              <BookOpen className="w-6 h-6" />
              <span className="text-xs font-medium">Materias</span>
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

      {/* Chatbot Floating Button */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-[#5B8FC3] to-[#4A7FB0] text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center justify-center z-40 group"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
        </button>
      )}

      {/* Chatbot Popup */}
      <ChatbotPopup
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userContext={{
          user: user,
          stats: dashboard?.stats,
          upcomingTasks: prioritizedTasks?.slice(0, 5),
          courses: courses?.slice(0, 3)
        }}
      />
    </div>
  )
}

export default StudentDashboard
