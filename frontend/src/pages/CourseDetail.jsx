import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, BookOpen, Clock, FileText, Megaphone, AlertCircle } from 'lucide-react'

function CourseDetail() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeSection, setActiveSection] = useState('tasks')
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch(`http://127.0.0.1:8000/api/dashboard/student/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) {
          throw new Error('No se pudo cargar el curso')
        }

        const data = await response.json()
        setCourse(data)
      } catch (error) {
        console.error('Error al cargar curso:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetail()
  }, [courseId, navigate])

  const getTaskStatusIcon = (status) => {
    if (status === 'critical') return '🔴'
    if (status === 'warning') return '🟡'
    return '✅'
  }

  if (loading) {
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
        <h2 className="text-2xl font-semibold text-gray-800">No pudimos cargar el curso</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => navigate('/dashboard/alumno')}
          className="px-6 py-3 bg-[#5B8FC3] text-white rounded-lg font-medium hover:bg-[#4A7FB0] transition-colors"
        >
          Volver al Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#5B8FC3] to-[#4A7FB0] text-white sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/dashboard/alumno')}
            className="flex items-center gap-2 text-white/90 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver</span>
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold mb-1">{course?.course?.name}</h1>
              {course?.course?.section && (
                <p className="text-white/80 text-sm">Sección {course.course.section}</p>
              )}
              {course?.course?.description && (
                <p className="text-white/90 text-sm mt-2">{course.course.description}</p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Section Tabs */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-1 border-b border-gray-200">
            <button
              onClick={() => setActiveSection('tasks')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeSection === 'tasks'
                  ? 'text-[#5B8FC3] border-b-2 border-[#5B8FC3]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Tareas ({course?.tasks?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSection('announcements')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeSection === 'announcements'
                  ? 'text-[#5B8FC3] border-b-2 border-[#5B8FC3]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Anuncios ({course?.announcements?.length || 0})</span>
            </button>
            <button
              onClick={() => setActiveSection('materials')}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm transition-colors ${
                activeSection === 'materials'
                  ? 'text-[#5B8FC3] border-b-2 border-[#5B8FC3]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Materiales ({course?.materials?.length || 0})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tasks Section */}
        {activeSection === 'tasks' && (
          <div className="space-y-4">
            {course?.tasks?.length ? (
              course.tasks.map((task, index) => (
                <button
                  key={`${task.id}-${index}`}
                  onClick={() => navigate(`/curso/${courseId}/tarea/${task.id}`)}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow text-left w-full"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getTaskStatusIcon(task.status)}</span>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-[#5B8FC3]" />
                          <span className="text-sm text-[#5B8FC3] font-medium">{task.dueDate}</span>
                        </div>
                        {task.maxPoints && (
                          <span className="text-sm text-gray-500">{task.maxPoints} puntos</span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-6xl mb-4">📝</p>
                <p className="text-xl font-semibold text-gray-900 mb-2">Sin tareas</p>
                <p className="text-gray-600">No hay tareas asignadas en este curso</p>
              </div>
            )}
          </div>
        )}

        {/* Announcements Section */}
        {activeSection === 'announcements' && (
          <div className="space-y-4">
            {course?.announcements?.length ? (
              course.announcements.map((announcement, index) => (
                <div key={`${announcement.id}-${index}`} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <Megaphone className="w-6 h-6 text-[#5B8FC3] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 whitespace-pre-wrap">{announcement.text}</p>
                      <p className="text-sm text-gray-500 mt-2">{announcement.creationTime}</p>
                      {announcement.alternateLink && (
                        <a
                          href={announcement.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#5B8FC3] hover:underline mt-2 inline-block"
                        >
                          Ver en Classroom →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-6xl mb-4">📢</p>
                <p className="text-xl font-semibold text-gray-900 mb-2">Sin anuncios</p>
                <p className="text-gray-600">No hay anuncios recientes en este curso</p>
              </div>
            )}
          </div>
        )}

        {/* Materials Section */}
        {activeSection === 'materials' && (
          <div className="space-y-4">
            {course?.materials?.length ? (
              course.materials.map((material, index) => (
                <div key={`${material.id}-${index}`} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <FileText className="w-6 h-6 text-[#5B8FC3] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900">{material.title}</h3>
                      {material.description && (
                        <p className="text-sm text-gray-600 mt-1">{material.description}</p>
                      )}
                      {material.alternateLink && (
                        <a
                          href={material.alternateLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#5B8FC3] hover:underline mt-2 inline-block"
                        >
                          Abrir material →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm">
                <p className="text-6xl mb-4">📄</p>
                <p className="text-xl font-semibold text-gray-900 mb-2">Sin materiales</p>
                <p className="text-gray-600">No hay materiales publicados en este curso</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default CourseDetail
