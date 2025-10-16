import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, FileText, Link as LinkIcon, Video, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react'

function AssignmentDetail() {
  const { courseId, assignmentId } = useParams()
  const [assignment, setAssignment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchAssignmentDetail = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (!token) {
          navigate('/login')
          return
        }

        const response = await fetch(
          `http://127.0.0.1:8000/api/dashboard/student/courses/${courseId}/assignments/${assignmentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        if (!response.ok) {
          throw new Error('No se pudo cargar la tarea')
        }

        const data = await response.json()
        setAssignment(data)
      } catch (error) {
        console.error('Error al cargar tarea:', error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignmentDetail()
  }, [courseId, assignmentId, navigate])

  const getStatusColor = (status) => {
    if (status === 'critical') return 'bg-red-100 text-red-800'
    if (status === 'warning') return 'bg-yellow-100 text-yellow-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusIcon = (status) => {
    if (status === 'critical') return <XCircle className="w-5 h-5" />
    if (status === 'warning') return <AlertCircle className="w-5 h-5" />
    return <CheckCircle className="w-5 h-5" />
  }

  const getMaterialIcon = (type) => {
    if (type === 'video') return <Video className="w-5 h-5 text-red-600" />
    if (type === 'link') return <LinkIcon className="w-5 h-5 text-blue-600" />
    return <FileText className="w-5 h-5 text-gray-600" />
  }

  const getSubmissionStatus = (submission) => {
    if (!submission) return { text: 'Sin entregar', color: 'bg-gray-100 text-gray-800' }

    const state = submission.state
    if (state === 'TURNED_IN') {
      return { text: 'Entregado', color: 'bg-green-100 text-green-800' }
    }
    if (state === 'RETURNED') {
      return { text: 'Calificado', color: 'bg-blue-100 text-blue-800' }
    }
    if (state === 'NEW' || state === 'CREATED') {
      return { text: 'Sin entregar', color: 'bg-gray-100 text-gray-800' }
    }
    return { text: state, color: 'bg-gray-100 text-gray-800' }
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
        <h2 className="text-2xl font-semibold text-gray-800">No pudimos cargar la tarea</h2>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => navigate(`/curso/${courseId}`)}
          className="px-6 py-3 bg-[#5B8FC3] text-white rounded-lg font-medium hover:bg-[#4A7FB0] transition-colors"
        >
          Volver al Curso
        </button>
      </div>
    )
  }

  const submissionStatus = getSubmissionStatus(assignment?.submission)

  return (
    <div className="min-h-screen bg-gray-50 pb-6">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <button
            onClick={() => navigate(`/curso/${courseId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver al Curso</span>
          </button>

          <div className="flex items-start gap-3">
            <div className={`px-3 py-1 rounded-lg flex items-center gap-1.5 ${getStatusColor(assignment?.assignment?.status)}`}>
              {getStatusIcon(assignment?.assignment?.status)}
              <span className="text-sm font-semibold">{assignment?.assignment?.status === 'critical' ? 'Vencida' : assignment?.assignment?.status === 'warning' ? 'Por vencer' : 'A tiempo'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Assignment Info */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{assignment?.assignment?.title}</h1>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5 text-[#5B8FC3]" />
              <span className="text-sm">
                <span className="font-medium">Fecha de entrega:</span> {assignment?.assignment?.dueDate}
              </span>
            </div>

            {assignment?.assignment?.maxPoints && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-sm">
                  <span className="font-medium">Puntos:</span> {assignment.assignment.maxPoints}
                </span>
              </div>
            )}
          </div>

          {assignment?.assignment?.description && (
            <div className="prose prose-sm max-w-none mt-4">
              <p className="text-gray-700 whitespace-pre-wrap">{assignment.assignment.description}</p>
            </div>
          )}
        </div>

        {/* Submission Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Tu Entrega</h2>

          <div className="flex items-center gap-3 mb-4">
            <span className={`px-4 py-2 rounded-lg font-semibold ${submissionStatus.color}`}>
              {submissionStatus.text}
            </span>
            {assignment?.submission?.late && (
              <span className="px-3 py-1 rounded-lg bg-red-100 text-red-800 text-sm font-medium">
                Entrega tardía
              </span>
            )}
          </div>

          {assignment?.submission?.assignedGrade !== null && assignment?.submission?.assignedGrade !== undefined && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-sm text-gray-600 mb-1">Calificación</p>
              <p className="text-3xl font-bold text-green-700">
                {assignment.submission.assignedGrade}
                {assignment?.assignment?.maxPoints && (
                  <span className="text-lg text-gray-500"> / {assignment.assignment.maxPoints}</span>
                )}
              </p>
            </div>
          )}

          {assignment?.submission?.alternateLink && (
            <a
              href={assignment.submission.alternateLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-[#5B8FC3] text-white rounded-xl font-semibold hover:bg-[#4A7FB0] transition-colors"
            >
              <span>Ver/Entregar en Classroom</span>
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Materials */}
        {assignment?.assignment?.materials?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Materiales Adjuntos</h2>

            <div className="space-y-3">
              {assignment.assignment.materials.map((material, index) => (
                <a
                  key={index}
                  href={material.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  {getMaterialIcon(material.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {material.title || 'Material sin título'}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{material.type}</p>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gradient-to-r from-[#5B8FC3] to-[#4A7FB0] rounded-2xl p-6 text-white">
          <h3 className="text-lg font-bold mb-2">¿Necesitas ayuda con esta tarea?</h3>
          <p className="text-white/90 text-sm mb-4">
            Nuestro asistente IA puede ayudarte a entender mejor la tarea y organizar tu trabajo.
          </p>
          <button className="w-full bg-white text-[#5B8FC3] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors">
            Hablar con el Asistente
          </button>
        </div>
      </main>
    </div>
  )
}

export default AssignmentDetail
